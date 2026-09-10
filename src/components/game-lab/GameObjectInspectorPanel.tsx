'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, GlassCard, Input, Select } from '@/components/ui';
import type { SceneObjectBlueprint, SceneObjectType } from '@/lib/game-scene-objects';
import { Copy, SlidersHorizontal, Trash2 } from 'lucide-react';

interface GameObjectInspectorPanelProps {
  selectedObject: SceneObjectBlueprint | null;
  currentSceneName?: string;
  onUpdateObject: (
    objectId: string,
    updates: Partial<Omit<SceneObjectBlueprint, 'id' | 'sceneId'>>
  ) => void;
  onDuplicateObject: (objectId: string) => void;
  onRemoveObject: (objectId: string) => void;
}

const objectTypeOptions: Array<{ value: SceneObjectType; label: string }> = [
  { value: 'collectible', label: 'Collectible' },
  { value: 'hazard', label: 'Hazard' },
  { value: 'portal', label: 'Portal' },
  { value: 'moving-enemy', label: 'Moving Enemy' },
  { value: 'platform', label: 'Platform' },
];

export function GameObjectInspectorPanel({
  selectedObject,
  currentSceneName,
  onUpdateObject,
  onDuplicateObject,
  onRemoveObject,
}: GameObjectInspectorPanelProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<SceneObjectType>('collectible');
  const [x, setX] = useState('320');
  const [y, setY] = useState('240');
  const [size, setSize] = useState('20');
  const [color, setColor] = useState('#33d6ff');

  useEffect(() => {
    if (!selectedObject) {
      setLabel('');
      setType('collectible');
      setX('320');
      setY('240');
      setSize('20');
      setColor('#33d6ff');
      return;
    }

    setLabel(selectedObject.label);
    setType(selectedObject.type);
    setX(String(selectedObject.x));
    setY(String(selectedObject.y));
    setSize(String(selectedObject.size));
    setColor(selectedObject.color);
  }, [selectedObject]);

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3">
            <SlidersHorizontal className="mr-1 h-3 w-3" />
            Object Inspector
          </Badge>
          <h3 className="font-heading text-2xl font-semibold text-white">Tune the selected gameplay object</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            This is the property dock for the current object. Adjust layout, color, size, and type without hunting through generated code.
          </p>
          {currentSceneName ? (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-secondary">
              Active scene: {currentSceneName}
            </p>
          ) : null}
        </div>
        {selectedObject ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={<Copy className="h-4 w-4" />} onClick={() => onDuplicateObject(selectedObject.id)}>
              Duplicate object
            </Button>
            <Button size="sm" variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => onRemoveObject(selectedObject.id)}>
              Remove object
            </Button>
          </div>
        ) : null}
      </div>

      {selectedObject ? (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Object name" value={label} onChange={(event) => setLabel(event.target.value)} />
            <Select
              label="Object type"
              value={type}
              onChange={(event) => setType(event.target.value as SceneObjectType)}
              options={objectTypeOptions}
            />
            <Input label="X position" type="number" value={x} onChange={(event) => setX(event.target.value)} />
            <Input label="Y position" type="number" value={y} onChange={(event) => setY(event.target.value)} />
            <Input label="Size" type="number" value={size} onChange={(event) => setSize(event.target.value)} />
            <label className="space-y-1.5">
              <span className="block text-sm font-medium text-white/70">Object color</span>
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-12 w-full cursor-pointer rounded-xl border border-white/10 bg-transparent p-2"
              />
            </label>
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  onUpdateObject(selectedObject.id, {
                    label,
                    type,
                    x: Number(x),
                    y: Number(y),
                    size: Number(size),
                    color,
                  })
                }
              >
                Apply changes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setX(String(Number(x) - 16))}>
                Nudge left
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setX(String(Number(x) + 16))}>
                Nudge right
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setY(String(Number(y) - 16))}>
                Nudge up
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setY(String(Number(y) + 16))}>
                Nudge down
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/36">Inspector summary</div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-white">{selectedObject.label}</div>
                  <div className="mt-2 text-sm leading-6 text-white/58">
                    {selectedObject.type} at ({selectedObject.x}, {selectedObject.y}) with size {selectedObject.size}
                  </div>
                </div>
                <span
                  className="h-10 w-10 rounded-full border border-white/15"
                  style={{ backgroundColor: selectedObject.color }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-white/58">
              Select any object on the Scene Canvas to inspect it here. Changes in this panel are synced back into the managed Phaser project.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/58">
          No object selected yet. Click an object in the Scene Canvas to edit its properties here.
        </div>
      )}
    </GlassCard>
  );
}
