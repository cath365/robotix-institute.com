/** Maximum length of authored Phaser/JavaScript injected into iframe */
export const GAME_LAB_CODE_MAX_CHARS = 200_000;

/**
 * Basic anti-breakout for closing script tags inside user-authored code.
 */
export function sanitiseEmbeddedScript(js: string): string {
  return js.replace(/<\/script/gi, '<\\/script');
}

const PHASER_CDN =
  process.env.NEXT_PUBLIC_PHASER_CDN ??
  'https://cdn.jsdelivr.net/npm/phaser@3.88.2/dist/phaser.min.js';

/**
 * Builds isolated HTML executed inside a sandboxed iframe.
 *
 * ### Student API
 * Assign a config factory via:
 * ```js
 * RobotixPhaser.start((Phaser) => ({
 *   type: Phaser.AUTO,
 *   width: 640,
 *   height: 520,
 *   parent: 'game-root',
 *   scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
 *   backgroundColor: '#0B0638',
 *   physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
 *   scene: { preload, create, update }
 * }));
 * ```
 */
export function buildGameLabHtml(studentCodeRaw: string, previewSceneId?: string | null): string {
  const studentCode = sanitiseEmbeddedScript(studentCodeRaw.trim());

  const styles =
    `:root{font-family:system-ui,sans-serif}` +
    `body{margin:0;background:#0B0638}` +
    `#game-root{min-height:100vh;display:flex;align-items:center;justify-content:center}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Game Lab Preview</title>
<style>${styles}</style>
<script src="${PHASER_CDN}" crossorigin="anonymous"><\\/script>
</head>
<body>
<div id="game-root"></div>
<pre id="student-error" style="display:none;white-space:pre-wrap;color:#f87171;padding:16px;"></pre>
<script>
(function () {
  'use strict';

  /** Call once — passes global Phaser so your factory can extend built-ins cleanly. */
  window.RobotixPhaser = {};
  window.__ROBOTIX_PREVIEW_SCENE_ID = ${previewSceneId ? JSON.stringify(previewSceneId) : 'null'};

  RobotixPhaser.start = function(factory) {
    var errEl = document.getElementById('student-error');

    try {
      if (typeof factory !== 'function') {
        throw new Error('Pass a factory: RobotixPhaser.start((Phaser) => ({ …config })).');
      }

      window.__GAME_INST__ && window.__GAME_INST__.destroy(true);
      window.__GAME_INST__ = null;

      var cfg = factory(Phaser);

      if (!cfg || typeof cfg !== 'object') {
        throw new Error('Factory must return a Phaser game configuration object.');
      }

      cfg.parent = cfg.parent || 'game-root';

      window.__GAME_INST__ = new Phaser.Game(cfg);
      return window.__GAME_INST__;
    } catch (e) {
      errEl.style.display = 'block';
      errEl.textContent = String(e && e.stack ? e.stack : e);
      throw e;
    }
  };

  try {
    ${studentCode}
    if (!window.__GAME_INST__) {
      console.warn('[Game Lab] No game started yet — remember to call RobotixPhaser.start(factory).');
    }
  } catch (e) {
    var err = document.getElementById('student-error');
    err.style.display = 'block';
    err.textContent = String(e && e.stack ? e.stack : e);
  }
})();
</script>
</body>
</html>`;
}
