'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Shield, CheckCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DEPARTMENTS: Record<string, string> = {
  infrastructure: 'Infrastructure & Maintenance',
  academic: 'Academic Affairs',
  administrative: 'Administrative & Office',
  examination: 'Examination Cell',
  cleanliness: 'Cleanliness & Hygiene',
  technical: 'IT & Technical',
};

export default function PendingVerificationPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">CIViQ+</h1>
          <p className="text-amber-200 mt-2">Authority Portal</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-xl">
          <CardHeader className="text-center border-b border-white/10 pb-6">
            <div className="mx-auto w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-amber-400" />
            </div>
            <CardTitle className="text-white text-2xl">Verification Pending</CardTitle>
            <CardDescription className="text-amber-200">
              Your authority account is under review
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Name</span>
                <span className="text-white font-medium">{user.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Email</span>
                <span className="text-white font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Employee ID</span>
                <span className="text-white font-medium">{user.employeeId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Department</span>
                <span className="text-white font-medium">
                  {user.department ? DEPARTMENTS[user.department] || user.department : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Designation</span>
                <span className="text-white font-medium">{user.designation || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Authority Level</span>
                <span className="text-white font-medium">Level {user.authorityLevel}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-amber-200 text-sm font-medium mb-1">What happens next?</p>
                  <ul className="text-amber-200/80 text-xs space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Admin will verify your employee ID and credentials
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      You will receive access to department-specific complaints
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      You can then start resolving issues in your domain
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-center text-blue-300 text-sm">
              This usually takes 1-2 business days. You will be notified once verified.
            </p>

            <Button
              onClick={logout}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
