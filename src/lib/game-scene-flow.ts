import { upsertManagedCodeSection } from '@/lib/game-code-blocks';

export type StudioSceneKind = 'menu' | 'level' | 'boss' | 'win';
export type StudioSceneTransition = 'fade' | 'flash' | 'zoom' | 'slide';

export interface StudioSceneDefinition {
  id: string;
  name: string;
  kind: StudioSceneKind;
  objective: string;
  accentColor: string;
  scoreTarget: number;
  backgroundAssetUrl?: string | null;
  soundtrackUrl?: string | null;
  transitionStyle?: StudioSceneTransition;
  nextSceneId?: string | null;
}

function sanitizeId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || `scene-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultSceneFlow(): StudioSceneDefinition[] {
  return [
    {
      id: 'menu',
      name: 'Main Menu',
      kind: 'menu',
      objective: 'Press Enter to begin the mission.',
      accentColor: '#33d6ff',
      scoreTarget: 1,
      backgroundAssetUrl: null,
      soundtrackUrl: '',
      transitionStyle: 'fade',
      nextSceneId: 'level-1',
    },
    {
      id: 'level-1',
      name: 'Level 1',
      kind: 'level',
      objective: 'Reach the target score to unlock the next scene.',
      accentColor: '#f4b400',
      scoreTarget: 6,
      backgroundAssetUrl: null,
      soundtrackUrl: '',
      transitionStyle: 'zoom',
      nextSceneId: 'win',
    },
    {
      id: 'win',
      name: 'Victory Screen',
      kind: 'win',
      objective: 'Press Enter to return to the beginning.',
      accentColor: '#4ade80',
      scoreTarget: 1,
      backgroundAssetUrl: null,
      soundtrackUrl: '',
      transitionStyle: 'flash',
      nextSceneId: 'menu',
    },
  ];
}

export function normalizeSceneFlow(scenes: StudioSceneDefinition[]) {
  return scenes.map((scene, index) => ({
    id: sanitizeId(scene.id || scene.name || `scene-${index + 1}`),
    name: scene.name.trim() || `Scene ${index + 1}`,
    kind: scene.kind,
    objective: scene.objective.trim() || 'Complete the objective to continue.',
    accentColor: /^#[0-9a-f]{6}$/i.test(scene.accentColor) ? scene.accentColor : '#33d6ff',
    scoreTarget: Math.max(1, Math.round(Number(scene.scoreTarget) || 1)),
    backgroundAssetUrl: scene.backgroundAssetUrl?.trim() || null,
    soundtrackUrl: scene.soundtrackUrl?.trim() || '',
    transitionStyle: scene.transitionStyle ?? 'fade',
    nextSceneId: scene.nextSceneId?.trim() || null,
  }));
}

export function syncSceneFlowToCode(code: string, scenes: StudioSceneDefinition[]) {
  const normalized = normalizeSceneFlow(scenes);
  const scenePayload = JSON.stringify(normalized);
  const preloadLines = normalized
    .filter((scene) => scene.backgroundAssetUrl)
    .map((scene) => `this.load.image('robotix-scene-bg-${scene.id}', ${JSON.stringify(scene.backgroundAssetUrl)});`)
    .join('\n');

  const globalSnippet = `const ROBOTIX_SCENE_FLOW = ${scenePayload};`;

  const preloadSnippet = preloadLines;

  const createSnippet = `this.robotixSceneFlow = ROBOTIX_SCENE_FLOW;
this.robotixSceneFlowIndex = 0;
this.robotixSceneEnterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
this.robotixSceneCards = [];
this.robotixSceneBackdrop = null;
this.robotixSceneAudio = null;
this.robotixSceneTransitionOverlay = this.add.rectangle(360, 270, 720, 540, 0x040812, 0)
  .setDepth(60)
  .setScrollFactor(0);

const robotixScenePanel = this.add.rectangle(360, 94, 420, 108, 0x020617, 0.76)
  .setStrokeStyle(2, 0x33d6ff, 0.85)
  .setDepth(20);
const robotixSceneTitle = this.add.text(360, 72, '', {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '28px',
  color: '#ffffff',
  align: 'center',
}).setOrigin(0.5).setDepth(21);
const robotixSceneObjective = this.add.text(360, 110, '', {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '15px',
  color: '#dbe5ff',
  align: 'center',
  wordWrap: { width: 340 },
}).setOrigin(0.5).setDepth(21);
const robotixSceneHint = this.add.text(360, 146, '', {
  fontFamily: 'monospace',
  fontSize: '13px',
  color: '#9fb9ff',
}).setOrigin(0.5).setDepth(21);

this.robotixApplySceneFlow = (index) => {
  const scene = this.robotixSceneFlow?.[index];
  if (!scene) return;
  const previousScene = this.robotixActiveScene;
  this.robotixSceneFlowIndex = index;
  this.robotixActiveScene = scene;
  this.cameras.main.setBackgroundColor(scene.accentColor);
  robotixScenePanel.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(scene.accentColor).color, 0.9);
  robotixSceneTitle.setText(scene.name);
  robotixSceneTitle.setColor(scene.accentColor);
  robotixSceneObjective.setText(scene.objective);
  robotixSceneHint.setText(
    scene.kind === 'menu'
      ? 'Press Enter to start'
      : scene.kind === 'win'
        ? 'Press Enter to loop'
        : 'Reach score ' + scene.scoreTarget + ' then press Enter'
  );

  if (scene.backgroundAssetUrl) {
    const textureKey = 'robotix-scene-bg-' + scene.id;
    if (this.textures.exists(textureKey)) {
      if (!this.robotixSceneBackdrop) {
        this.robotixSceneBackdrop = this.add.image(360, 270, textureKey).setDepth(-9);
      } else {
        this.robotixSceneBackdrop.setTexture(textureKey);
      }
      this.robotixSceneBackdrop.setDisplaySize(720, 540);
      this.robotixSceneBackdrop.setAlpha(0.26);
      this.robotixSceneBackdrop.setVisible(true);
    }
  } else if (this.robotixSceneBackdrop) {
    this.robotixSceneBackdrop.setVisible(false);
  }

  if (this.robotixSceneAudio && this.robotixSceneAudio.src !== scene.soundtrackUrl) {
    this.robotixSceneAudio.pause();
    this.robotixSceneAudio = null;
  }
  if (scene.soundtrackUrl && !this.robotixSceneAudio) {
    try {
      this.robotixSceneAudio = new Audio(scene.soundtrackUrl);
      this.robotixSceneAudio.loop = true;
      this.robotixSceneAudio.volume = 0.28;
      this.robotixSceneAudio.play().catch(() => {});
    } catch (error) {
      console.warn('Scene soundtrack failed to start', error);
    }
  }

  if (this.player?.body) {
    this.player.body.moves = scene.kind !== 'menu' && scene.kind !== 'win';
    if (!this.player.body.moves) {
      this.player.body.setVelocity(0, 0);
    }
  }

  if (previousScene && previousScene.id !== scene.id) {
    if (scene.transitionStyle === 'flash') {
      this.cameras.main.flash(220, 120, 220, 255);
    } else if (scene.transitionStyle === 'zoom') {
      this.cameras.main.zoomTo(1.08, 180, 'Sine.easeOut', true, (_camera, progress) => {
        if (progress >= 1) {
          this.cameras.main.zoomTo(1, 160, 'Sine.easeIn');
        }
      });
    } else if (scene.transitionStyle === 'slide') {
      this.cameras.main.shake(120, 0.0035);
      this.tweens.add({
        targets: robotixScenePanel,
        x: 404,
        duration: 140,
        ease: 'Sine.easeOut',
        yoyo: true,
      });
    } else {
      this.robotixSceneTransitionOverlay.setAlpha(0.42);
      this.tweens.add({
        targets: this.robotixSceneTransitionOverlay,
        alpha: 0,
        duration: 220,
        ease: 'Sine.easeOut',
      });
    }
  }
};

if (this.robotixSceneFlow?.length) {
  const previewId = window.__ROBOTIX_PREVIEW_SCENE_ID;
  const previewIndex = typeof previewId === 'string'
    ? this.robotixSceneFlow.findIndex((scene) => scene.id === previewId)
    : -1;
  this.robotixApplySceneFlow(previewIndex >= 0 ? previewIndex : 0);
  this.robotixRefreshSceneObjects?.();
}`;

  const updateSnippet = `if (this.robotixActiveScene && Phaser.Input.Keyboard.JustDown(this.robotixSceneEnterKey)) {
  const currentScene = this.robotixActiveScene;
  const canAdvance =
    currentScene.kind === 'menu' ||
    currentScene.kind === 'win' ||
    (currentScene.kind !== 'menu' && currentScene.kind !== 'win' && (this.score ?? 0) >= currentScene.scoreTarget);

  if (canAdvance) {
    const nextId = currentScene.nextSceneId;
    const nextIndex = this.robotixSceneFlow.findIndex((scene) => scene.id === nextId);
    if (nextIndex >= 0) {
      this.robotixApplySceneFlow(nextIndex);
      this.robotixRefreshSceneObjects?.();
    }
  }
}`;

  let nextCode = code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-scene-flow', 'global', globalSnippet).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-scene-flow', 'preload', preloadSnippet).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-scene-flow', 'create', createSnippet).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-scene-flow', 'update', updateSnippet).code;

  return {
    code: nextCode,
    scenes: normalized,
  };
}
