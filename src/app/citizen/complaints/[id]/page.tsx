'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
    Calendar,
    User,
    Tag,
    AlertTriangle,
    FileText,
    Activity,
    ShieldCheck
  } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function ComplaintDetailsPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { user } = useAuth();
  const router = useRouter();
  const [complaint, setComplaint] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && params.id) {
      fetchComplaintDetails();
    }
  }, [user, params.id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const [complaintRes, activityRes] = await Promise.all([
        fetch(`/api/complaints/${params.id}`),
        fetch(`/api/complaints/${params.id}/activity`)
      ]);

      if (!complaintRes.ok) {
        throw new Error('Failed to fetch complaint details');
      }

      const complaintData = await complaintRes.json();
      const activityData = await activityRes.json();

      setComplaint(complaintData);
      setActivity(activityData);
    } catch (err: any) {
      console.error('Error fetching complaint details:', err);
      setError(err.message);
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
        return 'text-red-600 border-red-200 bg-red-50';
      case 'high':
        return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'low':
        return 'text-green-600 border-green-200 bg-green-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'complaint_submitted':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'status_updated':
        return <Activity className="w-4 h-4 text-purple-500" />;
      case 'assigned':
        return <User className="w-4 h-4 text-indigo-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'feedback_given':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading Complaint...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardLayout title="Error">
        <Card className="max-w-2xl mx-auto mt-8">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Complaint Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The complaint you are looking for does not exist or you do not have permission to view it.'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['citizen']}>
      <DashboardLayout title={`Complaint #${complaint.id}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Badge className={`px-3 py-1 text-sm ${getStatusColor(complaint.status)}`}>
              {complaint.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">{complaint.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        Submitted on {new Date(complaint.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                      {complaint.priority.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                  </div>

                  {complaint.imageUrl && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Attached Image</h3>
                      <div className="rounded-lg overflow-hidden border">
                        <img 
                          src={complaint.imageUrl} 
                          alt="Complaint attachment" 
                          className="max-w-full h-auto"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-sm">{complaint.locationAddress || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Tag className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Category</p>
                        <p className="text-sm capitalize">{complaint.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

                {/* Assigned Authority Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assigned Authority</CardTitle>
                    <CardDescription>Details of the official handling your complaint</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {complaint.assignedOfficer ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{complaint.assignedOfficer.fullName}</p>
                            <p className="text-sm text-gray-500">{complaint.assignedOfficer.designation || 'Officer'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-xl bg-white">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-700">Trust Score</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xl font-bold text-green-600">
                              {complaint.assignedOfficer.trustScore}%
                            </span>
                            <div className="w-32 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-green-500" 
                                style={{ width: `${complaint.assignedOfficer.trustScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 italic">
                          This score is based on feedback from other citizens regarding their complaint resolutions.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-100">
                        <Clock className="w-5 h-5" />
                        <p className="text-sm font-medium">Waiting for authority assignment</p>
                      </div>
                    )}
                    
                    {complaint.status === 'resolved' && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                          <CheckCircle className="w-4 h-4" />
                          Resolved
                        </div>
                        <p className="text-xs text-green-600">
                          This issue was resolved on {new Date(complaint.resolvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {complaint.status === 'resolved' && (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <CardHeader>
                      <CardTitle className="text-lg">Rate Resolution</CardTitle>
                      <CardDescription>Your feedback affects the authority's trust score</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/citizen/complaints/${complaint.id}/feedback`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Give Feedback
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
