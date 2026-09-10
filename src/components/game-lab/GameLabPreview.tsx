'use client';

import { useMemo } from 'react';
import { buildGameLabHtml } from '@/lib/game-lab-runner';

interface GameLabPreviewProps {
  code: string;
  title?: string;
  previewSceneId?: string | null;
}

/**
 * Sandboxed Phaser preview. `allow-same-origin` is required so Phaser can bind
 * canvas; top navigation and forms stay blocked.
 */
export function GameLabPreview({ code, title = 'Preview', previewSceneId }: GameLabPreviewProps) {
  const srcDoc = useMemo(() => buildGameLabHtml(code, previewSceneId), [code, previewSceneId]);

  return (
    <iframe
      title={title}
      className="w-full min-h-[540px] rounded-xl border border-white/10 bg-[#0B0638]"
      sandbox="allow-scripts allow-same-origin"
      srcDoc={srcDoc}
    />
  );
}
