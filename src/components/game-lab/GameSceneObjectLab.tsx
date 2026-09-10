'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, GlassCard, Input } from '@/components/ui';
import {
  createDefaultSceneObject,
  type SceneObjectBlueprint,
  type SceneObjectType,
} from '@/lib/game-scene-objects';
import { Boxes, PlusSquare } from 'lucide-react';

interface GameSceneObjectLabProps {
  objects: SceneObjectBlueprint[];
  currentSceneName?: string;
  onCreate: (object: Omit<SceneObjectBlueprint, 'id'> & { id?: string }) => void;
}

const objectTypes: Array<{ type: SceneObjectType; label: string; help: string }> = [
  { type: 'collectible', label: 'Collectible', help: 'Adds score and can be collected repeatedly.' },
  { type: 'hazard', label: 'Hazard', help: 'Damages or pressures the player on contact.' },
  { type: 'portal', label: 'Portal', help: 'Teleports the player for more dynamic movement.' },
  { type: 'moving-enemy', label: 'Moving Enemy', help: 'Adds a bouncing threat with simple combat pressure.' },
  { type: 'platform', label: 'Platform', help: 'Creates extra level structure for movement and positioning.' },
];

export function GameSceneObjectLab({ objects, currentSceneName, onCreate }: GameSceneObjectLabProps) {
  const [selectedType, setSelectedType] = useState<SceneObjectType>('collectible');
  const draft = useMemo(() => createDefaultSceneObject(selectedType), [selectedType]);
  const [label, setLabel] = useState(draft.label);
  const [x, setX] = useState(String(draft.x));
  const [y, setY] = useState(String(draft.y));
  const [size, setSize] = useState(String(draft.size));
  const [color, setColor] = useState(draft.color);

  const resetDraft = (type: SceneObjectType) => {
    const next = createDefaultSceneObject(type);
    setSelectedType(type);
    setLabel(next.label);
    setX(String(next.x));
    setY(String(next.y));
    setSize(String(next.size));
    setColor(next.color);
  };

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="max-w-2xl">
        <Badge variant="accent" className="mb-3">
          <Boxes className="mr-1 h-3 w-3" />
          Scene Object Lab
        </Badge>
        <h3 className="font-heading text-2xl font-semibold text-white">Place real gameplay objects visually</h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Create collectibles, hazards, portals, enemies, and platforms with structure instead of hand-writing every object from scratch.
        </p>
        {currentSceneName ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-secondary">Editing scene: {currentSceneName}</p> : null}
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        {objectTypes.map((entry) => (
          <button
            key={entry.type}
            type="button"
            onClick={() => resetDraft(entry.type)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              selectedType === entry.type
                ? 'border-brand-accent bg-brand-accent/10'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
            }`}
          >
            <div className="font-medium text-white">{entry.label}</div>
            <div className="mt-2 text-sm leading-6 text-white/55">{entry.help}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Object name" value={label} onChange={(event) => setLabel(event.target.value)} />
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
          <div className="flex items-end">
            <Button
              icon={<PlusSquare className="h-4 w-4" />}
              onClick={() =>
                onCreate({
                  label,
                  type: selectedType,
                  x: Number(x),
                  y: Number(y),
                  size: Number(size),
                  color,
                })
              }
            >
              Add object
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-white/36">Objects in this session</div>
          <div className="mt-4 grid gap-3">
            {objects.length > 0 ? objects.map((object) => (
              <div key={object.id} className="rounded-2xl border border-white/8 bg-black/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{object.label}</div>
                    <div className="mt-1 text-sm text-white/55">
                      {object.type} at ({object.x}, {object.y}) size {object.size}
                    </div>
                  </div>
                  <span
                    className="h-6 w-6 rounded-full border border-white/15"
                    style={{ backgroundColor: object.color }}
                  />
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-white/8 bg-black/10 p-4 text-sm leading-6 text-white/55">
                No custom scene objects yet. Add one to start shaping the level visually.
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
