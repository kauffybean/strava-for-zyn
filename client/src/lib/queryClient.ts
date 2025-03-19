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
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.status === 401) {
        if (options.on401 === 'returnNull') {
          return null;
        }
        throw new Error('Unauthorized');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  };
};
