'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, LogOut, Bell, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { Chatbot } from '@/components/Chatbot';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { appHeaderSurfaceClass, appPageBackgroundClass } from '@/lib/app-shell';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const refreshUnreadIndicator = useCallback(async () => {
    if (!user?.id) {
      setHasUnreadNotifications(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/notifications?userId=${user.id}&limit=1&isRead=false`
      );
      if (!res.ok) return;
      const data = await res.json();
      setHasUnreadNotifications(Array.isArray(data) && data.length > 0);
    } catch {
      setHasUnreadNotifications(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refreshUnreadIndicator();
  }, [refreshUnreadIndicator]);

  if (!user) return null;

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={appPageBackgroundClass}>
      <header className={appHeaderSurfaceClass}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
                    CIViQ+
                  </h1>
                  <p className="text-xs text-gray-600">{title}</p>
                </div>
              </Link>
            </div>

            <div className="hidden items-center gap-4 md:flex">
              <Popover
                open={notificationsOpen}
                onOpenChange={(open) => {
                  setNotificationsOpen(open);
                  void refreshUnreadIndicator();
                }}
              >
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {hasUnreadNotifications && (
                      <span
                        className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-red-500"
                        aria-hidden
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <NotificationsPanel
                    onClose={() => setNotificationsOpen(false)}
                    onNotificationsUpdated={refreshUnreadIndicator}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                  <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 space-y-4 border-t border-gray-200 pt-4 md:hidden">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">{user.fullName}</div>
                  <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <Chatbot />
    </div>
  );
}
