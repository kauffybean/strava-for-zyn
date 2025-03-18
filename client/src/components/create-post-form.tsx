import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FLAVORS, MOODS, NICOTINE_STRENGTHS, InsertPost } from '@shared/schema';

export function CreatePostForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const [locationData, setLocationData] = useState<{ lat?: number, lng?: number, name?: string }>({});
  
  const createPostMutation = useMutation({
    mutationFn: async (postData: Omit<InsertPost, 'userId'>) => {
      const res = await apiRequest('POST', '/api/posts', postData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/posts']);
      toast({
        title: 'Post created!',
        description: 'Your Zyn activity has been posted.',
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleGetLocation = () => {
    setIsUsingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location', // This could be improved with reverse geocoding
          });
          toast({
            title: 'Location acquired',
            description: 'Your current location will be added to the post.',
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsUsingLocation(false);
          toast({
            title: 'Location error',
            description: 'Could not get your location. Please try again.',
            variant: 'destructive',
          });
        }
      );
    } else {
      setIsUsingLocation(false);
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSubmit = (data: any) => {
    const postData: Omit<InsertPost, 'userId'> = {
      title: data.title,
      description: data.description,
      startTime: new Date(),
      nicotineStrength: parseFloat(data.nicotineStrength),
      flavor: data.flavor,
      mood: data.mood,
      imageUrl: data.imageUrl,
      ...(isUsingLocation && locationData.lat && locationData.lng ? {
        latitude: locationData.lat,
        longitude: locationData.lng,
        locationName: locationData.name,
      } : {}),
    };
    
    createPostMutation.mutate(postData);
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Log a Zyn</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit} defaultValues={{
          title: '',
          description: '',
          nicotineStrength: NICOTINE_STRENGTHS[0].toString(),
          flavor: FLAVORS[0],
          mood: MOODS[0],
          imageUrl: '',
        }}>
          {(methods) => (
            <>
              <FormField
                name="title"
                label="Title"
                methods={methods}
                rules={{ required: 'Title is required' }}
              >
                <Input placeholder="e.g., Morning Buzz" fullWidth />
              </FormField>
              
              <FormField
                name="description"
                label="Description (optional)"
                methods={methods}
              >
                <Input as="textarea" placeholder="How was your experience?" fullWidth />
              </FormField>
              
              <FormField
                name="nicotineStrength"
                label="Nicotine Strength"
                methods={methods}
                rules={{ required: 'Strength is required' }}
              >
                <select className="ios-input w-full">
                  {NICOTINE_STRENGTHS.map(strength => (
                    <option key={strength} value={strength}>
                      {strength} mg
                    </option>
                  ))}
                </select>
              </FormField>
              
              <FormField
                name="flavor"
                label="Flavor"
                methods={methods}
                rules={{ required: 'Flavor is required' }}
              >
                <select className="ios-input w-full">
                  {FLAVORS.map(flavor => (
                    <option key={flavor} value={flavor}>
                      {flavor}
                    </option>
                  ))}
                </select>
              </FormField>
              
              <FormField
                name="mood"
                label="Mood/Vibe"
                methods={methods}
                rules={{ required: 'Mood is required' }}
              >
                <select className="ios-input w-full">
                  {MOODS.map(mood => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
              </FormField>
              
              <FormField
                name="imageUrl"
                label="Image URL (optional)"
                methods={methods}
              >
                <Input placeholder="https://example.com/image.jpg" fullWidth />
              </FormField>
              
              <div className="mt-4">
                <Button 
                  type="button" 
                  variant={isUsingLocation ? 'primary' : 'outline'} 
                  onClick={handleGetLocation}
                  className="mb-4 w-full"
                >
                  {isUsingLocation 
                    ? (locationData.lat ? '✓ Location Added' : 'Getting Location...') 
                    : 'Add Current Location'}
                </Button>
                
                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={createPostMutation.isLoading}
                >
                  Post Zyn Activity
                </Button>
              </div>
            </>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}
