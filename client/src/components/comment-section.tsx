import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Comment } from '@shared/schema';
import { formatDistance } from 'date-fns';
import { Link } from 'wouter';

type CommentWithUser = Comment & {
  user: {
    id: number;
    displayName: string;
    username: string;
    avatar?: string;
  }
};

export function CommentSection({ postId }: { postId: number }) {
  const [comment, setComment] = useState('');
  
  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    queryFn: getQueryFn(),
  });
  
  // Create comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', `/api/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries([`/api/posts/${postId}/comments`]);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      commentMutation.mutate(comment);
    }
  };
  
  return (
    <div className="w-full">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <Input
          placeholder="Add a comment..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="sm" 
          isLoading={commentMutation.isLoading}
          disabled={!comment.trim()}
        >
          Post
        </Button>
      </form>
      
      {/* Comments list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-2 text-sm text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-2 text-sm text-gray-500">No comments yet</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                {comment.user.avatar ? (
                  <img 
                    src={comment.user.avatar} 
                    alt={comment.user.displayName} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  comment.user.displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-2">
                  <Link href={`/profile/${comment.user.id}`} className="font-semibold text-xs hover:underline">
                    {comment.user.displayName}
                  </Link>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
