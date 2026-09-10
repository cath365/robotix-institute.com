'use client';

import { Badge, Button, GlassCard } from '@/components/ui';
import type { StudioSceneDefinition } from '@/lib/game-scene-flow';
import { Image, Music4, PanelsTopLeft } from 'lucide-react';

interface GameSceneMediaPanelProps {
  scene: StudioSceneDefinition | null;
  stageArtUrl?: string | null;
  onClearSceneBackground: () => void;
  onClearSceneSoundtrack: () => void;
}

export function GameSceneMediaPanel({
  scene,
  stageArtUrl,
  onClearSceneBackground,
  onClearSceneSoundtrack,
}: GameSceneMediaPanelProps) {
  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3">
            <PanelsTopLeft className="mr-1 h-3 w-3" />
            Scene Media Dock
          </Badge>
          <h3 className="font-heading text-2xl font-semibold text-white">Give each scene its own mood</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            This dock separates scene presentation from gameplay logic, so backgrounds and soundtrack choices feel like proper editor tools instead of loose URL fields.
          </p>
        </div>
        {scene ? (
          <div className="flex flex-wrap gap-2">
            {scene.backgroundAssetUrl ? (
              <Button size="sm" variant="ghost" onClick={onClearSceneBackground}>
                Clear background
              </Button>
            ) : null}
            {scene.soundtrackUrl ? (
              <Button size="sm" variant="ghost" onClick={onClearSceneSoundtrack}>
                Clear soundtrack
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {scene ? (
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03]">
              <div
                className="min-h-[220px] bg-cover bg-center"
                style={{
                  backgroundImage: scene.backgroundAssetUrl
                    ? `linear-gradient(180deg, rgba(6,10,24,0.18), rgba(6,10,24,0.82)), url(${scene.backgroundAssetUrl})`
                    : stageArtUrl
                      ? `linear-gradient(180deg, rgba(6,10,24,0.18), rgba(6,10,24,0.82)), url(${stageArtUrl})`
                      : 'radial-gradient(circle at top left, rgba(51,214,255,0.16), transparent 35%), linear-gradient(135deg, rgba(10,14,32,0.98), rgba(26,10,46,0.94))',
                }}
              />
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{scene.kind}</Badge>
                  <Badge variant="accent">{scene.name}</Badge>
                </div>
                <p className="text-sm leading-6 text-white/60">{scene.objective}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-2 text-white">
                  <Image className="h-4 w-4 text-brand-secondary" />
                  <span className="text-sm font-medium">Background layer</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/58">
                  {scene.backgroundAssetUrl
                    ? 'This scene uses its own backdrop and overrides the shared stage art in the canvas and preview.'
                    : 'No scene-specific backdrop yet. The shared stage art will be used until a scene image is assigned.'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-2 text-white">
                  <Music4 className="h-4 w-4 text-brand-secondary" />
                  <span className="text-sm font-medium">Soundtrack lane</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/58">
                  {scene.soundtrackUrl
                    ? 'This scene has a soundtrack file assigned and the preview will try to start it when the scene loads.'
                    : 'No soundtrack is assigned to this scene yet. Use Asset Studio to attach MP3, WAV, or OGG audio.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/36">Scene runtime</div>
              <div className="mt-4 grid gap-3 text-sm text-white/62">
                <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                  Score target: <span className="text-white">{scene.scoreTarget}</span>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                  Next scene: <span className="text-white">{scene.nextSceneId ?? 'None set'}</span>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                  Accent color: <span className="text-white">{scene.accentColor}</span>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                  Transition: <span className="text-white">{scene.transitionStyle ?? 'fade'}</span>
                </div>
              </div>
            </div>

            {scene.soundtrackUrl ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/36">Audio preview</div>
                <audio controls className="mt-4 w-full">
                  <source src={scene.soundtrackUrl} />
                </audio>
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-white/58">
              Use Asset Studio to assign images and audio, then use Scene Flow to route the player between scenes. This keeps presentation, logic, and progression in separate lanes.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/58">
          Select a scene to manage its presentation layer here.
        </div>
      )}
    </GlassCard>
  );
}
