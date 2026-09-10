'use client';

import { useEffect, useMemo, useState } from 'react';
import { Radar, RotateCcw, Zap } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

type SignalNode = {
  id: string;
  label: string;
  short: string;
  idle: string;
  active: string;
};

const SIGNAL_NODES: SignalNode[] = [
  {
    id: 'north',
    label: 'North Beam',
    short: 'N',
    idle: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
    active: 'border-cyan-300 bg-cyan-300/30 text-white shadow-[0_0_24px_rgba(103,232,249,0.35)]',
  },
  {
    id: 'east',
    label: 'East Pulse',
    short: 'E',
    idle: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100',
    active: 'border-fuchsia-300 bg-fuchsia-300/30 text-white shadow-[0_0_24px_rgba(232,121,249,0.35)]',
  },
  {
    id: 'south',
    label: 'South Relay',
    short: 'S',
    idle: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    active: 'border-emerald-300 bg-emerald-300/30 text-white shadow-[0_0_24px_rgba(110,231,183,0.35)]',
  },
  {
    id: 'west',
    label: 'West Core',
    short: 'W',
    idle: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
    active: 'border-amber-300 bg-amber-300/30 text-white shadow-[0_0_24px_rgba(252,211,77,0.35)]',
  },
];

const MAX_ROUNDS = 6;

function randomIndex() {
  return Math.floor(Math.random() * SIGNAL_NODES.length);
}

function buildScore(roundsCleared: number) {
  return roundsCleared * 120 + Math.max(0, roundsCleared - 1) * 35;
}

export function SignalSprint({ onScore }: { onScore: (score: number) => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<'idle' | 'watch' | 'repeat' | 'failed' | 'complete'>('idle');
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [bestRound, setBestRound] = useState(0);
  const [status, setStatus] = useState('Start the signal drill, watch the pattern, then repeat it exactly.');
  const [lastScore, setLastScore] = useState(0);

  const roundsCleared = useMemo(() => Math.max(0, sequence.length - (phase === 'complete' ? 0 : 1)), [phase, sequence.length]);

  useEffect(() => {
    if (phase !== 'watch' || sequence.length === 0) return;

    const timers: number[] = [];
    sequence.forEach((nodeIndex, index) => {
      const startAt = index * 620;
      timers.push(window.setTimeout(() => setActiveNode(nodeIndex), startAt + 120));
      timers.push(window.setTimeout(() => setActiveNode(null), startAt + 420));
    });
    timers.push(window.setTimeout(() => {
      setActiveNode(null);
      setPlayerInput([]);
      setPhase('repeat');
      setStatus('Your turn. Replay the signal path.');
    }, sequence.length * 620 + 160));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [phase, sequence]);

  const startRun = () => {
    const firstSequence = [randomIndex()];
    setSequence(firstSequence);
    setPlayerInput([]);
    setActiveNode(null);
    setPhase('watch');
    setLastScore(0);
    setStatus('Watch the signal pattern carefully.');
  };

  const finishRun = (cleared: number, nextPhase: 'failed' | 'complete', message: string) => {
    const finalScore = buildScore(cleared);
    setBestRound((current) => Math.max(current, cleared));
    setLastScore(finalScore);
    setPhase(nextPhase);
    setStatus(message);
    if (finalScore > 0) onScore(finalScore);
  };

  const handlePress = (nodeIndex: number) => {
    if (phase !== 'repeat') return;

    const nextInput = [...playerInput, nodeIndex];
    const expected = sequence[playerInput.length];
    if (nodeIndex !== expected) {
      finishRun(
        roundsCleared,
        'failed',
        roundsCleared > 0
          ? `Signal drift detected. You cleared ${roundsCleared} round${roundsCleared === 1 ? '' : 's'}.`
          : 'Signal drift detected. Start again and lock in the first sequence.'
      );
      return;
    }

    setPlayerInput(nextInput);
    if (nextInput.length !== sequence.length) return;

    const cleared = sequence.length;
    if (cleared >= MAX_ROUNDS) {
      finishRun(cleared, 'complete', 'Signal chain complete. You ran the full relay perfectly.');
      return;
    }

    setBestRound((current) => Math.max(current, cleared));
    setStatus(`Round ${cleared} complete. Loading a longer signal path.`);
    window.setTimeout(() => {
      setPlayerInput([]);
      setSequence((current) => [...current, randomIndex()]);
      setPhase('watch');
    }, 700);
  };

  const readyToStart = phase === 'idle' || phase === 'failed' || phase === 'complete';

  return (
    <div>
      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Round</div>
            <div className="mt-2 text-xl font-bold text-brand-secondary">{Math.max(1, sequence.length || 1)}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Best round</div>
            <div className="mt-2 text-xl font-bold text-white">{bestRound}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Last score</div>
            <div className="mt-2 text-xl font-bold text-white">{lastScore}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Mode</div>
            <div className="mt-2 text-sm font-semibold text-white">Signal memory</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">
            <Radar className="mr-1 h-3 w-3" />
            {phase === 'watch' ? 'Watching' : phase === 'repeat' ? 'Repeating' : phase === 'complete' ? 'Completed' : 'Standby'}
          </Badge>
          <Button
            size="sm"
            variant="secondary"
            onClick={startRun}
            icon={readyToStart ? <Zap className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
          >
            {readyToStart ? 'Start drill' : 'Restart drill'}
          </Button>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-brand-secondary/10 p-3 text-brand-secondary">
            <Radar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Signal Sprint</div>
            <p className="mt-1 text-sm leading-6 text-white/62">{status}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SIGNAL_NODES.map((node, index) => {
          const lit = activeNode === index;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => handlePress(index)}
              disabled={phase === 'watch' || phase === 'idle'}
              className={`rounded-[1.35rem] border p-5 text-left transition-all ${
                lit ? node.active : node.idle
              } ${
                phase === 'repeat'
                  ? 'hover:-translate-y-1 hover:border-white/30'
                  : 'cursor-not-allowed opacity-90'
              }`}
            >
              <div className="text-[11px] uppercase tracking-[0.22em] opacity-70">{node.short}</div>
              <div className="mt-3 text-lg font-semibold">{node.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
