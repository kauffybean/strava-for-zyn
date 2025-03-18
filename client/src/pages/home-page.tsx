import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { PostCard } from '@/components/post-card';
import Navigation from '@/components/navigation';
import { Post } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { 
  Target, Zap, Shield, Activity, Clock, Calendar, 
  BarChart2, TrendingUp, Users, AreaChart, AlertTriangle, Loader2
} from 'lucide-react';
import { formatRelativeTime } from '@/utils/format-utils';

type PostWithUser = Post & { 
  user: { 
    id: number; 
    username: string; 
    displayName: string; 
    avatar?: string; 
  } 
};

// Dummy analytics data - this would come from the backend in a real app
const generateAnalytics = (userId: number) => {
  const today = new Date();
  return {
    weeklyDeployments: Math.floor(Math.random() * 15) + 5,
    tacticalScore: Math.floor(Math.random() * 100),
    operationEfficiency: Math.floor(Math.random() * 100),
    nicStrength: [1.5, 3, 6, 8][Math.floor(Math.random() * 4)],
    preferredFlavor: ['Wintergreen', 'Cool Mint', 'Citrus', 'Cinnamon'][Math.floor(Math.random() * 4)],
    weekStats: [
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
    ],
    lastOperation: new Date(today.getTime() - Math.floor(Math.random() * 86400000 * 3)),
  };
};

// Tactical Zyn Deployment Chart
const TacticalChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  
  return (
    <div className="flex items-end space-x-1 h-20">
      {data.map((value, index) => {
        const height = value === 0 ? 4 : (value / max) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-accent/30 rounded-sm transition-all duration-300 hover:bg-accent" 
              style={{ height: `${height}%`, minHeight: '4px' }}
            ></div>
            <span className="text-xs mt-1 text-muted">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

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
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Generate analytics data for the current user
  useEffect(() => {
    if (user) {
      setAnalytics(generateAnalytics(user.id));
    }
  }, [user]);
  
  // Fetch posts for the feed
  const { data: posts = [], isLoading, isError, refetch } = useQuery<PostWithUser[]>({
    queryKey: ['/api/posts'],
    queryFn: getQueryFn(),
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
          
          {analytics && (
            <div className="bg-card rounded-ios p-4 shadow-card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-primary">Operation Status: <span className="text-accent font-semibold">ACTIVE</span></h3>
                  <p className="text-sm text-muted">Last Zyn deployed: {formatRelativeTime(analytics.lastOperation)}</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-full">
                  <Activity size={20} className="text-accent" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatBadge 
                  icon={BarChart2} 
                  label="WEEK DEPLOYMENTS" 
                  value={analytics.weeklyDeployments} 
                />
                <StatBadge 
                  icon={Zap} 
                  label="NIC STRENGTH" 
                  value={`${analytics.nicStrength} mg`} 
                />
                <StatBadge 
                  icon={Shield} 
                  label="TACTICAL SCORE" 
                  value={`${analytics.tacticalScore}/100`} 
                />
                <StatBadge 
                  icon={TrendingUp} 
                  label="POUCH EFFICIENCY" 
                  value={`${analytics.operationEfficiency}%`} 
                />
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">WEEKLY BATTLE RHYTHM</h4>
                <TacticalChart data={analytics.weekStats} />
              </div>
              
              <div className="text-center py-2 px-4 bg-background rounded-ios border border-border/60">
                <p className="text-xs uppercase font-medium text-muted">TACTICAL ASSESSMENT</p>
                <p className="text-sm mt-1">"Ready for pouch deployment - maintain Zyn discipline"</p>
              </div>
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
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
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
