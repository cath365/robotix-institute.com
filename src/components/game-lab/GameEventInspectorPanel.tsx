'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, GlassCard, Input, Select } from '@/components/ui';
import {
  type EventActionId,
  type EventConditionId,
  type GameEventRule,
} from '@/lib/game-event-sheet';
import type { SceneObjectBlueprint } from '@/lib/game-scene-objects';
import { Copy, GitBranchPlus, Trash2 } from 'lucide-react';

interface GameEventInspectorPanelProps {
  selectedRule: GameEventRule | null;
  objects: SceneObjectBlueprint[];
  currentSceneName?: string;
  onUpdateRule: (
    ruleId: string,
    updates: Partial<Omit<GameEventRule, 'id' | 'sceneId'>>
  ) => void;
  onDuplicateRule: (ruleId: string) => void;
  onRemoveRule: (ruleId: string) => void;
}

const conditionOptions: Array<{ value: EventConditionId; label: string }> = [
  { value: 'score_reaches', label: 'When score reaches value' },
  { value: 'timer_below', label: 'When timer drops below value' },
  { value: 'space_pressed', label: 'When player presses Space' },
  { value: 'player_hits_object', label: 'When player touches an object' },
];

const actionOptions: Array<{ value: EventActionId; label: string }> = [
  { value: 'show_message', label: 'Show message' },
  { value: 'camera_shake', label: 'Shake camera' },
  { value: 'spawn_bonus', label: 'Spawn bonus pickup' },
  { value: 'increase_score', label: 'Increase score' },
  { value: 'teleport_player', label: 'Teleport player' },
];

export function GameEventInspectorPanel({
  selectedRule,
  objects,
  currentSceneName,
  onUpdateRule,
  onDuplicateRule,
  onRemoveRule,
}: GameEventInspectorPanelProps) {
  const [label, setLabel] = useState('');
  const [condition, setCondition] = useState<EventConditionId>('score_reaches');
  const [action, setAction] = useState<EventActionId>('show_message');
  const [value, setValue] = useState('5');
  const [message, setMessage] = useState('');
  const [targetObjectId, setTargetObjectId] = useState('');

  useEffect(() => {
    if (!selectedRule) {
      setLabel('');
      setCondition('score_reaches');
      setAction('show_message');
      setValue('5');
      setMessage('');
      setTargetObjectId('');
      return;
    }

    setLabel(selectedRule.label);
    setCondition(selectedRule.condition);
    setAction(selectedRule.action);
    setValue(String(selectedRule.value));
    setMessage(selectedRule.message);
    setTargetObjectId(selectedRule.targetObjectId ?? '');
  }, [selectedRule]);

  const objectOptions = objects.length > 0
    ? objects.map((object) => ({ value: object.id, label: object.label }))
    : [{ value: '', label: 'Add a scene object first' }];

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3">
            <GitBranchPlus className="mr-1 h-3 w-3" />
            Rule Inspector
          </Badge>
          <h3 className="font-heading text-2xl font-semibold text-white">Tune the selected event rule</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            This property dock lets creators revise rule labels, triggers, values, and actions without rebuilding the whole event chain from scratch.
          </p>
          {currentSceneName ? (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-secondary">
              Active scene: {currentSceneName}
            </p>
          ) : null}
        </div>
        {selectedRule ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={<Copy className="h-4 w-4" />} onClick={() => onDuplicateRule(selectedRule.id)}>
              Duplicate rule
            </Button>
            <Button size="sm" variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => onRemoveRule(selectedRule.id)}>
              Remove rule
            </Button>
          </div>
        ) : null}
      </div>

      {selectedRule ? (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Rule name" value={label} onChange={(event) => setLabel(event.target.value)} />
            <Select
              label="Condition"
              value={condition}
              onChange={(event) => setCondition(event.target.value as EventConditionId)}
              options={conditionOptions}
            />
            <Select
              label="Action"
              value={action}
              onChange={(event) => setAction(event.target.value as EventActionId)}
              options={actionOptions}
            />
            <Input label="Value" type="number" value={value} onChange={(event) => setValue(event.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Message / detail" value={message} onChange={(event) => setMessage(event.target.value)} />
            </div>
            {condition === 'player_hits_object' ? (
              <div className="sm:col-span-2">
                <Select
                  label="Target object"
                  value={targetObjectId}
                  onChange={(event) => setTargetObjectId(event.target.value)}
                  options={objectOptions}
                />
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <Button
                onClick={() =>
                  onUpdateRule(selectedRule.id, {
                    label,
                    condition,
                    action,
                    value: Number(value),
                    message,
                    targetObjectId: condition === 'player_hits_object' ? targetObjectId : undefined,
                  })
                }
              >
                Apply rule changes
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/36">Rule summary</div>
              <div className="mt-4 space-y-2 text-sm text-white/62">
                <div><span className="text-white">Condition:</span> {selectedRule.condition}</div>
                <div><span className="text-white">Action:</span> {selectedRule.action}</div>
                <div><span className="text-white">Value:</span> {selectedRule.value}</div>
                <div><span className="text-white">Target:</span> {selectedRule.targetObjectId ?? 'Global trigger'}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-white/58">
              Select a rule from the Event Sheet to revise how it behaves without throwing away the whole visual logic chain.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/58">
          No rule selected yet. Pick a rule in the Event Sheet to edit it here.
        </div>
      )}
    </GlassCard>
  );
}
