'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, GlassCard, Input, Textarea } from '@/components/ui';
import {
  createDefaultGameBuilderConfig,
  createGameBuilderProject,
  GAME_BUILDER_PRESETS,
  getGameBuilderPreset,
  type GameBuilderConfig,
  type GameBuilderPresetId,
} from '@/lib/game-builder';
import { Sparkles, Wand2 } from 'lucide-react';

interface GameBuilderPanelProps {
  onApply: (project: ReturnType<typeof createGameBuilderProject>) => void;
}

function updateNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function GameBuilderPanel({ onApply }: GameBuilderPanelProps) {
  const [config, setConfig] = useState<GameBuilderConfig>(() => createDefaultGameBuilderConfig('collector'));

  const activePreset = useMemo(() => getGameBuilderPreset(config.preset), [config.preset]);
  const generatedProject = useMemo(() => createGameBuilderProject(config), [config]);

  const setPreset = (presetId: GameBuilderPresetId) => {
    setConfig(createDefaultGameBuilderConfig(presetId));
  };

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3">
            <Sparkles className="mr-1 h-3 w-3" />
            Guided Game Builder
          </Badge>
          <h3 className="font-heading text-2xl font-semibold text-white">Create a game the Code.org way</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Pick a gameplay type, tune a few settings, and generate a working Phaser game before you ever touch raw code.
          </p>
        </div>

        <Button size="sm" icon={<Wand2 className="h-4 w-4" />} onClick={() => onApply(generatedProject)}>
          Apply to studio
        </Button>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        {GAME_BUILDER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setPreset(preset.id)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              config.preset === preset.id
                ? 'border-brand-accent bg-brand-accent/10 shadow-[0_20px_40px_rgba(51,214,255,0.12)]'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-heading text-lg font-semibold text-white">{preset.name}</h4>
              <Badge variant={config.preset === preset.id ? 'accent' : 'primary'}>{preset.id}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/62">{preset.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/36">{preset.helper}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Input
            label="Game title"
            value={config.title}
            onChange={(event) => setConfig((current) => ({ ...current, title: event.target.value }))}
          />
          <Textarea
            label="Objective"
            className="min-h-[96px]"
            value={config.objective}
            onChange={(event) => setConfig((current) => ({ ...current, objective: event.target.value }))}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Player speed"
              type="number"
              min={140}
              max={420}
              value={config.playerSpeed}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  playerSpeed: updateNumber(event.target.value, current.playerSpeed),
                }))
              }
            />
            <Input
              label={activePreset.goalLabel}
              type="number"
              min={1}
              max={50}
              value={config.preset === 'dodger' ? config.lives : config.goalCount}
              onChange={(event) =>
                setConfig((current) =>
                  current.preset === 'dodger'
                    ? { ...current, lives: updateNumber(event.target.value, current.lives) }
                    : { ...current, goalCount: updateNumber(event.target.value, current.goalCount) }
                )
              }
            />
            <Input
              label={activePreset.objectLabel}
              type="number"
              min={1}
              max={12}
              value={config.objectCount}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  objectCount: updateNumber(event.target.value, current.objectCount),
                }))
              }
            />
            <Input
              label={activePreset.timeLabel}
              type="number"
              min={10}
              max={180}
              value={config.roundTime}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  roundTime: updateNumber(event.target.value, current.roundTime),
                }))
              }
            />
          </div>

          {config.preset !== 'dodger' ? (
            <Input
              label="Lives"
              type="number"
              min={1}
              max={10}
              value={config.lives}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  lives: updateNumber(event.target.value, current.lives),
                }))
              }
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Background color', key: 'backgroundColor' },
              { label: 'Player color', key: 'playerColor' },
              { label: 'Accent color', key: 'accentColor' },
              { label: 'Hazard color', key: 'hazardColor' },
            ].map((field) => (
              <label key={field.key} className="space-y-1.5">
                <span className="block text-sm font-medium text-white/70">{field.label}</span>
                <input
                  type="color"
                  value={config[field.key as keyof GameBuilderConfig] as string}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="h-12 w-full cursor-pointer rounded-xl border border-white/10 bg-transparent p-2"
                />
              </label>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/36">Generated plan</div>
            <h4 className="mt-3 font-heading text-xl font-semibold text-white">{generatedProject.title}</h4>
            <p className="mt-2 text-sm leading-6 text-white/60">{generatedProject.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {generatedProject.tags.split(', ').map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/40">
              Apply this starter to the studio, then keep editing the code and metadata before saving.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
