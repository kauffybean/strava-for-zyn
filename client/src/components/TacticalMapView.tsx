import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type TacticalMapViewProps = {
  coordinates: {
    lat: number;
    lng: number;
  };
  height?: number;
};

// Military-style icon for the map marker
const createTacticalMarker = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="w-5 h-5 rounded-full bg-accent border-2 border-white flex items-center justify-center">
            <div class="w-1 h-1 bg-white rounded-full"></div>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const TacticalMapView: React.FC<TacticalMapViewProps> = ({ coordinates, height = 200 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        boxZoom: false,
        doubleClickZoom: false,
        keyboard: false,
        scrollWheelZoom: false,
        touchZoom: false
      }).setView([coordinates.lat, coordinates.lng], 14);

      // Use a military-style map layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Add a custom tactical marker
      L.marker([coordinates.lat, coordinates.lng], {
        icon: createTacticalMarker()
      }).addTo(map);

      // Add a circle around the position to indicate area
      L.circle([coordinates.lat, coordinates.lng], {
        radius: 300,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        color: '#3b82f6',
        weight: 1
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      // Update view if coordinates change
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 14);
      
      // Clear existing layers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          mapInstanceRef.current?.removeLayer(layer);
        }
      });
      
      // Add updated marker and circle
      L.marker([coordinates.lat, coordinates.lng], {
        icon: createTacticalMarker()
      }).addTo(mapInstanceRef.current);
      
      L.circle([coordinates.lat, coordinates.lng], {
        radius: 300,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        color: '#3b82f6',
        weight: 1
      }).addTo(mapInstanceRef.current);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates]);

  return (
    <div 
      ref={mapRef} 
      className="rounded-md overflow-hidden border border-border/60"
      style={{ height: `${height}px` }}
    />
  );
};

export default TacticalMapView;