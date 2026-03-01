'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserComplaints();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = complaints.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.locationAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredComplaints(filtered);
    } else {
      setFilteredComplaints(complaints);
    }
  }, [searchTerm, complaints]);

  const fetchUserComplaints = async () => {
    try {
      const response = await fetch(`/api/complaints?userId=${user?.id}&limit=100`);
      const data = await response.json();
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 border-red-600';
      case 'high':
        return 'text-orange-600 border-orange-600';
      case 'medium':
        return 'text-yellow-600 border-yellow-600';
      case 'low':
        return 'text-green-600 border-green-600';
      default:
        return 'text-gray-600 border-gray-600';
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: complaints.length,
      submitted: complaints.filter((c) => c.status === 'submitted').length,
      inProgress: complaints.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length,
      resolved: complaints.filter((c) => c.status === 'resolved').length,
      rejected: complaints.filter((c) => c.status === 'rejected').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <ProtectedRoute allowedRoles={['citizen']}>
      <DashboardLayout title="My Complaints">
        <div className="space-y-6">
          {/* Header */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">My Complaints</CardTitle>
                  <CardDescription>
                    Track and manage all your submitted complaints
                  </CardDescription>
                </div>
                <Link href="/citizen/submit">
                  <Button>
                    Report New Issue
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-0 shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
                <div className="text-xs text-gray-600">Submitted</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-xs text-gray-600">Resolved</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-xs text-gray-600">Rejected</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search complaints..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {loading ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center text-gray-500">
                  Loading...
                </CardContent>
              </Card>
            ) : filteredComplaints.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No complaints found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Start by reporting your first issue'}
                  </p>
                  {!searchTerm && (
                    <Link href="/citizen/submit">
                      <Button>Report New Issue</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold">{complaint.title}</h3>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">{complaint.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">ID:</span> #{complaint.id}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                          {complaint.locationAddress && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {complaint.locationAddress}
                            </span>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {complaint.category}
                          </Badge>
                        </div>

                        {complaint.isAnonymous && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Anonymous Submission
                          </Badge>
                        )}
                      </div>

                        <div className="flex flex-col gap-2">
                          <Link href={`/citizen/complaints/${complaint.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          {complaint.status === 'resolved' && (
                            <Button variant="outline" size="sm">
                              Give Feedback
                            </Button>
                          )}
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
