'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  FileText,
  MapPin,
  Shield,
  AlertOctagon,
  ArrowUpRight,
  Timer,
  Eye,
  Users,
  Building2,
  Globe,
  Star,
  MessageSquare,
  Award
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { 
  getDomainById, 
  getDepartmentById, 
  getIssueById, 
  DOMAIN_COLORS 
} from '@/lib/complaint-categories';

interface Complaint {
  id: number;
  title: string;
  description: string;
  domain: string | null;
  department: string | null;
  issueType: string | null;
  category: string;
  priority: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  locationAddress: string | null;
  imageUrl: string | null;
  isAnonymous: boolean;
  assignedTo: number | null;
  userId: number; // Added to get citizen info
  escalationLevel: number | null;
  escalationDeadline: string | null;
  resolvedAt: string | null;
  escalatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  critical: number;
}

const LEVEL_LABELS: Record<number, { title: string; description: string; icon: React.ReactNode }> = {
  1: {
    title: 'Ground Worker',
    description: 'Assigned complaints to resolve',
    icon: <Users className="w-5 h-5" />,
  },
  2: {
    title: 'Supervisor',
    description: 'Department complaints management',
    icon: <Building2 className="w-5 h-5" />,
  },
  3: {
    title: 'Domain Officer',
    description: 'Domain-wide oversight',
    icon: <Globe className="w-5 h-5" />,
  },
};

export default function AuthorityDashboard() {
  const { user, refreshUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    escalated: 0,
    critical: 0,
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintForFeedback, setComplaintForFeedback] = useState<Complaint | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const userLevel = user?.authorityLevel || 1;

  useEffect(() => {
    if (user) {
      // Trigger automatic escalation check
      fetch('/api/escalation', { method: 'POST' }).catch(console.error);
      fetchComplaints();
    }
  }, [user, statusFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let url = `/api/authority/complaints?userId=${user?.id}&level=${userLevel}&status=${statusFilter}`;
      
      if (userLevel === 1) {
        url += `&issueType=${user?.issueType}`;
      } else if (userLevel === 2) {
        url += `&department=${user?.department}`;
      } else if (userLevel === 3) {
        url += `&domain=${user?.domain}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setComplaints(data.complaints || []);
      setStats(data.stats || {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        escalated: 0,
        critical: 0,
      });
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/authority/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!complaintForFeedback || feedbackRating === 0) return;

    try {
      setIsSubmittingFeedback(true);
      const response = await fetch(`/api/complaints/${complaintForFeedback.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          rating: feedbackRating,
          comment: feedbackComment,
          type: 'authority_to_citizen'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      await refreshUser();
      toast.success('Feedback submitted successfully. Citizen trust score updated.');
      setComplaintForFeedback(null);
      setFeedbackRating(0);
      setFeedbackComment('');
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-gray-100 text-gray-700';
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
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300';
    }
  };

  const getEscalationBadge = (level: number | null) => {
    if (!level || level === 1) return null;
    
    if (level === 2) {
      return (
        <Badge className="bg-orange-500 text-white flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />
          Escalated L2
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-red-500 text-white flex items-center gap-1 animate-pulse">
        <AlertOctagon className="w-3 h-3" />
        Escalated L3
      </Badge>
    );
  };

  const getDaysOpen = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getLevelInfo = () => LEVEL_LABELS[userLevel] || LEVEL_LABELS[1];

  const getDepartmentLabel = (deptId: string | null) => {
    if (!deptId) return 'Unknown';
    const info = getDepartmentById(deptId);
    return info ? `${info.department.icon} ${info.department.label}` : deptId;
  };

  const getDomainLabel = (domainId: string | null) => {
    if (!domainId) return 'Unknown';
    const domain = getDomainById(domainId);
    return domain ? `${domain.icon} ${domain.label}` : domainId;
  };

  const getIssueLabel = (issueId: string | null) => {
    if (!issueId) return 'Unknown';
    const info = getIssueById(issueId);
    return info ? info.issue.label : issueId;
  };

  const getGradientByLevel = () => {
    switch (userLevel) {
      case 1:
        return 'from-blue-600 via-blue-700 to-indigo-700';
      case 2:
        return 'from-amber-600 via-orange-600 to-red-600';
      case 3:
        return 'from-purple-600 via-violet-600 to-indigo-600';
      default:
        return 'from-gray-600 via-gray-700 to-gray-800';
    }
  };

  const getScopeLabel = () => {
    if (userLevel === 1) {
      const issueLabel = getIssueLabel(user?.issueType || null);
      return user?.issueType ? `Issue: ${issueLabel}` : 'Your Assigned Complaints';
    }
    if (userLevel === 2) return getDepartmentLabel(user?.department || null);
    if (userLevel === 3) return getDomainLabel(user?.domain || null);
    return 'Complaints';
  };

  if (user?.verificationStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verification Pending</h2>
            <p className="text-gray-600">Your account is under review. Please check back later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const levelInfo = getLevelInfo();

  return (
    <ProtectedRoute allowedRoles={['authority']}>
      <DashboardLayout title="Authority Dashboard">
        <div className="space-y-8">
          <div className={`bg-gradient-to-r ${getGradientByLevel()} rounded-2xl p-8 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-6 h-6" />
                    <Badge className="bg-white/20 text-white border-0 flex items-center gap-1">
                      {levelInfo.icon}
                      Level {userLevel} - {levelInfo.title}
                    </Badge>
                  </div>
                    <h1 className="text-3xl font-bold mb-1">Welcome, {user?.fullName}!</h1>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        <span className="font-semibold text-lg">Trust Score: {user?.trustScore}/100</span>
                      </div>
                      <Progress value={user?.trustScore} className="w-32 bg-white/20" />
                    </div>
                    <p className="text-white/80">
                      {user?.designation} • {getScopeLabel()}
                    </p>
                    {user?.organizationRegion && (
                      <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {user.organizationRegion} {user.organizationName ? `• ${user.organizationName}` : ''}
                      </p>
                    )}
                  <p className="text-white/60 text-sm mt-1">{levelInfo.description}</p>
                </div>
                <Link href="/authority/map">
                  <Button variant="secondary" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    View Map
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-white/70">Total Issues</div>
                  <div className="text-3xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-white/70">Pending Action</div>
                  <div className="text-3xl font-bold text-yellow-300">{stats.pending}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-white/70">In Progress</div>
                  <div className="text-3xl font-bold text-blue-300">{stats.inProgress}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-white/70">Resolved</div>
                  <div className="text-3xl font-bold text-green-300">{stats.resolved}</div>
                </div>
              </div>
            </div>
          </div>

          {stats.critical > 0 && (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-800">
                      {stats.critical} Critical Issue{stats.critical > 1 ? 's' : ''} Require Immediate Attention
                    </p>
                    <p className="text-sm text-red-600">
                      These complaints are marked as critical priority and need urgent resolution.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setStatusFilter('submitted')}
                  >
                    View Critical
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.escalated > 0 && (
            <Card className="border-orange-300 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-orange-800">
                      {stats.escalated} Escalated Complaint{stats.escalated > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-orange-600">
                      These were escalated due to delayed resolution. Please prioritize.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-orange-500 text-orange-700 hover:bg-orange-100"
                    onClick={() => setStatusFilter('escalated')}
                  >
                    View Escalated
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">All Issues</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${statusFilter === 'submitted' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setStatusFilter('submitted')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${statusFilter === 'in_progress' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setStatusFilter('in_progress')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${statusFilter === 'resolved' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setStatusFilter('resolved')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                  <p className="text-xs text-gray-500">Resolved</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${statusFilter === 'escalated' ? 'ring-2 ring-orange-500' : ''}`}
              onClick={() => setStatusFilter('escalated')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.escalated}</p>
                  <p className="text-xs text-gray-500">Escalated</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {userLevel === 1 ? 'Your Assigned Complaints' : 
                     userLevel === 2 ? 'Department Complaints' : 
                     'Domain Complaints'}
                  </CardTitle>
                  <CardDescription>
                    {userLevel === 1 ? 'Complaints assigned to you for resolution' :
                     userLevel === 2 ? `Complaints in ${getDepartmentLabel(user?.department || null)}` :
                     `All complaints in ${getDomainLabel(user?.domain || null)} domain`}
                  </CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No complaints found</p>
                  <p className="text-sm">
                    {statusFilter === 'all' 
                      ? userLevel === 1 
                        ? 'No complaints have been assigned to you yet.'
                        : 'There are no complaints in your scope yet.' 
                      : `No ${statusFilter.replace('_', ' ')} complaints.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className={`border-l-4 p-5 bg-white rounded-lg shadow hover:shadow-md transition-all ${getPriorityColor(
                        complaint.priority
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-bold text-lg">{complaint.title}</h3>
                            <Badge className={getStatusColor(complaint.status)}>
                              {complaint.status.replace('_', ' ')}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`uppercase ${
                                complaint.priority === 'critical' ? 'border-red-500 text-red-600' :
                                complaint.priority === 'high' ? 'border-orange-500 text-orange-600' :
                                ''
                              }`}
                            >
                              {complaint.priority}
                            </Badge>
                            {getEscalationBadge(complaint.escalationLevel)}
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">ID:</span> #{complaint.id}
                            </span>
                            {complaint.domain && (
                              <Badge 
                                variant="outline" 
                                style={{ borderColor: DOMAIN_COLORS[complaint.domain], color: DOMAIN_COLORS[complaint.domain] }}
                              >
                                {getDomainLabel(complaint.domain)}
                              </Badge>
                            )}
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {getDaysOpen(complaint.createdAt)} days open
                            </span>
                            {complaint.locationAddress && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {complaint.locationAddress.slice(0, 30)}...
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[180px]">
                          <Select
                            value={complaint.status}
                            onValueChange={(value) => handleStatusUpdate(complaint.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                          </Select>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedComplaint(complaint)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>

                          {complaint.status === 'resolved' && (
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                              onClick={() => setComplaintForFeedback(complaint)}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Give Feedback
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feedback Dialog */}
        <Dialog open={!!complaintForFeedback} onOpenChange={() => setComplaintForFeedback(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Give Feedback to Citizen</DialogTitle>
              <DialogDescription>
                Rate your experience resolving this complaint. This will affect the citizen's trust score.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium">Cooperation Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className="focus:outline-none transition-transform active:scale-90"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= feedbackRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Comments (Optional)</p>
                <Textarea
                  placeholder="Share details about the citizen's cooperation..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setComplaintForFeedback(null)}>Cancel</Button>
              <Button 
                onClick={handleFeedbackSubmit} 
                disabled={isSubmittingFeedback || feedbackRating === 0}
              >
                {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Complaint #{selectedComplaint?.id}
                <Badge className={getStatusColor(selectedComplaint?.status || '')}>
                  {selectedComplaint?.status?.replace('_', ' ')}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Submitted on {selectedComplaint && new Date(selectedComplaint.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            
            {selectedComplaint && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">{selectedComplaint.title}</h3>
                  <p className="text-gray-600">{selectedComplaint.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Domain</p>
                    <p className="font-medium">{getDomainLabel(selectedComplaint.domain)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Department</p>
                    <p className="font-medium">{getDepartmentLabel(selectedComplaint.department)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Priority</p>
                    <Badge variant="outline" className="uppercase">
                      {selectedComplaint.priority}
                    </Badge>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Escalation Level</p>
                    <p className="font-medium">Level {selectedComplaint.escalationLevel || 1}</p>
                  </div>
                </div>
                
                {selectedComplaint.locationAddress && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedComplaint.locationAddress}
                    </p>
                  </div>
                )}
                
                {selectedComplaint.imageUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Attached Image</p>
                    <img 
                      src={selectedComplaint.imageUrl} 
                      alt="Complaint" 
                      className="rounded-lg max-h-64 object-cover"
                    />
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Select
                    value={selectedComplaint.status}
                    onValueChange={(value) => {
                      handleStatusUpdate(selectedComplaint.id, value);
                      setSelectedComplaint(null);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
