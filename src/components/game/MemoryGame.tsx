'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Layers3, RotateCcw, Trophy, Zap } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

type MemoryCard = {
  id: string;
  label: string;
  symbol: string;
  category: string;
  gradient: string;
};

type GameMode = 'explorer' | 'challenger';

const CARD_LIBRARY: MemoryCard[] = [
  { id: 'ai-core', label: 'AI Core', symbol: '◉', category: 'AI', gradient: 'from-brand-secondary/30 to-brand-accent/30' },
  { id: 'sensor-grid', label: 'Sensor Grid', symbol: '⌁', category: 'IoT', gradient: 'from-brand-primary/30 to-brand-secondary/25' },
  { id: 'logic-loop', label: 'Logic Loop', symbol: '↺', category: 'Code', gradient: 'from-brand-accent/30 to-brand-primary/25' },
  { id: 'energy-node', label: 'Energy Node', symbol: '⚡', category: 'Power', gradient: 'from-brand-secondary/25 to-brand-primary/25' },
  { id: 'robot-arm', label: 'Robot Arm', symbol: '✦', category: 'Robotics', gradient: 'from-brand-accent/25 to-brand-secondary/25' },
  { id: 'playverse', label: 'PlayVerse', symbol: '▣', category: 'Games', gradient: 'from-brand-primary/25 to-brand-accent/20' },
  { id: 'vision-lab', label: 'Vision Lab', symbol: '◌', category: 'Vision', gradient: 'from-brand-secondary/25 to-brand-primary/20' },
  { id: 'build-flow', label: 'Build Flow', symbol: '⟲', category: 'Builder', gradient: 'from-brand-accent/25 to-brand-primary/25' },
];

const MODE_CONFIG: Record<GameMode, { label: string; description: string; pairCount: number }> = {
  explorer: {
    label: 'Explorer',
    description: 'A fast and welcoming memory loop for younger learners and warm-up rounds.',
    pairCount: 6,
  },
  challenger: {
    label: 'Challenger',
    description: 'A denser board with more pairs for older learners and sharper focus training.',
    pairCount: 8,
  },
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildDeck(mode: GameMode) {
  const cards = CARD_LIBRARY.slice(0, MODE_CONFIG[mode].pairCount);
  return shuffle([...cards, ...cards]);
}

export function MemoryGame({ onScore }: { onScore: (score: number) => void }) {
  const [mode, setMode] = useState<GameMode>('explorer');
  const [deck, setDeck] = useState<MemoryCard[]>(() => buildDeck('explorer'));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const matchedPairs = matched.length / 2;
  const totalPairs = deck.length / 2;
  const progress = Math.round((matchedPairs / totalPairs) * 100);
  const score = Math.max(0, matchedPairs * 30 + bestCombo * 18 + Math.max(0, 120 - moves * 6));

  useEffect(() => {
    if (matched.length === deck.length && !submitted) {
      setSubmitted(true);
      onScore(score + (mode === 'challenger' ? 80 : 40));
    }
  }, [deck.length, matched.length, mode, onScore, score, submitted]);

  useEffect(() => {
    if (flipped.length !== 2) return;

    const [first, second] = flipped;
    setMoves((value) => value + 1);

    if (deck[first].id === deck[second].id) {
      setMatched((current) => [...current, first, second]);
      setCombo((current) => {
        const next = current + 1;
        setBestCombo((best) => Math.max(best, next));
        return next;
      });
      setFlipped([]);
      return;
    }

    setCombo(0);
    const timer = window.setTimeout(() => setFlipped([]), 720);
    return () => window.clearTimeout(timer);
  }, [deck, flipped]);

  const reset = (nextMode = mode) => {
    setMode(nextMode);
    setDeck(buildDeck(nextMode));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setCombo(0);
    setBestCombo(0);
    setSubmitted(false);
  };

  const statusText = useMemo(() => {
    if (matched.length === deck.length) {
      return 'Board complete. Great focus and pattern recognition.';
    }
    if (combo >= 2) {
      return `Hot streak. ${combo} clean matches in a row.`;
    }
    return MODE_CONFIG[mode].description;
  }, [combo, deck.length, matched.length, mode]);

  return (
    <div>
      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MODE_CONFIG) as GameMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => reset(item)}
                className={`rounded-full px-3 py-2 text-sm transition-all ${
                  mode === item
                    ? 'bg-brand-secondary text-brand-dark'
                    : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-brand-secondary/30 hover:text-white'
                }`}
              >
                {MODE_CONFIG[item].label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Score</div>
              <div className="mt-2 text-xl font-bold text-brand-secondary">{score}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Moves</div>
              <div className="mt-2 text-xl font-bold text-white">{moves}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Best combo</div>
              <div className="mt-2 text-xl font-bold text-white">{bestCombo}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Progress</div>
              <div className="mt-2 text-xl font-bold text-white">{progress}%</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {combo > 0 ? <Badge variant="accent">Combo x{combo}</Badge> : null}
          <Button size="sm" variant="secondary" onClick={() => reset()} icon={<RotateCcw className="h-4 w-4" />}>
            Reset board
          </Button>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-brand-secondary/10 p-3 text-brand-secondary">
            {mode === 'challenger' ? <Trophy className="h-5 w-5" /> : <BrainCircuit className="h-5 w-5" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{MODE_CONFIG[mode].label} memory protocol</div>
            <p className="mt-1 text-sm leading-6 text-white/62">{statusText}</p>
          </div>
        </div>
      </div>

      <div className={`grid gap-3 ${mode === 'challenger' ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4'}`}>
        {deck.map((card, index) => {
          const visible = flipped.includes(index) || matched.includes(index);
          return (
            <motion.button
              key={`${card.id}-${index}`}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -2 }}
              onClick={() => {
                if (visible || flipped.length === 2) return;
                setFlipped((current) => [...current, index]);
              }}
              className={`group aspect-square rounded-[1.25rem] border transition-all ${
                visible
                  ? 'border-brand-secondary/40 bg-white/[0.05] shadow-glow-accent'
                  : 'border-white/10 bg-white/[0.03] hover:border-brand-secondary/30 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex h-full flex-col items-center justify-center rounded-[1.1rem] p-3">
                {visible ? (
                  <>
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-2xl font-bold text-white`}>
                      {card.symbol}
                    </div>
                    <div className="text-sm font-semibold text-white">{card.label}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">{card.category}</div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-brand-primary/35 text-brand-secondary">
                      <Layers3 className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-semibold text-white/65">Robotix</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/30">Hidden node</div>
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {matched.length === deck.length && (
        <div className="mt-5 rounded-2xl border border-brand-secondary/30 bg-brand-secondary/10 p-4 text-sm text-white/78">
          <div className="flex items-center gap-2 font-semibold text-brand-secondary">
            <Zap className="h-4 w-4" />
            Memory protocol complete
          </div>
          <p className="mt-2 leading-6">
            You finished the {MODE_CONFIG[mode].label.toLowerCase()} board with a score of {score}. Reset to sharpen your speed or switch modes for a different challenge level.
          </p>
        </div>
      )}
    </div>
  );
}
