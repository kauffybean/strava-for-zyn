import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardBadge } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Search, UserPlus, Check, Shield, X, 
  Radio, Clock, AlertTriangle, UserCheck, Loader2
} from 'lucide-react';

// Friend request type
type FriendRequest = {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted';
  createdAt: string;
  sender: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
};

// User search result type
type UserSearchResult = {
  id: number;
  username: string;
  displayName: string;
  avatar?: string;
};

export function FriendManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'search' | 'friends'>('friends');
  
  // Fetch friend requests
  const { 
    data: friendRequests = [], 
    isLoading: isLoadingRequests 
  } = useQuery<FriendRequest[]>({
    queryKey: ['/api/friends/requests'],
    queryFn: getQueryFn(),
    enabled: activeTab === 'requests'
  });
  
  // Fetch friends list
  const { 
    data: friends = [], 
    isLoading: isLoadingFriends 
  } = useQuery<UserSearchResult[]>({
    queryKey: ['/api/friends'],
    queryFn: getQueryFn(),
  });
  
  // Search users
  const { 
    data: searchResults = [], 
    isLoading: isSearching,
    refetch: refetchSearch 
  } = useQuery<UserSearchResult[]>({
    queryKey: ['/api/search/users', searchQuery],
    queryFn: () => getQueryFn()(`/api/search/users?q=${encodeURIComponent(searchQuery)}`),
    enabled: false, // Only search when requested
  });
  
  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (friendId: number) => {
      await apiRequest('POST', '/api/friends/request', { friendId });
    },
    onSuccess: () => {
      toast({
        title: 'RECRUITMENT INITIATED',
        description: 'Tactical friend request deployed successfully.',
      });
      refetchSearch();
    },
    onError: (error: Error) => {
      toast({
        title: 'RECRUITMENT FAILED',
        description: error.message || 'Could not send friend request.',
        variant: 'destructive',
      });
    },
  });
  
  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest('PUT', `/api/friends/accept/${requestId}`);
    },
    onSuccess: () => {
      toast({
        title: 'SQUAD MEMBER ADDED',
        description: 'Friend request accepted. New ally in your squad.',
      });
      queryClient.invalidateQueries(['/api/friends/requests']);
      queryClient.invalidateQueries(['/api/friends']);
    },
    onError: (error: Error) => {
      toast({
        title: 'OPERATION FAILED',
        description: error.message || 'Could not accept friend request.',
        variant: 'destructive',
      });
    },
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      refetchSearch();
    }
  };
  
  const handleSendRequest = (friendId: number) => {
    sendRequestMutation.mutate(friendId);
  };
  
  const handleAcceptRequest = (requestId: number) => {
    acceptRequestMutation.mutate(requestId);
  };
  
  const renderFriendsList = () => {
    if (isLoadingFriends) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-accent mr-2" />
          <span className="text-sm font-medium">LOADING SQUAD ROSTER...</span>
        </div>
      );
    }
    
    if (friends.length === 0) {
      return (
        <div className="text-center py-6 bg-background rounded-ios border border-primary/20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
            <Users size={24} className="text-primary/70" />
          </div>
          <h3 className="font-heading font-semibold mb-2">NO ACTIVE SQUAD MEMBERS</h3>
          <p className="text-sm text-muted mb-4 max-w-xs mx-auto">
            Your tactical team is empty. Search for pouchers and recruit them to your squad.
          </p>
          <Button 
            onClick={() => setActiveTab('search')} 
            variant="accent"
            iconRight={<Search size={16} />}
          >
            RECRUIT POUCHERS
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="px-3 py-2 bg-primary/5 rounded-md mb-2 text-xs font-medium">
          <div className="flex items-center justify-between">
            <span>SQUAD ROSTER</span>
            <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-sm">
              {friends.length} ACTIVE
            </span>
          </div>
        </div>
        
        {friends.map(friend => (
          <div 
            key={friend.id} 
            className="flex items-center p-3 bg-background border border-border rounded-ios"
          >
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center text-primary flex-shrink-0 relative overflow-hidden mr-3">
              {friend.avatar ? (
                <img 
                  src={friend.avatar} 
                  alt={friend.displayName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading font-bold">{friend.displayName.charAt(0).toUpperCase()}</span>
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border border-background flex items-center justify-center">
                <Shield size={8} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-medium text-sm">{friend.displayName}</h4>
                <CardBadge className="ml-2 h-5" color="primary">ALLIED</CardBadge>
              </div>
              <p className="text-xs text-muted">@{friend.username}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderFriendRequests = () => {
    if (isLoadingRequests) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-accent mr-2" />
          <span className="text-sm font-medium">CHECKING ENLISTMENT REQUESTS...</span>
        </div>
      );
    }
    
    if (friendRequests.length === 0) {
      return (
        <div className="text-center py-6 bg-background rounded-ios border border-primary/20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
            <Radio size={24} className="text-primary/70" />
          </div>
          <h3 className="font-heading font-semibold mb-2">NO PENDING REQUESTS</h3>
          <p className="text-sm text-muted max-w-xs mx-auto">
            Your communications channel is clear. No pending squad enlistment requests.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <div className="px-3 py-2 bg-primary/5 rounded-md mb-2 text-xs font-medium">
          <div className="flex items-center justify-between">
            <span>PENDING SQUAD ENLISTMENTS</span>
            <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-sm">
              {friendRequests.length} PENDING
            </span>
          </div>
        </div>
        
        {friendRequests.map(request => (
          <div 
            key={request.id} 
            className="flex items-center p-3 bg-background border border-accent/30 rounded-ios"
          >
            <div className="w-10 h-10 rounded-full border-2 border-accent/20 bg-accent/5 flex items-center justify-center text-primary flex-shrink-0 relative overflow-hidden mr-3">
              {request.sender.avatar ? (
                <img 
                  src={request.sender.avatar} 
                  alt={request.sender.displayName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading font-bold">{request.sender.displayName.charAt(0).toUpperCase()}</span>
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border border-background flex items-center justify-center">
                <Users size={8} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-medium text-sm">{request.sender.displayName}</h4>
                <div className="ml-2 text-xs bg-accent/10 px-1.5 py-0.5 rounded-sm text-accent font-medium">
                  REQUESTING
                </div>
              </div>
              <div className="flex items-center text-xs text-muted mt-0.5">
                <Clock size={10} className="mr-1" />
                <span>Request sent {new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="accent"
                onClick={() => handleAcceptRequest(request.id)}
                iconLeft={<Check size={14} />}
                isLoading={acceptRequestMutation.isPending && acceptRequestMutation.variables === request.id}
              >
                ACCEPT
              </Button>
              <Button
                size="sm"
                variant="outline"
                iconLeft={<X size={14} />}
              >
                DENY
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderSearchResults = () => {
    if (searchQuery.trim().length < 2) {
      return (
        <div className="text-center py-6 bg-background/50 rounded-ios border border-primary/10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 mb-3">
            <Search size={24} className="text-primary/60" />
          </div>
          <h3 className="font-medium mb-2">INITIATE RECONNAISSANCE</h3>
          <p className="text-sm text-muted max-w-xs mx-auto">
            Enter at least 2 characters to search for potential squad members
          </p>
        </div>
      );
    }
    
    if (isSearching) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-accent mr-2" />
          <span className="text-sm font-medium">SCANNING FOR POUCHERS...</span>
        </div>
      );
    }
    
    if (searchResults.length === 0) {
      return (
        <div className="text-center py-6 bg-background/50 rounded-ios border border-primary/10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 mb-3">
            <AlertTriangle size={24} className="text-primary/60" />
          </div>
          <h3 className="font-medium mb-2">NO MATCHES FOUND</h3>
          <p className="text-sm text-muted max-w-xs mx-auto">
            No pouchers found matching "{searchQuery}". Try different keywords.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="px-3 py-2 bg-primary/5 rounded-md mb-2 text-xs font-medium">
          <div className="flex items-center justify-between">
            <span>SEARCH RESULTS</span>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-sm">
              {searchResults.length} FOUND
            </span>
          </div>
        </div>
        
        {searchResults.map(user => {
          const isFriend = friends.some(friend => friend.id === user.id);
          
          return (
            <div 
              key={user.id} 
              className="flex items-center p-3 bg-background border border-border rounded-ios"
            >
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center text-primary flex-shrink-0 relative overflow-hidden mr-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.displayName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-heading font-bold">{user.displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-sm">{user.displayName}</h4>
                <p className="text-xs text-muted">@{user.username}</p>
              </div>
              
              {isFriend ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  iconLeft={<UserCheck size={14} />}
                >
                  ENLISTED
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => handleSendRequest(user.id)}
                  iconLeft={<UserPlus size={14} />}
                  isLoading={sendRequestMutation.isPending && sendRequestMutation.variables === user.id}
                >
                  RECRUIT
                </Button>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2 bg-primary/5 border-b border-primary/10">
        <div className="flex items-center">
          <Users size={18} className="text-accent mr-2" />
          <CardTitle className="font-heading tracking-wide text-lg">SQUAD MANAGEMENT</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Tab navigation */}
        <div className="flex border-b border-border mb-4">
          <button
            className={`flex-1 py-2 px-3 text-sm font-medium ${
              activeTab === 'friends' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-muted hover:text-primary'
            }`}
            onClick={() => setActiveTab('friends')}
          >
            SQUAD ({friends.length})
          </button>
          <button
            className={`flex-1 py-2 px-3 text-sm font-medium ${
              activeTab === 'requests' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-muted hover:text-primary'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            REQUESTS ({friendRequests.length})
          </button>
          <button
            className={`flex-1 py-2 px-3 text-sm font-medium ${
              activeTab === 'search' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-muted hover:text-primary'
            }`}
            onClick={() => setActiveTab('search')}
          >
            RECRUIT
          </button>
        </div>
        
        {/* Tab content */}
        {activeTab === 'search' && (
          <div>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search for pouchers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted">
                  <Search size={16} />
                </div>
              </div>
              <Button 
                type="submit" 
                variant="primary"
                disabled={searchQuery.trim().length < 2}
              >
                SCAN
              </Button>
            </form>
            
            {renderSearchResults()}
          </div>
        )}
        
        {activeTab === 'requests' && renderFriendRequests()}
        
        {activeTab === 'friends' && renderFriendsList()}
      </CardContent>
    </Card>
  );
}