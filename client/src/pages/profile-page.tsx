import React from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { ProfileSummary } from '@/components/profile-summary';
import { PostCard } from '@/components/post-card';
import Navigation from '@/components/navigation';
import { Post } from '@shared/schema';

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
  
  // Fetch user's posts
  const { data: posts = [], isLoading, isError } = useQuery<PostWithUser[]>({
    queryKey: [`/api/users/${userId}/posts`],
    queryFn: getQueryFn(),
    enabled: !!userId,
  });
  
  if (!match) {
    return <div>Profile not found</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-[#FF5E3A]">Profile</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-4">
        <ProfileSummary userId={userId} />
        
        <h2 className="text-lg font-semibold mb-3">Activity</h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-32 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Failed to load posts</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No posts yet</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </main>
      
      <Navigation />
    </div>
  );
}
