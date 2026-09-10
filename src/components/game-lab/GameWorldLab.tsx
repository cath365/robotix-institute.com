'use client';

import { Badge, Button, GlassCard } from '@/components/ui';
import { GAME_WORLD_THEMES, type GameWorldTheme } from '@/lib/game-world-themes';
import { Orbit, Palette } from 'lucide-react';

interface GameWorldLabProps {
  onApply: (theme: GameWorldTheme) => void;
}

export function GameWorldLab({ onApply }: GameWorldLabProps) {
  return (
    <GlassCard className="space-y-5 p-5">
      <div className="max-w-2xl">
        <Badge variant="accent" className="mb-3">
          <Palette className="mr-1 h-3 w-3" />
          World Lab
        </Badge>
        <h3 className="font-heading text-2xl font-semibold text-white">Shape the world, not just the code</h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Theme packs let creators shift the game’s identity fast by changing color, mood, tags, and presentation direction in one move.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {GAME_WORLD_THEMES.map((theme) => (
          <GlassCard key={theme.id} className="flex h-full flex-col overflow-hidden p-0">
            <div
              className="min-h-[150px] border-b border-white/10 p-5"
              style={{
                backgroundImage: `radial-gradient(circle at top left, ${theme.palette.accent}33, transparent 40%), linear-gradient(135deg, ${theme.palette.background}, #050816)`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="accent" className="mb-3">Theme pack</Badge>
                  <h4 className="font-heading text-2xl font-semibold text-white">{theme.name}</h4>
                </div>
                <Orbit className="h-5 w-5 text-white/70" />
              </div>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/70">{theme.vibe}</p>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="mb-4 flex gap-2">
                {[theme.palette.background, theme.palette.accent, theme.palette.player, theme.palette.hazard].map((color) => (
                  <span
                    key={color}
                    className="h-8 w-8 rounded-full border border-white/15"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <p className="text-sm leading-6 text-white/60">{theme.descriptionSeed}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {theme.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-5">
                <Button size="sm" onClick={() => onApply(theme)}>
                  Apply world pack
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </GlassCard>
  );
}
