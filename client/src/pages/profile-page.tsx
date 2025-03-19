import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { ProfileSummary } from '@/components/profile-summary';
import { PostCard } from '@/components/post-card';
import { FriendManagement } from '@/components/friend-management';
import Navigation from '@/components/navigation';
import { Post } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { 
  Target, Crosshair, User, ChevronLeft, Clock, 
  Shield, Zap, BarChart, Loader2, AlertTriangle
} from 'lucide-react';

type PostWithUser = Post & { 
  user: { 
    id: number; 
    username: string; 
    displayName: string; 
    avatar?: string; 
  } 
};

export default function ProfilePage() {
  const [match, params] = useRoute<{ id: string }>('/profile/:id');
  const userId = parseInt(params?.id || '0');
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'analytics'>('posts');
  
  const isOwnProfile = user?.id === userId;
  
  // Fetch user's posts
  const { data: posts = [], isLoading, isError } = useQuery<PostWithUser[]>({
    queryKey: [`/api/users/${userId}/posts`],
    queryFn: getQueryFn(),
    enabled: !!userId && activeTab === 'posts',
  });
  
  // Fetch user analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: [`/api/users/${userId}/analytics`],
    queryFn: getQueryFn(),
    enabled: !!userId && activeTab === 'analytics',
  });
  
  if (!match) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <AlertTriangle size={48} className="text-destructive mb-4" />
        <h1 className="text-2xl font-heading font-bold mb-2">PROFILE NOT FOUND</h1>
        <p className="text-muted mb-6">The requested tactical personnel file does not exist</p>
        <Link href="/" className="button-accent px-4 py-2 rounded-ios">
          RETURN TO BASE
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen pb-16 pt-14">
      <header className="fixed top-0 left-0 right-0 bg-background border-b border-primary/10 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="text-primary mr-3">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center">
            <Target className="text-accent mr-2" size={20} />
            <h1 className="font-heading text-lg tracking-wide">
              {isOwnProfile ? 'YOUR PROFILE' : 'POUCHER PROFILE'}
            </h1>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-4 mt-2">
        <ProfileSummary userId={userId} />
        
        {/* Tab navigation */}
        <div className="flex border-b border-border my-4">
          <button
            className={`flex-1 py-2 px-3 text-sm font-medium ${
              activeTab === 'posts' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-muted hover:text-primary'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            OPERATIONS
          </button>
          {isOwnProfile && (
            <button
              className={`flex-1 py-2 px-3 text-sm font-medium ${
                activeTab === 'friends' 
                  ? 'border-b-2 border-accent text-accent' 
                  : 'text-muted hover:text-primary'
              }`}
              onClick={() => setActiveTab('friends')}
            >
              SQUAD
            </button>
          )}
          <button
            className={`flex-1 py-2 px-3 text-sm font-medium ${
              activeTab === 'analytics' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-muted hover:text-primary'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            TACTICAL DATA
          </button>
        </div>
        
        {/* Posts Section */}
        {activeTab === 'posts' && (
          <>
            <div className="flex items-center mb-4">
              <Crosshair size={16} className="text-accent mr-2" />
              <h2 className="font-heading text-lg tracking-wide">DEPLOYMENT RECORD</h2>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(2)].map((_, i) => (
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
            ) : isError ? (
              <div className="bg-card rounded-ios p-6 shadow-card text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                  <AlertTriangle size={28} className="text-destructive" />
                </div>
                <h3 className="font-semibold mb-2">INTEL RETRIEVAL FAILED</h3>
                <p className="text-muted mb-4">Unable to access deployment records</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-card rounded-ios p-6 shadow-card text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Target size={28} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">NO DEPLOYMENTS RECORDED</h3>
                <p className="text-muted mb-4">This poucher hasn't logged any Zyn operations yet</p>
                {isOwnProfile && (
                  <Link 
                    href="/create" 
                    className="button-accent px-4 py-2 rounded-ios inline-flex items-center"
                  >
                    <Zap size={16} className="mr-2" />
                    LOG FIRST DEPLOYMENT
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Friends Section (only shown on own profile) */}
        {activeTab === 'friends' && isOwnProfile && (
          <FriendManagement />
        )}
        
        {/* Analytics Section */}
        {activeTab === 'analytics' && (
          <>
            <div className="flex items-center mb-4">
              <BarChart size={16} className="text-accent mr-2" />
              <h2 className="font-heading text-lg tracking-wide">OPERATIONAL METRICS</h2>
            </div>
            
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Loader2 size={32} className="animate-spin text-accent" />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <Target size={16} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-muted">ANALYZING TACTICAL DATA...</p>
                </div>
              </div>
            ) : analytics ? (
              <div className="bg-card rounded-ios p-4 shadow-card">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center bg-background border border-border/60 rounded-md p-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-md mr-3">
                      <Zap size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-medium">TOTAL DEPLOYMENTS</p>
                      <p className="text-sm font-bold">{analytics.totalPosts || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-background border border-border/60 rounded-md p-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-md mr-3">
                      <Clock size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-medium">AVG DURATION</p>
                      <p className="text-sm font-bold">{analytics.avgDuration || 0} min</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-background border border-border/60 rounded-md p-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-md mr-3">
                      <Shield size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-medium">FAVORITE FLAVOR</p>
                      <p className="text-sm font-bold">{analytics.topFlavor || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-background border border-border/60 rounded-md p-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-md mr-3">
                      <Target size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-medium">PREFERRED STRENGTH</p>
                      <p className="text-sm font-bold">{analytics.avgStrength || 0} mg</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-2 px-4 bg-background rounded-ios border border-border/60 mb-4">
                  <p className="text-xs uppercase font-medium text-muted">TACTICAL ASSESSMENT</p>
                  <p className="text-sm mt-1">
                    {isOwnProfile 
                      ? "You're maintaining excellent Zyn discipline and operational readiness"
                      : "This poucher maintains excellent Zyn discipline and operational readiness"
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-ios p-6 shadow-card text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <BarChart size={28} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">NO ANALYTICS AVAILABLE</h3>
                <p className="text-muted mb-4">Insufficient data to generate tactical insights</p>
              </div>
            )}
          </>
        )}
      </main>
      
      <Navigation />
    </div>
  );
}
