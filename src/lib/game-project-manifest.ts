import type { StudioAssetItem } from '@/lib/game-assets';
import type { GameEventRule } from '@/lib/game-event-sheet';
import type { StudioSceneDefinition } from '@/lib/game-scene-flow';
import type { SceneObjectBlueprint } from '@/lib/game-scene-objects';

export interface GameProjectManifest {
  version: 1;
  sceneObjects: SceneObjectBlueprint[];
  eventRules: GameEventRule[];
  assets: StudioAssetItem[];
  stageArtUrl: string | null;
  scenes: StudioSceneDefinition[];
}

const MANIFEST_PREFIX = '/* RobotixStudioManifest:';
const MANIFEST_SUFFIX = ' */';

export function createEmptyManifest(): GameProjectManifest {
  return {
    version: 1,
    sceneObjects: [],
    eventRules: [],
    assets: [],
    stageArtUrl: null,
    scenes: [],
  };
}

function encodeManifest(manifest: GameProjectManifest) {
  const json = JSON.stringify(manifest);
  if (typeof window === 'undefined') {
    return Buffer.from(json, 'utf8').toString('base64');
  }

  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function decodeManifest(encoded: string) {
  if (typeof window === 'undefined') {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as GameProjectManifest;
  }

  const binary = window.atob(encoded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as GameProjectManifest;
}

export function stripProjectManifest(code: string) {
  return code.replace(/^\/\* RobotixStudioManifest:[A-Za-z0-9+/=]+\*\/\s*/m, '');
}

export function attachProjectManifest(code: string, manifest: GameProjectManifest) {
  const cleanCode = stripProjectManifest(code).trimStart();
  return `${MANIFEST_PREFIX}${encodeManifest(manifest)}${MANIFEST_SUFFIX}\n${cleanCode}`;
}

export function parseProjectManifest(code: string) {
  const match = code.match(/^\/\* RobotixStudioManifest:([A-Za-z0-9+/=]+)\*\/\s*/m);
  if (!match) {
    return {
      manifest: createEmptyManifest(),
      code: stripProjectManifest(code),
    };
  }

  try {
    return {
      manifest: {
        ...createEmptyManifest(),
        ...decodeManifest(match[1]),
      },
      code: stripProjectManifest(code),
    };
  } catch {
    return {
      manifest: createEmptyManifest(),
      code: stripProjectManifest(code),
    };
  }
}
