'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Gamepad2,
  Medal,
  Play,
  Search,
  Shield,
  Trophy,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PlayVerseArcade, type ArcadeGameId } from '@/components/game/PlayVerseArcade';
import { useLearningProfile } from '@/components/learning/useLearningProfile';
import { Badge, Button, GlassCard, Section } from '@/components/ui';
import { saveLeaderboardScore, subscribeToLeaderboard, type LeaderboardScore } from '@/lib/firebase';

const gameSignals = [
  { title: 'On-site arcade', text: 'Play directly on Robotix with native STEM mini-games that do not depend on outside platforms.', icon: Gamepad2 },
  { title: 'Robotics Challenges', text: 'Practice systems thinking, command flow, and robotics intuition through interactive mechanics.', icon: Zap },
  { title: 'XP and rankings', text: 'Earn visible momentum with scores, streaks, badges, and innovation-driven leaderboards.', icon: Trophy },
  { title: 'Creator pathway', text: 'Play, learn, then move into PlayVerse Studio to publish your own STEM games.', icon: Shield },
];

interface SpotlightGame {
  id: string;
  slug: string;
  title: string;
  description?: string;
  playCount: number;
  likeCount?: number;
  tags?: string;
  thumbnail?: string;
}

export default function PlayPage() {
  const { user } = useLearningProfile();
  const [sessionScore, setSessionScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardScore[]>([]);
  const [scoreError, setScoreError] = useState('');
  const [spotlightGames, setSpotlightGames] = useState<SpotlightGame[]>([]);

  useEffect(() => {
    try {
      return subscribeToLeaderboard(setLeaderboard);
    } catch (error) {
      setScoreError(error instanceof Error ? error.message : 'Leaderboard is unavailable.');
    }
  }, []);

  useEffect(() => {
    const loadSpotlightGames = async () => {
      try {
        const res = await fetch('/api/game-projects?sort=trending&limit=3');
        const json = await res.json();
        const next = Array.isArray(json?.data) ? json.data : [];
        setSpotlightGames(next);
      } catch {
        setSpotlightGames([]);
      }
    };

    loadSpotlightGames();
  }, []);

  const recordScore = useCallback(async (score: number, game: ArcadeGameId = 'memory') => {
    setSessionScore((current) => Math.max(current, score));
    if (!user) {
      setScoreError('Sign in on the dashboard to save leaderboard scores.');
      return;
    }
    await saveLeaderboardScore({
      userId: user.uid,
      displayName: user.displayName || user.email || 'Robotix Creator',
      game,
      score,
    });
  }, [user]);

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <Gamepad2 className="mr-1 h-3 w-3" />
                PlayVerse
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                A futuristic STEM gaming world for Africa&apos;s next creators.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                PlayVerse combines coding games, robotics thinking, challenge mechanics, and visible progress into a premium learning universe instead of a normal arcade page.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/game-lab">
                  <Button variant="primary" size="lg" icon={<Zap className="h-5 w-5" />}>
                    Enter PlayVerse Studio
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="secondary" size="lg" icon={<ArrowRight className="h-5 w-5" />}>
                    View XP Identity
                  </Button>
                </Link>
              </div>
            </div>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-secondary">Session signal</p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold">Fast rewards, real learning, visible momentum.</h2>
                </div>
                <Trophy className="h-6 w-6 text-brand-secondary" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Best session score', value: sessionScore.toString() },
                  { label: 'Leaderboard mode', value: 'Live' },
                  { label: 'Play style', value: 'Learning-first' },
                  { label: 'Creator route', value: 'Play to publish' },
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
        <div className="grid gap-4 lg:grid-cols-4">
          {gameSignals.map((item) => (
            <GlassCard key={item.title} className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <GlassCard className="overflow-hidden p-5">
              <PlayVerseArcade onScore={recordScore} />
            </GlassCard>

            <GlassCard className="overflow-hidden p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-bold">Published on Robotix</h2>
                  <p className="mt-1 text-sm text-white/58">
                    These are live PlayVerse releases from your own creator ecosystem, not off-site embeds.
                  </p>
                </div>
                <Link href="/game-gallery">
                  <Button size="sm" variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>
                    Open gallery
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {spotlightGames.length > 0 ? spotlightGames.map((game) => (
                  <div key={game.id} className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.03]">
                    <div
                      className="relative min-h-[190px] border-b border-white/10 p-4"
                      style={game.thumbnail ? {
                        backgroundImage: `linear-gradient(180deg, rgba(5,8,22,0.18), rgba(5,8,22,0.82)), url(${game.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : undefined}
                    >
                      {!game.thumbnail ? (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(51,214,255,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(138,63,252,0.2),transparent_40%),linear-gradient(135deg,rgba(10,14,32,0.98),rgba(28,8,51,0.96))]" />
                      ) : null}
                      <div className="relative flex h-full min-h-[158px] flex-col justify-between">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="accent">Published</Badge>
                          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/78">
                            {game.playCount.toLocaleString()} plays
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/72">
                            <Play className="h-3 w-3" />
                            Featured release
                          </div>
                          <h3 className="font-heading text-xl font-semibold text-white">{game.title}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm leading-6 text-white/58">
                        {game.description || 'A creator-built PlayVerse release ready to play inside Robotix.'}
                      </p>
                      {game.tags ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {game.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/54">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/42">
                        <span>{(game.likeCount || 0).toLocaleString()} likes</span>
                        <Link href={`/game-lab/play/${game.slug}`}>
                          <Button size="sm" icon={<Play className="h-4 w-4" />}>Play now</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-[1.35rem] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-white/50 md:col-span-3">
                    Published creator games will appear here as the PlayVerse gallery grows.
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          <aside className="space-y-5">
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold">Live leaderboard</h2>
                <Medal className="h-5 w-5 text-brand-secondary" />
              </div>
              <div className="space-y-2">
                {scoreError ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{scoreError}</p> : null}
                {leaderboard.map((row, index) => (
                  <div key={row.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <span className="flex items-center gap-2 text-sm">
                      <Medal className="h-4 w-4 text-brand-secondary" />
                      #{index + 1} {row.displayName}
                    </span>
                    <span className="font-bold text-brand-secondary">{row.score}</span>
                  </div>
                ))}
                {leaderboard.length === 0 && !scoreError ? <p className="text-sm text-white/50">No scores yet. Be the first signal in PlayVerse.</p> : null}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-lg font-bold">What next?</h2>
              </div>
              <div className="grid gap-2">
                <Link href="/build" className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm text-white/70 transition-colors hover:text-white">
                  Save a game idea in AI Builder
                </Link>
                <Link href="/game-gallery" className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm text-white/70 transition-colors hover:text-white">
                  Browse published PlayVerse games
                </Link>
                <Link href="/game-lab" className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm text-white/70 transition-colors hover:text-white">
                  Open PlayVerse Studio
                </Link>
                <Link href="/dashboard" className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm text-white/70 transition-colors hover:text-white">
                  Check badges, streaks, and identity progress
                </Link>
              </div>
            </GlassCard>
          </aside>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
