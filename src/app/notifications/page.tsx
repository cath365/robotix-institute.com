'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bell, Check, CheckCheck, Trash2, BookOpen, Trophy,
  MessageCircle, ShoppingCart, Award, Settings
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Section, GlassCard, Badge, Button, LoadingSpinner, EmptyState
} from '@/components/ui';
import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

const typeIcons: Record<string, React.ReactNode> = {
  achievement: <Award className="w-5 h-5 text-yellow-400" />,
  course: <BookOpen className="w-5 h-5 text-blue-400" />,
  competition: <Trophy className="w-5 h-5 text-purple-400" />,
  forum: <MessageCircle className="w-5 h-5 text-green-400" />,
  order: <ShoppingCart className="w-5 h-5 text-orange-400" />,
  system: <Settings className="w-5 h-5 text-white/40" />,
};

export default function NotificationsPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchNotifications();
  }, [token, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data?.notifications || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const markRead = async (ids: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notificationIds: ids }),
      });
      setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
    } catch {}
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-brand-dark text-white">
        <Navbar />
        <div className="pt-32 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <h1 className="text-2xl font-heading font-bold mb-4">Sign in to view notifications</h1>
          <Link href="/login"><Button>Sign In</Button></Link>
        </div>
      </main>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <Section className="pt-28">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-white">Notifications</h1>
              <p className="text-sm text-white/40 mt-1">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} icon={<CheckCheck className="w-4 h-4" />}>
                Mark All Read
              </Button>
            )}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-8 h-8" />}
              title="No Notifications"
              description="You're all caught up! Notifications will appear here."
            />
          ) : (
            <div className="space-y-2">
              {notifications.map((notif: any, i: number) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link href={notif.link || '#'}>
                    <GlassCard
                      hover
                      className={`p-4 flex items-start gap-4 ${!notif.read ? 'border-brand-accent/20 bg-brand-accent/5' : ''}`}
                    >
                      <div className="mt-0.5">
                        {typeIcons[notif.type] || typeIcons.system}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-brand-accent" />}
                        </div>
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-white/30 mt-1">{formatDate(notif.createdAt)}</p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead([notif.id]); }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm"
              >
                Previous
              </button>
              <span className="text-sm text-white/40 px-4">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Section>

      <Footer />
    </main>
  );
}
