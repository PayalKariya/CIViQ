'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  MapPin, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserComplaints();
    }
  }, [user]);

  const fetchUserComplaints = async () => {
    try {
      const response = await fetch(`/api/complaints?userId=${user?.id}&limit=10`);
      const data = await response.json();
      setComplaints(data);

      // Calculate stats
      const total = data.length;
      const pending = data.filter((c: any) => c.status === 'submitted' || c.status === 'assigned').length;
      const inProgress = data.filter((c: any) => c.status === 'in_progress').length;
      const resolved = data.filter((c: any) => c.status === 'resolved').length;

      setStats({ total, pending, inProgress, resolved });
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
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['citizen']}>
      <DashboardLayout title="Citizen Dashboard">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName}!</h1>
                <p className="text-blue-100 mb-4">
                  Track your complaints and make your voice heard
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold">Trust Score: {user?.trustScore}/100</span>
                  </div>
                  <Progress value={user?.trustScore} className="w-32" />
                </div>
              </div>
              <Link href="/citizen/submit">
                <Button size="lg" variant="secondary" className="shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Report New Issue
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Complaints</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.inProgress}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/citizen/submit" className="block">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Report Issue</h3>
                  <p className="text-sm text-gray-600">Submit a new complaint with photos and location</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/citizen/map" className="block">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">View Map</h3>
                  <p className="text-sm text-gray-600">See all complaints on interactive map</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/citizen/complaints" className="block">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">My Complaints</h3>
                  <p className="text-sm text-gray-600">Track all your submitted complaints</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Complaints */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>Your latest submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No complaints yet. Report your first issue!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.slice(0, 5).map((complaint) => (
                    <div
                      key={complaint.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{complaint.title}</h4>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{complaint.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {complaint.locationAddress || 'No location'}
                          </span>
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link href={`/citizen/complaints/${complaint.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
