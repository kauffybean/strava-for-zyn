import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { User } from '@shared/schema';

type ProfileSummaryProps = {
  userId: number;
};

export function ProfileSummary({ userId }: ProfileSummaryProps) {
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;
  
  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<Omit<User, 'password'>>({
    queryKey: [`/api/users/${userId}`],
    queryFn: getQueryFn(),
  });
  
  // Fetch user analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/analytics`],
    queryFn: getQueryFn(),
  });
  
  // Fetch friend status
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['/api/friends'],
    queryFn: getQueryFn(),
    enabled: !isOwnProfile,
  });
  
  // Friend request mutation
  const friendRequestMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/friends/request', { friendId: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/friends']);
    }
  });
  
  if (userLoading || analyticsLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-pulse text-center">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!user) {
    return (
      <Card className="mb-4">
        <CardContent className="text-center py-8">
          <div className="text-gray-500">User not found</div>
        </CardContent>
      </Card>
    );
  }
  
  // Check if this user is already a friend
  const isFriend = friends?.some((friend: any) => friend.id === userId);
  
  return (
    <Card className="mb-4 overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-[#FF5E3A] to-[#FF9500]"></div>
      <CardContent className="pt-0 relative">
        <div className="flex flex-col items-center -mt-12">
          <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.displayName} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.displayName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold mt-2">{user.displayName}</h2>
          <p className="text-sm text-gray-500">@{user.username}</p>
          
          {user.bio && <p className="text-sm text-center mt-2">{user.bio}</p>}
          
          {!isOwnProfile && (
            <div className="mt-3">
              <Button 
                size="sm" 
                variant={isFriend ? "secondary" : "primary"}
                isLoading={friendRequestMutation.isLoading}
                disabled={isFriend}
                onClick={() => friendRequestMutation.mutate()}
              >
                {isFriend ? 'Friends' : 'Add Friend'}
              </Button>
            </div>
          )}
        </div>
        
        {analytics && (
          <div className="grid grid-cols-3 gap-2 mt-6">
            <div className="text-center">
              <div className="text-xl font-bold">{analytics.totalPosts}</div>
              <div className="text-xs text-gray-500">Zyns</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{analytics.totalNicotine}mg</div>
              <div className="text-xs text-gray-500">Nicotine</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{analytics.totalReactions}</div>
              <div className="text-xs text-gray-500">Reactions</div>
            </div>
          </div>
        )}
        
        {analytics && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold mb-2">Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Favorite Flavor:</span>
                <span className="font-medium">{analytics.favoriteFlavorName} ({analytics.favoriteFlavorPercentage}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Top Mood:</span>
                <span className="font-medium">{analytics.favoriteMoodName} ({analytics.favoriteMoodPercentage}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Time:</span>
                <span className="font-medium">
                  {analytics.mostActiveHour}:00 ({analytics.mostActiveHourCount} zyns)
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
