'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { AlertCircle, MapPin, User, Shield, Building2, BadgeCheck, ArrowLeft, ArrowRight, Globe, Camera, ImagePlus, X, Wrench } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { DOMAINS, getDepartmentsByDomain, type Department, type IssueType } from '@/lib/complaint-categories';

const AUTHORITY_LEVELS = [
  { value: '1', label: 'Level 1 - Ground Worker', description: 'Resolve specific issue types assigned to you' },
  { value: '2', label: 'Level 2 - Supervisor', description: 'Oversee all complaints in your department' },
  { value: '3', label: 'Level 3 - Domain Officer', description: 'Oversee all complaints across your entire domain' },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<'citizen' | 'authority'>('citizen');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
      phone: '',
      employeeId: '',
      organizationRegion: '',
      organizationName: '',
      department: '',
    domain: '',
    authorityLevel: '',
    designation: '',
    issueType: '',
  });
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<IssueType[]>([]);
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleDomainChange = (domainId: string) => {
    const departments = getDepartmentsByDomain(domainId);
    setSelectedDepartments(departments);
    setSelectedIssues([]);
    setFormData({ 
      ...formData, 
      domain: domainId, 
      department: '', 
      issueType: '' 
    });
  };

  const handleDepartmentChange = (departmentId: string) => {
    const department = selectedDepartments.find(d => d.id === departmentId);
    setSelectedIssues(department?.issues || []);
    setFormData({ 
      ...formData, 
      department: departmentId, 
      issueType: '' 
    });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB');
        return;
      }
      setIdPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setIdPhoto(null);
    setIdPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const uploadIdPhoto = async (): Promise<string | null> => {
    if (!idPhotoFile) return null;
    
    setUploadingPhoto(true);
    try {
      const base64 = idPhoto;
      return base64;
    } catch {
      console.error('Failed to process photo');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let idPhotoUrl: string | null = null;
      if (accountType === 'authority' && idPhotoFile) {
        idPhotoUrl = await uploadIdPhoto();
      }

      await signup(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone || undefined,
        accountType,
        accountType === 'authority' ? formData.department : undefined,
        accountType === 'authority' ? formData.domain : undefined,
        accountType === 'authority' ? parseInt(formData.authorityLevel) : undefined,
        accountType === 'authority' ? formData.employeeId : undefined,
        accountType === 'authority' ? formData.organizationRegion : undefined,
        accountType === 'authority' ? formData.organizationName : undefined,
        accountType === 'authority' ? formData.designation : undefined,
        idPhotoUrl || undefined,
        accountType === 'authority' && formData.authorityLevel === '1' ? formData.issueType : undefined
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = accountType !== null;
  const canProceedToStep3 = formData.fullName && formData.email && formData.password;
  
    const canSubmit = () => {
      if (accountType === 'citizen') return canProceedToStep3;
      
      const baseRequirements = canProceedToStep3 && 
        formData.organizationRegion && 
        formData.organizationName && 
        formData.authorityLevel && 
        formData.designation && 
        idPhoto && 
        formData.domain;
      
      if (formData.authorityLevel === '3') {
        return baseRequirements;
      } else if (formData.authorityLevel === '2') {
        return baseRequirements && formData.department;
      } else if (formData.authorityLevel === '1') {
        return baseRequirements && formData.department && formData.issueType;
      }
      return false;
    };

  const getSelectedDomainInfo = () => DOMAINS.find(d => d.id === formData.domain);
  const getSelectedDepartmentInfo = () => selectedDepartments.find(d => d.id === formData.department);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CIViQ+
          </h1>
          <p className="text-gray-600 mt-2">Join the community</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Create Account</CardTitle>
                <CardDescription className="text-gray-500">
                  {step === 1 && 'Choose your account type'}
                  {step === 2 && 'Enter your personal details'}
                  {step === 3 && 'Authority verification details'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      s === step 
                        ? 'bg-blue-600 w-6' 
                        : s < step 
                          ? 'bg-blue-600' 
                          : accountType === 'citizen' && s === 3
                            ? 'bg-gray-100'
                            : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <Label className="text-gray-900 text-base">I am registering as a...</Label>
                  <RadioGroup
                    value={accountType}
                    onValueChange={(value) => setAccountType(value as 'citizen' | 'authority')}
                    className="grid grid-cols-1 gap-4"
                  >
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        accountType === 'citizen'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-100 hover:border-blue-200 bg-gray-50/50'
                      }`}
                    >
                      <RadioGroupItem value="citizen" id="citizen" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">User / Student</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Report issues, track complaints, and help improve your environment
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        accountType === 'authority'
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-100 hover:border-amber-200 bg-gray-50/50'
                      }`}
                    >
                      <RadioGroupItem value="authority" id="authority" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-amber-600" />
                          <span className="font-semibold text-gray-900">Authority / Staff</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Handle and resolve complaints in your assigned department
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <BadgeCheck className="w-3 h-3" />
                          Requires verification
                        </div>
                      </div>
                    </label>
                  </RadioGroup>

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-900">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-900">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-900">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Must be at least 8 characters with 1 uppercase and 1 number
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    {accountType === 'citizen' ? (
                      <Button
                        type="submit"
                        disabled={!canProceedToStep3 || loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {loading ? 'Creating...' : 'Create Account'}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={!canProceedToStep3}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && accountType === 'authority' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold mb-1">
                      <Shield className="w-4 h-4" />
                      Authority Verification Required
                    </div>
                    <p className="text-xs text-amber-600">
                      Your account will be reviewed and verified by an admin before you can access the authority dashboard.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900">Authority Level</Label>
                    <Select
                      value={formData.authorityLevel}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        authorityLevel: value, 
                        department: '', 
                        domain: '',
                        issueType: ''
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your authority level" />
                      </SelectTrigger>
                      <SelectContent>
                        {AUTHORITY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <div className="font-medium">{level.label}</div>
                              <div className="text-xs text-gray-500">{level.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {formData.authorityLevel === '1' && 'You will resolve specific issue types in your department'}
                      {formData.authorityLevel === '2' && 'You will oversee all complaints in your department'}
                      {formData.authorityLevel === '3' && 'You will oversee all complaints in your domain'}
                      {!formData.authorityLevel && 'Select your role in the complaint resolution hierarchy'}
                    </p>
                  </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationRegion" className="text-gray-900">Organization Area / Region</Label>
                      <Input
                        id="organizationRegion"
                        type="text"
                        placeholder="e.g., Zone A, Downtown, North Campus"
                        value={formData.organizationRegion}
                        onChange={(e) => setFormData({ ...formData, organizationRegion: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationName" className="text-gray-900">Organization Name</Label>
                      <Input
                        id="organizationName"
                        type="text"
                        placeholder="e.g., Educational, Offices, Workplace"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        required
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation" className="text-gray-900">Designation / Job Title</Label>
                    <Input
                      id="designation"
                      type="text"
                      placeholder={formData.authorityLevel === '3' ? 'e.g., Chief Education Officer' : formData.authorityLevel === '1' ? 'e.g., Plumber, Electrician, IT Support' : 'e.g., Department Supervisor'}
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      required
                    />
                  </div>

                  {formData.authorityLevel && (
                    <div className="space-y-2">
                      <Label className="text-gray-900">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Domain
                      </Label>
                      <Select
                        value={formData.domain}
                        onValueChange={handleDomainChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOMAINS.map((domain) => (
                            <SelectItem key={domain.id} value={domain.id}>
                              <div className="flex items-center gap-2">
                                <span>{domain.icon}</span>
                                <span className="font-medium">{domain.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.authorityLevel === '3' && formData.domain && (
                        <p className="text-xs text-amber-700">
                          You will oversee all {getSelectedDomainInfo()?.departments.length} departments in {getSelectedDomainInfo()?.label}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.authorityLevel !== '3' && formData.domain && selectedDepartments.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-gray-900">
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Department
                      </Label>
                      <Select
                        value={formData.department}
                        onValueChange={handleDepartmentChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              <div className="flex items-center gap-2">
                                <span>{dept.icon}</span>
                                <span className="font-medium">{dept.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.authorityLevel === '2' && formData.department && (
                        <p className="text-xs text-blue-600">
                          You will supervise all {getSelectedDepartmentInfo()?.issues.length} issue types in this department
                        </p>
                      )}
                    </div>
                  )}

                  {formData.authorityLevel === '1' && formData.department && selectedIssues.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-gray-900">
                        <Wrench className="w-4 h-4 inline mr-2" />
                        Issue Type You Handle
                      </Label>
                      <Select
                        value={formData.issueType}
                        onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedIssues.map((issue) => (
                            <SelectItem key={issue.id} value={issue.id}>
                              {issue.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-green-600">
                        You will receive complaints specifically for this issue type
                      </p>
                    </div>
                  )}

                  {formData.domain && formData.authorityLevel && (
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Your Scope:</p>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                          {getSelectedDomainInfo()?.icon} {getSelectedDomainInfo()?.label}
                        </span>
                        {formData.department && (
                          <>
                            <span className="text-gray-400">→</span>
                            <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 font-medium">
                              {getSelectedDepartmentInfo()?.icon} {getSelectedDepartmentInfo()?.label}
                            </span>
                          </>
                        )}
                        {formData.issueType && (
                          <>
                            <span className="text-gray-400">→</span>
                            <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
                              {selectedIssues.find(i => i.id === formData.issueType)?.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-900">ID Card Photo</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a clear photo of your official ID card for verification
                    </p>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={cameraInputRef}
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />

                    {idPhoto ? (
                      <div className="relative">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-amber-200 bg-gray-50">
                          <Image
                            src={idPhoto}
                            alt="ID Card"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex-1"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1"
                        >
                          <ImagePlus className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canSubmit() || loading}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {loading ? 'Submitting...' : 'Submit for Verification'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
