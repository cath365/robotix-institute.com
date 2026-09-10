'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Flame,
  Globe2,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Wifi,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, GlassCard, ProgressBar, Section } from '@/components/ui';
import { useLearningProfile } from '@/components/learning/useLearningProfile';
import { challengeArcs, connectivityModes, languageRoadmap } from '@/lib/ecosystem-data';
import { learningPaths } from '@/lib/learning-data';

export default function LearnHubPage() {
  const { profile, level, levelProgress, completedCount, totalLessons, badges, nextLesson } = useLearningProfile();

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <Radar className="mr-1 h-3 w-3" />
                Mission Hub
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                Learn like you are navigating an innovation world, not browsing lessons.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                Every path now works like a sector inside the Robotix universe: lessons, prototypes, games, badges,
                school relevance, and future creator identity all connect into one journey.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/learn/${nextLesson.pathSlug}`}>
                  <Button icon={<ArrowRight className="h-4 w-4" />}>Continue next mission</Button>
                </Link>
                <Link href="/onboarding">
                  <Button variant="secondary" icon={<ShieldCheck className="h-4 w-4" />}>Adjust my route</Button>
                </Link>
              </div>
            </div>

            <GlassCard className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-3xl font-bold text-brand-accent">{profile.xp}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/38">XP</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-3xl font-bold text-emerald-300">{profile.streak}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/38">Streak</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-3xl font-bold text-brand-secondary">{completedCount}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/38">Lessons done</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-3xl font-bold text-white">{badges.length}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/38">Badges visible</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs text-white/48">
                  <span>{level}</span>
                  <span>{completedCount}/{totalLessons} lessons</span>
                </div>
                <ProgressBar value={levelProgress} />
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {learningPaths.map((path, index) => {
            const Icon = path.icon;
            const completed = path.lessons.filter((lesson) => profile.completedLessonIds.includes(lesson.id)).length;
            const progress = Math.round((completed / path.lessons.length) * 100);
            return (
              <motion.div
                key={path.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={path.href}>
                  <GlassCard hover className="flex h-full flex-col p-5">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${path.accent}`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge variant="primary">{path.level}</Badge>
                      <Badge variant="accent">{path.badge}</Badge>
                    </div>
                    <h2 className="font-heading text-xl font-bold">{path.title}</h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-white/58">{path.description}</p>
                    <div className="mt-5">
                      <ProgressBar value={progress} showLabel />
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
                      Enter sector <ArrowRight className="h-4 w-4" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">Challenge unlocks</h2>
            </div>
            <div className="space-y-3">
              {challengeArcs.map((challenge) => (
                <div key={challenge.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{challenge.title}</p>
                    <Badge variant="accent">{challenge.xp}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-white/58">{challenge.detail}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-2xl font-bold">Language readiness</h2>
              </div>
              <div className="space-y-3">
                {languageRoadmap.map((language) => (
                  <div key={language.name} className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div>
                      <p className="font-semibold text-white">{language.name}</p>
                      <p className="mt-1 text-sm text-white/58">{language.detail}</p>
                    </div>
                    <Badge variant={language.status === 'Live now' ? 'success' : 'primary'}>{language.status}</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Wifi className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-2xl font-bold">Access modes</h2>
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
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Flame, title: 'Daily streak engine', text: 'Learning streaks stay visible and emotionally motivating, not buried inside settings.' },
            { icon: Trophy, title: 'Portfolio-linked outcomes', text: 'Every lesson path is now framed to feed identity, badges, and creator credibility.' },
            { icon: Sparkles, title: 'Cross-platform momentum', text: 'Move from learning into PlayVerse, IDE Lab, AI Builder, and school showcases without losing context.' },
          ].map((item) => (
            <GlassCard key={item.title} className="p-5">
              <item.icon className="mb-3 h-6 w-6 text-brand-accent" />
              <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/play"><Button variant="secondary">Enter PlayVerse</Button></Link>
          <Link href="/playground"><Button>Open IDE Lab</Button></Link>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
