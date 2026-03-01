'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: 'citizen' | 'authority' | 'admin';
  trustScore: number;
  department: string | null;
  domain: string | null;
  issueType: string | null;
  authorityLevel: number | null;
  employeeId: string | null;
  organizationRegion: string | null;
  organizationName: string | null;
  verificationStatus: 'pending' | 'verified' | 'rejected' | null;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    role?: string,
    department?: string,
    domain?: string,
    authorityLevel?: number,
    employeeId?: string,
    organizationRegion?: string,
    organizationName?: string,
    designation?: string,
    idPhotoUrl?: string,
    issueType?: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('civiq_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('civiq_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // Refresh user data on mount to ensure trust score is up to date
      const data = JSON.parse(storedUser);
      fetch(`/api/users/${data.id}`)
        .then(res => res.json())
        .then(userData => {
          if (!userData.error) {
            setUser(userData);
            localStorage.setItem('civiq_user', JSON.stringify(userData));
          }
        })
        .catch(err => console.error('Initial refresh failed', err));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem('civiq_user', JSON.stringify(userData));

    if (userData.role === 'admin') {
      router.push('/admin');
    } else if (userData.role === 'authority') {
      if (userData.verificationStatus === 'pending') {
        router.push('/authority/pending');
      } else if (userData.verificationStatus === 'verified') {
        router.push('/authority');
      } else {
        throw new Error('Your authority account has been rejected. Please contact support.');
      }
    } else {
      router.push('/citizen');
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    role?: string,
    department?: string,
    domain?: string,
    authorityLevel?: number,
    employeeId?: string,
    organizationRegion?: string,
    organizationName?: string,
    designation?: string,
    idPhotoUrl?: string,
    issueType?: string
  ) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        fullName,
        phone,
        role,
        department,
        domain,
        authorityLevel,
        employeeId,
        organizationRegion,
        organizationName,
        designation,
        idPhotoUrl,
        issueType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem('civiq_user', JSON.stringify(userData));

    if (userData.role === 'admin') {
      router.push('/admin');
    } else if (userData.role === 'authority') {
      router.push('/authority/pending');
    } else {
      router.push('/citizen');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civiq_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
