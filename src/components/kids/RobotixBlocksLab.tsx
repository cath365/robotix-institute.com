'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flag,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Sparkles,
  Star,
  Trash2,
  Undo2,
  Zap,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'right' | 'down' | 'left';
type CommandType = 'forward' | 'left' | 'right' | 'jump';
type Position = { x: number; y: number };
type RobotState = Position & { direction: Direction };
type RunTone = 'idle' | 'success' | 'warning' | 'error';

type Mission = {
  id: string;
  title: string;
  subtitle: string;
  story: string;
  size: number;
  start: RobotState;
  goal: Position;
  stars: Position[];
  walls: Position[];
  maxBlocks: number;
  sampleProgram: CommandType[];
  hint: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const directionOrder: Direction[] = ['up', 'right', 'down', 'left'];

const directionVectors: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const missions: Mission[] = [
  {
    id: 'hello-hall',
    title: 'Hello Hall',
    subtitle: 'Wake up the Robotix helper and drive it home.',
    story: 'Tap a few blocks to help the little Robotix helper roll down the hall and wave at the finish flag.',
    size: 5,
    start: { x: 0, y: 2, direction: 'right' },
    goal: { x: 4, y: 2 },
    stars: [{ x: 2, y: 2 }],
    walls: [],
    maxBlocks: 5,
    sampleProgram: ['forward', 'forward', 'forward', 'forward'],
    hint: 'Try stacking four Move blocks in a row.',
  },
  {
    id: 'turning-garden',
    title: 'Turning Garden',
    subtitle: 'Learn to turn before collecting the glowing flower star.',
    story: 'The Robotix helper needs one careful turn to visit the flower path before going home.',
    size: 5,
    start: { x: 0, y: 4, direction: 'up' },
    goal: { x: 4, y: 2 },
    stars: [{ x: 0, y: 1 }],
    walls: [{ x: 2, y: 4 }, { x: 2, y: 3 }],
    maxBlocks: 7,
    sampleProgram: ['forward', 'forward', 'forward', 'right', 'forward', 'forward', 'forward'],
    hint: 'Go up first, turn right, then travel across the path.',
  },
  {
    id: 'jump-bridge',
    title: 'Jump Bridge',
    subtitle: 'Use a jump block to cross the missing bridge tile.',
    story: 'A tiny gap is in the bridge. Use a Jump block so the robot can hop over it and grab both stars.',
    size: 6,
    start: { x: 0, y: 3, direction: 'right' },
    goal: { x: 5, y: 3 },
    stars: [{ x: 2, y: 3 }, { x: 4, y: 3 }],
    walls: [{ x: 3, y: 3 }],
    maxBlocks: 8,
    sampleProgram: ['forward', 'forward', 'jump', 'forward', 'forward'],
    hint: 'Move twice, jump over the blocked tile, then keep going.',
  },
  {
    id: 'party-square',
    title: 'Party Square',
    subtitle: 'Mix turns and movement to finish the Robotix parade.',
    story: 'Now the Robotix helper is brave enough for a real parade route with corners and shiny stars.',
    size: 6,
    start: { x: 0, y: 5, direction: 'up' },
    goal: { x: 5, y: 0 },
    stars: [{ x: 0, y: 2 }, { x: 3, y: 2 }, { x: 5, y: 2 }],
    walls: [{ x: 1, y: 5 }, { x: 1, y: 4 }, { x: 4, y: 1 }],
    maxBlocks: 12,
    sampleProgram: ['forward', 'forward', 'forward', 'right', 'forward', 'forward', 'forward', 'left', 'forward', 'forward'],
    hint: 'Climb the left lane, turn right across the middle, then turn left for the finish.',
  },
];

const commandMeta: Record<
  CommandType,
  {
    label: string;
    shortLabel: string;
    detail: string;
    accent: string;
    shadow: string;
    icon: LucideIcon;
  }
> = {
  forward: {
    label: 'Move Forward',
    shortLabel: 'Move',
    detail: 'Go one square ahead.',
    accent: 'from-sky-400 to-cyan-300',
    shadow: 'shadow-sky-200/80',
    icon: ArrowRight,
  },
  left: {
    label: 'Turn Left',
    shortLabel: 'Left',
    detail: 'Turn to the left side.',
    accent: 'from-fuchsia-400 to-pink-300',
    shadow: 'shadow-pink-200/80',
    icon: RotateCcw,
  },
  right: {
    label: 'Turn Right',
    shortLabel: 'Right',
    detail: 'Turn to the right side.',
    accent: 'from-amber-400 to-orange-300',
    shadow: 'shadow-amber-200/80',
    icon: RotateCw,
  },
  jump: {
    label: 'Jump',
    shortLabel: 'Jump',
    detail: 'Hop forward two squares.',
    accent: 'from-emerald-400 to-lime-300',
    shadow: 'shadow-emerald-200/80',
    icon: Zap,
  },
};

function cellKey(position: Position) {
  return `${position.x}-${position.y}`;
}

function rotate(direction: Direction, turn: 'left' | 'right') {
  const currentIndex = directionOrder.indexOf(direction);
  const nextIndex = turn === 'left'
    ? (currentIndex + directionOrder.length - 1) % directionOrder.length
    : (currentIndex + 1) % directionOrder.length;
  return directionOrder[nextIndex];
}

function isInsideBoard(position: Position, size: number) {
  return position.x >= 0 && position.y >= 0 && position.x < size && position.y < size;
}

function facingRotation(direction: Direction) {
  switch (direction) {
    case 'up':
      return 'rotate(-90deg)';
    case 'down':
      return 'rotate(90deg)';
    case 'left':
      return 'rotate(180deg)';
    default:
      return 'rotate(0deg)';
  }
}

export function RobotixBlocksLab() {
  const [missionIndex, setMissionIndex] = useState(0);
  const [program, setProgram] = useState<CommandType[]>([]);
  const [robot, setRobot] = useState<RobotState>(missions[0].start);
  const [collectedStars, setCollectedStars] = useState<string[]>([]);
  const [runMessage, setRunMessage] = useState('Build a tiny program, then press Run.');
  const [runTone, setRunTone] = useState<RunTone>('idle');
  const [runLog, setRunLog] = useState<string[]>(['Robotix Blocks is ready.']);
  const [isRunning, setIsRunning] = useState(false);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const runTokenRef = useRef(0);

  const mission = missions[missionIndex];

  const wallKeys = useMemo(() => new Set(mission.walls.map(cellKey)), [mission]);
  const totalStars = mission.stars.length;
  const allStarsCollected = collectedStars.length === totalStars;
  const missionDone = completedMissionIds.includes(mission.id);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('robotix-blocks-completed');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedMissionIds(parsed.filter((item): item is string => typeof item === 'string'));
        }
      }
    } catch {
      // Ignore local storage issues and keep the page playable.
    }
  }, []);

  useEffect(() => {
    setRobot(mission.start);
    setCollectedStars([]);
    setRunMessage('Tap colorful command blocks, then press Run.');
    setRunTone('idle');
    setRunLog([`Mission ready: ${mission.title}.`]);
    setProgram([]);
    runTokenRef.current += 1;
    setIsRunning(false);
  }, [mission]);

  function saveCompleted(nextCompleted: string[]) {
    setCompletedMissionIds(nextCompleted);
    try {
      window.localStorage.setItem('robotix-blocks-completed', JSON.stringify(nextCompleted));
    } catch {
      // Keep going even if storage is not available.
    }
  }

  function resetRobotBoard(nextMessage = 'Board reset. Try another block order.') {
    runTokenRef.current += 1;
    setIsRunning(false);
    setRobot(mission.start);
    setCollectedStars([]);
    setRunTone('idle');
    setRunMessage(nextMessage);
    setRunLog([`Reset ${mission.title}.`]);
  }

  function addBlock(command: CommandType) {
    if (isRunning) {
      return;
    }
    if (program.length >= mission.maxBlocks) {
      setRunTone('warning');
      setRunMessage(`This mission uses up to ${mission.maxBlocks} blocks.`);
      return;
    }

    setProgram((current) => [...current, command]);
    setRunTone('idle');
    setRunMessage(`${commandMeta[command].shortLabel} added.`);
  }

  function removeBlock(index: number) {
    if (isRunning) {
      return;
    }
    setProgram((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    if (isRunning) {
      return;
    }
    setProgram((current) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function undoLastBlock() {
    if (isRunning || program.length === 0) {
      return;
    }
    setProgram((current) => current.slice(0, -1));
    setRunTone('idle');
    setRunMessage('Last block removed.');
  }

  function fillSampleProgram() {
    if (isRunning) {
      return;
    }
    setProgram(mission.sampleProgram);
    setRunTone('idle');
    setRunMessage('Sample blocks added. Press Run to test them.');
  }

  function clearProgram() {
    if (isRunning) {
      return;
    }
    setProgram([]);
    setRunTone('idle');
    setRunMessage('Program cleared.');
  }

  function goToMission(nextIndex: number) {
    if (isRunning || nextIndex < 0 || nextIndex >= missions.length) {
      return;
    }
    setMissionIndex(nextIndex);
  }

  function simulateCommand(currentRobot: RobotState, command: CommandType, currentStars: string[]) {
    if (command === 'left' || command === 'right') {
      const nextRobot = { ...currentRobot, direction: rotate(currentRobot.direction, command) };
      return {
        ok: true,
        robot: nextRobot,
        stars: currentStars,
        log: `${commandMeta[command].shortLabel}: robot turned ${command}.`,
      };
    }

    const stepSize = command === 'jump' ? 2 : 1;
    const vector = directionVectors[currentRobot.direction];
    let candidate = { ...currentRobot };

    for (let step = 0; step < stepSize; step += 1) {
      const nextPosition = { x: candidate.x + vector.x, y: candidate.y + vector.y };
      if (!isInsideBoard(nextPosition, mission.size)) {
        return {
          ok: false,
          robot: candidate,
          stars: currentStars,
          log: 'Oops. The robot tried to leave the board.',
        };
      }
      if (wallKeys.has(cellKey(nextPosition))) {
        return {
          ok: false,
          robot: candidate,
          stars: currentStars,
          log: 'Oops. The robot bumped into a blocked square.',
        };
      }
      candidate = { ...candidate, ...nextPosition };
    }

    const landingKey = cellKey(candidate);
    const stars = currentStars.includes(landingKey) || !mission.stars.some((star) => cellKey(star) === landingKey)
      ? currentStars
      : [...currentStars, landingKey];

    return {
      ok: true,
      robot: candidate,
      stars,
      log: stars.length > currentStars.length
        ? `${commandMeta[command].shortLabel}: star collected.`
        : `${commandMeta[command].shortLabel}: robot moved.`,
    };
  }

  async function runProgramSequence() {
    if (isRunning) {
      return;
    }
    if (program.length === 0) {
      setRunTone('warning');
      setRunMessage('Add at least one block first.');
      return;
    }

    const token = Date.now();
    runTokenRef.current = token;
    setIsRunning(true);
    setRobot(mission.start);
    setCollectedStars([]);
    setRunTone('idle');
    setRunMessage('Robotix is running your blocks...');
    setRunLog(['Program started.']);

    let currentRobot = mission.start;
    let currentStars: string[] = [];

    for (let index = 0; index < program.length; index += 1) {
      const command = program[index];
      await sleep(480);

      if (runTokenRef.current !== token) {
        return;
      }

      const result = simulateCommand(currentRobot, command, currentStars);
      currentRobot = result.robot;
      currentStars = result.stars;

      setRobot(currentRobot);
      setCollectedStars(currentStars);
      setRunLog((current) => [...current, `Step ${index + 1}: ${result.log}`]);

      if (!result.ok) {
        setRunTone('error');
        setRunMessage(result.log);
        setIsRunning(false);
        return;
      }
    }

    await sleep(220);

    if (runTokenRef.current !== token) {
      return;
    }

    const reachedGoal = currentRobot.x === mission.goal.x && currentRobot.y === mission.goal.y;

    if (reachedGoal && currentStars.length === totalStars) {
      const nextCompleted = missionDone ? completedMissionIds : [...completedMissionIds, mission.id];
      if (!missionDone) {
        saveCompleted(nextCompleted);
      }
      setRunTone('success');
      setRunMessage(`You solved ${mission.title}. Great job, little Robotix coder.`);
      setRunLog((current) => [...current, 'Mission complete.']);
    } else if (reachedGoal) {
      setRunTone('warning');
      setRunMessage('Nice finish. Now try again and collect every star too.');
      setRunLog((current) => [...current, 'Finish reached, but a star is still waiting.']);
    } else {
      setRunTone('warning');
      setRunMessage('Good try. The robot still needs help reaching the finish flag.');
      setRunLog((current) => [...current, 'Program ended before the finish.']);
    }

    setIsRunning(false);
  }

  const missionProgress = `${completedMissionIds.length}/${missions.length} missions solved`;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-[#b8e7f3] bg-white p-6 shadow-[0_20px_60px_rgba(80,168,192,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="accent" className="bg-[#dbf7ff] text-[#0c7084]">
                Little Einsteins
              </Badge>
              <span className="rounded-full bg-[#effafc] px-3 py-1 text-xs font-semibold text-[#4f7280]">
                {missionProgress}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-[#17313b]">{mission.title}</h2>
            <p className="mt-2 text-sm font-semibold text-[#0f7288]">{mission.subtitle}</p>
            <p className="mt-4 text-sm leading-6 text-[#55737d]">{mission.story}</p>

            <div className="mt-5 rounded-[24px] bg-[#f4fbfd] p-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#72a2b1]">Mission goals</p>
              <div className="mt-3 space-y-3 text-sm text-[#35515b]">
                <div className="flex items-center gap-3">
                  <Flag className="h-4 w-4 text-[#0f7288]" />
                  Reach the finish flag.
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-[#f6a500]" />
                  Collect {totalStars} glow {totalStars === 1 ? 'star' : 'stars'}.
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-[#7f56d9]" />
                  Use no more than {mission.maxBlocks} blocks.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-dashed border-[#b8e7f3] bg-[#fcfeff] p-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#72a2b1]">Hint</p>
              <p className="mt-2 text-sm leading-6 text-[#55737d]">{mission.hint}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                size="sm"
                icon={<ChevronDown className="h-4 w-4" />}
                onClick={fillSampleProgram}
                className="bg-[#0f7288] text-white hover:bg-[#0b6174]"
              >
                Show sample blocks
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={() => resetRobotBoard()}
              >
                Reset board
              </Button>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#b8e7f3] bg-white p-6 shadow-[0_18px_45px_rgba(80,168,192,0.14)]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#72a2b1]">Mission map</p>
            <div className="mt-4 grid gap-3">
              {missions.map((entry, index) => {
                const active = index === missionIndex;
                const done = completedMissionIds.includes(entry.id);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => goToMission(index)}
                    className={cn(
                      'rounded-[24px] border px-4 py-4 text-left transition-all',
                      active
                        ? 'border-[#0f7288] bg-[#ddf8ff] shadow-[0_10px_30px_rgba(32,137,167,0.16)]'
                        : 'border-[#d7eef5] bg-[#f8fdff] hover:border-[#9fd7e5] hover:bg-[#eefaff]',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#17313b]">{entry.title}</p>
                        <p className="mt-1 text-xs text-[#597882]">{entry.subtitle}</p>
                      </div>
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#7297a3]">
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[36px] border border-[#abddea] bg-[#d9f3fb] p-5 shadow-[0_26px_70px_rgba(54,154,182,0.18)]">
          <div className="rounded-[28px] border border-white/80 bg-white/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#72a2b1]">Robotix stage</p>
                <p className="mt-1 text-sm text-[#55737d]">Build with blocks and watch the robot move.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#fff7dc] px-3 py-1 text-xs font-bold text-[#b57600]">
                  Stars {collectedStars.length}/{totalStars}
                </span>
                <span className="rounded-full bg-[#edfaff] px-3 py-1 text-xs font-bold text-[#0f7288]">
                  Blocks {program.length}/{mission.maxBlocks}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-[28px] bg-[#f6fdff] p-4">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${mission.size}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: mission.size * mission.size }, (_, cellIndex) => {
                  const x = cellIndex % mission.size;
                  const y = Math.floor(cellIndex / mission.size);
                  const key = `${x}-${y}`;
                  const isGoal = mission.goal.x === x && mission.goal.y === y;
                  const hasWall = wallKeys.has(key);
                  const hasStar = mission.stars.some((star) => cellKey(star) === key) && !collectedStars.includes(key);
                  const robotHere = robot.x === x && robot.y === y;

                  return (
                    <div
                      key={key}
                      className={cn(
                        'relative aspect-square rounded-[20px] border transition-all',
                        hasWall
                          ? 'border-[#7fc3d6] bg-[#6cb5ca]'
                          : isGoal
                            ? 'border-[#81d69d] bg-[#dcf9e6]'
                            : 'border-[#d7eef5] bg-white',
                      )}
                    >
                      {hasWall ? (
                        <div className="absolute inset-0 rounded-[20px] bg-[linear-gradient(135deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.02)_100%)]" />
                      ) : null}
                      {isGoal ? (
                        <div className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                          Home
                        </div>
                      ) : null}
                      {hasStar ? (
                        <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#fff2b8] text-[#d48a00] shadow-[0_8px_20px_rgba(244,192,51,0.28)]">
                          <Star className="h-5 w-5 fill-current" />
                        </div>
                      ) : null}
                      {robotHere ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f7288] text-white shadow-[0_14px_30px_rgba(16,117,141,0.28)]">
                            <Bot className="h-6 w-6" style={{ transform: facingRotation(robot.direction) }} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={cn(
                'mt-4 rounded-[24px] border px-4 py-4',
                runTone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : runTone === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : runTone === 'warning'
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-[#d7eef5] bg-white text-[#496671]',
              )}
            >
              <p className="text-sm font-bold">{runMessage}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={runProgramSequence}
                loading={isRunning}
                icon={!isRunning ? <Play className="h-4 w-4" /> : undefined}
                className="bg-[#0f7288] text-white hover:bg-[#0c6276]"
              >
                {isRunning ? 'Running blocks' : 'Run blocks'}
              </Button>
              <Button
                variant="secondary"
                icon={<Undo2 className="h-4 w-4" />}
                onClick={undoLastBlock}
                disabled={program.length === 0 || isRunning}
              >
                Undo
              </Button>
              <Button
                variant="secondary"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={clearProgram}
                disabled={program.length === 0 || isRunning}
              >
                Clear
              </Button>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#d7eef5] bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#72a2b1]">Robotix console</p>
                {missionDone ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                    Solved
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 text-sm text-[#55737d]">
                {runLog.slice(-5).map((entry, index) => (
                  <div key={`${entry}-${index}`} className="rounded-2xl bg-[#f4fbfd] px-3 py-2">
                    {entry}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToMission(missionIndex - 1)}
                disabled={missionIndex === 0 || isRunning}
              >
                Previous mission
              </Button>
              <Button
                size="sm"
                icon={<ArrowRight className="h-4 w-4" />}
                onClick={() => goToMission(missionIndex + 1)}
                disabled={missionIndex === missions.length - 1 || isRunning}
                className="bg-[#0f7288] text-white hover:bg-[#0b6174]"
              >
                Next mission
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-[#b8e7f3] bg-white p-6 shadow-[0_20px_60px_rgba(80,168,192,0.16)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#72a2b1]">Command blocks</p>
                <h3 className="mt-2 text-xl font-black text-[#17313b]">Tap a block to add it</h3>
              </div>
              <Badge variant="primary" className="bg-[#edfaff] text-[#0f7288]">
                No typing needed
              </Badge>
            </div>
            <div className="mt-5 grid gap-3">
              {(Object.keys(commandMeta) as CommandType[]).map((command) => {
                const meta = commandMeta[command];
                const Icon = meta.icon;
                return (
                  <button
                    key={command}
                    type="button"
                    onClick={() => addBlock(command)}
                    disabled={program.length >= mission.maxBlocks || isRunning}
                    className={cn(
                      'group rounded-[28px] border border-white/80 bg-gradient-to-r p-4 text-left text-white shadow-xl transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60',
                      meta.accent,
                      meta.shadow,
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/20 p-3">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black">{meta.label}</p>
                          <p className="mt-1 text-sm text-white/80">{meta.detail}</p>
                        </div>
                      </div>
                      <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                        Add
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#b8e7f3] bg-white p-6 shadow-[0_18px_45px_rgba(80,168,192,0.16)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#72a2b1]">My program</p>
                <h3 className="mt-2 text-xl font-black text-[#17313b]">Stack your Robotix blocks</h3>
              </div>
              <span className="rounded-full bg-[#effafc] px-3 py-1 text-xs font-semibold text-[#4f7280]">
                {program.length} blocks
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {program.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-[#b8e7f3] bg-[#f7fcfe] px-5 py-10 text-center">
                  <p className="text-sm font-semibold text-[#55737d]">Your blocks will stack here.</p>
                  <p className="mt-2 text-sm text-[#7f9aa4]">Start with Move, then add turns when the path bends.</p>
                </div>
              ) : (
                program.map((command, index) => {
                  const meta = commandMeta[command];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={`${command}-${index}`}
                      className={cn(
                        'rounded-[28px] bg-gradient-to-r p-4 text-white shadow-xl',
                        meta.accent,
                        meta.shadow,
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-white/20 p-3">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-black">
                              {index + 1}. {meta.label}
                            </p>
                            <p className="mt-1 text-sm text-white/80">{meta.detail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveBlock(index, 'up')}
                            disabled={index === 0 || isRunning}
                            className="rounded-full bg-white/18 p-2 transition hover:bg-white/28 disabled:opacity-50"
                            aria-label="Move block up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(index, 'down')}
                            disabled={index === program.length - 1 || isRunning}
                            className="rounded-full bg-white/18 p-2 transition hover:bg-white/28 disabled:opacity-50"
                            aria-label="Move block down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBlock(index)}
                            disabled={isRunning}
                            className="rounded-full bg-white/18 p-2 transition hover:bg-white/28 disabled:opacity-50"
                            aria-label="Delete block"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#b8e7f3] bg-white p-6 shadow-[0_18px_45px_rgba(80,168,192,0.14)]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#72a2b1]">Parent note</p>
            <h3 className="mt-2 text-xl font-black text-[#17313b]">Want a bigger Robotix pathway after this?</h3>
            <p className="mt-3 text-sm leading-6 text-[#55737d]">
              This page is a playful start for little learners. When they are ready, Robotix weekend classes and public
              programs can carry them into real robotics, Scratch-style logic, and project building.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/weekend-classes">
                <Button size="sm" className="bg-[#0f7288] text-white hover:bg-[#0b6174]">
                  See weekend classes
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="sm" variant="secondary">
                  Explore all programs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
