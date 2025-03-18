import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { PostCard } from '@/components/post-card';
import Navigation from '@/components/navigation';
import { Post } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

type PostWithUser = Post & { 
  user: { 
    id: number; 
    username: string; 
    displayName: string; 
    avatar?: string; 
  } 
};

export default function HomePage() {
  const { user } = useAuth();
  
  // Fetch posts for the feed
  const { data: posts = [], isLoading, isError, refetch } = useQuery<PostWithUser[]>({
    queryKey: ['/api/posts'],
    queryFn: getQueryFn(),
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <h1 className="text-xl font-bold text-[#FF5E3A]">Zynnie</h1>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-32 bg-gray-200 rounded w-full"></div>
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
      <div className="flex flex-col min-h-screen pb-16">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <h1 className="text-xl font-bold text-[#FF5E3A]">Zynnie</h1>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Failed to load posts</p>
            <button 
              onClick={() => refetch()}
              className="ios-button bg-[#FF5E3A] text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </main>
        
        <Navigation />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-[#FF5E3A]">Zynnie</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-4">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="font-semibold mb-2">No Zyns in Your Feed</h3>
            <p className="text-gray-600 mb-4">Post your first Zyn or find friends to follow</p>
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
