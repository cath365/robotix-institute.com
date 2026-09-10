'use client';

import { Badge, Button, GlassCard } from '@/components/ui';
import { GAME_DIRECTOR_SYSTEMS, type GameDirectorSystem } from '@/lib/game-director-systems';
import { Cpu, PlusSquare } from 'lucide-react';

interface GameDirectorPanelProps {
  onDeploy: (system: GameDirectorSystem) => void;
}

export function GameDirectorPanel({ onDeploy }: GameDirectorPanelProps) {
  return (
    <GlassCard className="space-y-5 p-5">
      <div className="max-w-2xl">
        <Badge variant="accent" className="mb-3">
          <Cpu className="mr-1 h-3 w-3" />
          Director Systems
        </Badge>
        <h3 className="font-heading text-2xl font-semibold text-white">Build with systems, not only snippets</h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          These are larger game-director modules for pacing, reward loops, combat pressure, and premium presentation.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {GAME_DIRECTOR_SYSTEMS.map((system) => (
          <GlassCard key={system.id} className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-heading text-xl font-semibold text-white">{system.title}</h4>
                <p className="mt-2 text-sm leading-6 text-white/60">{system.description}</p>
              </div>
              <Badge variant={system.lane === 'Combat' ? 'danger' : system.lane === 'Reward' ? 'accent' : 'primary'}>
                {system.lane}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {system.sections.map((section) => (
                <span
                  key={`${system.id}-${section.target}`}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/50"
                >
                  {section.target}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-5">
              <Button size="sm" icon={<PlusSquare className="h-4 w-4" />} onClick={() => onDeploy(system)}>
                Deploy system
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </GlassCard>
  );
}
