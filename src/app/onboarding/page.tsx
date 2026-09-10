'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  Globe2,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, GlassCard, Section } from '@/components/ui';
import { connectivityModes, languageRoadmap, onboardingTracks } from '@/lib/ecosystem-data';

const roleIcons = {
  student: Sparkles,
  school: Layers3,
  parent: ShieldCheck,
  innovator: Rocket,
  startup: Users,
} as const;

export default function OnboardingPage() {
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
                <Compass className="mr-1 h-3 w-3" />
                Ecosystem Onboarding
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                Enter Robotix through the right mission lane for you.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                Students, schools, parents, innovators, and startups should not all land in the same generic flow.
                This onboarding layer turns the platform into an African innovation operating system instead of a flat website.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/learn">
                  <Button icon={<Sparkles className="h-4 w-4" />}>Start as a learner</Button>
                </Link>
                <Link href="/partners">
                  <Button variant="secondary" icon={<Layers3 className="h-4 w-4" />}>Open school mode</Button>
                </Link>
              </div>
            </div>

            <GlassCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Role-based routes', value: '5' },
                  { label: 'Language-ready', value: '4' },
                  { label: 'Connectivity modes', value: '3' },
                  { label: 'Setup time', value: '< 2 min' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/40">{item.label}</div>
                    <div className="mt-3 text-2xl font-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-4 lg:grid-cols-5">
          {onboardingTracks.map((track, index) => {
            const Icon = roleIcons[track.id];
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={track.destination}>
                  <GlassCard hover className="flex h-full flex-col p-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="font-heading text-xl font-semibold">{track.title}</h2>
                    <p className="mt-3 flex-1 text-sm leading-6 text-white/60">{track.summary}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/38">{track.spotlight}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
                      Enter lane <ArrowRight className="h-4 w-4" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">Language roadmap</h2>
            </div>
            <div className="space-y-3">
              {languageRoadmap.map((language) => (
                <div key={language.name} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{language.name}</p>
                    <Badge variant={language.status === 'Live now' ? 'success' : 'primary'}>{language.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-white/58">{language.detail}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Wifi className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">Connectivity-aware experience</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {connectivityModes.map((mode) => (
                <div key={mode.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-secondary">{mode.signal}</p>
                  <h3 className="mt-3 font-heading text-lg font-semibold">{mode.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/58">{mode.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-brand-accent/20 bg-brand-accent/8 p-4 text-sm text-white/70">
              Robotix can now be framed as both a premium immersive platform and a practical low-bandwidth learning system for wider African access.
            </div>
          </GlassCard>
        </div>
      </Section>

      <Section className="py-8">
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold">Recommended launch order</h2>
              <p className="mt-2 max-w-3xl text-sm text-white/60">
                Start in onboarding, move into your mission space, then let analytics, portfolio, and community reflect your momentum over time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button variant="secondary">Open dashboard</Button>
              </Link>
              <Link href="/portfolio">
                <Button icon={<ArrowRight className="h-4 w-4" />}>View innovation identity</Button>
              </Link>
            </div>
          </div>
        </GlassCard>
      </Section>

      <Footer />
    </main>
  );
}
