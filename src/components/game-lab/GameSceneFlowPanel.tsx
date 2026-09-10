'use client';

import { useMemo } from 'react';
import { Badge, Button, GlassCard, Input, Select } from '@/components/ui';
import {
  createDefaultSceneFlow,
  type StudioSceneDefinition,
  type StudioSceneKind,
  type StudioSceneTransition,
} from '@/lib/game-scene-flow';
import { ArrowDown, ArrowUp, Clapperboard, Copy, PlusSquare, Trash2 } from 'lucide-react';

interface GameSceneFlowPanelProps {
  scenes: StudioSceneDefinition[];
  selectedSceneId: string | null;
  sceneObjectCounts?: Record<string, number>;
  sceneRuleCounts?: Record<string, number>;
  onSelectScene: (sceneId: string | null) => void;
  onReplaceScenes: (scenes: StudioSceneDefinition[]) => void;
  onDuplicateScene: (sceneId: string) => void;
}

const sceneKindOptions = [
  { value: 'menu', label: 'Menu' },
  { value: 'level', label: 'Level' },
  { value: 'boss', label: 'Boss' },
  { value: 'win', label: 'Win Screen' },
];

const transitionOptions = [
  { value: 'fade', label: 'Fade' },
  { value: 'flash', label: 'Flash' },
  { value: 'zoom', label: 'Zoom Pulse' },
  { value: 'slide', label: 'Slide Shock' },
];

export function GameSceneFlowPanel({
  scenes,
  selectedSceneId,
  sceneObjectCounts = {},
  sceneRuleCounts = {},
  onSelectScene,
  onReplaceScenes,
  onDuplicateScene,
}: GameSceneFlowPanelProps) {
  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0] ?? null,
    [scenes, selectedSceneId]
  );

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3">
            <Clapperboard className="mr-1 h-3 w-3" />
            Scene Flow
          </Badge>
          <h3 className="font-heading text-2xl font-semibold text-white">Build a full game journey</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Create menu, level, boss, and win scenes with structured progression instead of a single endless screen.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const defaults = createDefaultSceneFlow();
              onReplaceScenes(defaults);
              const nextId = defaults[0]?.id ?? null;
              onSelectScene(nextId);
            }}
          >
            Reset flow
          </Button>
          <Button
            size="sm"
            icon={<PlusSquare className="h-4 w-4" />}
            onClick={() => {
              const next: StudioSceneDefinition = {
                id: `scene-${Math.random().toString(36).slice(2, 7)}`,
                name: `Scene ${scenes.length + 1}`,
                kind: 'level',
                objective: 'Complete the mission and continue forward.',
                accentColor: '#33d6ff',
                scoreTarget: 5,
                nextSceneId: null,
              };
              onReplaceScenes([...scenes, next]);
              onSelectScene(next.id);
            }}
          >
            Add scene
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3">
          {scenes.length > 0 ? scenes.map((scene) => (
            <button
            key={scene.id}
            type="button"
            onClick={() => {
              onSelectScene(scene.id);
            }}
            className={`w-full rounded-2xl border p-4 text-left transition-all ${
                selectedScene?.id === scene.id
                  ? 'border-brand-accent bg-brand-accent/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
            }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-white">{scene.name}</div>
                  <div className="mt-1 text-sm text-white/55">{scene.kind}</div>
                </div>
                <Badge variant="primary">{scene.scoreTarget}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-white/40">
                <span>{sceneObjectCounts[scene.id] ?? 0} objects</span>
                <span>{sceneRuleCounts[scene.id] ?? 0} rules</span>
                <span>{scene.transitionStyle ?? 'fade'} transition</span>
                {scene.backgroundAssetUrl ? <span>bg ready</span> : null}
                {scene.soundtrackUrl ? <span>audio ready</span> : null}
              </div>
              <div className="mt-3 text-sm leading-6 text-white/55">{scene.objective}</div>
            </button>
          )) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/55">
              No scenes yet. Add one to start building a full game flow.
            </div>
          )}
        </div>

        {selectedScene ? (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <Input
              label="Scene name"
              value={selectedScene.name}
              onChange={(event) =>
                onReplaceScenes(
                  scenes.map((scene) => scene.id === selectedScene.id ? { ...scene, name: event.target.value } : scene)
                )
              }
            />
            <Select
              label="Scene type"
              value={selectedScene.kind}
              onChange={(event) =>
                onReplaceScenes(
                  scenes.map((scene) => scene.id === selectedScene.id ? { ...scene, kind: event.target.value as StudioSceneKind } : scene)
                )
              }
              options={sceneKindOptions}
            />
            <Input
              label="Objective"
              value={selectedScene.objective}
              onChange={(event) =>
                onReplaceScenes(
                  scenes.map((scene) => scene.id === selectedScene.id ? { ...scene, objective: event.target.value } : scene)
                )
              }
            />
            <Input
              label="Score target"
              type="number"
              value={selectedScene.scoreTarget}
              onChange={(event) =>
                onReplaceScenes(
                  scenes.map((scene) => scene.id === selectedScene.id ? { ...scene, scoreTarget: Number(event.target.value) } : scene)
                )
              }
            />
            <Input
              label="Scene background image URL"
              value={selectedScene.backgroundAssetUrl ?? ''}
              onChange={(event) =>
                onReplaceScenes(
                  scenes.map((scene) => scene.id === selectedScene.id ? { ...scene, backgroundAssetUrl: event.target.value } : scene)
                )
              }
            />
            <Input
              label="Scene soundtrack URL"
              value={selectedScene.soundtrackUrl ?? ''}
              onChange={(event) =>
                onReplaceScenes(
                  scenes.map((scene) => scene.id === selectedScene.id ? { ...scene, soundtrackUrl: event.target.value } : scene)
                )
              }
            />
            <Select
              label="Transition style"
              value={selectedScene.transitionStyle ?? 'fade'}
              onChange={(event) =>
                onReplaceScenes(
                  scenes.map((scene) => scene.id === selectedScene.id ? { ...scene, transitionStyle: event.target.value as StudioSceneTransition } : scene)
                )
              }
              options={transitionOptions}
            />
            <Input
              label="Next scene id"
              value={selectedScene.nextSceneId ?? ''}
              onChange={(event) =>
                onReplaceScenes(
                  scenes.map((scene) => scene.id === selectedScene.id ? { ...scene, nextSceneId: event.target.value } : scene)
                )
              }
            />
            <label className="space-y-1.5">
              <span className="block text-sm font-medium text-white/70">Accent color</span>
              <input
                type="color"
                value={selectedScene.accentColor}
                onChange={(event) =>
                  onReplaceScenes(
                    scenes.map((scene) => scene.id === selectedScene.id ? { ...scene, accentColor: event.target.value } : scene)
                  )
                }
                className="h-12 w-full cursor-pointer rounded-xl border border-white/10 bg-transparent p-2"
              />
            </label>
            <Button
              size="sm"
              variant="secondary"
              icon={<Copy className="h-4 w-4" />}
              onClick={() => onDuplicateScene(selectedScene.id)}
            >
              Duplicate scene
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                icon={<ArrowUp className="h-4 w-4" />}
                onClick={() => {
                  const index = scenes.findIndex((scene) => scene.id === selectedScene.id);
                  if (index <= 0) return;
                  const next = [...scenes];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  onReplaceScenes(next);
                }}
              >
                Move up
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<ArrowDown className="h-4 w-4" />}
                onClick={() => {
                  const index = scenes.findIndex((scene) => scene.id === selectedScene.id);
                  if (index < 0 || index >= scenes.length - 1) return;
                  const next = [...scenes];
                  [next[index], next[index + 1]] = [next[index + 1], next[index]];
                  onReplaceScenes(next);
                }}
              >
                Move down
              </Button>
            </div>
            <Button
              size="sm"
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => {
                const next = scenes.filter((scene) => scene.id !== selectedScene.id);
                onReplaceScenes(next);
                const nextId = next[0]?.id ?? null;
                onSelectScene(nextId);
              }}
            >
              Remove scene
            </Button>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
