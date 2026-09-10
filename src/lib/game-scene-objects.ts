import { applyCodeSections, type GameCodeBlockSection, upsertManagedCodeSection } from '@/lib/game-code-blocks';

export type SceneObjectType = 'collectible' | 'hazard' | 'portal' | 'moving-enemy' | 'platform';

export interface SceneObjectBlueprint {
  id: string;
  label: string;
  type: SceneObjectType;
  sceneId?: string | null;
  x: number;
  y: number;
  size: number;
  color: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sanitizeId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || `scene-object-${Math.random().toString(36).slice(2, 8)}`;
}

function colorToHexLiteral(color: string) {
  return `0x${color.replace('#', '')}`;
}

export function normalizeSceneObjectBlueprint(input: Omit<SceneObjectBlueprint, 'id'> & { id?: string }): SceneObjectBlueprint {
  return {
    id: sanitizeId(input.id || input.label || input.type),
    label: input.label.trim() || 'Scene Object',
    type: input.type,
    sceneId: input.sceneId?.trim() || null,
    x: clamp(Math.round(Number(input.x) || 320), 30, 690),
    y: clamp(Math.round(Number(input.y) || 240), 90, 510),
    size: clamp(Math.round(Number(input.size) || 20), 8, 120),
    color: /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : '#33d6ff',
  };
}

export function createDefaultSceneObject(type: SceneObjectType = 'collectible'): SceneObjectBlueprint {
  if (type === 'hazard') {
    return normalizeSceneObjectBlueprint({
      label: 'Pulse Hazard',
      type,
      x: 520,
      y: 220,
      size: 18,
      color: '#fb7185',
    });
  }

  if (type === 'portal') {
    return normalizeSceneObjectBlueprint({
      label: 'Warp Portal',
      type,
      x: 620,
      y: 450,
      size: 16,
      color: '#33d6ff',
    });
  }

  if (type === 'moving-enemy') {
    return normalizeSceneObjectBlueprint({
      label: 'Rival Drone',
      type,
      x: 140,
      y: 180,
      size: 16,
      color: '#ef4444',
    });
  }

  if (type === 'platform') {
    return normalizeSceneObjectBlueprint({
      label: 'Hover Platform',
      type,
      x: 320,
      y: 360,
      size: 70,
      color: '#8b5cf6',
    });
  }

  return normalizeSceneObjectBlueprint({
    label: 'Energy Orb',
    type,
    x: 420,
    y: 260,
    size: 12,
    color: '#f4b400',
  });
}

function buildSceneObjectSections(object: SceneObjectBlueprint): GameCodeBlockSection[] {
  const key = `robotix_${object.id.replace(/-/g, '_')}`;
  const color = colorToHexLiteral(object.color);

  if (object.type === 'platform') {
    return [
      {
        target: 'create',
        snippet: `this.robotixSceneObjects = this.robotixSceneObjects || {};
const ${key} = this.add.rectangle(${object.x}, ${object.y}, ${object.size * 2.6}, 18, ${color}, 0.95);
this.physics.add.existing(${key}, true);
this.robotixSceneObjects[${JSON.stringify(object.id)}] = ${key};
this.robotixSceneRuntimeObjects.push({ id: ${JSON.stringify(object.id)}, sceneId: ${JSON.stringify(object.sceneId ?? null)}, object: ${key} });
if (this.player && this.physics?.add?.collider) {
  this.physics.add.collider(this.player, ${key});
}`,
      },
    ];
  }

  if (object.type === 'portal') {
    return [
      {
        target: 'create',
        snippet: `this.robotixSceneObjects = this.robotixSceneObjects || {};
const ${key} = this.add.circle(${object.x}, ${object.y}, ${object.size}, ${color}, 0.4).setStrokeStyle(2, 0xffffff, 0.9);
this.physics.add.existing(${key});
${key}.body.setImmovable(true);
${key}.body.setAllowGravity(false);
this.robotixSceneObjects[${JSON.stringify(object.id)}] = ${key};
this.robotixSceneRuntimeObjects.push({ id: ${JSON.stringify(object.id)}, sceneId: ${JSON.stringify(object.sceneId ?? null)}, object: ${key} });
this.physics.add.overlap(this.player, ${key}, () => {
  if (${JSON.stringify(object.sceneId ?? null)} && this.robotixActiveScene?.id !== ${JSON.stringify(object.sceneId ?? null)}) return;
  if (this.time.now < (${key}.robotixCooldown ?? 0)) return;
  ${key}.robotixCooldown = this.time.now + 1200;
  this.player.setPosition(
    Phaser.Math.Between(80, 640),
    Phaser.Math.Between(120, 440)
  );
  this.cameras.main.flash(140, 120, 220, 255);
});`,
      },
      {
        target: 'update',
        snippet: `if (${key} && (!${JSON.stringify(object.sceneId ?? null)} || this.robotixActiveScene?.id === ${JSON.stringify(object.sceneId ?? null)})) {
  ${key}.rotation += 0.03;
}`,
      },
    ];
  }

  if (object.type === 'moving-enemy') {
    return [
      {
        target: 'create',
        snippet: `this.robotixSceneObjects = this.robotixSceneObjects || {};
const ${key} = this.add.circle(${object.x}, ${object.y}, ${object.size}, ${color});
this.physics.add.existing(${key});
${key}.body.setCollideWorldBounds(true);
${key}.body.setBounce(1, 1);
${key}.body.setVelocity(160, 120);
this.robotixSceneObjects[${JSON.stringify(object.id)}] = ${key};
this.robotixSceneRuntimeObjects.push({ id: ${JSON.stringify(object.id)}, sceneId: ${JSON.stringify(object.sceneId ?? null)}, object: ${key} });
this.physics.add.overlap(this.player, ${key}, () => {
  if (${JSON.stringify(object.sceneId ?? null)} && this.robotixActiveScene?.id !== ${JSON.stringify(object.sceneId ?? null)}) return;
  this.cameras.main.shake(120, 0.01);
  this.lives = Math.max(0, (this.lives ?? 3) - 1);
  if (this.livesText) this.livesText.setText('Lives: ' + this.lives);
});`,
      },
    ];
  }

  if (object.type === 'hazard') {
    return [
      {
        target: 'create',
        snippet: `this.robotixSceneObjects = this.robotixSceneObjects || {};
const ${key} = this.add.circle(${object.x}, ${object.y}, ${object.size}, ${color}, 0.9);
this.physics.add.existing(${key});
${key}.body.setImmovable(true);
${key}.body.setAllowGravity(false);
this.robotixSceneObjects[${JSON.stringify(object.id)}] = ${key};
this.robotixSceneRuntimeObjects.push({ id: ${JSON.stringify(object.id)}, sceneId: ${JSON.stringify(object.sceneId ?? null)}, object: ${key} });
this.physics.add.overlap(this.player, ${key}, () => {
  if (${JSON.stringify(object.sceneId ?? null)} && this.robotixActiveScene?.id !== ${JSON.stringify(object.sceneId ?? null)}) return;
  if (this.time.now < (this.robotixLastHazardHit ?? 0) + 900) return;
  this.robotixLastHazardHit = this.time.now;
  this.cameras.main.flash(120, 255, 120, 120);
  this.lives = Math.max(0, (this.lives ?? 3) - 1);
  if (this.livesText) this.livesText.setText('Lives: ' + this.lives);
});`,
      },
      {
        target: 'update',
        snippet: `if (${key} && (!${JSON.stringify(object.sceneId ?? null)} || this.robotixActiveScene?.id === ${JSON.stringify(object.sceneId ?? null)})) {
  ${key}.scale = 1 + Math.sin(this.time.now / 180) * 0.08;
}`,
      },
    ];
  }

  return [
    {
      target: 'create',
      snippet: `this.robotixSceneObjects = this.robotixSceneObjects || {};
const ${key} = this.add.circle(${object.x}, ${object.y}, ${object.size}, ${color});
this.physics.add.existing(${key});
${key}.body.setImmovable(true);
${key}.body.setAllowGravity(false);
this.robotixSceneObjects[${JSON.stringify(object.id)}] = ${key};
this.robotixSceneRuntimeObjects.push({ id: ${JSON.stringify(object.id)}, sceneId: ${JSON.stringify(object.sceneId ?? null)}, object: ${key} });
this.physics.add.overlap(this.player, ${key}, () => {
  if (${JSON.stringify(object.sceneId ?? null)} && this.robotixActiveScene?.id !== ${JSON.stringify(object.sceneId ?? null)}) return;
  this.score = (this.score ?? 0) + 1;
  if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
  ${key}.setPosition(
    Phaser.Math.Between(80, 640),
    Phaser.Math.Between(120, 440)
  );
  ${key}.setAlpha(0.55);
  this.time.delayedCall(120, () => ${key}.setAlpha(1));
});`,
    },
    {
      target: 'update',
      snippet: `if (${key} && (!${JSON.stringify(object.sceneId ?? null)} || this.robotixActiveScene?.id === ${JSON.stringify(object.sceneId ?? null)})) {
  ${key}.rotation += 0.025;
}`,
    },
  ];
}

export function applySceneObjectBlueprint(code: string, input: Omit<SceneObjectBlueprint, 'id'> & { id?: string }) {
  const object = normalizeSceneObjectBlueprint(input);
  const result = applyCodeSections(code, `scene-${object.id}`, buildSceneObjectSections(object));
  return {
    ...result,
    object,
  };
}

export function syncSceneObjectsToCode(code: string, objects: SceneObjectBlueprint[]) {
  const normalized = objects.map((object) => normalizeSceneObjectBlueprint(object));
  const createSnippets: string[] = [];
  const updateSnippets: string[] = [];
  const globalSnippets: string[] = [];
  const preloadSnippets: string[] = [];

  normalized.forEach((object) => {
    buildSceneObjectSections(object).forEach((section) => {
      if (section.target === 'create') createSnippets.push(section.snippet);
      else if (section.target === 'update') updateSnippets.push(section.snippet);
      else if (section.target === 'global') globalSnippets.push(section.snippet);
      else if (section.target === 'preload') preloadSnippets.push(section.snippet);
    });
  });

  createSnippets.unshift(`this.robotixSceneObjects = this.robotixSceneObjects || {};
this.robotixSceneRuntimeObjects = [];
this.robotixRefreshSceneObjects = () => {
  this.robotixSceneRuntimeObjects.forEach((entry) => {
    const active = !entry.sceneId || this.robotixActiveScene?.id === entry.sceneId;
    if (typeof entry.object.setVisible === 'function') entry.object.setVisible(active);
    if (typeof entry.object.setActive === 'function') entry.object.setActive(active);
    if (entry.object.body) {
      entry.object.body.enable = active;
      if (!active && typeof entry.object.body.setVelocity === 'function') {
        entry.object.body.setVelocity(0, 0);
      }
    }
  });
};`);

  createSnippets.push(`this.robotixRefreshSceneObjects?.();`);

  let nextCode = code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-scene-objects', 'global', globalSnippets.join('\n\n')).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-scene-objects', 'preload', preloadSnippets.join('\n\n')).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-scene-objects', 'create', createSnippets.join('\n\n')).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-scene-objects', 'update', updateSnippets.join('\n\n')).code;

  return {
    code: nextCode,
    objects: normalized,
  };
}
