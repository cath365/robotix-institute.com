'use client';

import { Badge, Button, GlassCard } from '@/components/ui';
import { GAME_CODE_BLOCKS, type GameCodeBlock } from '@/lib/game-code-blocks';
import { Blocks, PlusSquare } from 'lucide-react';

interface GameCodeBlocksProps {
  onInsert: (block: GameCodeBlock) => void;
}

const builderSteps = [
  'Choose a guided starter first so the scene already has a player and goal.',
  'Drop in one logic block at a time, then hit Run to see what changed.',
  'When something works, save it and keep layering more mechanics.',
];

export function GameCodeBlocks({ onInsert }: GameCodeBlocksProps) {
  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3">
            <Blocks className="mr-1 h-3 w-3" />
            Logic Blocks
          </Badge>
          <h3 className="font-heading text-2xl font-semibold text-white">Add mechanics like building blocks</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            These are click-to-insert gameplay chunks for students who are still learning where `create()` and `update()` belong.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-white/36">Build flow</div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {builderSteps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/8 bg-black/10 p-3 text-sm leading-6 text-white/62">
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-brand-secondary">Step {index + 1}</div>
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {GAME_CODE_BLOCKS.map((block) => (
          <GlassCard key={block.id} className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-heading text-xl font-semibold text-white">{block.title}</h4>
                <p className="mt-2 text-sm leading-6 text-white/60">{block.description}</p>
              </div>
              <Badge variant={block.level === 'Challenge' ? 'danger' : block.level === 'Builder' ? 'primary' : 'accent'}>
                {block.level}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {block.sections.map((section) => (
                <span
                  key={`${block.id}-${section.target}`}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/50"
                >
                  {section.target}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-5">
              <Button size="sm" icon={<PlusSquare className="h-4 w-4" />} onClick={() => onInsert(block)}>
                Insert block
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </GlassCard>
  );
}
