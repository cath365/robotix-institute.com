'use client';

import { useMemo, useState } from 'react';
import {
  AI_BUILDER_BLOCK_LIBRARY,
  buildAiBuilderCode,
  cloneAiBuilderBlock,
  type AiBuilderManifest,
  type AiBuilderWorkspaceMode,
} from '@/lib/ai-builder-blocks';
import { Badge, Button, GlassCard, Input } from '@/components/ui';
import {
  ArrowDown,
  ArrowUp,
  Bot,
  BrainCircuit,
  CirclePlay,
  Layers3,
  PlusSquare,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface AiBlocksStudioProps {
  manifest: AiBuilderManifest;
  onChange: (manifest: AiBuilderManifest) => void;
}

const workspaceModes: Array<{ value: AiBuilderWorkspaceMode; label: string; detail: string }> = [
  { value: 'ai-friend', label: 'AI Friend', detail: 'A playful assistant that responds with energy and encouragement.' },
  { value: 'quiz-host', label: 'Quiz Host', detail: 'A challenge-style experience with quick prompts and fun reactions.' },
  { value: 'robot-coach', label: 'Robot Coach', detail: 'A robotics guide that feels like a helper in the lab.' },
  { value: 'launch-board', label: 'Launch Board', detail: 'A more dashboard-like surface with animated status energy.' },
];

const libraryCategories = ['Start', 'Interface', 'AI', 'Data', 'Fun'] as const;

export function AiBlocksStudio({ manifest, onChange }: AiBlocksStudioProps) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof libraryCategories)[number]>('Start');
  const [studentName, setStudentName] = useState('Creator');
  const [topic, setTopic] = useState('robot pet idea');
  const [score, setScore] = useState(0);
  const [lastReply, setLastReply] = useState('Press Run App to test your block stack.');
  const [memory, setMemory] = useState<string[]>([]);
  const [didCelebrate, setDidCelebrate] = useState(false);
  const [didDance, setDidDance] = useState(false);

  const filteredBlocks = useMemo(
    () => AI_BUILDER_BLOCK_LIBRARY.filter((block) => block.category === selectedCategory),
    [selectedCategory]
  );

  const generatedCode = useMemo(() => buildAiBuilderCode(manifest), [manifest]);
  const hasBlock = (kind: string) => manifest.blocks.some((block) => block.kind === kind);

  const previewTitle = useMemo(() => {
    switch (manifest.workspaceMode) {
      case 'robot-coach':
        return 'Robot Coach Console';
      case 'launch-board':
        return 'Launch Board';
      case 'quiz-host':
        return 'Quiz Party AI';
      default:
        return 'Robotix AI Friend';
    }
  }, [manifest.workspaceMode]);

  const runApp = () => {
    const name = hasBlock('ask-name') ? studentName.trim() || 'Creator' : 'Creator';
    const chosenTopic = hasBlock('ask-topic') ? topic.trim() || 'a smart idea' : 'a smart idea';
    const intro =
      manifest.workspaceMode === 'robot-coach'
        ? `Coach ${name}, let’s build ${chosenTopic} with clear steps and bold testing.`
        : manifest.workspaceMode === 'launch-board'
          ? `${name}, your ${chosenTopic} concept is now entering launch mode.`
          : manifest.workspaceMode === 'quiz-host'
            ? `${name}, ready for a fast challenge about ${chosenTopic}?`
            : `Hey ${name}, I’ve got a fun Robotix idea for ${chosenTopic}.`;

    const enhancements: string[] = [];
    if (hasBlock('quick-buttons')) enhancements.push('quick choices');
    if (hasBlock('save-memory')) enhancements.push('saved memory');
    if (hasBlock('show-score')) enhancements.push('score energy');
    if (hasBlock('confetti-burst')) enhancements.push('celebration');
    if (hasBlock('robot-dance')) enhancements.push('robot dance');

    const reply = enhancements.length > 0
      ? `${intro} This version includes ${enhancements.join(', ')}.`
      : intro;

    setLastReply(reply);
    if (hasBlock('save-memory')) {
      setMemory((current) => [chosenTopic, ...current].slice(0, 4));
    }
    if (hasBlock('show-score')) {
      setScore((current) => current + 10);
    }
    setDidCelebrate(hasBlock('confetti-burst'));
    setDidDance(hasBlock('robot-dance'));
  };

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(87,212,255,0.12),rgba(255,255,255,0.02))] px-6 py-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge variant="accent" className="mb-3">
              <Sparkles className="mr-1 h-3 w-3" />
              AI Blocks Studio
            </Badge>
            <h2 className="font-heading text-3xl font-bold text-white">Build fun AI experiences with blocks</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
              This works like a playful Scratch-style builder for AI ideas: pick colorful blocks, stack the flow, and test the app instantly.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-white/72 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Mode</div>
              <div className="mt-1 font-heading text-lg text-white">{workspaceModes.find((mode) => mode.value === manifest.workspaceMode)?.label}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Blocks</div>
              <div className="mt-1 font-heading text-lg text-white">{manifest.blocks.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Preview</div>
              <div className="mt-1 font-heading text-lg text-white">Live</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Style</div>
              <div className="mt-1 font-heading text-lg text-white">Scratch-like</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[320px_1fr_420px]">
        <div className="border-b border-white/10 bg-white/[0.02] p-5 xl:border-b-0 xl:border-r">
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">Block library</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {libraryCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition-all ${
                  selectedCategory === category
                    ? 'border-brand-accent bg-brand-accent/15 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/58 hover:border-white/20 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            {filteredBlocks.map((block) => (
              <div key={block.kind} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950 ${block.accentClass}`}>
                  {block.category}
                </div>
                <div className="mt-3 font-heading text-lg font-semibold text-white">{block.label}</div>
                <div className="mt-2 text-sm leading-6 text-white/58">{block.description}</div>
                <Button
                  size="sm"
                  className="mt-4"
                  icon={<PlusSquare className="h-4 w-4" />}
                  onClick={() =>
                    onChange({
                      ...manifest,
                      blocks: [...manifest.blocks, cloneAiBuilderBlock(block.kind)],
                    })
                  }
                >
                  Add block
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-white/10 p-5 xl:border-b-0 xl:border-r">
          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/40">Workspace mode</div>
              <div className="mt-4 grid gap-3">
                {workspaceModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => onChange({ ...manifest, workspaceMode: mode.value })}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      manifest.workspaceMode === mode.value
                        ? 'border-brand-accent bg-brand-accent/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-white">{mode.label}</div>
                    <div className="mt-2 text-sm leading-6 text-white/58">{mode.detail}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/40">Stack your blocks</div>
              <div className="mt-4 space-y-3">
                {manifest.blocks.length > 0 ? manifest.blocks.map((block, index) => {
                  const blockDef = AI_BUILDER_BLOCK_LIBRARY.find((item) => item.kind === block.kind);
                  return (
                    <div key={block.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950 ${blockDef?.accentClass ?? 'from-brand-secondary to-brand-accent'}`}>
                            Step {index + 1}
                          </div>
                          <div className="mt-3 font-heading text-lg font-semibold text-white">{blockDef?.label}</div>
                          <div className="mt-2 text-sm leading-6 text-white/58">{blockDef?.description}</div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<ArrowUp className="h-4 w-4" />}
                            onClick={() => {
                              if (index === 0) return;
                              const next = [...manifest.blocks];
                              [next[index - 1], next[index]] = [next[index], next[index - 1]];
                              onChange({ ...manifest, blocks: next });
                            }}
                          >
                            Up
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<ArrowDown className="h-4 w-4" />}
                            onClick={() => {
                              if (index >= manifest.blocks.length - 1) return;
                              const next = [...manifest.blocks];
                              [next[index], next[index + 1]] = [next[index + 1], next[index]];
                              onChange({ ...manifest, blocks: next });
                            }}
                          >
                            Down
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() =>
                              onChange({
                                ...manifest,
                                blocks: manifest.blocks.filter((item) => item.id !== block.id),
                              })
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm leading-6 text-white/58">
                    Add a few blocks from the library to start building your AI experience.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <BrainCircuit className="h-4 w-4 text-brand-secondary" />
              Generated workflow code
            </div>
            <pre className="mt-4 max-h-[280px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-emerald-100">
              {generatedCode}
            </pre>
          </div>
        </div>

        <div className="bg-white/[0.02] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/40">Live preview</div>
              <h3 className="mt-2 font-heading text-2xl font-semibold text-white">{previewTitle}</h3>
            </div>
            <Button icon={<CirclePlay className="h-4 w-4" />} onClick={runApp}>
              Run App
            </Button>
          </div>

          <div className="mt-5 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
            <div className="flex items-start gap-3">
              {hasBlock('show-avatar') ? (
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-brand-secondary/10 text-2xl transition-transform ${didDance ? 'rotate-6 scale-110' : ''}`}>
                  <Bot className="h-7 w-7 text-brand-secondary" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-xl">
                  <Layers3 className="h-6 w-6 text-white/60" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{previewTitle}</div>
                <div className="mt-1 text-sm leading-6 text-white/58">{lastReply}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {hasBlock('ask-name') ? (
                <Input label="Creator name" value={studentName} onChange={(event) => setStudentName(event.target.value)} />
              ) : null}
              {hasBlock('ask-topic') ? (
                <Input label="Idea topic" value={topic} onChange={(event) => setTopic(event.target.value)} />
              ) : null}
            </div>

            {hasBlock('quick-buttons') ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {['robot helper', 'quiz game', 'smart farm', 'study bot'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setTopic(chip)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/72 transition-all hover:border-white/25 hover:text-white"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {hasBlock('show-score') ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/36">Fun score</div>
                  <div className="mt-2 font-heading text-3xl font-bold text-brand-secondary">{score}</div>
                </div>
              ) : null}
              {hasBlock('save-memory') ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/36">Saved ideas</div>
                  <div className="mt-3 space-y-2 text-sm text-white/68">
                    {memory.length > 0 ? memory.map((item) => (
                      <div key={item} className="rounded-xl bg-black/20 px-3 py-2">{item}</div>
                    )) : <div>No ideas saved yet.</div>}
                  </div>
                </div>
              ) : null}
            </div>

            {didCelebrate ? (
              <div className="mt-5 rounded-2xl border border-pink-300/20 bg-pink-400/10 px-4 py-3 text-sm font-semibold text-pink-100">
                Celebration block fired. Your app now feels playful and rewarding.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
