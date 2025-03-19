import { QueryClient } from '@tanstack/react-query';

type ApiRequestOptions = {
  on401?: 'throw' | 'returnNull';
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

export const apiRequest = async (
  method: string,
  url: string,
  body?: any
): Promise<Response> => {
  // Use relative URL to work in any environment
  const fullUrl = url.startsWith('/') ? url : `/${url}`;
  
  const response = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...(body && { body: JSON.stringify(body) }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText || 'Error making request');
  }
  
  return response;
};

export const getQueryFn = (options: ApiRequestOptions = {}) => {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [url] = queryKey;
    
    // Use relative URL to work in any environment
    const fullUrl = url.startsWith('/') ? url : `/${url}`;
    
    try {
      console.log(`Making query request to: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.status === 401) {
        console.log(`Got 401 for ${fullUrl}, handling with option: ${options.on401 || 'throw'}`);
        if (options.on401 === 'returnNull') {
          return null;
        }
        throw new Error('Unauthorized');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from ${fullUrl}:`, errorText);
        throw new Error(errorText || 'Error fetching data');
      }
      
      const data = await response.json();
      console.log(`Successful query response from ${fullUrl}:`, data);
      
      // For post queries, ensure each post has a properly structured user object
      // to prevent "Cannot read property 'avatar' of undefined" errors
      if (url.includes('/posts') && Array.isArray(data)) {
        return data.map((post: any) => {
          if (!post) return null;
          
          // Ensure post has all required fields
          const safePost = {
            ...post,
            id: post.id || 0,
            userId: post.userId || 0,
            title: post.title || 'Untitled Deployment',
            description: post.description || undefined,
            imageUrl: post.imageUrl || undefined,
            locationName: post.locationName || undefined,
            startTime: post.startTime || new Date(),
            duration: post.duration || 0,
            nicotineStrength: post.nicotineStrength || 3,
            flavor: post.flavor || 'mint',
            mood: post.mood || 'focused',
            createdAt: post.createdAt || new Date(),
            // Guarantee user object is properly structured
            user: post.user ? {
              id: post.user.id || post.userId || 0,
              username: post.user.username || 'unknown',
              displayName: post.user.displayName || 'Unknown User',
              avatar: post.user.avatar || undefined
            } : {
              id: post.userId || 0,
              username: 'unknown',
              displayName: 'Unknown User',
              avatar: undefined
            }
          };
          
          return safePost;
        });
      }
      
      return data;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  };
};
