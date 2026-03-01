'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  MapPin,
  ArrowUpRight,
  Users,
  Building2,
  Globe
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDepartmentById, getDomainById, DOMAIN_COLORS } from '@/lib/complaint-categories';

interface MapComplaint {
  id: number;
  title: string;
  description: string;
  domain: string | null;
  department: string | null;
  category: string;
  priority: string;
  status: string;
  latitude: number;
  longitude: number;
  locationAddress: string | null;
  escalationLevel: number | null;
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Ground Worker',
  2: 'Supervisor',
  3: 'Domain Officer',
};

export default function AuthorityMapPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<MapComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<MapComplaint | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  useEffect(() => {
    if (user && user.verificationStatus === 'verified') {
      fetchMapData();
    }
  }, [user, statusFilter, priorityFilter]);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        LRef.current = L.default;
        setLeafletLoaded(true);
      }
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current || !LRef.current) return;

    const L = LRef.current;
    mapRef.current = L.map(mapContainerRef.current).setView([19.0760, 72.8777], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !markersRef.current || !LRef.current) return;
    
    const L = LRef.current;
    markersRef.current.clearLayers();

    complaints.forEach((complaint) => {
      if (!complaint.latitude || !complaint.longitude) return;

      const markerColor = getMarkerColor(complaint.priority, complaint.escalationLevel, complaint.domain);
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${markerColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            ${complaint.escalationLevel && complaint.escalationLevel >= 2 ? 'animation: pulse 1.5s infinite;' : ''}
          ">
            <span style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">
              ${complaint.escalationLevel && complaint.escalationLevel >= 2 ? '!' : '•'}
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([complaint.latitude, complaint.longitude], { icon })
        .addTo(markersRef.current!);

      const domainLabel = complaint.domain ? getDomainById(complaint.domain)?.label || complaint.domain : 'Unknown';
      
      const tooltipContent = `
        <div style="min-width: 200px; padding: 8px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${complaint.title}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
            ${complaint.description.slice(0, 80)}...
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <span style="
              background: ${getPriorityBgColor(complaint.priority)};
              color: ${getPriorityTextColor(complaint.priority)};
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
            ">${complaint.priority.toUpperCase()}</span>
            <span style="
              background: ${getStatusBgColor(complaint.status)};
              color: ${getStatusTextColor(complaint.status)};
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
            ">${complaint.status.replace('_', ' ')}</span>
            ${complaint.escalationLevel && complaint.escalationLevel >= 2 ? `
              <span style="
                background: #f97316;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
              ">Level ${complaint.escalationLevel}</span>
            ` : ''}
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: ${DOMAIN_COLORS[complaint.domain || 'civic']};">
            ${domainLabel}
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -32],
        opacity: 0.95,
      });

      marker.on('click', () => {
        setSelectedComplaint(complaint);
      });
    });

    if (complaints.length > 0 && complaints.some(c => c.latitude && c.longitude)) {
      const validComplaints = complaints.filter(c => c.latitude && c.longitude);
      const bounds = L.latLngBounds(
        validComplaints.map(c => [c.latitude, c.longitude] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [complaints, leafletLoaded]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: user!.id.toString(),
        status: statusFilter,
        includeMap: 'true',
      });
      
      const response = await fetch(`/api/authority/complaints?${params}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      let filteredData = data.mapData || [];
      if (priorityFilter !== 'all') {
        filteredData = filteredData.filter((c: MapComplaint) => c.priority === priorityFilter);
      }
      
      setComplaints(filteredData);
      setUserLevel(data.userLevel || user?.authorityLevel || 1);
    } catch (error) {
      console.error('Error fetching map data:', error);
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (priority: string, escalationLevel: number | null, domain: string | null) => {
    if (escalationLevel && escalationLevel >= 3) return '#dc2626';
    if (escalationLevel && escalationLevel >= 2) return '#f97316';
    
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return DOMAIN_COLORS[domain || 'civic'] || '#6b7280';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#fee2e2';
      case 'high': return '#ffedd5';
      case 'medium': return '#fef3c7';
      case 'low': return '#dcfce7';
      default: return '#f3f4f6';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#f3f4f6';
      case 'assigned': return '#dbeafe';
      case 'in_progress': return '#f3e8ff';
      case 'resolved': return '#dcfce7';
      case 'escalated': return '#ffedd5';
      default: return '#f3f4f6';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#6b7280';
      case 'assigned': return '#2563eb';
      case 'in_progress': return '#9333ea';
      case 'resolved': return '#16a34a';
      case 'escalated': return '#ea580c';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-gray-100 text-gray-700';
      case 'assigned': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'escalated': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScopeLabel = () => {
    if (userLevel === 1) return 'Your Assigned Complaints';
    if (userLevel === 2) {
      const dept = getDepartmentById(user?.department || '');
      return dept ? `${dept.department.icon} ${dept.department.label}` : 'Department';
    }
    if (userLevel === 3) {
      const domain = getDomainById(user?.domain || '');
      return domain ? `${domain.icon} ${domain.label}` : 'Domain';
    }
    return 'Complaints';
  };

  const getLevelIcon = () => {
    switch (userLevel) {
      case 1: return <Users className="w-4 h-4" />;
      case 2: return <Building2 className="w-4 h-4" />;
      case 3: return <Globe className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['authority']}>
      <DashboardLayout title="Complaints Map">
        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { transform: rotate(-45deg) scale(1); }
            50% { transform: rotate(-45deg) scale(1.1); }
          }
          .leaflet-tooltip {
            background: white !important;
            border: none !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            padding: 0 !important;
          }
          .leaflet-tooltip-top:before {
            border-top-color: white !important;
          }
        `}</style>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/authority">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{getScopeLabel()} - Map View</h2>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getLevelIcon()}
                    Level {userLevel} - {LEVEL_LABELS[userLevel]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Showing {complaints.length} complaint locations
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span>Critical / L3 Escalated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span>High / L2 Escalated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span>Low</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="overflow-hidden">
                <div 
                  ref={mapContainerRef} 
                  className="h-[600px] w-full"
                  style={{ zIndex: 0 }}
                />
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="h-[600px] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {selectedComplaint ? 'Selected Complaint' : 'Complaints List'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-y-auto h-[calc(600px-60px)]">
                  {selectedComplaint ? (
                    <div className="space-y-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedComplaint(null)}
                        className="mb-2"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to list
                      </Button>

                      <div>
                        <h3 className="font-bold">{selectedComplaint.title}</h3>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge className={getStatusColor(selectedComplaint.status)}>
                            {selectedComplaint.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="uppercase">
                            {selectedComplaint.priority}
                          </Badge>
                          {selectedComplaint.escalationLevel && selectedComplaint.escalationLevel >= 2 && (
                            <Badge className="bg-orange-500 text-white">
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                              L{selectedComplaint.escalationLevel}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {selectedComplaint.domain && (
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: DOMAIN_COLORS[selectedComplaint.domain], 
                            color: DOMAIN_COLORS[selectedComplaint.domain] 
                          }}
                        >
                          {getDomainById(selectedComplaint.domain)?.icon} {getDomainById(selectedComplaint.domain)?.label}
                        </Badge>
                      )}

                      <p className="text-sm text-gray-600">{selectedComplaint.description}</p>

                      {selectedComplaint.locationAddress && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          <p className="text-sm flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {selectedComplaint.locationAddress}
                          </p>
                        </div>
                      )}

                      <Link href="/authority">
                        <Button className="w-full">
                          Manage This Complaint
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {complaints.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No complaints with locations</p>
                        </div>
                      ) : (
                        complaints.map((complaint) => (
                          <div
                            key={complaint.id}
                            className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                              complaint.escalationLevel && complaint.escalationLevel >= 2 
                                ? 'border-orange-300 bg-orange-50' 
                                : 'border-gray-200'
                            }`}
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              if (mapRef.current) {
                                mapRef.current.setView([complaint.latitude, complaint.longitude], 16);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{complaint.title}</h4>
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      complaint.priority === 'critical' ? 'border-red-500 text-red-600' :
                                      complaint.priority === 'high' ? 'border-orange-500 text-orange-600' :
                                      ''
                                    }`}
                                  >
                                    {complaint.priority}
                                  </Badge>
                                  {complaint.escalationLevel && complaint.escalationLevel >= 2 && (
                                    <Badge className="bg-orange-500 text-white text-xs">
                                      L{complaint.escalationLevel}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Badge className={`${getStatusColor(complaint.status)} text-xs`}>
                                {complaint.status === 'in_progress' ? 'WIP' : complaint.status.slice(0, 3)}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
