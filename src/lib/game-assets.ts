import { upsertManagedCodeSection } from '@/lib/game-code-blocks';

export interface StudioAssetItem {
  id: string;
  url: string;
  filename: string;
  mime: string;
  size: number;
}

export function syncStageArtToCode(code: string, assetUrl?: string | null) {
  const preloadSnippet = assetUrl
    ? `this.load.image('robotix-stage-art', ${JSON.stringify(assetUrl)});`
    : '';

  const createSnippet = assetUrl
    ? `const robotixStageArt = this.add.image(360, 270, 'robotix-stage-art');
robotixStageArt.setDisplaySize(720, 540);
robotixStageArt.setAlpha(0.24);
robotixStageArt.setDepth(-10);`
    : '';

  let nextCode = code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-stage-art', 'preload', preloadSnippet).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-stage-art', 'create', createSnippet).code;

  return nextCode;
}
