'use client';

import { useMemo, useState } from 'react';
import { Check, RotateCcw, Trash2, Zap } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

type Mission = {
  id: string;
  title: string;
  difficulty: 'Explorer' | 'Builder' | 'Advanced';
  briefing: string;
  hint: string;
  commands: string[];
  solution: string[];
  reward: number;
  board: string[][];
};

const MISSIONS: Mission[] = [
  {
    id: 'starter-route',
    title: 'Starter Route',
    difficulty: 'Explorer',
    briefing: 'Guide the robot from launch pad to data gem using a short command chain.',
    hint: 'One forward move, one turn, one forward move, then collect.',
    commands: ['move()', 'turnRight()', 'turnLeft()', 'collectGem()'],
    solution: ['move()', 'turnRight()', 'move()', 'collectGem()'],
    reward: 120,
    board: [
      ['START', 'PATH', 'TURN'],
      ['WALL', 'PATH', 'GEM'],
    ],
  },
  {
    id: 'sensor-sweep',
    title: 'Sensor Sweep',
    difficulty: 'Builder',
    briefing: 'The robot must scan the environment before collecting the energy core.',
    hint: 'Move first, scan once, then continue toward the core.',
    commands: ['move()', 'scanSensor()', 'turnRight()', 'move()', 'collectGem()'],
    solution: ['move()', 'scanSensor()', 'turnRight()', 'move()', 'collectGem()'],
    reward: 180,
    board: [
      ['START', 'PATH', 'SCAN'],
      ['WALL', 'TURN', 'PATH'],
      ['WALL', 'WALL', 'GEM'],
    ],
  },
  {
    id: 'precision-delivery',
    title: 'Precision Delivery',
    difficulty: 'Advanced',
    briefing: 'Navigate a longer route, avoid the wall cluster, and deliver the robot to the target core.',
    hint: 'There are two forward moves after the turn before the final collect.',
    commands: ['move()', 'move()', 'turnRight()', 'turnLeft()', 'scanSensor()', 'collectGem()'],
    solution: ['move()', 'move()', 'turnRight()', 'move()', 'move()', 'collectGem()'],
    reward: 260,
    board: [
      ['START', 'PATH', 'PATH', 'TURN'],
      ['WALL', 'WALL', 'PATH', 'PATH'],
      ['SCAN', 'PATH', 'PATH', 'GEM'],
    ],
  },
];

const TILE_STYLES: Record<string, string> = {
  START: 'bg-brand-secondary/25 text-brand-secondary',
  PATH: 'bg-white/[0.04] text-white/65',
  TURN: 'bg-brand-accent/25 text-brand-accent-light',
  GEM: 'bg-emerald-400/20 text-emerald-300',
  WALL: 'bg-brand-primary/45 text-white/35',
  SCAN: 'bg-brand-secondary/15 text-brand-secondary-light',
};

export function CodingPuzzle({ onScore }: { onScore: (score: number) => void }) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [message, setMessage] = useState('Select commands to build the robot route.');
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const mission = MISSIONS[missionIndex];
  const solved = completedIds.includes(mission.id);
  const preview = useMemo(() => sequence.map((step, index) => `${index + 1}. ${step}`).join('\n') || '// select commands from the palette', [sequence]);

  const resetMission = (nextMission = missionIndex) => {
    setMissionIndex(nextMission);
    setSequence([]);
    setMessage('Select commands to build the robot route.');
  };

  const run = () => {
    const correct = mission.solution.every((command, index) => sequence[index] === command) && sequence.length === mission.solution.length;
    if (!correct) {
      setMessage(`Not quite. ${mission.hint}`);
      return;
    }

    setMessage(`${mission.title} solved. The robot completed the route cleanly.`);
    if (!completedIds.includes(mission.id)) {
      setCompletedIds((current) => [...current, mission.id]);
      onScore(mission.reward);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {MISSIONS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => resetMission(index)}
              className={`rounded-full px-3 py-2 text-sm transition-all ${
                missionIndex === index
                  ? 'bg-brand-secondary text-brand-dark'
                  : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-brand-secondary/30 hover:text-white'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{mission.title}</div>
              <div className="text-xs text-white/45">{mission.briefing}</div>
            </div>
            <Badge variant={mission.difficulty === 'Explorer' ? 'success' : mission.difficulty === 'Builder' ? 'accent' : 'primary'}>
              {mission.difficulty}
            </Badge>
          </div>

          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${mission.board[0].length}, minmax(0, 1fr))` }}>
            {mission.board.flatMap((row, rowIndex) =>
              row.map((tile, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`rounded-xl border border-white/8 p-3 text-center text-xs font-semibold ${TILE_STYLES[tile] || 'bg-white/5 text-white/60'}`}
                >
                  {tile}
                </div>
              ))
            )}
          </div>

          <p className="mt-4 text-sm leading-6 text-white/60">{message}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 text-sm font-semibold text-white">Command palette</div>
          <div className="flex flex-wrap gap-2">
            {mission.commands.map((command, index) => (
              <Button
                key={`${command}-${index}`}
                size="sm"
                variant="secondary"
                onClick={() => setSequence((current) => [...current, command])}
              >
                {command}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-brand-dark p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">Route script</div>
            <div className="text-xs text-white/40">{sequence.length}/{mission.solution.length} steps</div>
          </div>
          <pre className="min-h-[170px] rounded-2xl border border-white/8 bg-black/25 p-4 font-mono text-sm text-brand-secondary-light">{preview}</pre>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={run} icon={<Check className="h-4 w-4" />}>Run mission</Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSequence([]);
              setMessage('Select commands to build the robot route.');
            }}
            icon={<RotateCcw className="h-4 w-4" />}
          >
            Clear route
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSequence((current) => current.slice(0, -1))}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Remove last
          </Button>
          {solved ? <Badge variant="success">+{mission.reward} score</Badge> : null}
        </div>

        <div className="rounded-[1.4rem] border border-brand-secondary/20 bg-brand-secondary/10 p-4 text-sm text-white/78">
          <div className="flex items-center gap-2 font-semibold text-brand-secondary">
            <Zap className="h-4 w-4" />
            Professional puzzle flow
          </div>
          <p className="mt-2 leading-6">
            These route puzzles are designed to work for both younger learners and older builders by keeping the interface intuitive while gradually increasing the logic depth.
          </p>
        </div>
      </div>
    </div>
  );
}
