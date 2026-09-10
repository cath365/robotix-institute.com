'use client';

import { Badge, GlassCard } from '@/components/ui';
import type { GameEventRule } from '@/lib/game-event-sheet';
import { Link2 } from 'lucide-react';

interface GameEventGraphProps {
  rules: GameEventRule[];
  currentSceneName?: string;
}

export function GameEventGraph({ rules, currentSceneName }: GameEventGraphProps) {
  return (
    <GlassCard className="space-y-5 p-5">
      <div className="max-w-2xl">
        <Badge variant="accent" className="mb-3">
          <Link2 className="mr-1 h-3 w-3" />
          Event Graph
        </Badge>
        <h3 className="font-heading text-2xl font-semibold text-white">See gameplay logic as connected systems</h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          This graph turns event-sheet rules into a visual logic map so creators can read game flow more like a design system than raw code.
        </p>
        {currentSceneName ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-secondary">Viewing scene: {currentSceneName}</p> : null}
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
        {rules.length > 0 ? (
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="grid gap-4 lg:grid-cols-[0.95fr_90px_0.95fr_90px_0.95fr] lg:items-center">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Condition</div>
                  <div className="mt-2 font-medium text-white">{rule.condition}</div>
                  <div className="mt-1 text-sm text-white/55">Value {rule.value}</div>
                </div>
                <div className="hidden lg:flex items-center justify-center text-white/25">→</div>
                <div className="rounded-2xl border border-brand-secondary/20 bg-brand-secondary/10 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-brand-secondary/80">Rule</div>
                  <div className="mt-2 font-medium text-white">{rule.label}</div>
                  <div className="mt-1 text-sm text-white/55">{rule.targetObjectId ? `Object: ${rule.targetObjectId}` : 'Global trigger'}</div>
                </div>
                <div className="hidden lg:flex items-center justify-center text-white/25">→</div>
                <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-fuchsia-100/70">Action</div>
                  <div className="mt-2 font-medium text-white">{rule.action}</div>
                  <div className="mt-1 text-sm text-white/55">{rule.message}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm leading-6 text-white/55">
            No connected event systems yet. Add a rule in the event sheet and it will appear here as a graph.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
