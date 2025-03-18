import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { formatDistance } from 'date-fns';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Post, Reaction, REACTION_TYPES } from '@shared/schema';
import { CommentSection } from './comment-section';

type PostWithUser = Post & { 
  user: { 
    id: number; 
    username: string; 
    displayName: string; 
    avatar?: string; 
  } 
};

export function PostCard({ post }: { post: PostWithUser }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  
  // Fetch reactions
  const { data: reactions = [] } = useQuery<(Reaction & { user: { id: number; displayName: string } })[]>({
    queryKey: [`/api/posts/${post.id}/reactions`],
    queryFn: getQueryFn(),
  });
  
  // Create reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async (type: string) => {
      await apiRequest('POST', `/api/posts/${post.id}/reactions`, { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/posts/${post.id}/reactions`]);
    }
  });
  
  // Find user's current reaction
  const userReaction = reactions.find(r => r.userId === user?.id);
  
  const handleReaction = (type: string) => {
    reactionMutation.mutate(type);
  };
  
  // Format the post time
  const timeAgo = formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true });
  
  // Group reactions by type for display
  const reactionCounts: Record<string, { count: number, users: string[] }> = {};
  reactions.forEach(reaction => {
    if (!reactionCounts[reaction.type]) {
      reactionCounts[reaction.type] = { count: 0, users: [] };
    }
    reactionCounts[reaction.type].count++;
    reactionCounts[reaction.type].users.push(reaction.user.displayName);
  });
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
            {post.user.avatar ? (
              <img 
                src={post.user.avatar} 
                alt={post.user.displayName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              post.user.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <Link href={`/profile/${post.user.id}`} className="font-semibold text-sm hover:underline">
              {post.user.displayName}
            </Link>
            <div className="flex items-center text-xs text-gray-500">
              <span>{timeAgo}</span>
              {post.locationName && (
                <>
                  <span className="mx-1">•</span>
                  <span>{post.locationName}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        <h3 className="font-bold mb-1">{post.title}</h3>
        {post.description && <p className="text-sm mb-3">{post.description}</p>}
        
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700 mb-3">
          <div className="px-2 py-1 rounded-full bg-gray-100">
            {post.nicotineStrength}mg
          </div>
          <div className="px-2 py-1 rounded-full bg-gray-100">
            {post.flavor}
          </div>
          <div className="px-2 py-1 rounded-full bg-gray-100">
            {post.mood}
          </div>
          {post.duration && (
            <div className="px-2 py-1 rounded-full bg-gray-100">
              {post.duration} min
            </div>
          )}
        </div>
        
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden mb-3">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full object-cover"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}
        
        {/* Reactions display */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(reactionCounts).map(([type, data]) => (
              <div key={type} className="flex items-center text-xs bg-gray-50 rounded-full px-2 py-1">
                <span>{type}</span>
                <span className="ml-1 font-medium">{data.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col pt-0">
        <div className="flex justify-between w-full border-t border-gray-100 pt-3">
          <div className="flex gap-2">
            {REACTION_TYPES.map(type => (
              <Button 
                key={type}
                variant={userReaction?.type === type ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleReaction(type)}
                className="text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowComments(!showComments)}
            className="text-xs"
          >
            {showComments ? 'Hide Comments' : 'Comments'}
          </Button>
        </div>
        
        {showComments && (
          <div className="mt-3 w-full">
            <CommentSection postId={post.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
