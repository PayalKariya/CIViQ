'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Shield, CheckCircle, LogOut } from 'lucide-react';
import { appPageBackgroundClass } from '@/lib/app-shell';

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

  if (!user) {
    return null;
  }

  return (
    <div className={`${appPageBackgroundClass} flex min-h-screen items-center justify-center p-4`}>
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">CIViQ+</h1>
          <p className="mt-2 text-amber-800/90">Authority Portal</p>
        </div>

        <Card className="border border-gray-200 bg-white shadow-xl">
          <CardHeader className="border-b border-gray-100 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-10 w-10 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Verification Pending</CardTitle>
            <CardDescription className="text-gray-600">Your authority account is under review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="shrink-0 text-gray-500">Name</span>
                <span className="text-right font-medium text-slate-900">{user.fullName}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="shrink-0 text-gray-500">Email</span>
                <span className="text-right font-medium text-slate-900">{user.email}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="shrink-0 text-gray-500">Employee ID</span>
                <span className="text-right font-medium text-slate-900">{user.employeeId}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="shrink-0 text-gray-500">Department</span>
                <span className="text-right font-medium text-slate-900">
                  {user.department ? DEPARTMENTS[user.department] || user.department : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="shrink-0 text-gray-500">Designation</span>
                <span className="text-right font-medium text-slate-900">{user.designation || '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="shrink-0 text-gray-500">Authority Level</span>
                <span className="text-right font-medium text-slate-900">Level {user.authorityLevel}</span>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="mb-1 text-sm font-medium text-amber-900">What happens next?</p>
                  <ul className="space-y-1 text-xs text-amber-900/85">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 shrink-0" />
                      Admin will verify your employee ID and credentials
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 shrink-0" />
                      You will receive access to department-specific complaints
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 shrink-0" />
                      You can then start resolving issues in your domain
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              This usually takes 1-2 business days. You will be notified once verified.
            </p>

            <Button onClick={logout} variant="outline" className="w-full border-gray-300 bg-white hover:bg-gray-50">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
