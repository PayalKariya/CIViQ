'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Eye,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

interface PendingAuthority {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  department: string | null;
    domain: string | null;
    organizationRegion: string | null;
    organizationName: string | null;
    designation: string;
  employeeId: string;
  authorityLevel: number;
  verificationStatus: string;
  idPhotoUrl: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingAuthorities, setPendingAuthorities] = useState<PendingAuthority[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<PendingAuthority | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [idPhotoModalOpen, setIdPhotoModalOpen] = useState(false);
  const [viewingIdPhoto, setViewingIdPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, complaintsRes, usersRes, pendingRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch('/api/complaints?limit=10'),
        fetch('/api/users?limit=10'),
        fetch('/api/admin/authorities?status=pending'),
      ]);

      const analyticsData = await analyticsRes.json();
      const complaintsData = await complaintsRes.json();
      const usersData = await usersRes.json();
      const pendingData = await pendingRes.json();

      setAnalytics(analyticsData);
      setComplaints(complaintsData);
      setUsers(usersData);
      setPendingAuthorities(Array.isArray(pendingData) ? pendingData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (authority: PendingAuthority) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/authorities/${authority.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!res.ok) throw new Error('Failed to approve');

      toast.success(`${authority.fullName} has been approved as authority`);
      setPendingAuthorities(prev => prev.filter(a => a.id !== authority.id));
    } catch (error) {
      toast.error('Failed to approve authority');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAuthority) return;
    
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/authorities/${selectedAuthority.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: rejectReason }),
      });

      if (!res.ok) throw new Error('Failed to reject');

      toast.success(`${selectedAuthority.fullName} has been rejected`);
      setPendingAuthorities(prev => prev.filter(a => a.id !== selectedAuthority.id));
      setRejectDialogOpen(false);
      setSelectedAuthority(null);
      setRejectReason('');
    } catch (error) {
      toast.error('Failed to reject authority');
    } finally {
      setProcessing(false);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'authority':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout title="Admin Dashboard">
          <div className="text-center py-20">Loading...</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout title="Admin Dashboard">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Admin Control Center</h1>
                <p className="text-purple-100">
                  Full system oversight and management
                </p>
              </div>
              <Shield className="w-16 h-16 opacity-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Complaints</p>
                    <p className="text-3xl font-bold">{analytics?.totalComplaints || 0}</p>
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
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-3xl font-bold">{analytics?.totalUsers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{analytics?.totalResolved || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg border-2 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Authorities</p>
                    <p className="text-3xl font-bold text-orange-600">{pendingAuthorities.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending-authorities" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending-authorities" className="relative">
                Pending Authorities
                {pendingAuthorities.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingAuthorities.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="complaints">Complaints</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="pending-authorities" className="mt-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Pending Authority Verifications
                  </CardTitle>
                  <CardDescription>
                    Review and verify new authority registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingAuthorities.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pending authority verifications</p>
                    </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                              <TableHead>Dept/Domain</TableHead>
                              <TableHead>Region/Org</TableHead>
                              <TableHead>Designation</TableHead>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>ID Photo</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingAuthorities.map((authority) => (
                            <TableRow key={authority.id}>
                              <TableCell className="font-medium">{authority.fullName}</TableCell>
                              <TableCell>{authority.email}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="capitalize">
                                    {authority.authorityLevel === 3 ? authority.domain : authority.department}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{authority.organizationRegion}</div>
                                    <div className="text-gray-500 text-xs">{authority.organizationName}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{authority.designation}</TableCell>
                              <TableCell className="font-mono">{authority.employeeId}</TableCell>
                              <TableCell>
                                <Badge variant="outline">Level {authority.authorityLevel}</Badge>
                              </TableCell>
                              <TableCell>
                                {authority.idPhotoUrl ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setViewingIdPhoto(authority.idPhotoUrl);
                                      setIdPhotoModalOpen(true);
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View
                                  </Button>
                                ) : (
                                  <span className="text-gray-400 text-sm">No photo</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(authority.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(authority)}
                                    disabled={processing}
                                  >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedAuthority(authority);
                                      setRejectDialogOpen(true);
                                    }}
                                    disabled={processing}
                                  >
                                    <UserX className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Complaints by Status</CardTitle>
                    <CardDescription>Distribution of complaint statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.complaintsByStatus?.map((item: any) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / analytics.totalComplaints) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="font-semibold w-8 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Complaints by Category</CardTitle>
                    <CardDescription>Issues by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.complaintsByCategory?.slice(0, 6).map((item: any) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <div className="capitalize font-medium">{item.category}</div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / analytics.totalComplaints) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="font-semibold w-8 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="complaints" className="mt-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Complaints</CardTitle>
                  <CardDescription>Latest submissions across all categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-mono">#{complaint.id}</TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {complaint.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{complaint.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{complaint.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(complaint.status)}>
                              {complaint.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Trust Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono">#{user.id}</TableCell>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${user.trustScore}%` }}
                                />
                              </div>
                              <span className="text-sm">{user.trustScore}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Authority Request</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reject {selectedAuthority?.fullName}'s authority request?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium mb-2 block">
                  Reason for rejection (optional)
                </label>
                <Textarea
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={processing}>
                  {processing ? 'Rejecting...' : 'Reject'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={idPhotoModalOpen} onOpenChange={setIdPhotoModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>ID Card Photo</DialogTitle>
                <DialogDescription>
                  Review the submitted ID card for verification
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {viewingIdPhoto && (
                  <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={viewingIdPhoto}
                      alt="ID Card"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setIdPhotoModalOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
