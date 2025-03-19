import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardBadge } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FLAVORS, MOODS, NICOTINE_STRENGTHS, InsertPost } from '@shared/schema';
import { 
  MapPin, Target, Clock, Shield, Zap, File, ArrowRight,
  Upload, Camera, Crosshair, Compass, AlertTriangle, Map as MapIcon
} from 'lucide-react';
// Import Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Military-style duration selector
const DurationSelector = ({
  value,
  onChange
}: {
  value: number;
  onChange: (duration: number) => void;
}) => {
  const durations = [15, 30, 45, 60, 90, 120];
  
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {durations.map(duration => (
        <button
          key={duration}
          type="button"
          className={`py-2 px-3 rounded-md text-sm font-medium transition-all
            ${value === duration
              ? 'bg-accent text-white border-accent shadow-inner'
              : 'bg-background hover:bg-primary/5 border border-border'
            }`}
          onClick={() => onChange(duration)}
        >
          {duration} min
        </button>
      ))}
    </div>
  );
};

// Geolocation with reverse geocoding
interface LocationDetails {
  lat?: number;
  lng?: number;
  name?: string;
  address?: string;
}

// Tactical Map Component with Leaflet
const TacticalMapView = ({ 
  coordinates, 
  height = 200 
}: { 
  coordinates: { lat: number; lng: number }; 
  height?: number 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Fix for Leaflet icons not loading properly
    const fixLeafletIcon = () => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    };
    
    fixLeafletIcon();

    // Initialize map if not already done
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 13);
      
      // Add military-style tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(leafletMapRef.current);
      
      // Custom tactical marker
      const tacticalIcon = L.divIcon({
        className: 'custom-tactical-marker',
        html: `<div class="tactical-pin bg-accent p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="22" y1="12" x2="18" y2="12"></line>
                  <line x1="6" y1="12" x2="2" y2="12"></line>
                  <line x1="12" y1="6" x2="12" y2="2"></line>
                  <line x1="12" y1="22" x2="12" y2="18"></line>
                </svg>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      markerRef.current = L.marker([coordinates.lat, coordinates.lng], { 
        icon: tacticalIcon 
      }).addTo(leafletMapRef.current);
      
      // Add radius circle to indicate tactical area
      L.circle([coordinates.lat, coordinates.lng], {
        radius: 500,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(leafletMapRef.current);
    } else {
      // Update map view and marker position
      leafletMapRef.current.setView([coordinates.lat, coordinates.lng], 13);
      if (markerRef.current) {
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      }
    }
    
    // Add tactical coordinate lines
    const gridLayer = L.layerGroup().addTo(leafletMapRef.current);
    
    // Add tactical grid labels
    const latLabel = L.marker([coordinates.lat, coordinates.lng], {
      icon: L.divIcon({
        className: 'tactical-label',
        html: `<div class="bg-black/70 text-white text-xs p-1">LAT: ${coordinates.lat.toFixed(5)}</div>`,
        iconSize: [100, 20],
        iconAnchor: [100, 0]
      })
    }).addTo(gridLayer);
    
    const lngLabel = L.marker([coordinates.lat, coordinates.lng], {
      icon: L.divIcon({
        className: 'tactical-label',
        html: `<div class="bg-black/70 text-white text-xs p-1">LNG: ${coordinates.lng.toFixed(5)}</div>`,
        iconSize: [100, 20],
        iconAnchor: [0, 20]
      })
    }).addTo(gridLayer);
    
    return () => {
      if (leafletMapRef.current) {
        gridLayer.clearLayers();
      }
    };
  }, [coordinates]);

  return (
    <div className="border border-accent/30 rounded-md overflow-hidden relative">
      <div className="absolute top-2 left-2 z-10 bg-black/60 text-xs text-white px-2 py-1 rounded-sm">
        TACTICAL MAP
      </div>
      <div 
        ref={mapRef} 
        className="w-full" 
        style={{ height: `${height}px` }}
      ></div>
    </div>
  );
};

export function CreatePostForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const [locationData, setLocationData] = useState<LocationDetails>({});
  const [duration, setDuration] = useState(30);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  const createPostMutation = useMutation({
    mutationFn: async (postData: Omit<InsertPost, 'userId'>) => {
      const res = await apiRequest('POST', '/api/posts', postData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/posts']);
      toast({
        title: 'MISSION ACCOMPLISHED',
        description: 'Zyn deployment logged successfully.',
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'OPERATION FAILED',
        description: error.message || 'Could not log Zyn deployment. Retry mission.',
        variant: 'destructive',
      });
    },
  });
  
  // Reverse geocoding function
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // In a production app, you would use a service like Google Maps or Mapbox
      // For this demo, we'll use a simple placeholder
      return {
        name: 'Deployment Zone',
        address: 'Tactical Position'
      };
    } catch (error) {
      console.error('Error getting address:', error);
      return {
        name: 'Field Position',
        address: 'Coordinates Recorded'
      };
    }
  };
  
  const handleGetLocation = () => {
    setIsUsingLocation(true);
    setIsFetchingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Get location name through reverse geocoding
          const addressInfo = await getAddressFromCoordinates(lat, lng);
          
          setLocationData({
            lat,
            lng,
            name: addressInfo.name,
            address: addressInfo.address
          });
          
          toast({
            title: 'COORDINATES ACQUIRED',
            description: 'Your tactical position has been recorded.',
          });
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsUsingLocation(false);
          setIsFetchingLocation(false);
          toast({
            title: 'LOCATION INTEL FAILURE',
            description: 'Unable to secure coordinates. Position remains classified.',
            variant: 'destructive',
          });
        }
      );
    } else {
      setIsUsingLocation(false);
      setIsFetchingLocation(false);
      toast({
        title: 'RECON UNAVAILABLE',
        description: 'Your device does not support location tracking.',
        variant: 'destructive',
      });
    }
  };
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewImage(url);
  };
  
  const handleSubmit = (data: any) => {
    const postData: Omit<InsertPost, 'userId'> = {
      title: data.title,
      description: data.description,
      startTime: new Date(),
      duration,
      nicotineStrength: parseFloat(data.nicotineStrength),
      flavor: data.flavor,
      mood: data.mood,
      imageUrl: data.imageUrl,
      ...(isUsingLocation && locationData.lat && locationData.lng ? {
        latitude: locationData.lat,
        longitude: locationData.lng,
        locationName: locationData.name || 'Field Position',
      } : {}),
    };
    
    createPostMutation.mutate(postData);
  };
  
  return (
    <div className="max-w-md mx-auto px-4">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center bg-primary/10 rounded-lg px-4 py-2">
          <Target className="text-accent mr-2" size={20} />
          <h1 className="font-heading text-xl tracking-wide">NEW ZYN DEPLOYMENT</h1>
        </div>
      </div>
      
      <Card className="shadow-tactical border-primary/20">
        <CardHeader className="pb-2 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center">
            <Crosshair size={20} className="text-accent mr-2" />
            <CardTitle className="font-heading tracking-wide text-lg">MISSION PARAMETERS</CardTitle>
          </div>
          <p className="text-xs text-muted italic">
            Record your tactical Zyn deployment details for the pouch force
          </p>
        </CardHeader>
        
        <CardContent className="p-4">
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
                  label="OPERATION NAME"
                  methods={methods}
                  rules={{ required: 'Mission title is required' }}
                >
                  <Input 
                    placeholder="e.g., Morning Tactical Insertion" 
                    fullWidth 
                    leftIcon={<File size={16} />}
                  />
                </FormField>
                
                <FormField
                  name="description"
                  label="FIELD NOTES"
                  methods={methods}
                >
                  <TextArea 
                    placeholder="Document your experience or environmental conditions..." 
                    fullWidth 
                    rows={3}
                  />
                </FormField>
                
                <div className="mt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-medium uppercase text-primary">
                      DEPLOYMENT DURATION
                    </label>
                    <CardBadge color="accent" className="h-6">
                      <Clock size={12} className="mr-1" /> {duration} min
                    </CardBadge>
                  </div>
                  <DurationSelector value={duration} onChange={setDuration} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    name="nicotineStrength"
                    label="TACTICAL STRENGTH"
                    methods={methods}
                    rules={{ required: 'Strength classification required' }}
                  >
                    <div className="relative">
                      <select className="w-full px-4 py-2.5 bg-background border border-border rounded-ios appearance-none pr-10">
                        {NICOTINE_STRENGTHS.map(strength => (
                          <option key={strength} value={strength}>
                            {strength} mg
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Zap size={16} className="text-accent" />
                      </div>
                    </div>
                  </FormField>
                  
                  <FormField
                    name="flavor"
                    label="TACTICAL VARIANT"
                    methods={methods}
                    rules={{ required: 'Flavor designation required' }}
                  >
                    <div className="relative">
                      <select className="w-full px-4 py-2.5 bg-background border border-border rounded-ios appearance-none pr-10">
                        {FLAVORS.map(flavor => (
                          <option key={flavor} value={flavor}>
                            {flavor}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Shield size={16} className="text-primary" />
                      </div>
                    </div>
                  </FormField>
                </div>
                
                <FormField
                  name="mood"
                  label="MISSION STATUS"
                  methods={methods}
                  rules={{ required: 'Status classification required' }}
                >
                  <div className="relative">
                    <select className="w-full px-4 py-2.5 bg-background border border-border rounded-ios appearance-none pr-10">
                      {MOODS.map(mood => (
                        <option key={mood} value={mood}>
                          {mood}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Compass size={16} className="text-primary" />
                    </div>
                  </div>
                </FormField>
                
                <FormField
                  name="imageUrl"
                  label="RECONNAISSANCE IMAGERY"
                  methods={methods}
                >
                  <Input 
                    placeholder="https://example.com/tactical-image.jpg" 
                    fullWidth 
                    leftIcon={<Camera size={16} />}
                    onChange={handleImageUrlChange}
                  />
                </FormField>
                
                {previewImage && (
                  <div className="mt-3 border border-primary/20 rounded-ios overflow-hidden">
                    <div className="bg-primary/5 px-2 py-1 text-xs font-medium">
                      IMAGE PREVIEW
                    </div>
                    <div className="relative">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-auto max-h-48 object-cover"
                        onError={() => {
                          toast({
                            title: 'Image Error',
                            description: 'Could not load preview image.',
                            variant: 'destructive',
                          });
                          setPreviewImage(null);
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs py-0.5 px-2 rounded-sm">
                        TACTICAL IMAGERY
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 p-3 bg-background rounded-ios border border-border/70">
                  <div className="flex items-center mb-2">
                    <MapPin size={16} className="text-accent mr-2" />
                    <h4 className="text-sm font-medium">POSITION COORDINATES</h4>
                  </div>
                  
                  {isUsingLocation && locationData.lat ? (
                    <div className="mb-3">
                      <div className="flex items-center bg-accent/10 p-2 rounded-md">
                        <Crosshair size={16} className="text-accent mr-2" />
                        <div>
                          <p className="text-sm font-semibold">{locationData.name || 'Deployment Zone'}</p>
                          <p className="text-xs text-muted">{locationData.address || 'Coordinates secured'}</p>
                        </div>
                      </div>
                      
                      {/* Map toggle button */}
                      <div className="mt-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setShowMap(!showMap)}
                          className="flex items-center justify-center w-full py-1.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-md text-xs font-medium transition-colors"
                        >
                          <MapIcon size={14} className="mr-1.5 text-accent" />
                          {showMap ? 'HIDE TACTICAL MAP' : 'VIEW TACTICAL MAP'}
                        </button>
                      </div>
                      
                      {/* Tactical Map */}
                      {showMap && locationData.lat && locationData.lng && (
                        <div className="mb-3">
                          <TacticalMapView 
                            coordinates={{ 
                              lat: locationData.lat, 
                              lng: locationData.lng 
                            }} 
                            height={180}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted mb-3">
                      {isFetchingLocation 
                        ? 'Acquiring tactical position...'
                        : 'No location data. Deploy with concealed position or add coordinates.'}
                    </p>
                  )}
                  
                  <Button 
                    type="button" 
                    variant={isUsingLocation && locationData.lat ? 'accent' : 'outline'} 
                    onClick={handleGetLocation}
                    className="w-full"
                    isLoading={isFetchingLocation}
                    iconLeft={isUsingLocation && locationData.lat ? undefined : <MapPin size={16} />}
                  >
                    {isFetchingLocation
                      ? 'ACQUIRING POSITION'
                      : (isUsingLocation && locationData.lat
                        ? 'COORDINATES LOCKED'
                        : 'ADD TACTICAL POSITION')}
                  </Button>
                </div>
                
                <div className="mt-6">
                  <Button 
                    type="submit" 
                    fullWidth 
                    variant="primary"
                    isLoading={createPostMutation.isLoading}
                    iconRight={<ArrowRight size={16} />}
                    className="py-3"
                  >
                    {createPostMutation.isLoading ? 'DEPLOYING...' : 'DEPLOY MISSION REPORT'}
                  </Button>
                </div>
                
                <div className="mt-4 text-center text-xs text-muted italic">
                  "Front-line pouchers record every deployment with precision."
                </div>
              </>
            )}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
