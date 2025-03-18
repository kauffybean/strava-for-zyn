import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { formatDistance } from 'date-fns';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardHeader, CardContent, CardFooter, CardBadge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Post, Reaction, REACTION_TYPES } from '@shared/schema';
import { CommentSection } from './comment-section';
import { formatNicotineStrength, formatDuration } from '@/utils/format-utils';
import { 
  MapPin, Clock, MessageSquare, Target, Zap, Shield, Award, 
  Compass, Flag, AlertTriangle, Crosshair
} from 'lucide-react';

// Military-style tactical icons
const NicLevelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
  </svg>
);

const FlavorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10"></path>
    <path d="M8.5 8.5v.01"></path>
    <path d="M15.5 8.5v.01"></path>
    <path d="M15 15c-1-1-2-2-3-2s-2 1-3 2"></path>
  </svg>
);

const MoodIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M8 9h8"></path>
    <path d="M12 16v.01"></path>
  </svg>
);

const DurationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    <path d="M12 12h.01"></path>
    <path d="M17 12h.01"></path>
    <path d="M7 12h.01"></path>
  </svg>
);

// Military-themed mood mapping
const moodToTacticalTerm: Record<string, string> = {
  'energetic': 'COMBAT READY',
  'relaxed': 'STAND DOWN',
  'focused': 'LOCKED ON TARGET',
  'social': 'SQUAD ACTIVE',
  'creative': 'TACTICAL THINKING'
};

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
  
  // Fetch reactions (signals from other users)
  const { data: reactions = [] } = useQuery<(Reaction & { user: { id: number; displayName: string } })[]>({
    queryKey: [`/api/posts/${post.id}/reactions`],
    queryFn: getQueryFn(),
  });
  
  // Create reaction mutation (sending signal)
  const reactionMutation = useMutation({
    mutationFn: async (type: string) => {
      await apiRequest('POST', `/api/posts/${post.id}/reactions`, { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/posts/${post.id}/reactions`]);
    }
  });
  
  // Find user's current reaction (signal)
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
  
  // Get badge color based on mood
  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'energetic': return 'accent';
      case 'relaxed': return 'secondary';
      case 'focused': return 'primary';
      case 'social': return 'warning';
      case 'creative': return 'success';
      default: return 'primary';
    }
  };
  
  // Generate a military-style code for the post
  const postCode = `ZYN-${post.id.toString().padStart(4, '0')}`;
  
  // Tactical Zyn puns for flavor descriptions
  const getFlavorDescription = (flavor: string) => {
    switch (flavor.toLowerCase()) {
      case 'wintergreen': return 'Arctic Tactical';
      case 'cool mint': return 'Frost Ops';
      case 'citrus': return 'Citrus Strike';
      case 'coffee': return 'Dark Ops Brew';
      case 'cinnamon': return 'Red Zone Heat';
      default: return flavor;
    }
  };
  
  // Military rank based on nicotine strength
  const getNicotineRank = (strength: number) => {
    if (strength >= 8) return 'GENERAL';
    if (strength >= 6) return 'COLONEL';
    if (strength >= 3) return 'CAPTAIN';
    return 'LIEUTENANT';
  };
  
  return (
    <Card className="mb-4 overflow-hidden border-1 border-primary/10" variant="default">
      <div className="absolute top-0 right-0 py-1 px-2 bg-primary/10 text-primary text-xs font-mono rounded-bl-md">
        {postCode}
      </div>
      
      <CardHeader className="pb-2 relative">
        <div className="flex items-center">
          <div className="w-11 h-11 rounded-full border-2 border-primary/20 bg-background flex items-center justify-center text-primary overflow-hidden mr-3 relative">
            {post.user.avatar ? (
              <img 
                src={post.user.avatar} 
                alt={post.user.displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-heading font-bold text-lg">{post.user.displayName.charAt(0).toUpperCase()}</span>
            )}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border border-white flex items-center justify-center">
              <Target size={8} className="text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <Link href={`/profile/${post.user.id}`} className="font-heading font-semibold text-sm hover:underline">
                {post.user.displayName}
              </Link>
              <span className="ml-2 text-xs bg-primary/10 px-1.5 py-0.5 rounded-sm text-primary font-medium">
                {getNicotineRank(post.nicotineStrength)}
              </span>
            </div>
            <div className="flex items-center text-xs text-muted space-x-2">
              <span className="no-select">{timeAgo}</span>
              {post.locationName && (
                <div className="flex items-center">
                  <MapPin size={12} className="mr-1" />
                  <span>{post.locationName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="flex items-start">
          <div className="mr-2 mt-1">
            <Crosshair size={16} className="text-accent" />
          </div>
          <div>
            <h3 className="font-heading text-primary font-bold tracking-wide mb-1.5">
              {post.title.toUpperCase()}
            </h3>
            {post.description && (
              <div className="text-sm text-primary/80 mb-3 pl-2 border-l-2 border-accent/30">
                {post.description}
              </div>
            )}
          </div>
        </div>
        
        {/* Tactical operation stats */}
        <div className="bg-background rounded-ios p-3 mb-4 border border-border/60">
          <div className="text-xs font-medium text-muted mb-2">DEPLOYMENT PARAMETERS</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center mr-2">
                <Zap size={14} className="text-accent" />
              </div>
              <div>
                <div className="text-xs text-muted">STRENGTH</div>
                <div className="text-sm font-semibold">{formatNicotineStrength(post.nicotineStrength)}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center mr-2">
                <Shield size={14} className="text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted">FLAVOR</div>
                <div className="text-sm font-semibold">{getFlavorDescription(post.flavor)}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center mr-2">
                <Award size={14} className="text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted">STATUS</div>
                <div className="text-sm font-semibold">{moodToTacticalTerm[post.mood.toLowerCase()] || post.mood}</div>
              </div>
            </div>
            
            {post.duration && (
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center mr-2">
                  <Clock size={14} className="text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted">DURATION</div>
                  <div className="text-sm font-semibold">{formatDuration(post.duration)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {post.imageUrl && (
          <div className="rounded-ios overflow-hidden mb-4 border border-primary/10 shadow-tactical">
            <div className="relative">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full object-cover"
                style={{ maxHeight: '300px' }}
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs py-0.5 px-2 rounded-sm">
                TACTICAL IMAGERY
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-2">
                <div className="text-xs">OPERATION LOCATION</div>
                <div className="text-sm font-semibold">
                  {post.locationName || 'CLASSIFIED'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tactical reaction display (signal responses) */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 bg-primary/5 px-3 py-2 rounded-ios border border-primary/10">
            <div className="w-full text-xs font-medium text-muted mb-1">SQUAD SIGNALS</div>
            {Object.entries(reactionCounts).map(([type, data]) => (
              <div key={type} className="flex items-center text-xs bg-primary/10 text-primary rounded-pill px-2 py-1 border border-primary/10">
                <span>{type}</span>
                <span className="ml-1 font-medium bg-accent/20 rounded-full w-5 h-5 inline-flex items-center justify-center text-accent">{data.count}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Zyn-inspired tactical quote */}
        <div className="text-xs text-center italic text-muted px-4 py-2 border-t border-primary/10">
          "Pouching in silence, strength in nicotine. Front-line deployed."
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col pt-0">
        <div className="flex justify-between w-full border-t border-primary/5 pt-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {REACTION_TYPES.map(type => (
              <Button 
                key={type}
                variant={userReaction?.type === type ? 'accent' : 'outline'}
                size="sm"
                onClick={() => handleReaction(type)}
                className="text-xs whitespace-nowrap"
              >
                {type}
              </Button>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowComments(!showComments)}
            className="text-xs font-heading"
            iconLeft={showComments ? undefined : <MessageSquare size={14} />}
          >
            {showComments ? 'CLOSE COMMS' : 'OPEN COMMS'}
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
