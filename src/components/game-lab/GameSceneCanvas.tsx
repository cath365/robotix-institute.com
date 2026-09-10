'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, GlassCard } from '@/components/ui';
import type { SceneObjectBlueprint } from '@/lib/game-scene-objects';
import { Move, Trash2 } from 'lucide-react';

interface GameSceneCanvasProps {
  objects: SceneObjectBlueprint[];
  backgroundUrl?: string | null;
  currentSceneName?: string;
  selectedObjectId?: string | null;
  onMoveObject: (id: string, x: number, y: number) => void;
  onRemoveObject: (id: string) => void;
  onSelectObject?: (id: string | null) => void;
}

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 540;

export function GameSceneCanvas({
  objects,
  backgroundUrl,
  currentSceneName,
  selectedObjectId,
  onMoveObject,
  onRemoveObject,
  onSelectObject,
}: GameSceneCanvasProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const resolvedSelectedId = selectedObjectId ?? internalSelectedId;
  const setSelectedId = (id: string | null) => {
    setInternalSelectedId(id);
    onSelectObject?.(id);
  };

  const selectedObject = useMemo(
    () => objects.find((object) => object.id === resolvedSelectedId) ?? null,
    [objects, resolvedSelectedId]
  );

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const bounds = canvasRef.current.getBoundingClientRect();
      const x = Math.max(24, Math.min(CANVAS_WIDTH - 24, event.clientX - bounds.left - dragRef.current.offsetX));
      const y = Math.max(96, Math.min(CANVAS_HEIGHT - 24, event.clientY - bounds.top - dragRef.current.offsetY));
      onMoveObject(dragRef.current.id, Math.round(x), Math.round(y));
    };

    const handleUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [onMoveObject]);

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3">
            <Move className="mr-1 h-3 w-3" />
            Scene Canvas
          </Badge>
          <h3 className="font-heading text-2xl font-semibold text-white">Drag objects directly in the level</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            This is the visual layout lane. Move pickups, hazards, portals, enemies, and platforms on the stage and the studio will sync their positions back into the game code.
          </p>
          {currentSceneName ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-secondary">Editing scene: {currentSceneName}</p> : null}
        </div>

        {selectedObject ? (
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              onRemoveObject(selectedObject.id);
              setSelectedId(null);
            }}
          >
            Remove selected
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div
          ref={canvasRef}
          className="relative overflow-hidden rounded-[1.5rem] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
          style={{
            width: '100%',
            aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
            backgroundImage: backgroundUrl
              ? `linear-gradient(180deg, rgba(5,8,22,0.2), rgba(5,8,22,0.74)), url(${backgroundUrl})`
              : 'radial-gradient(circle at top left, rgba(51,214,255,0.16), transparent 35%), linear-gradient(135deg, rgba(10,14,32,0.98), rgba(26,10,46,0.94))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />

          {objects.map((object) => {
            const isPlatform = object.type === 'platform';
            return (
              <button
                key={object.id}
                type="button"
                onPointerDown={(event) => {
                  const bounds = canvasRef.current?.getBoundingClientRect();
                  if (!bounds) return;
                  dragRef.current = {
                    id: object.id,
                    offsetX: event.clientX - bounds.left - object.x,
                    offsetY: event.clientY - bounds.top - object.y,
                  };
                  setSelectedId(object.id);
                }}
                onClick={() => setSelectedId(object.id)}
                className={`absolute flex items-center justify-center border-2 text-[10px] uppercase tracking-[0.18em] text-white transition-all ${
                  resolvedSelectedId === object.id ? 'border-white shadow-[0_0_0_4px_rgba(255,255,255,0.12)]' : 'border-white/30'
                }`}
                style={{
                  left: `${(object.x / CANVAS_WIDTH) * 100}%`,
                  top: `${(object.y / CANVAS_HEIGHT) * 100}%`,
                  width: isPlatform ? `${object.size * 2.6}px` : `${object.size * 2}px`,
                  height: isPlatform ? '18px' : `${object.size * 2}px`,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: isPlatform ? '999px' : '999px',
                  backgroundColor: object.color,
                  opacity: object.type === 'portal' ? 0.55 : 0.95,
                }}
              >
                <span className="pointer-events-none hidden xl:block">{object.type.replace('-', ' ')}</span>
              </button>
            );
          })}

          {objects.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm leading-6 text-white/60">
              Add objects in Scene Object Lab, then drag them around here.
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/36">Selected object</div>
            {selectedObject ? (
              <div className="mt-3 space-y-2 text-sm text-white/65">
                <div className="font-medium text-white">{selectedObject.label}</div>
                <div>Type: {selectedObject.type}</div>
                <div>Position: {selectedObject.x}, {selectedObject.y}</div>
                <div>Size: {selectedObject.size}</div>
              </div>
            ) : (
              <div className="mt-3 text-sm leading-6 text-white/55">
                Select an object on the canvas to inspect or remove it.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-white/55">
            Dragging here now changes the actual generated game layout, not just the editor preview.
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
