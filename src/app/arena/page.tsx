'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, EmptyState, GlassCard, LoadingSpinner, Section } from '@/components/ui';
import { challengeArcs } from '@/lib/ecosystem-data';
import {
  Crown,
  Gamepad2,
  Medal,
  Play,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

interface ApiGame {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  difficulty: string;
  maxScore: number;
  thumbnail?: string;
  levels: { id: string; levelNum: number; name: string; maxScore: number }[];
  _count: { scores: number };
}

interface LeaderboardEntry {
  user: { id: string; firstName: string; lastName: string; avatar?: string };
  score: number;
  game?: { name: string };
}

interface InstituteLbEntry {
  rank: number;
  points: number;
  user: { id: string; firstName: string; lastName: string; avatar?: string | null };
  isMe?: boolean;
}

const FALLBACK_GAMES: ApiGame[] = [
  {
    id: 'fallback-1',
    name: 'Robot Maze Challenge',
    slug: 'robot-maze',
    description: 'Navigate your robot through increasingly complex mazes while learning structured movement logic.',
    type: 'maze',
    difficulty: 'medium',
    maxScore: 1000,
    levels: [{ id: 'l1', levelNum: 1, name: 'Warm-up', maxScore: 1000 }],
    _count: { scores: 0 },
  },
  {
    id: 'fallback-2',
    name: 'Coding Puzzle Rush',
    slug: 'coding-puzzle',
    description: 'Solve mission logic with commands, sequencing, and clearer computational thinking.',
    type: 'logic',
    difficulty: 'easy',
    maxScore: 800,
    levels: [{ id: 'l2', levelNum: 1, name: 'Starter', maxScore: 800 }],
    _count: { scores: 0 },
  },
];

const TYPE_META: Record<string, { icon: string; gradient: string }> = {
  maze: { icon: 'MZ', gradient: 'from-brand-accent/30 to-brand-primary/30' },
  line_follower: { icon: 'LF', gradient: 'from-emerald-400/30 to-brand-secondary/30' },
  drone_nav: { icon: 'DR', gradient: 'from-cyan-400/30 to-brand-secondary/30' },
  robot_soccer: { icon: 'RS', gradient: 'from-orange-400/30 to-rose-400/30' },
  logic: { icon: 'LG', gradient: 'from-brand-secondary/30 to-brand-accent/30' },
};

const ACHIEVEMENTS = [
  { name: 'First Launch', desc: 'Complete your first PlayVerse challenge.', points: 10 },
  { name: 'Speed Runner', desc: 'Beat a level under the target time.', points: 25 },
  { name: 'Perfect Score', desc: 'Hit maximum score in any challenge lane.', points: 50 },
  { name: 'Maze Master', desc: 'Clear the navigation progression set.', points: 100 },
  { name: 'Code Warrior', desc: 'Win 10 game sessions in a row.', points: 75 },
  { name: 'Legend Signal', desc: 'Reach the top of an arena leaderboard.', points: 200 },
] as const;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default function ArenaPage() {
  const [tab, setTab] = useState<'games' | 'leaderboard' | 'achievements'>('games');
  const [games, setGames] = useState<ApiGame[] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardBoard, setLeaderboardBoard] = useState<'arena' | 'institute'>('arena');
  const [pointsPeriod, setPointsPeriod] = useState<'all' | 'weekly'>('all');
  const [instituteRows, setInstituteRows] = useState<InstituteLbEntry[]>([]);
  const [instituteLoading, setInstituteLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [gamesRes, lbRes] = await Promise.all([
          fetch('/api/games?limit=20').then((response) => response.json()).catch(() => null),
          fetch('/api/leaderboard?limit=10').then((response) => response.json()).catch(() => null),
        ]);
        if (cancelled) return;
        const fromData = asArray<ApiGame>(gamesRes?.data);
        const fromItems = asArray<ApiGame>(gamesRes?.items);
        const fetchedGames = fromData.length > 0 ? fromData : fromItems;
        setGames(fetchedGames.length > 0 ? fetchedGames : FALLBACK_GAMES);
        const lbRaw = lbRes?.data?.leaderboard ?? lbRes?.data;
        setLeaderboard(asArray<LeaderboardEntry>(lbRaw));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInstitutePoints() {
      if (tab !== 'leaderboard' || leaderboardBoard !== 'institute') return;
      setInstituteLoading(true);
      try {
        const query = pointsPeriod === 'weekly' ? 'period=weekly&limit=50' : 'period=all&limit=50';
        const res = await fetch(`/api/leaderboard/users?${query}`, { credentials: 'include' });
        const json = await res.json();
        if (!cancelled) {
          const rows = json?.data?.leaderboard;
          setInstituteRows(Array.isArray(rows) ? rows : []);
        }
      } catch {
        if (!cancelled) setInstituteRows([]);
      } finally {
        if (!cancelled) setInstituteLoading(false);
      }
    }
    loadInstitutePoints();
    return () => {
      cancelled = true;
    };
  }, [leaderboardBoard, pointsPeriod, tab]);

  const totalScores = useMemo(
    () => (games || []).reduce((sum, game) => sum + (game._count?.scores || 0), 0),
    [games]
  );

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <Gamepad2 className="mr-1 h-3 w-3" />
                PlayVerse Arena
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                Competitive STEM play with enough polish for kids, teens, and serious builders.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                Arena is the challenge surface of Robotix: robotics mini-games, coding missions, leaderboard energy,
                and achievement loops that feed identity, competition, and creator growth.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/play">
                  <Button size="lg" icon={<Play className="h-5 w-5" />}>Enter PlayVerse</Button>
                </Link>
                <Link href="/game-gallery">
                  <Button variant="secondary" size="lg" icon={<ArrowRightIcon />}>Explore published games</Button>
                </Link>
              </div>
            </div>

            <GlassCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Arena games', value: (games?.length || 0).toString() },
                  { label: 'Score entries', value: totalScores.toString() },
                  { label: 'Challenge arcs', value: challengeArcs.length.toString() },
                  { label: 'Achievement tiers', value: ACHIEVEMENTS.length.toString() },
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
          {[
            { title: 'Challenge loops', text: 'Arena games sharpen logic, timing, and computational thinking.', icon: Target },
            { title: 'Competition energy', text: 'Visible scores and rankings make learning momentum feel real.', icon: Trophy },
            { title: 'Creator crossover', text: 'Arena play connects to PlayVerse Studio and game publishing.', icon: Sparkles },
            { title: 'Age-inclusive quality', text: 'Simple enough for new learners, polished enough for older builders.', icon: Users },
          ].map((item) => (
            <GlassCard key={item.title} className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section className="py-4">
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { key: 'games' as const, label: 'Games', icon: <Gamepad2 className="h-4 w-4" /> },
            { key: 'leaderboard' as const, label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
            { key: 'achievements' as const, label: 'Achievements', icon: <Medal className="h-4 w-4" /> },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                tab === item.key
                  ? 'bg-brand-secondary text-white'
                  : 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner size="lg" /> : null}

        {!loading && tab === 'games' && (
          <div className="grid gap-6 md:grid-cols-2">
            {games && games.length > 0 ? games.map((game, index) => {
              const levels = Array.isArray(game.levels) ? game.levels : [];
              const scoreCount = typeof game._count?.scores === 'number' ? game._count.scores : 0;
              const meta = TYPE_META[game.type] || { icon: 'GV', gradient: 'from-white/10 to-white/5' };
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard hover className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-lg font-heading font-bold`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-xl font-semibold text-white">{game.name}</h3>
                          <Badge variant={game.difficulty === 'easy' ? 'success' : game.difficulty === 'hard' ? 'danger' : 'accent'}>
                            {game.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/58">{game.description}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/42">
                          <span className="inline-flex items-center gap-1"><Target className="h-3 w-3" /> {levels.length} levels</span>
                          <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {game.maxScore} max</span>
                          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {scoreCount} scores</span>
                        </div>
                        <div className="mt-5">
                          <Link href={`/arena/${game.slug}`}>
                            <Button size="sm" icon={<Play className="h-4 w-4" />}>Play now</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            }) : (
              <EmptyState
                icon={<Gamepad2 className="w-8 h-8" />}
                title="No arena games yet"
                description="The arena is still warming up. Check back soon."
                action={<Link href="/playground"><Button>Open IDE Lab</Button></Link>}
              />
            )}
          </div>
        )}

        {!loading && tab === 'leaderboard' && (
          <GlassCard className="overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-heading font-semibold text-white">
                  {leaderboardBoard === 'arena' ? 'Arena high scores' : 'Institute points'}
                </h3>
                <p className="mt-1 text-xs text-white/40">
                  {leaderboardBoard === 'arena'
                    ? 'Highest scores across built-in robotics and logic mini-games.'
                    : pointsPeriod === 'weekly'
                      ? 'Points earned in the last seven days from lessons, games, and publishing.'
                      : 'Lifetime points from courses, games, and creator activity.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLeaderboardBoard('arena')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    leaderboardBoard === 'arena'
                      ? 'bg-brand-secondary text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  Mini-games
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardBoard('institute')}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    leaderboardBoard === 'institute'
                      ? 'bg-brand-secondary text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="h-3 w-3" /> Institute
                </button>
                {leaderboardBoard === 'institute' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPointsPeriod('all')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        pointsPeriod === 'all'
                          ? 'bg-white/15 text-white'
                          : 'bg-white/5 text-white/45 hover:bg-white/10'
                      }`}
                    >
                      All-time
                    </button>
                    <button
                      type="button"
                      onClick={() => setPointsPeriod('weekly')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        pointsPeriod === 'weekly'
                          ? 'bg-white/15 text-white'
                          : 'bg-white/5 text-white/45 hover:bg-white/10'
                      }`}
                    >
                      Weekly
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {leaderboardBoard === 'arena' ? (
              leaderboard.length === 0 ? (
                <EmptyState
                  icon={<Trophy className="w-8 h-8" />}
                  title="Leaderboard is empty"
                  description="Be the first to put your name on it."
                  action={<Link href="/arena/robot-maze"><Button>Play Robot Maze</Button></Link>}
                />
              ) : (
                <div className="divide-y divide-white/5">
                  {leaderboard.map((entry, index) => {
                    const user = entry.user;
                    const first = user?.firstName || 'Player';
                    const last = user?.lastName || '';
                    const score = typeof entry.score === 'number' ? entry.score : 0;
                    return (
                      <div key={`${user?.id || 'player'}-${index}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-heading font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-300' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-white/5 text-white/40'
                        }`}>
                          {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary text-xs font-bold text-white">
                          {(first.charAt(0) || '?')}{(last.charAt(0) || '')}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{first} {last ? `${last.charAt(0)}.` : ''}</div>
                          {entry.game?.name ? <div className="text-xs text-white/40">{entry.game.name}</div> : null}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-heading font-bold text-brand-accent">{score.toLocaleString()}</div>
                          <div className="text-xs text-white/40">points</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : instituteLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : instituteRows.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="w-8 h-8" />}
                title="No rows yet"
                description="Lesson completions and published games add institute points."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link href="/courses"><Button size="sm">Courses</Button></Link>
                    <Link href="/game-lab"><Button size="sm" variant="secondary">Game Lab</Button></Link>
                  </div>
                }
              />
            ) : (
              <div className="divide-y divide-white/5">
                {instituteRows.map((entry, index) => {
                  const user = entry.user;
                  const first = user?.firstName || 'Student';
                  const last = user?.lastName || '';
                  const points = typeof entry.points === 'number' ? entry.points : 0;
                  return (
                    <div
                      key={`${entry.rank}-${user?.id || index}`}
                      className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/5 ${entry.isMe ? 'bg-brand-accent/10' : ''}`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-heading font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-white/5 text-white/40'
                      }`}>
                        {entry.rank === 1 ? <Crown className="h-4 w-4" /> : entry.rank}
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary text-xs font-bold text-white">
                        {(first.charAt(0) || '?')}{(last.charAt(0) || '')}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {first} {last}
                          {entry.isMe ? <Badge variant="accent" className="ml-2 text-[10px] py-0">You</Badge> : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-heading font-bold text-brand-accent">{points.toLocaleString()}</div>
                        <div className="text-xs text-white/40">points</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        )}

        {!loading && tab === 'achievements' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="mb-2 sm:col-span-2 lg:col-span-3">
              <GlassCard className="flex items-center gap-2 p-4 text-sm text-white/60">
                <Sparkles className="h-4 w-4 text-brand-accent" />
                Earn achievements by playing games, finishing challenge arcs, and building consistent momentum across PlayVerse.
              </GlassCard>
            </div>
            {ACHIEVEMENTS.map((achievement, index) => (
              <motion.div
                key={achievement.name}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
              >
                <GlassCard className="p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{achievement.name}</h3>
                  <p className="mt-2 text-sm text-white/58">{achievement.desc}</p>
                  <Badge variant="accent" className="mt-4">{achievement.points} pts</Badge>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      <Footer />
    </main>
  );
}

function ArrowRightIcon() {
  return <span className="inline-block text-sm">{'->'}</span>;
}
