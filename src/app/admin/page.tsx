'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  Cpu,
  Gamepad2,
  GraduationCap,
  MailPlus,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  RadioTower,
  ReceiptText,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sprout,
  Trophy,
  Users,
  UserRound,
  Wifi,
} from 'lucide-react';
import AdminContactInbox from '@/components/admin/AdminContactInbox';
import AdminGameLabQueue from '@/components/admin/AdminGameLabQueue';
import AdminTeamOps from '@/components/admin/AdminTeamOps';
import AdminWeekendLeads from '@/components/admin/AdminWeekendLeads';
import { Badge, Button, GlassCard, Input, ProgressBar, Section } from '@/components/ui';
import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

type AdminStatsPayload = {
  stats: {
    users: {
      total: number;
      students: number;
      instructors: number;
    };
    courses: {
      total: number;
      enrollments: number;
    };
    marketplace: {
      products: number;
      orders: number;
      revenue: number;
    };
    competitions: {
      total: number;
      active: number;
    };
  };
  recentEnrollments: Array<{
    enrolledAt: string;
    user?: { firstName: string; lastName: string } | null;
    course?: { title: string; slug: string } | null;
  }>;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user?: { firstName: string; lastName: string } | null;
    items?: Array<{ product?: { name: string } | null }>;
  }>;
  popularCourses: Array<{
    title: string;
    slug: string;
    enrollmentCount: number;
  }>;
};

const tabs = ['Command Center', 'Messages', 'Team Ops', 'Programs', 'Game Lab', 'Settings'] as const;

const controlModules = [
  {
    title: 'User and identity control',
    description: 'Manage students, parents, innovators, staff roles, and access to ecosystem capabilities.',
    icon: Users,
  },
  {
    title: 'School partnership operations',
    description: 'Activate school dashboards, robotics clubs, event registrations, and performance intelligence.',
    icon: Building2,
  },
  {
    title: 'AI and content governance',
    description: 'Moderate Robotix AI usage, newsletters, media publishing, and learning content pipelines.',
    icon: Bot,
  },
  {
    title: 'IoT and agriculture monitoring',
    description: 'Track smart farming dashboards, device health, alerts, and live systems across deployments.',
    icon: Sprout,
  },
];

const operationsFeed = [
  'Newsletter automation segment prepared for learners, schools, and founders.',
  'Community moderation queue synced with discussion, comments, and creator approvals.',
  'Innovation media pipeline ready for event livestreams, founder stories, and student showcases.',
  'Realtime dashboard layer tracking IoT sensors, activity streams, and ecosystem engagement.',
];

const schoolSignals = [
  { name: 'School onboarding readiness', value: 82 },
  { name: 'Community moderation health', value: 74 },
  { name: 'Robotix AI service confidence', value: 91 },
  { name: 'AgriTech sensor visibility', value: 68 },
];

const systemAlerts = [
  { title: 'Innovation media schedule', detail: 'Three ecosystem stories queued for publication today.', tone: 'cyan' },
  { title: 'Partnership pipeline', detail: 'Two schools are ready for dashboard activation and robotics club onboarding.', tone: 'violet' },
  { title: 'Competition operations', detail: 'Challenge submissions are flowing into moderation and review panels.', tone: 'emerald' },
];

const fallbackData: AdminStatsPayload = {
  stats: {
    users: { total: 2840, students: 2230, instructors: 56 },
    courses: { total: 48, enrollments: 3920 },
    marketplace: { products: 126, orders: 184, revenue: 384200 },
    competitions: { total: 12, active: 4 },
  },
  recentEnrollments: [
    {
      enrolledAt: new Date().toISOString(),
      user: { firstName: 'Chelstone', lastName: 'STEM Club' },
      course: { title: 'Robotix Academy Launch Path', slug: 'robotix-academy-launch-path' },
    },
    {
      enrolledAt: new Date(Date.now() - 86_400_000).toISOString(),
      user: { firstName: 'Makeni', lastName: 'Innovation Lab' },
      course: { title: 'AI and Robotics Foundations', slug: 'ai-robotics-foundations' },
    },
    {
      enrolledAt: new Date(Date.now() - 172_800_000).toISOString(),
      user: { firstName: 'Copperbelt', lastName: 'Builder Circle' },
      course: { title: 'IoT Systems for Smart Agriculture', slug: 'iot-systems-smart-agriculture' },
    },
  ],
  recentOrders: [
    {
      id: 'ec-2401',
      total: 5400,
      status: 'processing',
      createdAt: new Date().toISOString(),
      user: { firstName: 'Prototype', lastName: 'Lab' },
      items: [{ product: { name: 'Robotics starter kits' } }],
    },
    {
      id: 'ec-2400',
      total: 2800,
      status: 'shipped',
      createdAt: new Date(Date.now() - 86_400_000).toISOString(),
      user: { firstName: 'AgriTech', lastName: 'Pilot' },
      items: [{ product: { name: 'Soil and climate sensor bundle' } }],
    },
    {
      id: 'ec-2399',
      total: 1900,
      status: 'delivered',
      createdAt: new Date(Date.now() - 172_800_000).toISOString(),
      user: { firstName: 'Drone', lastName: 'Builders' },
      items: [{ product: { name: 'ESP32 and navigation pack' } }],
    },
  ],
  popularCourses: [
    { title: 'AI and Robotics Foundations', slug: 'ai-robotics-foundations', enrollmentCount: 640 },
    { title: 'Smart Agriculture Systems', slug: 'smart-agriculture-systems', enrollmentCount: 472 },
    { title: 'Robotix Builder Lab', slug: 'robotix-builder-lab', enrollmentCount: 389 },
  ],
};

function initials(name?: string | null, surname?: string | null) {
  return `${name?.charAt(0) || 'R'}${surname?.charAt(0) || 'I'}`.toUpperCase();
}

export default function AdminPage() {
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Command Center');
  const [payload, setPayload] = useState<AdminStatsPayload>(fallbackData);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const loadStats = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.message || 'Admin analytics could not be loaded.');
        }
        if (!cancelled && json?.data) {
          setPayload(json.data as AdminStatsPayload);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Admin analytics could not be loaded.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const panel = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('panel') : null;
    if (panel === 'messages') setActiveTab('Messages');
    if (panel === 'team' || panel === 'invite') setActiveTab('Team Ops');
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: 'Ecosystem users',
        value: payload.stats.users.total.toLocaleString(),
        detail: `${payload.stats.users.students.toLocaleString()} students active in the network`,
        icon: Users,
      },
      {
        label: 'Learning flow',
        value: payload.stats.courses.enrollments.toLocaleString(),
        detail: `${payload.stats.courses.total} courses and pathways live`,
        icon: GraduationCap,
      },
      {
        label: 'Team coordination',
        value: payload.stats.users.instructors.toLocaleString(),
        detail: 'staff, instructors, and operators can be coordinated from Team Ops',
        icon: MessagesSquare,
      },
      {
        label: 'Competition system',
        value: payload.stats.competitions.active.toString(),
        detail: `${payload.stats.competitions.total} total competitions tracked`,
        icon: Trophy,
      },
      {
        label: 'School partners',
        value: '12',
        detail: 'active school relationships and programme sites',
        icon: Building2,
      },
      {
        label: 'Open enquiries',
        value: '24',
        detail: 'family, school, and partnership follow-ups',
        icon: MessageCircle,
      },
    ],
    [payload]
  );

  const adminShortcuts = [
    { label: 'Messages', icon: MessagesSquare, action: () => setActiveTab('Messages') },
    { label: 'Invite team', icon: MailPlus, action: () => setActiveTab('Team Ops') },
  ];

  const dailyActions: Array<
    | { title: string; detail: string; icon: LucideIcon; href: string }
    | { title: string; detail: string; icon: LucideIcon; onClick: () => void }
  > = [
    {
      title: 'Messages',
      detail: 'Contact, careers, and general website enquiries',
      icon: MessagesSquare,
      onClick: () => setActiveTab('Messages'),
    },
    {
      title: 'Child sign-ups',
      detail: 'Parents registering children for learning follow-up',
      icon: UserRound,
      onClick: () => setActiveTab('Messages'),
    },
    {
      title: 'Payments',
      detail: 'Proofs, balances, and account reconciliation',
      icon: ReceiptText,
      href: '/accounts',
    },
    {
      title: 'Team requests',
      detail: 'Materials, support, duties, and company needs',
      icon: ClipboardList,
      href: '/team#requests',
    },
  ];

  return (
    <main className="admin-dashboard min-h-screen bg-[#eef3f8] text-[#172132] lg:pl-56">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col bg-[#071a38] text-white lg:flex">
        <Link href="/" className="flex h-16 items-center border-b border-white/10 px-5">
          <Image src="/images/logo-white.png" alt="Robotix Institute" width={160} height={44} className="h-8 w-auto object-contain" />
        </Link>
        <div className="px-4 pb-2 pt-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">Administration</div>
        <nav className="flex-1 space-y-1 px-2.5">
          {tabs.map((tab, index) => {
            const icons = [BarChart3, MessagesSquare, Users, GraduationCap, Gamepad2, Settings];
            const Icon = icons[index];
            return (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-medium transition ${activeTab === tab ? 'bg-[#2478f3] text-white shadow-lg shadow-blue-950/30' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="h-4 w-4" />{tab}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"><ArrowRight className="h-4 w-4 rotate-180" />Public website</Link>
        </div>
      </aside>

      <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="min-w-0"><p className="truncate text-sm font-bold text-[#102744]">Robotix Administration</p><p className="text-[10px] text-slate-400">Institute operations dashboard</p></div>
          <div className="hidden max-w-md flex-1 items-center rounded-lg bg-slate-100 px-3 md:flex"><Search className="h-4 w-4 text-slate-400" /><input aria-label="Search administration" placeholder="Search students, programmes, enquiries..." className="w-full bg-transparent px-3 py-2 text-xs outline-none" /></div>
          <div className="flex items-center gap-2"><div className="hidden rounded-md bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700 sm:block">● Systems online</div><Link href="/notifications" className="relative rounded-lg border border-slate-200 p-2.5 text-slate-500"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" /></Link><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#102744] text-xs font-bold text-white">RI</div></div>
        </div>
        <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden">
          {tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-md px-3 py-2 text-[11px] font-semibold ${activeTab === tab ? 'bg-[#2478f3] text-white' : 'bg-slate-100 text-slate-600'}`}>{tab}</button>)}
        </div>
      </header>

      <section className="hidden">
        <div className="aurora-bg pointer-events-none absolute inset-0 opacity-80" />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <Shield className="mr-1 h-3 w-3" />
                Admin Super Dashboard
              </Badge>
              <h1 className="font-heading text-3xl font-bold text-[#102744] sm:text-4xl">
                Institute operations at a glance.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                Monitor learners, programs, enquiries, staff activity, and platform operations from one workspace.
              </p>
            </div>

            <GlassCard className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-accent">Daily work</p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold">Admin quick actions</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Live
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {dailyActions.map((item) => {
                  const content = (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-brand-accent/10 p-2 text-brand-accent">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-semibold text-white">{item.title}</div>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-white/50">{item.detail}</p>
                    </>
                  );

                  if ('href' in item) {
                    return (
                      <Link key={item.title} href={item.href} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-brand-accent/35 hover:bg-brand-accent/8">
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={item.onClick}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-brand-accent/35 hover:bg-brand-accent/8"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-brand-accent text-brand-dark shadow-glow-accent'
                      : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-brand-accent/25 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {adminShortcuts.map((shortcut) => (
                <button
                  key={shortcut.label}
                  type="button"
                  title={shortcut.label}
                  onClick={shortcut.action}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white/60 transition-colors hover:border-brand-accent/35 hover:text-white"
                >
                  <shortcut.icon className="h-5 w-5" />
                </button>
              ))}
              <Link
                href="/notifications"
                title="Notifications"
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white/60 transition-colors hover:border-brand-accent/35 hover:text-white"
              >
                <Bell className="h-5 w-5" />
              </Link>
              <Link
                href="/team#calendar"
                title="Team calendar"
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white/60 transition-colors hover:border-brand-accent/35 hover:text-white"
              >
                <CalendarDays className="h-5 w-5" />
              </Link>
              <Link
                href="/team#chat"
                title="Chat rooms"
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white/60 transition-colors hover:border-brand-accent/35 hover:text-white"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              <div className="w-full sm:w-64">
                <Input placeholder="Search systems, schools, creators..." icon={<Search className="h-4 w-4" />} />
              </div>
              <button type="button" className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white/60 transition-colors hover:text-white">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {activeTab === 'Command Center' && (
        <>
          <Section className="py-4">
            <div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2478f3]">Today at Robotix</p><h1 className="mt-1 text-xl font-bold text-[#102744]">Operations overview</h1></div><p className="hidden text-xs text-slate-400 sm:block">Live administrative summary</p></div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <GlassCard className={`admin-stat-card admin-stat-${index + 1} h-full p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-lg bg-white/15 p-2 text-white">
                        <stat.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-bold text-white/75">↗ LIVE</span>
                    </div>
                    <div className="mt-3 text-2xl font-bold">{stat.value}</div>
                    <div className="mt-1 text-[11px] font-semibold text-white/90">{stat.label}</div>
                    <div className="mt-2 line-clamp-2 text-[9px] leading-4 text-white/65">{stat.detail}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
            {loadError && (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                Live admin analytics could not be loaded, so the dashboard is showing a curated ecosystem preview instead.
              </div>
            )}
          </Section>

          <Section className="py-2">
            <div className="grid gap-3 xl:grid-cols-[1.55fr_0.78fr_1fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-[#102744]">Programme activity</p><p className="text-[10px] text-slate-400">Enrolments and completed projects · last 7 days</p></div><span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500">THIS WEEK</span></div>
                <div className="mt-4 h-44 w-full">
                  <svg viewBox="0 0 640 180" className="h-full w-full" role="img" aria-label="Programme activity trend">
                    {[30, 70, 110, 150].map((y) => <line key={y} x1="36" y1={y} x2="625" y2={y} stroke="#e7edf4" strokeWidth="1" />)}
                    <polyline fill="none" stroke="#2478f3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points="36,138 125,96 214,115 303,62 392,88 481,38 570,58 625,24" />
                    <polyline fill="none" stroke="#18a875" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points="36,154 125,137 214,142 303,112 392,121 481,84 570,99 625,65" />
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, index) => <text key={day} x={45 + index * 88} y="176" fill="#94a3b8" fontSize="10">{day}</text>)}
                  </svg>
                </div>
                <div className="flex gap-5 text-[10px] text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#2478f3]" />Enrolments</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#18a875]" />Completed projects</span></div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold text-[#102744]">Learners by programme</p><p className="text-[10px] text-slate-400">Current distribution</p>
                <div className="mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#2478f3 0 38%, #ff9f2f 38% 64%, #17a978 64% 83%, #8b5cf6 83% 100%)' }}><div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white"><strong className="text-xl text-[#102744]">{payload.stats.users.students}</strong><span className="text-[9px] text-slate-400">learners</span></div></div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 bg-[#2478f3]" />Robotics 38%</span><span><i className="mr-1 inline-block h-2 w-2 bg-[#ff9f2f]" />Coding 26%</span><span><i className="mr-1 inline-block h-2 w-2 bg-[#17a978]" />AI 19%</span><span><i className="mr-1 inline-block h-2 w-2 bg-[#8b5cf6]" />IoT 17%</span></div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold text-[#102744]">Enquiry summary</p><p className="text-[10px] text-slate-400">Follow-up status today</p>
                <div className="mt-4 space-y-2.5">{[
                  ['Admissions', '12', '50%', '#2478f3'],
                  ['School partnerships', '6', '25%', '#18a875'],
                  ['Weekend classes', '4', '17%', '#ff9f2f'],
                  ['General', '2', '8%', '#8b5cf6'],
                ].map(([name, count, percent, colour]) => <div key={name} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-slate-50 px-3 py-2"><div><p className="text-[10px] font-semibold text-slate-700">{name}</p><div className="mt-1 h-1.5 rounded-full bg-slate-200"><div className="h-full rounded-full" style={{ width: percent, backgroundColor: colour }} /></div></div><strong className="text-sm text-[#102744]">{count}</strong></div>)}</div>
              </div>
            </div>
          </Section>

          <Section className="py-3">
            <div className="grid gap-3 xl:grid-cols-[1.35fr_1fr_0.95fr]">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><p className="text-xs font-bold text-[#102744]">Recent enrolments</p><p className="text-[10px] text-slate-400">Latest learner activity</p></div><button onClick={() => setActiveTab('Programs')} className="text-[10px] font-bold text-[#2478f3]">VIEW PROGRAMMES →</button></div>
                <div className="divide-y divide-slate-100">{payload.recentEnrollments.map((item, index) => <div key={`${item.course?.slug}-${index}`} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 px-4 py-3"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-[10px] font-bold text-[#2478f3]">{initials(item.user?.firstName, item.user?.lastName)}</div><div className="min-w-0"><p className="truncate text-[11px] font-semibold text-slate-700">{[item.user?.firstName, item.user?.lastName].filter(Boolean).join(' ')}</p><p className="truncate text-[9px] text-slate-400">{item.course?.title}</p></div><span className="text-[9px] text-slate-400">{formatDate(item.enrolledAt)}</span></div>)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-[#102744]">Programme health</p><p className="text-[10px] text-slate-400">Operational readiness</p><div className="mt-4 space-y-4">{schoolSignals.map((signal) => <div key={signal.name}><div className="mb-1.5 flex justify-between text-[10px]"><span className="font-medium text-slate-600">{signal.name}</span><strong className="text-[#102744]">{signal.value}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#2478f3] to-[#57d4ff]" style={{ width: `${signal.value}%` }} /></div></div>)}</div></div>
              <div className="rounded-xl border border-red-100 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-[#102744]">Priority alerts</p><p className="text-[10px] text-slate-400">Items requiring attention</p></div><span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">3 OPEN</span></div><div className="mt-3 space-y-2">{systemAlerts.map((alert, index) => <div key={alert.title} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><div className="flex items-start gap-2"><span className={`mt-1 h-2 w-2 flex-none rounded-full ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-amber-500' : 'bg-blue-500'}`} /><div><p className="text-[10px] font-bold text-slate-700">{alert.title}</p><p className="mt-1 text-[9px] leading-4 text-slate-500">{alert.detail}</p></div></div></div>)}</div></div>
            </div>
          </Section>

          <Section className="hidden">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-brand-accent">Realtime intelligence</p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold">The ecosystem is built to be operated, not merely displayed.</h3>
                  </div>
                  <BarChart3 className="h-6 w-6 text-brand-accent" />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {operationsFeed.map((item, index) => (
                    <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/35">Signal 0{index + 1}</div>
                      <p className="mt-3 text-sm leading-6 text-white/68">{item}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-brand-accent">Control modules</p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold">Key governance surfaces</h3>
                  </div>
                  <BrainCircuit className="h-6 w-6 text-brand-accent" />
                </div>
                <div className="mt-6 space-y-3">
                  {controlModules.map((module) => (
                    <div key={module.title} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-brand-accent/10 p-2 text-brand-accent">
                          <module.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{module.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-white/58">{module.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </Section>

          <Section className="hidden">
            <div className="grid gap-6 lg:grid-cols-3">
              <GlassCard className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-brand-accent">Recent activations</p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold">Learning and ecosystem activity</h3>
                  </div>
                  <Activity className="h-6 w-6 text-brand-accent" />
                </div>
                <div className="mt-6">
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">Recent enrollments</h4>
                      <Link href="/courses" className="text-sm text-brand-accent hover:text-brand-accent-light">
                        Open academy
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {payload.recentEnrollments.map((item, index) => (
                        <div key={`${item.course?.slug || 'course'}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent text-xs font-bold">
                              {initials(item.user?.firstName, item.user?.lastName)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white">
                                {[item.user?.firstName, item.user?.lastName].filter(Boolean).join(' ') || 'Robotix learner'}
                              </div>
                              <div className="truncate text-xs text-white/45">{item.course?.title || 'Robotix course'}</div>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-white/35">{formatDate(item.enrolledAt)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="space-y-6">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-brand-accent">Signals</p>
                      <h3 className="mt-2 font-heading text-xl font-semibold">Health across key layers</h3>
                    </div>
                    <Wifi className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div className="mt-5 space-y-4">
                    {schoolSignals.map((signal) => (
                      <div key={signal.name}>
                        <div className="mb-2 flex items-center justify-between text-xs text-white/55">
                          <span>{signal.name}</span>
                          <span>{signal.value}%</span>
                        </div>
                        <ProgressBar value={signal.value} />
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-brand-accent">Priority alerts</p>
                      <h3 className="mt-2 font-heading text-xl font-semibold">What needs attention</h3>
                    </div>
                    <RadioTower className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {systemAlerts.map((alert) => (
                      <div key={alert.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-sm font-semibold text-white">{alert.title}</div>
                        <div className="mt-2 text-sm leading-6 text-white/58">{alert.detail}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </Section>
        </>
      )}

      {activeTab === 'Messages' && (
        <Section className="py-8">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: 'User governance',
                  text: 'Identity, roles, parent visibility, student protection, and creator moderation logic.',
                  icon: Users,
                },
                {
                  title: 'School rollout',
                  text: 'Partnership onboarding, dashboard access, robotics clubs, resources, and communications.',
                  icon: Building2,
                },
                {
                  title: 'Community safety',
                  text: 'Thread approvals, comment moderation, trending discussions, and reporting workflows.',
                  icon: Shield,
                },
                {
                  title: 'Media publishing',
                  text: 'News, newsletters, podcasts, event streaming, and ecosystem storytelling controls.',
                  icon: Newspaper,
                },
              ].map((item) => (
                <GlassCard key={item.title} className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{item.text}</p>
                </GlassCard>
              ))}
            </div>

            <AdminContactInbox />
            <AdminWeekendLeads />
          </div>
        </Section>
      )}

      {activeTab === 'Programs' && (
        <Section className="py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { title: 'Robotix Academy', metric: `${payload.stats.courses.total} active learning modules`, icon: GraduationCap },
              { title: 'AI Builder Platform', metric: 'Templates for apps, chatbots, and automations', icon: Bot },
              { title: 'Game and simulation layer', metric: 'Interactive labs and challenge environments', icon: Gamepad2 },
              { title: 'AgriTech systems', metric: 'Smart farming dashboards and connected field intelligence', icon: Sprout },
              { title: 'Innovation hub', metric: 'Founder pathways, ventures, and prototype readiness', icon: Briefcase },
              { title: 'Research and robotics lab', metric: 'Teaching kits, lab materials, and project surfaces', icon: Cpu },
            ].map((item) => (
              <GlassCard key={item.title} hover className="p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-brand-accent/10 p-3 text-brand-accent">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <Sparkles className="h-5 w-5 text-white/25" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{item.metric}</p>
              </GlassCard>
            ))}
          </div>
        </Section>
      )}

      {activeTab === 'Team Ops' && (
        <Section className="py-8">
          <AdminTeamOps />
        </Section>
      )}

      {activeTab === 'Game Lab' && (
        <Section className="py-8">
          <div className="mb-6 max-w-3xl">
            <Badge variant="accent" className="mb-4">
              <Gamepad2 className="mr-1 h-3 w-3" />
              STEM Game Zone Moderation
            </Badge>
            <h2 className="section-title">Review what young builders are creating before it goes live.</h2>
            <p className="section-subtitle mt-4">
              This queue acts as the quality and safety gate for game-based learning projects, challenge content, and playable innovation experiments.
            </p>
          </div>
          <AdminGameLabQueue />
        </Section>
      )}

      {activeTab === 'Settings' && (
        <Section className="py-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="p-6">
              <h3 className="font-heading text-2xl font-semibold">Ecosystem settings</h3>
              <div className="mt-6 space-y-4">
                <Input defaultValue="Robotix Institute Zambia" />
                <Input defaultValue="ecosystem@robotix.zm" />
                <Input defaultValue="+260 97X XXX XXX" />
                <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />}>
                  Save ecosystem configuration
                </Button>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-heading text-2xl font-semibold">Automation switches</h3>
              <div className="mt-6 space-y-3">
                {[
                  'Realtime dashboard alerts',
                  'Newsletter automation',
                  'Community moderation escalation',
                  'School onboarding notifications',
                  'AI tool governance logging',
                ].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <span className="text-sm text-white/68">{item}</span>
                    <div className={`h-6 w-11 rounded-full p-1 ${index !== 3 ? 'bg-brand-accent' : 'bg-white/10'}`}>
                      <div className={`h-4 w-4 rounded-full bg-white ${index !== 3 ? 'translate-x-5' : 'translate-x-0'} transition-transform`} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </Section>
      )}

      </div>
    </main>
  );
}
