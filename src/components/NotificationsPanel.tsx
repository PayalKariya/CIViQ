'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function NotificationsPanel({
  onClose,
  onNotificationsUpdated,
}: {
  onClose?: () => void;
  /** Called after unread list changes so the shell can sync (e.g. bell indicator). */
  onNotificationsUpdated?: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `/api/notifications?userId=${user?.id}&limit=50&isRead=false`
      );
      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  /** Mark read on the server and drop from the panel (same pattern as typical app notification centers). */
  const dismissNotification = async (notificationId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!res.ok) return false;
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      onNotificationsUpdated?.();
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  };

  const clearAllNotifications = async () => {
    if (!user?.id || notifications.length === 0 || clearingAll) return;
    setClearingAll(true);
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          typeof data.error === 'string' ? data.error : 'Could not clear notifications.'
        );
        return;
      }
      setNotifications([]);
      onNotificationsUpdated?.();
      const n = typeof data.cleared === 'number' ? data.cleared : 0;
      toast.success(
        n > 0
          ? `Cleared ${n} notification${n === 1 ? '' : 's'}.`
          : 'All notifications cleared.'
      );
    } catch (e) {
      console.error('Clear all notifications failed:', e);
      toast.error('Could not clear notifications. Try again.');
    } finally {
      setClearingAll(false);
    }
  };

  const handleNotificationClick = async (notification: { id: number; complaintId?: number | null }) => {
    const ok = await dismissNotification(notification.id);
    if (!ok) {
      toast.error('Could not clear notification. Try again.');
      return;
    }

    onClose?.();

    if (notification.complaintId) {
      router.push(`/citizen/complaints/${notification.complaintId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'complaint_status':
        return <Info className="w-4 h-4 text-blue-600" />;
      case 'assignment':
        return <Bell className="w-4 h-4 text-purple-600" />;
      case 'escalation':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'feedback':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const unreadCount = notifications.length;

  return (
    <Card className="w-full md:w-96 border-0 shadow-2xl">
      <CardHeader className="space-y-3 border-b">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="shrink-0 rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-blue-600 hover:text-blue-700"
                disabled={clearingAll || loading}
                onClick={(e) => {
                  e.stopPropagation();
                  void clearAllNotifications();
                }}
              >
                {clearingAll ? 'Clearing…' : 'Clear all'}
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="font-medium text-gray-700">You&apos;re all caught up</p>
              <p className="mt-1 text-sm">No new notifications right now.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="cursor-pointer bg-blue-50 p-4 transition-colors hover:bg-blue-100/80"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
