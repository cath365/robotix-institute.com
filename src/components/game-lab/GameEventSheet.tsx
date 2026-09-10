'use client';

import { useState } from 'react';
import { Badge, Button, GlassCard, Input, Select } from '@/components/ui';
import { createDefaultEventRule, type GameEventRule } from '@/lib/game-event-sheet';
import type { SceneObjectBlueprint } from '@/lib/game-scene-objects';
import { GitBranchPlus, Zap } from 'lucide-react';

interface GameEventSheetProps {
  rules: GameEventRule[];
  objects: SceneObjectBlueprint[];
  currentSceneId?: string | null;
  currentSceneName?: string;
  selectedRuleId?: string | null;
  onAddRule: (rule: GameEventRule) => void;
  onRemoveRule: (ruleId: string) => void;
  onSelectRule?: (ruleId: string | null) => void;
}

const conditionOptions = [
  { value: 'score_reaches', label: 'When score reaches value' },
  { value: 'timer_below', label: 'When timer drops below value' },
  { value: 'space_pressed', label: 'When player presses Space' },
  { value: 'player_hits_object', label: 'When player touches an object' },
];

const actionOptions = [
  { value: 'show_message', label: 'Show message' },
  { value: 'camera_shake', label: 'Shake camera' },
  { value: 'spawn_bonus', label: 'Spawn bonus pickup' },
  { value: 'increase_score', label: 'Increase score' },
  { value: 'teleport_player', label: 'Teleport player' },
];

export function GameEventSheet({
  rules,
  objects,
  currentSceneId,
  currentSceneName,
  selectedRuleId,
  onAddRule,
  onRemoveRule,
  onSelectRule,
}: GameEventSheetProps) {
  const [draft, setDraft] = useState<GameEventRule>(() => createDefaultEventRule());

  const objectOptions = objects.map((object) => ({
    value: object.id,
    label: object.label,
  }));

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="max-w-2xl">
        <Badge variant="accent" className="mb-3">
          <GitBranchPlus className="mr-1 h-3 w-3" />
          Event Sheet
        </Badge>
        <h3 className="font-heading text-2xl font-semibold text-white">Compose logic with visual rules</h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          This is the beginning of a GDevelop-style event workflow: choose a condition, attach an action, and let the studio wire the code for you.
        </p>
        {currentSceneName ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-secondary">Editing scene: {currentSceneName}</p> : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-3">
          <Input
            label="Rule name"
            value={draft.label}
            onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
          />
          <Select
            label="Condition"
            value={draft.condition}
            onChange={(event) => setDraft((current) => ({ ...current, condition: event.target.value as GameEventRule['condition'] }))}
            options={conditionOptions}
          />
          <Select
            label="Action"
            value={draft.action}
            onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value as GameEventRule['action'] }))}
            options={actionOptions}
          />
          <Input
            label="Value"
            type="number"
            value={draft.value}
            onChange={(event) => setDraft((current) => ({ ...current, value: Number(event.target.value) }))}
          />
          <Input
            label="Message / detail"
            value={draft.message}
            onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
          />

          {draft.condition === 'player_hits_object' ? (
            <Select
              label="Target object"
              value={draft.targetObjectId ?? ''}
              onChange={(event) => setDraft((current) => ({ ...current, targetObjectId: event.target.value }))}
              options={objectOptions.length > 0 ? objectOptions : [{ value: '', label: 'Add a scene object first' }]}
            />
          ) : null}

          <Button
            icon={<Zap className="h-4 w-4" />}
            onClick={() => {
              if (draft.condition === 'player_hits_object' && !draft.targetObjectId) return;
              onAddRule({
                ...draft,
                sceneId: currentSceneId ?? null,
                id: `${draft.label || 'rule'}-${Math.random().toString(36).slice(2, 7)}`,
              });
              onSelectRule?.(null);
              setDraft(createDefaultEventRule());
            }}
          >
            Add event rule
          </Button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-white/36">Rules in this session</div>
          <div className="mt-4 grid gap-3">
            {rules.length > 0 ? rules.map((rule) => (
              <div
                key={rule.id}
                onClick={() => onSelectRule?.(rule.id)}
                className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                  selectedRuleId === rule.id
                    ? 'border-brand-accent bg-brand-accent/10'
                    : 'border-white/8 bg-black/10 hover:border-white/20'
                }`}
              >
                <div className="font-medium text-white">{rule.label}</div>
                <div className="mt-2 text-sm leading-6 text-white/55">
                  If <span className="text-white/80">{rule.condition}</span>, then <span className="text-white/80">{rule.action}</span>
                  {rule.condition === 'player_hits_object' && rule.targetObjectId ? ` using ${rule.targetObjectId}` : ''}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-brand-secondary">
                  Value {rule.value}
                </div>
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveRule(rule.id);
                    }}
                  >
                    Remove rule
                  </Button>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-white/8 bg-black/10 p-4 text-sm leading-6 text-white/55">
                No event rules yet. Create one to turn visual logic into real game behavior.
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
