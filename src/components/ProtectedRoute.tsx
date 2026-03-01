'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('citizen' | 'authority' | 'admin')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'authority') {
          if (user.verificationStatus === 'pending') {
            router.push('/authority/pending');
          } else if (user.verificationStatus === 'verified') {
            router.push('/authority');
          } else {
            router.push('/login');
          }
        } else {
          router.push('/citizen');
        }
      } else if (user.role === 'authority' && allowedRoles?.includes('authority')) {
        if (user.verificationStatus === 'pending' && !pathname.includes('/pending')) {
          router.push('/authority/pending');
        } else if (user.verificationStatus !== 'verified' && user.verificationStatus !== 'pending') {
          router.push('/login');
        }
      }
    }
  }, [user, loading, allowedRoles, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
