'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { FirebaseLoginCard } from '@/components/learning/FirebaseLoginCard';
import { useLearningProfile } from '@/components/learning/useLearningProfile';
import { Button, GlassCard, LoadingSpinner, Section } from '@/components/ui';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, isAuthenticated, error } = useLearningProfile();

  if (!ready) return <LoadingSpinner size="lg" />;

  if (!isAuthenticated) {
    return (
      <Section className="pt-32">
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-[1fr_360px]">
          <GlassCard className="p-6">
            <Lock className="mb-4 h-8 w-8 text-brand-accent" />
            <h1 className="font-heading text-2xl font-bold text-white">Sign in to continue</h1>
            <p className="mt-2 text-white/55">
              Dashboard, Build Studio, lesson progress, XP, and leaderboard scores need a connected learning account.
            </p>
            {error ? <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
            <Link href="/learn">
              <Button className="mt-5" variant="secondary">Browse public lessons</Button>
            </Link>
          </GlassCard>
          <FirebaseLoginCard />
        </div>
      </Section>
    );
  }

  return <>{children}</>;
}
