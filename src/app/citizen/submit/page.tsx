'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MapPin, Upload, AlertCircle, Loader2, ChevronRight, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DOMAINS, getDepartmentsByDomain, type Domain, type Department, type IssueType } from '@/lib/complaint-categories';

export default function SubmitComplaint() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    department: '',
    issueType: '',
    priority: 'medium',
    locationAddress: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
    isAnonymous: false,
    organizationRegion: '',
  });

  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [issues, setIssues] = useState<IssueType[]>([]);

  const handleDomainChange = (domainId: string) => {
    const domain = DOMAINS.find(d => d.id === domainId);
    setSelectedDomain(domain || null);
    setSelectedDepartment(null);
    setDepartments(domain ? domain.departments : []);
    setIssues([]);
    setFormData({
      ...formData,
      domain: domainId,
      department: '',
      issueType: '',
    });
  };

  const handleDepartmentChange = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    setSelectedDepartment(department || null);
    setIssues(department ? department.issues : []);
    setFormData({
      ...formData,
      department: departmentId,
      issueType: '',
    });
  };

  const handleIssueChange = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    setFormData({
      ...formData,
      issueType: issueId,
      title: issue ? issue.label : formData.title,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: formData.department,
          userId: formData.isAnonymous ? null : user?.id,
          organizationRegion: formData.organizationRegion,
          organizationName: selectedDomain?.label,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success('Complaint submitted successfully!');
      router.push('/citizen');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          toast.success('Location captured successfully!');
        },
        (error) => {
          toast.error('Failed to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['citizen']}>
      <DashboardLayout title="Submit Complaint">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Report a New Issue</CardTitle>
              <CardDescription>
                Help us improve your community by reporting civic issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Select Category <span className="text-red-500">*</span>
                  </Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="domain" className="text-sm text-gray-600">Domain / Organization Type</Label>
                    <Select
                      value={formData.domain}
                      onValueChange={handleDomainChange}
                      required
                    >
                      <SelectTrigger id="domain">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
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

                  {selectedDomain && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <Label htmlFor="department" className="text-sm text-gray-600">Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={handleDepartmentChange}
                        required
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              <span className="flex items-center gap-2">
                                <span>{dept.icon}</span>
                                <span>{dept.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedDepartment && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <Label htmlFor="issueType" className="text-sm text-gray-600">Issue Type</Label>
                      <Select
                        value={formData.issueType}
                        onValueChange={handleIssueChange}
                        required
                      >
                        <SelectTrigger id="issueType">
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          {issues.map((issue) => (
                            <SelectItem key={issue.id} value={issue.id}>
                              {issue.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.domain && formData.department && formData.issueType && (
                    <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-sm">
                      <span className="font-medium" style={{ color: selectedDomain?.color }}>
                        {selectedDomain?.icon} {selectedDomain?.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span>{selectedDepartment?.icon} {selectedDepartment?.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{issues.find(i => i.id === formData.issueType)?.label}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Location & Area <span className="text-red-500">*</span>
                  </Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organizationRegion">Specific Area / Region (Matches to Authority)</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="organizationRegion"
                        placeholder="e.g., Zone A, Downtown, North Campus"
                        value={formData.organizationRegion}
                        onChange={(e) => setFormData({ ...formData, organizationRegion: e.target.value })}
                        required
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter the exact area/zone name provided by your local authorities for correct assignment.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="locationAddress">Detailed Address</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetLocation}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Auto-capture Coordinates
                      </Button>
                    </div>
                    <Input
                      id="locationAddress"
                      placeholder="Enter specific location address or landmark"
                      value={formData.locationAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, locationAddress: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude (Optional)</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="19.0760"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude (Optional)</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="72.8777"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Issue Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Detailed Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Photo URL (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isAnonymous: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="anonymous"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Submit anonymously
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Your identity will be hidden from public view
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your complaint will be automatically assigned to the correct authority based on the area and category selected.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading || !formData.domain || !formData.department || !formData.issueType || !formData.organizationRegion}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Complaint'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
