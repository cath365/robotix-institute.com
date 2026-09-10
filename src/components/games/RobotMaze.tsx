'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Badge } from '@/components/ui';
import { Compass, Play, RotateCw, Trophy } from 'lucide-react';

const CELL = 34;

type Cell = 0 | 1 | 2 | 3;

const LEVELS: { name: string; tier: string; briefing: string; grid: Cell[][] }[] = [
  {
    name: 'Warm-up',
    tier: 'Explorer',
    briefing: 'Learn the movement language and reach the goal with calm precision.',
    grid: [
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    name: 'Twists & Turns',
    tier: 'Builder',
    briefing: 'React to a more fragmented route and keep your move count efficient.',
    grid: [
      [2, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    ],
  },
  {
    name: 'The Spiral',
    tier: 'Advanced',
    briefing: 'Longer pathing, tighter corridors, and more room to optimize your route.',
    grid: [
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
      [0, 1, 0, 1, 3, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
];

interface Pos {
  r: number;
  c: number;
}

function findCell(grid: Cell[][], v: Cell): Pos {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === v) return { r, c };
    }
  }
  return { r: 0, c: 0 };
}

function bfsDistance(grid: Cell[][], start: Pos, goal: Pos): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = new Set<string>();
  const q: { p: Pos; d: number }[] = [{ p: start, d: 0 }];
  while (q.length) {
    const current = q.shift();
    if (!current) break;
    const { p, d } = current;
    const key = `${p.r},${p.c}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (p.r === goal.r && p.c === goal.c) return d;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = p.r + dr;
      const nc = p.c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc] === 1) continue;
      q.push({ p: { r: nr, c: nc }, d: d + 1 });
    }
  }
  return Infinity;
}

interface RobotMazeProps {
  onScore?: (payload: { score: number; level: number; time: number }) => void;
}

export default function RobotMaze({ onScore }: RobotMazeProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const level = LEVELS[levelIdx];
  const start = findCell(level.grid, 2);
  const goal = findCell(level.grid, 3);

  const [pos, setPos] = useState<Pos>(start);
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [now, setNow] = useState<number>(Date.now());
  const [finished, setFinished] = useState(false);
  const [bestPath, setBestPath] = useState<number>(0);
  const [trail, setTrail] = useState<Pos[]>([start]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    const nextStart = findCell(level.grid, 2);
    const nextGoal = findCell(level.grid, 3);
    setPos(nextStart);
    setTrail([nextStart]);
    setMoves(0);
    setStartedAt(Date.now());
    setNow(Date.now());
    setFinished(false);
    setBestPath(bfsDistance(level.grid, nextStart, nextGoal));
    submittedRef.current = false;
  }, [level, levelIdx]);

  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [finished]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const width = level.grid[0].length * CELL;
    const height = level.grid.length * CELL;
    cv.width = width;
    cv.height = height;

    const gridGradient = ctx.createLinearGradient(0, 0, width, height);
    gridGradient.addColorStop(0, '#0B0B1A');
    gridGradient.addColorStop(1, '#13132B');
    ctx.fillStyle = gridGradient;
    ctx.fillRect(0, 0, width, height);

    for (let r = 0; r < level.grid.length; r++) {
      for (let c = 0; c < level.grid[r].length; c++) {
        const value = level.grid[r][c];
        const x = c * CELL;
        const y = r * CELL;

        if (value === 1) {
          ctx.fillStyle = '#12006B';
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = 'rgba(138, 63, 252, 0.38)';
          ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.035)';
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = 'rgba(51,214,255,0.08)';
          ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
        }

        if (value === 3) {
          ctx.fillStyle = 'rgba(51,214,255,0.18)';
          ctx.fillRect(x + 5, y + 5, CELL - 10, CELL - 10);
          ctx.fillStyle = '#33D6FF';
          ctx.beginPath();
          ctx.arc(x + CELL / 2, y + CELL / 2, CELL / 3.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0B0B1A';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('◎', x + CELL / 2, y + CELL / 2);
        }
      }
    }

    trail.forEach((node, index) => {
      const alpha = Math.max(0.12, index / Math.max(1, trail.length) * 0.42);
      ctx.fillStyle = `rgba(138, 63, 252, ${alpha})`;
      ctx.beginPath();
      ctx.arc(node.c * CELL + CELL / 2, node.r * CELL + CELL / 2, CELL / 8, 0, Math.PI * 2);
      ctx.fill();
    });

    const rx = pos.c * CELL;
    const ry = pos.r * CELL;
    const robotGradient = ctx.createRadialGradient(rx + CELL / 2, ry + CELL / 2, 4, rx + CELL / 2, ry + CELL / 2, CELL / 1.9);
    robotGradient.addColorStop(0, '#86EAFF');
    robotGradient.addColorStop(1, '#33D6FF');
    ctx.fillStyle = robotGradient;
    ctx.beginPath();
    ctx.arc(rx + CELL / 2, ry + CELL / 2, CELL / 2.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(11,11,26,0.5)';
    ctx.stroke();
    ctx.fillStyle = '#0B0B1A';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', rx + CELL / 2, ry + CELL / 2);
  }, [level, pos, trail]);

  const resetCurrent = useCallback(() => {
    const nextStart = findCell(level.grid, 2);
    setPos(nextStart);
    setTrail([nextStart]);
    setMoves(0);
    setStartedAt(Date.now());
    setNow(Date.now());
    setFinished(false);
    submittedRef.current = false;
  }, [level.grid]);

  const tryMove = useCallback((dr: number, dc: number) => {
    if (finished) return;
    setPos((current) => {
      const nr = current.r + dr;
      const nc = current.c + dc;
      if (
        nr < 0 || nc < 0 ||
        nr >= level.grid.length || nc >= level.grid[0].length ||
        level.grid[nr][nc] === 1
      ) {
        return current;
      }
      setMoves((value) => value + 1);
      const next = { r: nr, c: nc };
      setTrail((path) => [...path, next]);
      return next;
    });
  }, [finished, level.grid]);

  useEffect(() => {
    if (pos.r === goal.r && pos.c === goal.c && !finished) {
      setFinished(true);
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      const moveBonus = Math.max(0, 100 - Math.max(0, moves - bestPath) * 5);
      const timeBonus = Math.max(0, 100 - elapsed);
      const finalScore = Math.min(1000, 420 + moveBonus * 4 + timeBonus * 2);
      if (!submittedRef.current && onScore) {
        submittedRef.current = true;
        onScore({ score: finalScore, level: levelIdx + 1, time: elapsed });
      }
    }
  }, [bestPath, finished, goal.c, goal.r, levelIdx, moves, onScore, pos.c, pos.r, startedAt]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') { event.preventDefault(); tryMove(-1, 0); }
      else if (key === 'arrowdown' || key === 's') { event.preventDefault(); tryMove(1, 0); }
      else if (key === 'arrowleft' || key === 'a') { event.preventDefault(); tryMove(0, -1); }
      else if (key === 'arrowright' || key === 'd') { event.preventDefault(); tryMove(0, 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryMove]);

  const elapsed = Math.round((now - startedAt) / 1000);
  const efficiency = useMemo(() => {
    if (!Number.isFinite(bestPath) || moves === 0) return 100;
    return Math.max(0, Math.round((bestPath / Math.max(bestPath, moves)) * 100));
  }, [bestPath, moves]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="grid w-full gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{level.name}</div>
              <div className="text-xs text-white/45">{level.briefing}</div>
            </div>
            <Badge variant={level.tier === 'Explorer' ? 'success' : level.tier === 'Builder' ? 'accent' : 'primary'}>
              {level.tier}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Moves</div>
              <div className="mt-2 text-xl font-bold text-white">{moves}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Time</div>
              <div className="mt-2 text-xl font-bold text-white">{elapsed}s</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Efficiency</div>
              <div className="mt-2 text-xl font-bold text-brand-secondary">{efficiency}%</div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Compass className="h-4 w-4 text-brand-secondary" />
            Control guide
          </div>
          <p className="text-sm leading-6 text-white/60">
            Use keyboard arrows or WASD for quick play. The touch controls below are tuned for mobile learners, and the breadcrumb trail helps both kids and adults read their route decisions more clearly.
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-brand-dark p-3 shadow-glow-primary">
        <canvas ref={canvasRef} className="block rounded-[1rem]" />
      </div>

      <div className="grid max-w-[190px] grid-cols-3 gap-2">
        <span />
        <Button variant="ghost" size="sm" onClick={() => tryMove(-1, 0)} aria-label="Up">↑</Button>
        <span />
        <Button variant="ghost" size="sm" onClick={() => tryMove(0, -1)} aria-label="Left">←</Button>
        <Button variant="ghost" size="sm" onClick={() => tryMove(1, 0)} aria-label="Down">↓</Button>
        <Button variant="ghost" size="sm" onClick={() => tryMove(0, 1)} aria-label="Right">→</Button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" size="sm" icon={<RotateCw className="w-4 h-4" />} onClick={resetCurrent}>
          Restart
        </Button>
        {LEVELS.map((item, index) => (
          <Button
            key={item.name}
            variant={index === levelIdx ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setLevelIdx(index)}
          >
            {item.name}
          </Button>
        ))}
      </div>

      {finished && (
        <div className="max-w-lg rounded-2xl border border-brand-secondary/30 bg-brand-secondary/10 p-5 text-center">
          <p className="flex items-center justify-center gap-2 text-lg font-heading font-bold text-brand-secondary">
            <Trophy className="h-5 w-5" />
            Level cleared
          </p>
          <p className="mt-2 text-sm leading-6 text-white/65">
            {moves} moves, {elapsed}s, and {moves === bestPath ? 'an optimal route.' : `${Math.max(0, moves - bestPath)} extra moves over the optimal path.`}
          </p>
          {levelIdx < LEVELS.length - 1 && (
            <Button size="sm" className="mt-4" onClick={() => setLevelIdx(levelIdx + 1)} icon={<Play className="w-4 h-4" />}>
              Next mission
            </Button>
          )}
        </div>
      )}

      <p className="text-center text-xs text-white/30">
        Use <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">WASD</kbd> or arrow keys to move.
      </p>
    </div>
  );
}
