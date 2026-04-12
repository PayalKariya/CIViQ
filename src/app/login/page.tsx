'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { MarketingChrome } from '@/components/MarketingChrome';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingChrome>
      <div className="flex flex-1 flex-col items-center justify-center p-4 py-10 md:py-14">
        <div className="w-full max-w-md">
        <Card className="border border-gray-200 bg-white text-slate-900 shadow-xl">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </Link>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
                <div className="grid gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>Admin:</strong> admin@civiq.com / Admin123!
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>Authority:</strong> infra@civiq.com / Infra123!
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>Citizen:</strong> rajesh.kumar@gmail.com / Citizen123!
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </MarketingChrome>
  );
}
