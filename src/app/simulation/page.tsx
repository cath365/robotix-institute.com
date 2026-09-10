'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { useApi } from '@/hooks/useApi';
import {
  Badge,
  Button,
  GlassCard,
} from '@/components/ui';
import { connectivityModes, simulationBoards, simulationSensors } from '@/lib/ecosystem-data';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Bot,
  Compass,
  Cpu,
  Eye,
  Gauge,
  Lightbulb,
  Layers3,
  Play,
  RotateCcw,
  Send,
  Terminal,
  WandSparkles,
  Wifi,
  Zap,
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const SimulationCanvas = dynamic(
  () => import('@/components/three/SimulationScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-brand-dark text-white/20">
        Loading 3D environment...
      </div>
    ),
  }
);

const COMMANDS_HELP = [
  { cmd: 'moveForward()', desc: 'Move robot forward one step' },
  { cmd: 'moveForward(n)', desc: 'Move robot forward n steps' },
  { cmd: 'turnLeft()', desc: 'Rotate robot 90 degrees left' },
  { cmd: 'turnRight()', desc: 'Rotate robot 90 degrees right' },
  { cmd: 'scanObstacle()', desc: 'Scan for obstacles ahead' },
  { cmd: 'pickUp()', desc: 'Pick up an object' },
  { cmd: 'place()', desc: 'Place held object' },
  { cmd: 'wait(ms)', desc: 'Pause the mission for a set time' },
] as const;

const MISSIONS = [
  {
    id: 'starter',
    name: 'First Steps',
    difficulty: 'Beginner',
    desc: 'Move the robot to the goal marker and learn the basic motion vocabulary.',
    starter: `// First Steps mission\nmoveForward(2);\nturnRight();\nmoveForward(2);\nscanObstacle();\nmoveForward(1);\n`,
    objectives: ['Reach the goal tile', 'Use one scan', 'Finish within 6 commands'],
  },
  {
    id: 'obstacles',
    name: 'Obstacle Course',
    difficulty: 'Intermediate',
    desc: 'Navigate around barriers and keep your path clean using turns and sensor checks.',
    starter: `// Obstacle Course mission\nscanObstacle();\nmoveForward(1);\nturnLeft();\nmoveForward(2);\nturnRight();\nmoveForward(2);\n`,
    objectives: ['Avoid two obstacles', 'Turn efficiently', 'Complete with no collisions'],
  },
  {
    id: 'maze',
    name: 'Maze Runner',
    difficulty: 'Advanced',
    desc: 'Work through a longer route and combine directional logic with persistence.',
    starter: `// Maze Runner mission\nmoveForward(3);\nturnLeft();\nmoveForward(1);\nturnRight();\nscanObstacle();\nmoveForward(2);\nturnRight();\nmoveForward(1);\n`,
    objectives: ['Exit the maze', 'Use at least one scan', 'Maintain a readable script'],
  },
] as const;

export default function SimulationPage() {
  const { post } = useApi();
  const [selectedMissionId, setSelectedMissionId] = useState<(typeof MISSIONS)[number]['id']>('starter');
  const [selectedBoardIndex, setSelectedBoardIndex] = useState(0);
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);
  const [code, setCode] = useState<string>(MISSIONS[0].starter);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [commandQueue, setCommandQueue] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [robotState, setRobotState] = useState({
    x: 0,
    y: 0,
    z: 0,
    rotation: 0,
    sensorReading: -1,
    hasObject: false,
  });

  const selectedMission = useMemo(
    () => MISSIONS.find((mission) => mission.id === selectedMissionId) || MISSIONS[0],
    [selectedMissionId]
  );
  const selectedBoard = simulationBoards[selectedBoardIndex];
  const selectedMode = connectivityModes[selectedModeIndex];

  const runMissionCoach = useCallback(async (promptOverride?: string) => {
    const prompt = (promptOverride || aiPrompt).trim();
    if (!prompt) return;
    setAiLoading(true);
    try {
      const res = await post<{ message: string }>('/ai-tutor', {
        message: `You are helping in Robotix Simulation Lab.
Mission: ${selectedMission.name}
Mission description: ${selectedMission.desc}
Board profile: ${selectedBoard.title}
Connectivity mode: ${selectedMode.title}

Current robot mission code:
\`\`\`javascript
${code}
\`\`\`

Task: ${prompt}

Please explain clearly, suggest command logic, and provide improved mission code in a fenced block when useful.`,
        context: {
          topic: 'robotics simulation, mission planning, arduino logic',
          mission: selectedMission.name,
        },
      }, { requireAuth: false });
      setAiResponse(res.data?.message || 'No AI response returned.');
    } catch (error: unknown) {
      setAiResponse(`Robotix AI mission coach is unavailable right now.\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, code, post, selectedBoard.title, selectedMission.desc, selectedMission.name, selectedMode.title]);

  const executeCode = useCallback(() => {
    setIsRunning(true);
    setOutput('');
    const commands: string[] = [];
    let log = `Robotix Simulation Lab\nMission: ${selectedMission.name}\nBoard: ${selectedBoard.title}\nMode: ${selectedMode.title}\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    const lines = code.split('\n').filter((line) => line.trim() && !line.trim().startsWith('//'));
    let rx = 0;
    let ry = 0;
    let dir = 0;
    let lastScan = -1;
    const dirNames = ['North', 'East', 'South', 'West'];
    const dx = [0, 1, 0, -1];
    const dy = [1, 0, -1, 0];

    for (const line of lines) {
      const trimmed = line.trim();

      const moveMatch = trimmed.match(/moveForward\((\d*)\)/);
      if (moveMatch) {
        const steps = parseInt(moveMatch[1] || '1', 10);
        for (let step = 0; step < steps; step += 1) {
          rx += dx[dir];
          ry += dy[dir];
          commands.push(`move_${dir}`);
        }
        log += `moveForward(${steps}) -> (${rx}, ${ry})\n`;
        continue;
      }

      if (trimmed === 'turnLeft()') {
        dir = (dir + 3) % 4;
        commands.push('turn_left');
        log += `turnLeft() -> ${dirNames[dir]}\n`;
        continue;
      }

      if (trimmed === 'turnRight()') {
        dir = (dir + 1) % 4;
        commands.push('turn_right');
        log += `turnRight() -> ${dirNames[dir]}\n`;
        continue;
      }

      if (trimmed === 'scanObstacle()') {
        lastScan = Math.floor(Math.random() * 80) + 10;
        commands.push('scan');
        log += `scanObstacle() -> ${lastScan}cm\n`;
        continue;
      }

      if (trimmed === 'pickUp()') {
        commands.push('pickup');
        log += 'pickUp() -> object secured\n';
        continue;
      }

      if (trimmed === 'place()') {
        commands.push('place');
        log += 'place() -> object released\n';
        continue;
      }

      const waitMatch = trimmed.match(/wait\((\d+)\)/);
      if (waitMatch) {
        commands.push(`wait_${waitMatch[1]}`);
        log += `wait(${waitMatch[1]}ms)\n`;
      }
    }

    log += '━━━━━━━━━━━━━━━━━━━━━━━━\n';
    log += `Final position: (${rx}, ${ry}) facing ${dirNames[dir]}\n`;
    log += `Sensor memory: ${lastScan >= 0 ? `${lastScan}cm` : 'none'}\n`;
    log += 'Mission review: simulation complete.\n';

    setCommandQueue(commands);
    setRobotState((current) => ({
      ...current,
      x: rx,
      y: 0,
      z: ry,
      rotation: dir * 90,
      sensorReading: lastScan,
    }));

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < log.length) {
        setOutput(log.substring(0, charIndex + 1));
        charIndex += 1;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 10);
  }, [code, selectedBoard.title, selectedMission.name, selectedMode.title]);

  const resetSimulation = useCallback(() => {
    setRobotState({ x: 0, y: 0, z: 0, rotation: 0, sensorReading: -1, hasObject: false });
    setCommandQueue([]);
    setOutput('');
    setIsRunning(false);
  }, []);

  const applyMission = useCallback((missionId: (typeof MISSIONS)[number]['id']) => {
    const mission = MISSIONS.find((entry) => entry.id === missionId) || MISSIONS[0];
    setSelectedMissionId(mission.id);
    setCode(mission.starter);
    resetSimulation();
  }, [resetSimulation]);

  return (
    <main className="flex min-h-screen flex-col bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/10 pt-20">
        <div className="aurora-bg absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <Cpu className="mr-1 h-3 w-3" />
                Robotics Lab
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                Prototype robots in a browser lab that feels ready for learners and builders.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                The simulator now behaves more like a real lab surface: board profiles, mission presets, sensor palettes,
                serial logs, and lab tutorials wrap around the 3D scene instead of leaving it as a standalone demo.
              </p>
            </div>

            <GlassCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Mission pack', value: selectedMission.name },
                  { label: 'Board profile', value: selectedBoard.title },
                  { label: 'Access mode', value: selectedMode.title },
                  { label: 'Sensor nodes', value: simulationSensors.length.toString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/40">{item.label}</div>
                    <div className="mt-3 text-lg font-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-xl font-bold">Mission presets</h2>
              </div>
              <div className="space-y-3">
                {MISSIONS.map((mission) => (
                  <button
                    key={mission.id}
                    onClick={() => applyMission(mission.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selectedMission.id === mission.id
                        ? 'border-brand-secondary/40 bg-brand-secondary/10'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{mission.name}</p>
                      <Badge variant={mission.difficulty === 'Advanced' ? 'danger' : mission.difficulty === 'Intermediate' ? 'accent' : 'success'}>
                        {mission.difficulty}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-white/58">{mission.desc}</p>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-xl font-bold">Board profiles</h2>
              </div>
              <div className="space-y-3">
                {simulationBoards.map((board, index) => (
                  <button
                    key={board.title}
                    onClick={() => setSelectedBoardIndex(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selectedBoardIndex === index
                        ? 'border-brand-accent/40 bg-brand-accent/10'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                    }`}
                  >
                    <p className="font-semibold text-white">{board.title}</p>
                    <p className="mt-2 text-sm text-white/58">{board.detail}</p>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Wifi className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-xl font-bold">Lab access mode</h2>
              </div>
              <div className="space-y-3">
                {connectivityModes.map((mode, index) => (
                  <button
                    key={mode.title}
                    onClick={() => setSelectedModeIndex(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selectedModeIndex === index
                        ? 'border-brand-primary/40 bg-brand-primary/15'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{mode.title}</p>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-brand-secondary">{mode.signal}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/58">{mode.detail}</p>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="flex min-h-[780px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-brand-dark-surface/80 shadow-glass">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-brand-accent" />
                <div>
                  <p className="font-heading font-semibold text-white">Simulation workspace</p>
                  <p className="text-xs text-white/42">{selectedMission.name} on {selectedBoard.title}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={resetSimulation} icon={<RotateCcw className="h-4 w-4" />}>
                  Reset
                </Button>
                <Button size="sm" onClick={executeCode} loading={isRunning} icon={<Play className="h-4 w-4" />}>
                  Run mission
                </Button>
              </div>
            </div>

            <div className="grid flex-1 gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="flex min-h-[380px] flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
                <div className="border-b border-white/10 bg-white/[0.02] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/38">Command editor</p>
                </div>
                <div className="flex-1">
                  <MonacoEditor
                    height="100%"
                    language="javascript"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      padding: { top: 12 },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </div>

              <div className="flex min-h-[380px] flex-col">
                <div className="relative flex-1 min-h-[360px]">
                  <SimulationCanvas robotState={robotState} commands={commandQueue} />

                  <div className="absolute left-4 top-4 z-10">
                    <GlassCard className="space-y-1 p-3 text-xs">
                      <div className="flex items-center gap-2 font-heading font-semibold text-brand-accent">
                        <Compass className="h-3 w-3" /> Robot status
                      </div>
                      <div className="text-white/60">Position: ({robotState.x}, {robotState.z})</div>
                      <div className="text-white/60">Rotation: {robotState.rotation} degrees</div>
                      <div className="text-white/60">
                        Sensor: {robotState.sensorReading >= 0 ? `${robotState.sensorReading}cm` : '--'}
                      </div>
                    </GlassCard>
                  </div>

                  <div className="absolute bottom-4 right-4 z-10">
                    <GlassCard className="p-2">
                      <div className="grid grid-cols-3 gap-1">
                        <div />
                        <button className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10">
                          <ArrowUp className="mx-auto h-4 w-4" />
                        </button>
                        <div />
                        <button className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10">
                          <ArrowLeft className="mx-auto h-4 w-4" />
                        </button>
                        <button className="rounded-lg bg-brand-accent/20 p-2 text-brand-accent">
                          <Eye className="mx-auto h-4 w-4" />
                        </button>
                        <button className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10">
                          <ArrowRight className="mx-auto h-4 w-4" />
                        </button>
                        <div />
                        <button className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10">
                          <ArrowDown className="mx-auto h-4 w-4" />
                        </button>
                        <div />
                      </div>
                    </GlassCard>
                  </div>
                </div>

                <div className="h-56 border-t border-white/10 bg-[#0d1023]">
                  <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2">
                    <Terminal className="h-4 w-4 text-emerald-300" />
                    <span className="text-xs text-white/50">Serial + mission log</span>
                  </div>
                  <div className="h-[calc(100%-41px)] overflow-auto p-3 font-mono text-xs">
                    {output ? (
                      <pre className="whitespace-pre-wrap text-emerald-300">{output}</pre>
                    ) : (
                      <span className="text-white/20">Run your script to view simulation telemetry...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Gauge className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-xl font-bold">Mission objectives</h2>
              </div>
              <div className="space-y-3">
                {selectedMission.objectives.map((objective) => (
                  <div key={objective} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/60">
                    {objective}
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-xl font-bold">Sensor palette</h2>
              </div>
              <div className="grid gap-2">
                {simulationSensors.map((sensor) => (
                  <div key={sensor} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/62">
                    {sensor}
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-xl font-bold">Lab tutorial</h2>
              </div>
              <div className="space-y-3 text-sm text-white/60">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">1. Pick a board profile that matches your goal.</div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">2. Load a mission preset and inspect the starter code.</div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">3. Add movement, turns, and sensor logic in the editor.</div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">4. Run the mission and read the serial log like a real lab debug session.</div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-xl font-bold">AI Mission Coach</h2>
              </div>
              <div className="mb-3 grid gap-2">
                {[
                  'Explain the current mission code.',
                  'Improve this route for fewer commands.',
                  'Add scanObstacle logic for safer navigation.',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setAiPrompt(prompt);
                      runMissionCoach(prompt);
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left text-sm text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <textarea
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Ask the mission coach to optimize the route, explain commands, or generate a smarter script."
                className="input-field min-h-[110px] resize-y"
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <Button onClick={() => runMissionCoach()} loading={aiLoading} icon={<Send className="h-4 w-4" />}>
                  Ask coach
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const match = aiResponse.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
                    if (match?.[1]) setCode(match[1].trim());
                  }}
                  icon={<WandSparkles className="h-4 w-4" />}
                >
                  Apply AI code
                </Button>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/75">
                {aiResponse || 'Use the mission coach to explain movement logic, generate safer routes, or debug command sequences.'}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-xl font-bold">Command reference</h2>
              </div>
              <div className="space-y-2 text-xs">
                {COMMANDS_HELP.map((command) => (
                  <div key={command.cmd} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <code className="text-brand-accent">{command.cmd}</code>
                    <p className="mt-1 text-white/50">{command.desc}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
