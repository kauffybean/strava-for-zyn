import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Comment } from '@shared/schema';
import { formatDistance } from 'date-fns';
import { Link } from 'wouter';
import { 
  MessageSquare, Send, Target, Radio, 
  Clock, Loader2, AlertCircle, Shield
} from 'lucide-react';

type CommentWithUser = Comment & {
  user: {
    id: number;
    displayName: string;
    username: string;
    avatar?: string;
  }
};

// Military ranks based on comment counts
const getMilitaryRank = (commentCount: number) => {
  if (commentCount > 50) return 'COLONEL';
  if (commentCount > 20) return 'MAJOR';
  if (commentCount > 10) return 'CAPTAIN';
  if (commentCount > 5) return 'LIEUTENANT';
  return 'PRIVATE';
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
  
  // Count comments per user for rank display
  const userCommentCounts = comments.reduce((acc, comment) => {
    acc[comment.user.id] = (acc[comment.user.id] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 border-b border-primary/10 pb-2">
        <div className="flex items-center">
          <Radio size={14} className="text-accent mr-2" />
          <h3 className="text-sm font-heading font-semibold tracking-wide">COMMS CHANNEL</h3>
        </div>
        <div className="text-xs text-muted bg-primary/5 px-2 py-0.5 rounded-sm">
          {comments.length} TRANSMISSIONS
        </div>
      </div>
      
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4 relative">
        <div className="flex-1 relative">
          <Input
            placeholder="Transmit message to squad..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="pr-10 bg-background border-primary/20 focus:border-accent shadow-sm"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/40">
            <Radio size={14} className={comment.trim() ? 'text-accent' : 'text-primary/40'} />
          </div>
        </div>
        <Button 
          type="submit" 
          size="sm" 
          variant={comment.trim() ? 'accent' : 'outline'}
          isLoading={commentMutation.isLoading}
          disabled={!comment.trim()}
          iconRight={commentMutation.isLoading ? undefined : <Send size={14} />}
        >
          TRANSMIT
        </Button>
      </form>
      
      {/* Comments list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4 text-sm text-muted">
            <Loader2 size={16} className="animate-spin mr-2" />
            <span>ESTABLISHING COMMS...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-background border border-primary/10 rounded-ios p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
              <Radio size={18} className="text-primary/60" />
            </div>
            <h4 className="text-sm font-semibold mb-1">COMMS SILENT</h4>
            <p className="text-xs text-muted">No transmissions received on this channel</p>
          </div>
        ) : (
          <div className="bg-background border border-primary/10 rounded-ios pt-1 pb-2 px-3">
            {comments.map(comment => (
              <div key={comment.id} className="border-b border-primary/5 last:border-0 py-2">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center text-primary flex-shrink-0 relative">
                    {comment.user.avatar ? (
                      <img 
                        src={comment.user.avatar} 
                        alt={comment.user.displayName} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-heading font-bold text-sm">{comment.user.displayName.charAt(0).toUpperCase()}</span>
                    )}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                      <Target size={8} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Link href={`/profile/${comment.user.id}`} className="font-heading font-medium text-xs hover:underline">
                        {comment.user.displayName}
                      </Link>
                      <span className="ml-2 text-xs bg-primary/10 px-1.5 py-0.5 rounded-sm text-primary/80 font-mono">
                        {getMilitaryRank(userCommentCounts[comment.user.id] || 0)}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-sm pl-2 border-l-2 border-accent/30">
                      {comment.content}
                    </div>
                    
                    <div className="flex items-center mt-1.5 text-xs text-muted">
                      <Clock size={10} className="mr-1" />
                      {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Military-themed channel status */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse mr-1"></div>
          <span>CHANNEL ACTIVE</span>
        </div>
        <div className="font-mono">ZYN-COMMS-{postId}</div>
      </div>
    </div>
  );
}
