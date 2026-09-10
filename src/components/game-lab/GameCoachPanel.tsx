'use client';

import { useMemo } from 'react';
import { Badge, GlassCard } from '@/components/ui';
import { analyzeStudioProject } from '@/lib/game-studio-analyzer';
import { Gauge, Rocket, Sparkles } from 'lucide-react';

interface GameCoachPanelProps {
  title: string;
  description: string;
  tags: string;
  thumbnail?: string | null;
  code: string;
}

export function GameCoachPanel({
  title,
  description,
  tags,
  thumbnail,
  code,
}: GameCoachPanelProps) {
  const analysis = useMemo(
    () => analyzeStudioProject({ title, description, tags, thumbnail, code }),
    [title, description, tags, thumbnail, code]
  );

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3">
            <Gauge className="mr-1 h-3 w-3" />
            Studio Coach
          </Badge>
          <h3 className="font-heading text-2xl font-semibold text-white">This already can become a real game</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            The studio checks the project like a creator tool would: what systems are present, how publishable it feels, and what to add next.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">Build score</div>
          <div className="mt-2 text-3xl font-bold text-white">{analysis.score}/100</div>
          <div className="mt-1 text-sm text-brand-secondary">{analysis.verdict}</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/36">Detected genre</div>
            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
              <Rocket className="h-5 w-5 text-brand-accent" />
              {analysis.genre}
            </div>
          </div>

          <div className="grid gap-3">
            {analysis.signals.map((signal) => (
              <div key={signal.id} className="rounded-2xl border border-white/8 bg-black/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{signal.label}</div>
                    <p className="mt-1 text-sm leading-6 text-white/55">{signal.detail}</p>
                  </div>
                  <Badge variant={signal.found ? 'success' : 'primary'}>
                    {signal.found ? 'Ready' : 'Missing'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-brand-secondary" />
              <span className="font-semibold">What makes it better than a simple demo</span>
            </div>
            <p className="text-sm leading-6 text-white/60">
              Once a project has controls, a goal, tension, feedback, and a stronger presentation, students are no longer just “trying code” - they are building actual playable releases.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/36">Best next upgrades</div>
            <div className="mt-4 space-y-3">
              {analysis.suggestions.length > 0 ? analysis.suggestions.map((suggestion) => (
                <div key={suggestion.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{suggestion.title}</div>
                      <p className="mt-1 text-sm leading-6 text-white/55">{suggestion.detail}</p>
                    </div>
                    <Badge
                      variant={
                        suggestion.priority === 'high'
                          ? 'danger'
                          : suggestion.priority === 'medium'
                            ? 'accent'
                            : 'primary'
                      }
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-green-400/15 bg-green-400/10 p-4 text-sm leading-6 text-green-100">
                  This project already has the shape of a polished creator release. Keep tuning balance, visuals, and story before publishing.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
