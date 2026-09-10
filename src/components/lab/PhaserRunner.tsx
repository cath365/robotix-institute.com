'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { AlertCircle, Play, Square, RefreshCw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui';

const PHASER_CDN = 'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js';

export interface PhaserRunnerHandle {
  run: (code: string) => void;
  stop: () => void;
}

interface PhaserRunnerProps {
  /** Initial code to run on mount. Pass empty string to wait for `.run()`. */
  initialCode?: string;
  /** Auto-run the code on mount. Defaults to true when initialCode is given. */
  autoRun?: boolean;
  /** Optional className for the wrapper div. */
  className?: string;
  /** Hide the toolbar (useful in the public play page). */
  hideToolbar?: boolean;
}

interface RuntimeMessage {
  type: 'phaser-loaded' | 'phaser-error' | 'phaser-log';
  payload?: any;
}

/**
 * A sandboxed iframe that runs user-authored Phaser game code.
 *
 * Why an iframe?
 *   - User code runs in an isolated execution context (no access to the parent
 *     React app, cookies, localStorage, etc.).
 *   - `sandbox="allow-scripts"` blocks the iframe from making same-origin
 *     requests; even if a student writes malicious code, it can't read the
 *     user's auth cookie or hit our internal APIs.
 *   - Phaser is loaded ONCE per iframe from CDN — never bundled into the
 *     main app, keeping the initial JS payload tiny.
 *
 * Communication is one-way: parent posts `{ type: 'run', code }` to the iframe
 * which evals the code; the iframe posts back errors and console.log lines.
 */
export const PhaserRunner = forwardRef<PhaserRunnerHandle, PhaserRunnerProps>(
  function PhaserRunner({ initialCode = '', autoRun = true, className, hideToolbar = false }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const codeRef = useRef<string>(initialCode);
    const [phaserReady, setPhaserReady] = useState(false);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // Build the iframe HTML at mount. Keep this stable so we don't reload
    // Phaser on every code change.
    const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin: 0; padding: 0; background: #0B0638; color: #fff;
      font-family: ui-monospace, monospace; overflow: hidden; }
    #game-root { width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; }
    #game-root canvas { display: block; max-width: 100%; max-height: 100%; }
    #boot { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 12px; color: #6f72b3; font-size: 14px; }
    .spinner { width: 28px; height: 28px; border: 3px solid #2B1EA3; border-top-color: #F4B400;
      border-radius: 50%; animation: spin 0.9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="boot"><div class="spinner"></div><span>Loading Phaser…</span></div>
  <div id="game-root"></div>
  <script>
    (function () {
      var parent = window.parent;
      function post(type, payload) {
        try { parent.postMessage({ __phaser_runner: true, type: type, payload: payload }, '*'); } catch (e) {}
      }
      // Forward console output to the parent for the log panel.
      ['log', 'info', 'warn', 'error'].forEach(function (m) {
        var orig = console[m];
        console[m] = function () {
          var args = Array.prototype.slice.call(arguments).map(String).join(' ');
          post('phaser-log', { level: m, message: args });
          orig.apply(console, arguments);
        };
      });
      window.addEventListener('error', function (e) {
        post('phaser-error', { message: e.message, line: e.lineno, col: e.colno });
      });
      window.addEventListener('unhandledrejection', function (e) {
        post('phaser-error', { message: 'Unhandled: ' + (e.reason && e.reason.message || e.reason) });
      });

      var s = document.createElement('script');
      s.src = '${PHASER_CDN}';
      s.crossOrigin = 'anonymous';
      s.onload = function () {
        var b = document.getElementById('boot');
        if (b) b.style.display = 'none';
        post('phaser-loaded');
      };
      s.onerror = function () {
        post('phaser-error', { message: 'Failed to load Phaser from CDN. Check your network.' });
      };
      document.head.appendChild(s);

      // Tear down any previous Phaser game and execute fresh code.
      window.__runUserCode = function (code) {
        // Wipe old canvas / Phaser instance
        var root = document.getElementById('game-root');
        if (root) root.innerHTML = '';
        if (window.game && typeof window.game.destroy === 'function') {
          try { window.game.destroy(true); } catch (e) {}
          window.game = null;
        }
        try {
          // Wrap in IIFE so let/const declarations don't leak between runs.
          new Function('Phaser', '"use strict";' + code)(window.Phaser);
        } catch (err) {
          post('phaser-error', { message: err && err.message || String(err), stack: err && err.stack });
        }
      };

      window.addEventListener('message', function (ev) {
        var data = ev.data || {};
        if (data.__phaser_run && typeof data.code === 'string') {
          window.__runUserCode(data.code);
        }
      });
    })();
  </script>
</body>
</html>`;

    useEffect(() => {
      const onMessage = (ev: MessageEvent) => {
        const data = ev.data;
        if (!data || !data.__phaser_runner) return;
        const msg = data as RuntimeMessage;
        if (msg.type === 'phaser-loaded') {
          setPhaserReady(true);
          setError(null);
          if (autoRun && codeRef.current) {
            postRun(codeRef.current);
          }
        } else if (msg.type === 'phaser-error') {
          setError(msg.payload?.message || 'Unknown error');
          setRunning(false);
        } else if (msg.type === 'phaser-log') {
          const { level, message } = msg.payload || {};
          setLogs((l) => [...l.slice(-99), `${level === 'error' ? '✖' : level === 'warn' ? '⚠' : '›'} ${message}`]);
        }
      };
      window.addEventListener('message', onMessage);
      return () => window.removeEventListener('message', onMessage);
    }, [autoRun]);

    const postRun = (code: string) => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;
      setError(null);
      setLogs([]);
      setRunning(true);
      iframe.contentWindow.postMessage({ __phaser_run: true, code }, '*');
    };

    const stop = () => {
      const iframe = iframeRef.current;
      if (iframe) {
        // Re-post the same srcDoc to fully reset the runtime.
        iframe.srcdoc = srcDoc;
      }
      setRunning(false);
      setPhaserReady(false);
      setLogs([]);
    };

    useImperativeHandle(ref, () => ({
      run(code: string) {
        codeRef.current = code;
        if (phaserReady) postRun(code);
        else {
          // Phaser hasn't finished loading — auto-run when it does.
        }
      },
      stop,
    }), [phaserReady]);

    const fullscreen = () => {
      const w = wrapperRef.current;
      if (!w) return;
      if (!document.fullscreenElement) w.requestFullscreen?.();
      else document.exitFullscreen?.();
    };

    return (
      <div ref={wrapperRef} className={`relative flex flex-col bg-brand-dark rounded-2xl overflow-hidden border border-white/10 ${className ?? ''}`}>
        {!hideToolbar && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/5 bg-black/30">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className={`w-2 h-2 rounded-full ${running ? 'bg-green-400 animate-pulse' : phaserReady ? 'bg-yellow-400' : 'bg-white/30'}`} />
              {running ? 'Running' : phaserReady ? 'Ready' : 'Loading Phaser…'}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => postRun(codeRef.current)} disabled={!phaserReady}>
                Re-run
              </Button>
              <Button variant="ghost" size="sm" icon={<Square className="w-3.5 h-3.5" />} onClick={stop}>Stop</Button>
              <Button variant="ghost" size="sm" icon={<Maximize2 className="w-3.5 h-3.5" />} onClick={fullscreen}>Fullscreen</Button>
            </div>
          </div>
        )}
        <div className="relative flex-1 min-h-[360px] bg-[#0B0638]">
          <iframe
            ref={iframeRef}
            title="Phaser game runtime"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            allow="autoplay; gamepad"
            className="absolute inset-0 w-full h-full"
            style={{ border: 0, background: '#0B0638' }}
          />
          {error && (
            <div className="absolute bottom-3 left-3 right-3 max-w-2xl mx-auto bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-mono break-words">{error}</span>
            </div>
          )}
        </div>
        {!hideToolbar && logs.length > 0 && (
          <div className="border-t border-white/5 bg-black/40 px-3 py-2 max-h-32 overflow-auto font-mono text-[11px] space-y-0.5">
            {logs.map((l, i) => (
              <div key={i} className={l.startsWith('✖') ? 'text-red-400' : l.startsWith('⚠') ? 'text-yellow-400' : 'text-white/60'}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
