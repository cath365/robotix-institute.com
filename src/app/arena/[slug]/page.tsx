'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, EmptyState, GlassCard, LoadingSpinner, Section } from '@/components/ui';
import { challengeArcs } from '@/lib/ecosystem-data';
import { useApi, useAuth } from '@/hooks/useApi';
import {
  ArrowLeft,
  Construction,
  Crown,
  Gamepad2,
  Play,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

const RobotMaze = dynamic(() => import('@/components/games/RobotMaze'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  difficulty: string;
  maxScore: number;
  topScores?: Array<{
    id: string;
    score: number;
    level: number;
    user: { firstName: string; lastName: string; avatar?: string };
  }>;
  totalPlayers?: number;
}

export default function GamePlayerPage() {
  const params = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { post } = useApi();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/games/${params.slug}?leaderboard=true`);
        const data = await res.json();
        if (res.ok && data.data) setGame(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.slug]);

  const handleScore = async ({ score, level, time }: { score: number; level: number; time: number }) => {
    if (!isAuthenticated) {
      toast('Sign in to save your score!', { icon: '🔒' });
      return;
    }
    if (!game) return;
    setSubmitting(true);
    try {
      const res = await post(`/games/${game.slug}`, { score, level, time });
      if (res.success) {
        const rank = (res.data as { rank?: number })?.rank;
        toast.success(rank ? `Score saved! You're rank #${rank}` : 'Score saved!');
        const refresh = await fetch(`/api/games/${params.slug}?leaderboard=true`);
        const data = await refresh.json();
        if (data.data) setGame(data.data);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Could not save score');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-dark">
        <Navbar />
        <div className="pt-32"><LoadingSpinner size="lg" /></div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="min-h-screen bg-brand-dark">
        <Navbar />
        <Section className="pt-28">
          <EmptyState
            icon={<Gamepad2 className="w-8 h-8" />}
            title="Game not found"
            description="This game might still be in development. Check back soon."
            action={<Link href="/arena"><Button>Back to Arena</Button></Link>}
          />
        </Section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <Link href="/arena" className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Arena
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="accent" className="mb-4">
                <Gamepad2 className="mr-1 h-3 w-3" /> {game.type.replace('_', ' ')}
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">{game.name}</h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">{game.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/50">
                <span className="inline-flex items-center gap-1"><Target className="h-4 w-4" /> Max score {game.maxScore}</span>
                <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {game.totalPlayers ?? 0} players</span>
                <span className="inline-flex items-center gap-1"><Zap className="h-4 w-4" /> {game.difficulty}</span>
              </div>
            </motion.div>

            <GlassCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Difficulty', value: game.difficulty },
                  { label: 'Top board', value: `${game.topScores?.length || 0} scores` },
                  { label: 'Mode', value: game.type.replace('_', ' ') },
                  { label: 'Challenge arcs', value: challengeArcs.length.toString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/40">{item.label}</div>
                    <div className="mt-3 text-xl font-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { title: 'Mission logic', text: 'Train decision-making, movement planning, and score optimization under pressure.' },
            { title: 'Competition signal', text: 'Every strong run can ladder into leaderboards and institute points.' },
            { title: 'Playable learning', text: 'The game itself is part of the learning system, not a disconnected mini-demo.' },
            { title: 'Creator crossover', text: 'Players can move from Arena into PlayVerse Studio to build their own releases.' },
          ].map((item) => (
            <GlassCard key={item.title} className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-4 lg:p-6">
              {game.type === 'maze' ? (
                <RobotMaze onScore={handleScore} />
              ) : (
                <EmptyState
                  icon={<Construction className="w-8 h-8" />}
                  title="Coming soon"
                  description={`The ${game.name} engine is in active development. Try Robot Maze in the meantime.`}
                  action={<Link href="/arena/robot-maze"><Button>Play Robot Maze</Button></Link>}
                />
              )}
              {submitting ? (
                <p className="mt-3 text-center text-xs text-white/40">Saving your score...</p>
              ) : null}
            </GlassCard>
          </motion.div>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-bold">
                <Trophy className="h-5 w-5 text-brand-accent" /> Top 10
              </h2>
              {!game.topScores || game.topScores.length === 0 ? (
                <p className="py-6 text-center text-sm text-white/40">No scores yet. Be the first.</p>
              ) : (
                <ol className="space-y-2">
                  {game.topScores.map((score, index) => (
                    <li key={score.id} className={`flex items-center gap-3 rounded-xl p-2 ${index === 0 ? 'bg-brand-accent/10' : ''}`}>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-white/5 text-white/40'
                      }`}>
                        {index === 0 ? <Crown className="h-3 w-3" /> : index + 1}
                      </span>
                      <span className="flex-1 truncate text-sm text-white">
                        {score.user.firstName} {score.user.lastName.charAt(0)}.
                      </span>
                      <span className="text-sm font-mono text-brand-accent">{score.score}</span>
                    </li>
                  ))}
                </ol>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-bold">
                <Sparkles className="h-5 w-5 text-brand-accent" /> Challenge arcs
              </h2>
              <div className="space-y-3">
                {challengeArcs.slice(0, 3).map((challenge) => (
                  <div key={challenge.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{challenge.title}</p>
                      <Badge variant="accent">{challenge.xp}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-white/58">{challenge.detail}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
