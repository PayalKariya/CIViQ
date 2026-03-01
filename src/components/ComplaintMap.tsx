'use client';

import { useEffect, useRef, useState } from 'react';

interface Complaint {
  id: string;
  location_lat: number;
  location_long: number;
  description: string;
  urgency: string;
  status: string;
  domain: string;
  title?: string;
  locationAddress?: string;
}

interface ComplaintMapProps {
  complaints: Complaint[];
  onMarkerClick?: (id: string) => void;
}

export const ComplaintMap = ({ complaints, onMarkerClick }: ComplaintMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const LRef = useRef<any>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        await import('leaflet.markercluster/dist/MarkerCluster.css');
        await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
        await import('leaflet.markercluster');
        
        LRef.current = L.default;
        
        delete (LRef.current.Icon.Default.prototype as any)._getIconUrl;
        LRef.current.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        
        setLeafletLoaded(true);
      }
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current || !LRef.current) return;

    const L = LRef.current;
    const map = L.map(mapRef.current).setView([19.0760, 72.8777], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        let size = 'small';
        let colorClass = 'bg-primary';

        if (count > 10) {
          size = 'large';
          colorClass = 'bg-destructive';
        } else if (count > 5) {
          size = 'medium';
          colorClass = 'bg-warning';
        }

        return L.divIcon({
          html: `<div class="flex items-center justify-center w-full h-full rounded-full ${colorClass} text-white font-bold">${count}</div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40),
        });
      },
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !markersLayerRef.current || !mapInstanceRef.current || !LRef.current) return;

    const L = LRef.current;
    markersLayerRef.current.clearLayers();

    complaints.forEach((complaint) => {
      if (complaint.location_lat && complaint.location_long) {
        const getMarkerColor = (urgency: string) => {
          switch (urgency.toLowerCase()) {
            case 'high':
            case 'critical':
              return '#ef4444';
            case 'medium':
              return '#f59e0b';
            case 'low':
              return '#22c55e';
            default:
              return '#3b82f6';
          }
        };

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${getMarkerColor(complaint.urgency)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([complaint.location_lat, complaint.location_long], {
          icon: customIcon,
        });

        const tooltipContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #1f2937;">${complaint.domain}</h3>
            <p style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">${complaint.description.substring(0, 80)}${complaint.description.length > 80 ? '...' : ''}</p>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background-color: ${getMarkerColor(complaint.urgency)}; color: white; font-weight: 500;">${complaint.urgency}</span>
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background-color: #e5e7eb; color: #374151;">${complaint.status}</span>
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10],
          opacity: 0.95,
          className: 'custom-tooltip'
        });

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-sm mb-1">${complaint.domain}</h3>
            <p class="text-xs mb-2">${complaint.description}</p>
            <div class="flex gap-2 flex-wrap">
              <span class="text-xs px-2 py-1 rounded bg-gray-100">${complaint.urgency}</span>
              <span class="text-xs px-2 py-1 rounded bg-gray-100">${complaint.status}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(complaint.id));
        }

        markersLayerRef.current?.addLayer(marker);
      }
    });

    mapInstanceRef.current.addLayer(markersLayerRef.current);

    if (complaints.length > 0) {
      const bounds = markersLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [complaints, onMarkerClick, leafletLoaded]);

  if (!leafletLoaded) {
    return (
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg flex items-center justify-center bg-gray-100" style={{ minHeight: '500px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" style={{ minHeight: '500px' }} />;
};
