'use client';

import { useMemo, useState } from 'react';
import { Bot, Flame, Gamepad2, Medal, Radar, Sparkles, Zap } from 'lucide-react';
import { Badge, GlassCard } from '@/components/ui';
import { CodingPuzzle } from '@/components/game/CodingPuzzle';
import { MemoryGame } from '@/components/game/MemoryGame';
import { SignalSprint } from '@/components/game/SignalSprint';

const PLAYVERSE_MICRO_GAMES = [
  {
    id: 'memory',
    title: 'Neural Memory Match',
    description: 'A fast recognition challenge that stays fully inside Robotix.',
    signal: 'Pattern recognition, speed, and concept recall.',
    icon: Sparkles,
  },
  {
    id: 'coding-puzzle',
    title: 'Command Logic Puzzle',
    description: 'A compact robotics route planner for sequencing and logic flow.',
    signal: 'Commands, flow control, and robotics intuition.',
    icon: Bot,
  },
  {
    id: 'signal-sprint',
    title: 'Signal Sprint',
    description: 'A relay-memory game built around repeating live signal sequences.',
    signal: 'Attention, memory, and fast systems response.',
    icon: Radar,
  },
] as const;

const SESSION_BADGES = [
  { id: 'starter', title: 'Quick Starter', unlockAtXp: 40 },
  { id: 'streak-two', title: 'Hot Streak', unlockAtXp: 120 },
  { id: 'streak-four', title: 'Arcade Momentum', unlockAtXp: 260 },
  { id: 'prodigy', title: 'PlayVerse Prodigy', unlockAtXp: 480 },
] as const;

export type ArcadeGameId = (typeof PLAYVERSE_MICRO_GAMES)[number]['id'];

interface PlayVerseArcadeProps {
  initialGameId?: ArcadeGameId;
  onScore?: (score: number, game: ArcadeGameId) => void;
}

export function PlayVerseArcade({ initialGameId = 'memory', onScore }: PlayVerseArcadeProps) {
  const [activeGame, setActiveGame] = useState<ArcadeGameId>(initialGameId);
  const [bestScore, setBestScore] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [arcadeSignal, setArcadeSignal] = useState('PlayVerse is running natively inside Robotix.');

  const activeGameMeta = useMemo(
    () => PLAYVERSE_MICRO_GAMES.find((game) => game.id === activeGame) || PLAYVERSE_MICRO_GAMES[0],
    [activeGame]
  );
  const unlockedBadges = useMemo(
    () => SESSION_BADGES.filter((badge) => sessionXp >= badge.unlockAtXp),
    [sessionXp]
  );
  const nextBadge = useMemo(
    () => SESSION_BADGES.find((badge) => sessionXp < badge.unlockAtXp) || null,
    [sessionXp]
  );

  const handleScore = (score: number) => {
    const earnedXp = Math.max(20, Math.round(score / 8));
    setBestScore((current) => Math.max(current, score));
    setSessionXp((current) => current + earnedXp);
    setSessionStreak((current) => {
      const next = current + 1;
      setBestStreak((best) => Math.max(best, next));
      return next;
    });
    setArcadeSignal(`Session score recorded: ${score}. You earned ${earnedXp} XP inside PlayVerse.`);
    onScore?.(score, activeGame);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-brand-secondary" />
            <h3 className="font-heading text-lg font-semibold text-white">PlayVerse Arcade</h3>
          </div>
          <p className="mt-1 text-sm text-white/55">
            Built-in STEM mini-games that play directly on Robotix without sending learners away.
          </p>
        </div>
        <Badge variant="accent">On-site play</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-white/38">Mode</p>
          <p className="mt-2 text-sm font-semibold text-white">{activeGameMeta.title}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-white/38">Best score</p>
          <p className="mt-2 text-2xl font-bold text-brand-secondary">{bestScore}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-white/38">Session XP</p>
          <p className="mt-2 text-2xl font-bold text-white">{sessionXp}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-white/38">Streak</p>
          <p className="mt-2 text-2xl font-bold text-white">{sessionStreak}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/62">
        {arcadeSignal}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-2 sm:grid-cols-3">
          {PLAYVERSE_MICRO_GAMES.map((game, index) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => {
                  setActiveGame(game.id);
                  setArcadeSignal(`${game.title} is ready inside Robotix.`);
                }}
                className={`group relative overflow-hidden rounded-[1.4rem] border p-4 text-left transition-all ${
                  activeGame === game.id
                    ? 'border-brand-secondary/40 bg-brand-secondary/10'
                    : 'border-white/10 bg-white/[0.03] hover:-translate-y-1 hover:bg-white/[0.05]'
                }`}
              >
                <div
                  className={`absolute inset-0 opacity-80 ${
                    index === 0
                      ? 'bg-[radial-gradient(circle_at_top_left,rgba(51,214,255,0.18),transparent_55%),linear-gradient(135deg,rgba(9,20,40,0.96),rgba(25,8,51,0.92))]'
                      : index === 1
                        ? 'bg-[radial-gradient(circle_at_top_left,rgba(138,63,252,0.22),transparent_55%),linear-gradient(135deg,rgba(21,10,45,0.96),rgba(4,27,45,0.92))]'
                        : 'bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_55%),linear-gradient(135deg,rgba(17,19,43,0.96),rgba(5,41,49,0.92))]'
                  }`}
                />
                <div className="relative">
                  <div className="mb-6 flex items-start justify-between gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70">
                      Launch
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-white">{game.title}</div>
                  <p className="mt-2 min-h-[3.25rem] text-xs leading-5 text-white/72">{game.description}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-brand-secondary">{game.signal}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Medal className="h-4 w-4 text-brand-secondary" />
            Session rewards
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/38">Focus</div>
              <div className="mt-2 text-sm font-semibold text-white">{activeGameMeta.signal}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/38">
                <Flame className="h-3.5 w-3.5 text-amber-300" />
                Best streak
              </div>
              <div className="mt-2 text-xl font-bold text-white">{bestStreak}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/38">
                <Zap className="h-3.5 w-3.5 text-brand-secondary" />
                Next badge
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                {nextBadge ? `${nextBadge.title} at ${nextBadge.unlockAtXp} XP` : 'All session badges unlocked'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Session badges</div>
            <p className="mt-1 text-xs text-white/50">A quick reward layer inspired by modern arcade shelves and progression loops.</p>
          </div>
          <Badge variant="primary">{unlockedBadges.length}/{SESSION_BADGES.length} unlocked</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SESSION_BADGES.map((badge) => {
            const unlocked = sessionXp >= badge.unlockAtXp;
            return (
              <div
                key={badge.id}
                className={`rounded-full border px-3 py-2 text-xs transition-colors ${
                  unlocked
                    ? 'border-brand-secondary/30 bg-brand-secondary/10 text-brand-secondary'
                    : 'border-white/10 bg-black/20 text-white/42'
                }`}
              >
                {badge.title}
              </div>
            );
          })}
        </div>
      </div>

      <GlassCard className="overflow-hidden border-white/10 bg-brand-dark p-4">
        {activeGame === 'memory' ? (
          <MemoryGame onScore={handleScore} />
        ) : activeGame === 'coding-puzzle' ? (
          <CodingPuzzle onScore={handleScore} />
        ) : (
          <SignalSprint onScore={handleScore} />
        )}
      </GlassCard>
    </div>
  );
}
