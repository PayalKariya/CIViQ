'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { MapPin, Filter, Layers } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DOMAINS, DOMAIN_COLORS, getDomainById } from '@/lib/complaint-categories';

const ComplaintMap = dynamic(() => import('@/components/ComplaintMap').then(mod => ({ default: mod.ComplaintMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ minHeight: '500px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

export default function ComplaintsMap() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priority: 'all',
  });
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  useEffect(() => {
    fetchMapData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, complaints]);

  const fetchMapData = async () => {
    try {
      const response = await fetch('/api/complaints/map');
      const data = await response.json();
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (error) {
      console.error('Error fetching map data:', error);
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...complaints];

    if (filters.category !== 'all') {
      filtered = filtered.filter((c) => c.domain === filters.category || c.category === filters.category);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter((c) => c.status === filters.status);
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter((c) => c.priority === filters.priority);
    }

    setFilteredComplaints(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-700';
      case 'assigned':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'escalated':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Transform complaints data for the map component
  const mapComplaints = filteredComplaints.map((c) => ({
    id: c.id,
    location_lat: c.latitude,
    location_long: c.longitude,
    description: c.description || c.title || 'No description',
    title: c.title,
    urgency: c.priority,
    status: c.status,
    domain: c.category,
    locationAddress: c.locationAddress,
  }));

  const handleMarkerClick = (id: string) => {
    const complaint = filteredComplaints.find((c) => c.id === id);
    if (complaint) {
      setSelectedComplaint(complaint);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['citizen', 'authority', 'admin']}>
      <DashboardLayout title="Complaints Map">
        <div className="space-y-6">
          {/* Header */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Interactive Complaints Map</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Showing {filteredComplaints.length} of {complaints.length} complaints across Mumbai
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Layers className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setFilters({ category: 'all', status: 'all', priority: 'all' })}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Filters */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Filter Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">Domain</label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters({ ...filters, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Domains</SelectItem>
                        {DOMAINS.map((domain) => (
                          <SelectItem key={domain.id} value={domain.id}>
                            <span className="flex items-center gap-2">
                              <span>{domain.icon}</span>
                              <span>{domain.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => setFilters({ ...filters, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Visualization */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Map Area with Leaflet */}
            <Card className="md:col-span-2 border-0 shadow-lg">
              <CardContent className="p-0">
                {loading ? (
                  <div className="h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[600px] rounded-lg overflow-hidden">
                    <ComplaintMap 
                      complaints={mapComplaints} 
                      onMarkerClick={handleMarkerClick}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complaints List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Nearby Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[540px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : filteredComplaints.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No complaints found</div>
                  ) : (
                    filteredComplaints.slice(0, 20).map((complaint) => (
                      <div
                        key={complaint.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          selectedComplaint?.id === complaint.id ? 'border-primary bg-accent' : ''
                        }`}
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm line-clamp-1">{complaint.title}</h4>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{complaint.locationAddress || 'No address'}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {complaint.category}
                          </Badge>
                          <Badge variant="outline" className={getPriorityBadgeColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Map Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
                    ●
                  </div>
                  <div>
                    <div className="font-semibold">Critical/High Priority</div>
                    <div className="text-xs text-muted-foreground">Requires immediate attention</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
                    ●
                  </div>
                  <div>
                    <div className="font-semibold">Medium Priority</div>
                    <div className="text-xs text-muted-foreground">Standard issues</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
                    ●
                  </div>
                  <div>
                    <div className="font-semibold">Low Priority</div>
                    <div className="text-xs text-muted-foreground">Minor concerns</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {filteredComplaints.length > 5 ? '5+' : filteredComplaints.length}
                  </div>
                  <div>
                    <div className="font-semibold">Cluster Markers</div>
                    <div className="text-xs text-muted-foreground">Multiple complaints in area</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}