import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { PostCard } from '@/components/post-card';
import Navigation from '@/components/navigation';
import { Post } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { 
  Target, Zap, Shield, Activity, 
  BarChart2, TrendingUp, Users, Plus,
  AlertTriangle, Loader2, BarChart, MapPin,
  Map as MapIcon, Clock, Crosshair
} from 'lucide-react';
import { formatRelativeTime, formatNicotineStrength, formatDuration } from '@/utils/format-utils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

type PostWithUser = Post & { 
  user: { 
    id: number; 
    username: string; 
    displayName: string; 
    avatar?: string; 
  } 
};

type UserAnalytics = {
  totalPosts: number;
  weeklyDeployments: number;
  tacticalScore?: number;
  avgDuration: number;
  avgStrength: number;
  topFlavor: string;
  weekStats: number[];
  lastOperation?: Date;
};

import TacticalChart from '@/components/TacticalChart';
import TacticalMapView from '@/components/TacticalMapView';

// Military-inspired stats badge
const StatBadge = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
  <div className="flex items-center bg-background border border-border/60 rounded-md p-2">
    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-md mr-3">
      <Icon size={16} className="text-primary" />
    </div>
    <div>
      <p className="text-xs text-muted font-medium">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  </div>
);

export default function HomePage() {
  const { user } = useAuth();
  
  // Fetch user analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<UserAnalytics>({
    queryKey: ['/api/users/analytics'],
    queryFn: getQueryFn(),
    enabled: !!user,
  });
  
  // Fetch posts for the feed
  const { data: posts = [], isLoading, isError, refetch } = useQuery<PostWithUser[]>({
    queryKey: ['/api/posts'],
    queryFn: getQueryFn(),
    onSuccess: (data) => {
      console.log('Posts data received:', data);
    },
    onError: (error) => {
      console.error('Error fetching posts:', error);
    },
    // Disable automatic retries on 401 errors for a better experience
    retry: (failureCount, error: any) => {
      return !(error?.message === 'Unauthorized' || error?.status === 401) && failureCount < 3;
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen pb-16 pt-14">
        <main className="flex-1 container mx-auto px-4 py-4">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Loader2 size={32} className="animate-spin text-accent" />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <Target size={16} />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-muted">ESTABLISHING TACTICAL COMMS...</p>
            </div>
          </div>
          
          <div className="animate-pulse space-y-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-ios p-4 shadow-card">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-3"></div>
                <div className="h-32 bg-muted rounded-ios w-full"></div>
              </div>
            ))}
          </div>
        </main>
        
        <Navigation />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col min-h-screen pb-16 pt-14">
        <main className="flex-1 container mx-auto px-4 py-4 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle size={32} className="text-destructive" />
            </div>
            <h3 className="text-lg font-heading font-semibold mb-2">COMMS INTERFERENCE</h3>
            <p className="text-muted mb-6">Unable to establish connection with HQ</p>
            <button 
              onClick={() => refetch()}
              className="button-accent px-6 py-2.5 rounded-ios font-heading tracking-wide"
            >
              RETRY TRANSMISSION
            </button>
          </div>
        </main>
        
        <Navigation />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen pb-16 pt-14">
      <main className="flex-1 container mx-auto px-4 py-4">
        {/* Daily Briefing Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg tracking-wide">DAILY BRIEFING</h2>
            <span className="text-xs text-muted font-medium">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          {analytics ? (
            <div className="bg-card rounded-ios p-4 shadow-card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-primary">Operation Status: <span className="text-accent font-semibold">ACTIVE</span></h3>
                  {analytics.lastOperation && (
                    <p className="text-sm text-muted">Last Zyn deployed: {formatRelativeTime(analytics.lastOperation)}</p>
                  )}
                </div>
                <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-full">
                  <Activity size={20} className="text-accent" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatBadge 
                  icon={BarChart2} 
                  label="TOTAL DEPLOYMENTS" 
                  value={analytics.totalPosts || 0} 
                />
                <StatBadge 
                  icon={Zap} 
                  label="AVG STRENGTH" 
                  value={`${analytics.avgStrength || 0} mg`} 
                />
                <StatBadge 
                  icon={Shield} 
                  label="TACTICAL SCORE" 
                  value={`${analytics.tacticalScore || 75}/100`} 
                />
                <StatBadge 
                  icon={TrendingUp} 
                  label="AVG DURATION" 
                  value={`${analytics.avgDuration || 0} min`} 
                />
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">WEEKLY BATTLE RHYTHM</h4>
                <TacticalChart data={analytics.weekStats || [0, 0, 0, 0, 0, 0, 0]} />
              </div>
              
              <div className="text-center py-2 px-4 bg-background rounded-ios border border-border/60">
                <p className="text-xs uppercase font-medium text-muted">TACTICAL ASSESSMENT</p>
                <p className="text-sm mt-1">"Ready for pouch deployment - maintain Zyn discipline"</p>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-ios p-6 shadow-card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <BarChart size={28} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">NO ANALYTICS AVAILABLE</h3>
              <p className="text-muted mb-4">Deploy your first Zyn to generate tactical insights</p>
              <Link 
                href="/create" 
                className="button-accent px-4 py-2 rounded-ios inline-flex items-center"
              >
                <Plus size={16} className="mr-2" />
                LOG FIRST DEPLOYMENT
              </Link>
            </div>
          )}
        </div>
        
        {/* Feed Section */}
        <div className="mb-6">
          <h2 className="font-heading text-lg tracking-wide mb-3">SQUAD ACTIVITIES</h2>
          
          {posts.length === 0 ? (
            <div className="bg-card rounded-ios p-6 shadow-card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users size={28} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">NO DEPLOYMENTS DETECTED</h3>
              <p className="text-muted mb-4">Pouches awaiting tactical insertion</p>
              <p className="text-sm border-t border-border/60 pt-4 text-primary/80 font-medium italic">
                "Time to launch your first Nic-strike or recruit fellow pouchers to your unit"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Using our improved, null-safety PostCard component */}
              {posts.map(post => {
                // Debug log for any post processing issues
                console.log('Post being mapped:', post);
                
                // Make sure we have a valid post with a valid user object
                if (!post || !post.id) {
                  console.warn('Skipping invalid post:', post);
                  return null;
                }
                
                // Use our improved PostCard component with built-in error handling
                return <PostCard key={post.id} post={post} />;
              })}
            </div>
          )}
        </div>
        
        {/* Military/Zyn-inspired motivational quote */}
        <div className="bg-primary/5 rounded-ios p-4 border border-primary/10 mb-4">
          <p className="text-sm text-center italic">
            "Stay zynced, stay focused. The front-line poucher is always prepared for the next deployment."
          </p>
        </div>
      </main>
      
      <Navigation />
    </div>
  );
}
