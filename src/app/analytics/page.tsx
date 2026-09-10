'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, GlassCard, ProgressBar, Section } from '@/components/ui';
import { useAuthStore } from '@/store';
import { connectivityModes, ecosystemSignals, familySignals, futureAfricaNodes } from '@/lib/ecosystem-data';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Building2,
  Compass,
  Flame,
  Globe2,
  Radar,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wifi,
} from 'lucide-react';

const previewData = {
  overview: {
    totalEnrolled: 6,
    completedCourses: 3,
    codeProjects: 14,
    achievementCount: 18,
    totalPoints: 2840,
    avgQuizScore: 89,
    certificates: 7,
    topGameScore: 9420,
  },
  skills: [
    { skill: 'Robotics systems', level: 82 },
    { skill: 'JavaScript + web', level: 76 },
    { skill: 'Arduino logic', level: 71 },
    { skill: 'AI prompting', level: 68 },
    { skill: 'Presentation & storytelling', level: 61 },
  ],
  weeklyActivity: [
    { week: 'Mon', lessons: 4 },
    { week: 'Tue', lessons: 3 },
    { week: 'Wed', lessons: 5 },
    { week: 'Thu', lessons: 2 },
    { week: 'Fri', lessons: 6 },
    { week: 'Sat', lessons: 4 },
    { week: 'Sun', lessons: 3 },
  ],
};

export default function AnalyticsPage() {
  const { token, isAuthenticated, user } = useAuthStore();
  const [data, setData] = useState<any>(previewData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('/api/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) {
          setData((current: any) => ({ ...current, ...res.data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const overview = data?.overview || previewData.overview;
  const skills = data?.skills || previewData.skills;
  const weeklyActivity = data?.weeklyActivity || previewData.weeklyActivity;
  const maxWeekly = useMemo(
    () => Math.max(...weeklyActivity.map((entry: any) => entry.lessons), 1),
    [weeklyActivity]
  );

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <BarChart3 className="mr-1 h-3 w-3" />
                Live Innovation Dashboard
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                Analytics for learners, schools, devices, and the wider Robotix ecosystem.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                The analytics layer now reads like a premium control surface. It tracks personal growth, school rollout,
                AI usage, connectivity realities, and ecosystem health in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <Button icon={<Radar className="h-4 w-4" />}>Open identity dashboard</Button>
                </Link>
                <Link href="/partners">
                  <Button variant="secondary" icon={<Building2 className="h-4 w-4" />}>See school analytics</Button>
                </Link>
              </div>
            </div>

            <GlassCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {ecosystemSignals.map((signal) => (
                  <div key={signal.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/40">{signal.label}</div>
                    <div className="mt-3 text-2xl font-bold">{signal.value}</div>
                    <p className="mt-2 text-xs text-white/42">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {[
            { label: 'Enrolled sectors', value: overview.totalEnrolled || 0, icon: Activity, color: 'text-brand-secondary' },
            { label: 'Completed', value: overview.completedCourses || 0, icon: Trophy, color: 'text-emerald-300' },
            { label: 'Projects', value: overview.codeProjects || 0, icon: BrainCircuit, color: 'text-brand-accent' },
            { label: 'Achievements', value: overview.achievementCount || 0, icon: Sparkles, color: 'text-amber-300' },
            { label: 'Total points', value: overview.totalPoints || 0, icon: Flame, color: 'text-rose-300' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-5">
                <stat.icon className={`mb-3 h-6 w-6 ${stat.color}`} />
                <div className="text-2xl font-heading font-bold">{stat.value}</div>
                <div className="mt-1 text-xs text-white/42">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">Capability radar</h2>
            </div>
            <div className="space-y-4">
              {skills.map((skill: any) => (
                <div key={skill.skill}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-white/72">{skill.skill}</span>
                    <span className="text-white/42">{skill.level}%</span>
                  </div>
                  <ProgressBar value={skill.level} />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">Weekly motion</h2>
            </div>
            <div className="flex h-52 items-end gap-3 pt-4">
              {weeklyActivity.map((entry: any, index: number) => {
                const height = Math.max(12, (entry.lessons / maxWeekly) * 100);
                return (
                  <div key={entry.week} className="flex flex-1 flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.7, delay: index * 0.05 }}
                      className="w-full rounded-t-2xl bg-gradient-to-t from-brand-primary via-brand-accent to-brand-secondary"
                    />
                    <span className="text-[11px] text-white/40">{entry.week}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-white/42">Lesson completion and mission activity across the last seven active periods.</p>
          </GlassCard>
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">Future Africa node map</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {futureAfricaNodes.map((node) => (
                <div key={`${node.city}-${node.country}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-secondary">{node.status}</p>
                  <h3 className="mt-3 font-heading text-lg font-semibold">
                    {node.city}, {node.country}
                  </h3>
                  <p className="mt-2 text-sm text-white/58">{node.focus}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/40">{node.signal}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-2xl font-bold">Parent mode summary</h2>
              </div>
              <div className="space-y-3">
                {familySignals.map((signal) => (
                  <div key={signal.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="font-semibold text-white">{signal.title}</p>
                    <p className="mt-2 text-sm text-white/58">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Wifi className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-2xl font-bold">Connectivity intelligence</h2>
              </div>
              <div className="space-y-3">
                {connectivityModes.map((mode) => (
                  <div key={mode.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{mode.title}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-brand-secondary">{mode.signal}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/58">{mode.detail}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      <Section className="py-8">
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold">
                {isAuthenticated ? `Welcome back, ${user?.firstName || 'Innovator'}` : 'Preview mode active'}
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-white/60">
                {loading
                  ? 'Live analytics are syncing from your account now.'
                  : token
                    ? 'Your personal analytics are blended with ecosystem signals so the platform feels bigger than a personal report card.'
                    : 'You are seeing a branded analytics preview even before sign-in, which helps the website feel like a real innovation product from the first visit.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/onboarding"><Button variant="secondary">Open onboarding</Button></Link>
              <Link href="/portfolio"><Button>View portfolio layer</Button></Link>
            </div>
          </div>
        </GlassCard>
      </Section>

      <Footer />
    </main>
  );
}
