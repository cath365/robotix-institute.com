'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store';
import {
  Menu, X, ChevronDown,
  GraduationCap, Code, Cpu, Gamepad2, Trophy,
  Users, Bot, Wifi, BookOpen, Bell, Search,
  Map, BarChart3, Building2, Radio, Shield, Zap, CalendarDays, ReceiptText, Briefcase, MailPlus, MessageCircle, MessagesSquare
} from 'lucide-react';

const navItems = [
  {
    label: 'Ecosystem',
    children: [
      { label: 'Robotix Academy', href: '/courses', icon: GraduationCap },
      { label: 'Learning Paths', href: '/paths', icon: Map },
      { label: 'Innovation Portfolio', href: '/portfolio', icon: BookOpen },
      { label: 'Onboarding', href: '/onboarding', icon: Shield },
      { label: 'Robotix AI', href: '/ai-tutor', icon: Bot },
    ],
  },
  {
    label: 'Build',
    children: [
      { label: 'AI Builder', href: '/build', icon: Code },
      { label: 'IDE Lab', href: '/playground', icon: Code },
      { label: 'Robotix Blocks', href: '/robotix-blocks', icon: Code },
      { label: 'Robotics Simulator', href: '/simulation', icon: Cpu },
      { label: 'IoT Control Grid', href: '/iot', icon: Wifi },
      { label: 'PlayVerse Studio', href: '/game-lab', icon: Gamepad2 },
    ],
  },
  {
    label: 'Network',
    children: [
      { label: 'Community', href: '/community', icon: Users },
      { label: 'Competitions', href: '/competitions', icon: Trophy },
      { label: 'Innovation Media', href: '/blog', icon: Radio },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Team Workspace', href: '/team', icon: CalendarDays },
      { label: 'Events', href: '/events', icon: Building2 },
      { label: 'Careers', href: '/careers', icon: Briefcase },
    ],
  },
  {
    label: 'PlayVerse',
    children: [
      { label: 'Arcade', href: '/play', icon: Gamepad2 },
      { label: 'Creator Gallery', href: '/game-gallery', icon: Trophy },
      { label: 'Studio', href: '/game-lab', icon: Code },
      { label: 'IDE Arcade', href: '/playground', icon: Zap },
    ],
  },
  { label: 'Projects', href: '/projects' },
  { label: 'Weekend Classes', href: '/weekend-classes' },
  { label: 'Schools & Partners', href: '/partners' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const { isAuthenticated, user, token } = useAuthStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const logoHref = user?.role === 'ADMIN' ? '/admin' : '/';

  // Fetch notifications.
  // Poll every 60s while the tab is visible. Pause polling when hidden to
  // save battery and avoid hammering the API. When tab returns to focus we
  // do an immediate fetch.
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchNotifs = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch('/api/notifications?unread=true&limit=10', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setNotifications(data.data?.notifications || []);
          setUnreadCount(data.data?.unreadCount || 0);
        }
      } catch {
        /* network errors are fine; we'll retry on the next tick */
      }
    };

    const start = () => {
      if (interval) return;
      fetchNotifs();
      interval = setInterval(fetchNotifs, 60_000);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isAuthenticated, token]);

  // Global search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data?.results || []);
      }
    } catch {} finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const markAllRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const typeIcons: Record<string, string> = {
    course: '📚', blog: '📰', project: '🔧', forum: '💬', product: '🛒', path: '🗺️',
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/15 bg-[rgba(22,49,95,0.72)] shadow-[0_18px_45px_rgba(9,26,58,0.2)] backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={logoHref} className="flex items-center gap-2 group">
            <Image
              src="/images/logo-white.png"
              alt="Robotix Institute"
              width={160}
              height={44}
              className="h-9 w-auto object-contain group-hover:brightness-110 transition-all"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          {user?.role !== 'ADMIN' && (
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white">
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-1 w-60 overflow-hidden rounded-2xl border border-white/30 bg-[rgba(242,248,255,0.94)] backdrop-blur-xl shadow-glass"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-brand-primary/80 transition-colors hover:bg-brand-secondary/10 hover:text-brand-dark"
                          >
                            {child.icon && <child.icon className="w-4 h-4 text-brand-accent" />}
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Global Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                title="Search (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-96 overflow-hidden rounded-xl border border-white/30 bg-[rgba(242,248,255,0.95)] backdrop-blur-xl shadow-glass"
                  >
                    <div className="border-b border-slate-200/80 p-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/35" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search labs, projects, media, community..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white/90 py-2.5 pl-10 pr-12 text-sm text-brand-dark placeholder:text-slate-400 focus:border-brand-accent/50 focus:outline-none"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">ESC</kbd>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {searchLoading && (
                        <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
                      )}
                      {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
                        <div className="p-4 text-center text-sm text-slate-500">No results found</div>
                      )}
                      {!searchLoading && searchQuery.length < 2 && (
                        <div className="p-4 text-center text-sm text-slate-500">Type at least 2 characters...</div>
                      )}
                      {searchResults.map((result: any) => (
                        <Link
                          key={`${result.type}-${result.id}`}
                          href={result.url}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                          className="flex items-start gap-3 border-b border-slate-200/70 px-4 py-3 transition-colors last:border-0 hover:bg-brand-secondary/10"
                        >
                          <span className="text-lg mt-0.5">{typeIcons[result.type] || '📄'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-brand-dark">{result.title}</p>
                            <p className="truncate text-xs text-slate-500">{result.description}</p>
                          </div>
                          <span className="whitespace-nowrap rounded-full bg-brand-secondary/10 px-2 py-0.5 text-[10px] font-medium uppercase text-brand-primary/70">
                            {result.type}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            {isAuthenticated && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-white/30 bg-[rgba(242,248,255,0.95)] backdrop-blur-xl shadow-glass"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3">
                        <h3 className="text-sm font-heading font-semibold text-brand-dark">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-brand-accent hover:text-brand-accent/80 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            No new notifications
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((notif: any) => (
                            <Link
                              key={notif.id}
                              href={notif.link || '#'}
                              onClick={() => setNotifOpen(false)}
                              className={`block border-b border-slate-200/70 px-4 py-3 transition-colors last:border-0 hover:bg-brand-secondary/10 ${!notif.read ? 'bg-brand-secondary/8' : ''}`}
                            >
                              <p className="text-sm font-medium text-brand-dark">{notif.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{notif.message}</p>
                              <p className="mt-1 text-[10px] text-slate-400">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </Link>
                          ))
                        )}
                      </div>
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="block border-t border-slate-200/80 px-4 py-2.5 text-center text-xs font-medium text-brand-accent transition-colors hover:bg-brand-secondary/10"
                      >
                        View all notifications
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-2">
                {user?.role === 'ADMIN' ? (
                  <>
                    <Link href="/admin?panel=invite" className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="Invite team">
                      <MailPlus className="w-5 h-5" />
                    </Link>
                    <Link href="/admin?panel=messages" className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="Messages">
                      <MessagesSquare className="w-5 h-5" />
                    </Link>
                    <Link href="/team#calendar" className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="Calendar">
                      <CalendarDays className="w-5 h-5" />
                    </Link>
                    <Link href="/team#chat" className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="Chat rooms">
                      <MessageCircle className="w-5 h-5" />
                    </Link>
                  </>
                ) : (
                  <>
                    {(user?.role === 'INSTRUCTOR' || user?.role === 'ACCOUNTANT') && (
                      <>
                        <Link
                          href="/team#calendar"
                          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                          title="Calendar"
                        >
                          <CalendarDays className="w-5 h-5" />
                        </Link>
                        <Link
                          href="/team#chat"
                          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                          title="Chat rooms"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </Link>
                      </>
                    )}
                    {(user?.role === 'ACCOUNTANT') && (
                      <Link
                        href="/accounts"
                        className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        title="Accounts Panel"
                      >
                        <ReceiptText className="w-5 h-5" />
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-xs font-bold">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                      <span>{user?.firstName}</span>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm py-2">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2">
                  Join Ecosystem
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-brand-dark/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {user?.role === 'ADMIN' ? (
                <div className="grid grid-cols-4 gap-2 border-b border-white/10 pb-4">
                  {[
                    { label: 'Invite', href: '/admin?panel=invite', icon: MailPlus },
                    { label: 'Messages', href: '/admin?panel=messages', icon: MessagesSquare },
                    { label: 'Calendar', href: '/team#calendar', icon: CalendarDays },
                    { label: 'Chat', href: '/team#chat', icon: MessageCircle },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/70"
                    >
                      <item.icon className="h-5 w-5 text-brand-accent" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : (
              navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="space-y-1">
                    <p className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      {item.label}
                    </p>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {child.icon && <child.icon className="w-4 h-4 text-brand-accent" />}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href!}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )
              )}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <Link href="/login" className="block w-full text-center btn-ghost text-sm py-2">
                    Sign In
                  </Link>
                  <Link href="/register" className="block w-full text-center btn-primary text-sm py-2">
                    Join Ecosystem
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
