'use client';

import { useEffect, useRef, useState } from 'react';

const HOVER_SELECTOR = 'a, button, [role="button"], summary, [data-cursor-hover]';
const NO_CURSOR_INTERFERENCE = 'input, textarea, select, [contenteditable="true"]';

/**
 * Custom cursor that:
 *  - Disables itself on touch devices and when prefers-reduced-motion is on
 *  - Uses event delegation (one mouseover/mouseout listener) instead of
 *    re-attaching listeners on every DOM mutation (which leaked memory)
 *  - Keeps the native text caret cursor on inputs / textareas / contentEditable
 *  - Drives the visual via refs + rAF instead of React state to keep
 *    re-renders to zero
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    x: -100, y: -100,
    rx: -100, ry: -100,
    hover: false,
    clicking: false,
    visible: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (isTouch || reducedMotion || !finePointer) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    const s = stateRef.current;

    const onMove = (e: MouseEvent) => {
      s.x = e.clientX;
      s.y = e.clientY;
      if (!s.visible) {
        s.visible = true;
        if (ringRef.current) ringRef.current.style.opacity = '1';
        if (dotRef.current) dotRef.current.style.opacity = '1';
      }
    };
    const onLeave = () => {
      s.visible = false;
      if (ringRef.current) ringRef.current.style.opacity = '0';
      if (dotRef.current) dotRef.current.style.opacity = '0';
    };
    const onDown = () => { s.clicking = true; };
    const onUp = () => { s.clicking = false; };

    // Event delegation — one pair of listeners, no MutationObserver, no leaks
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || typeof t.closest !== 'function') return;
      s.hover = !!t.closest(HOVER_SELECTOR);
    };
    const onOut = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const rt = (e as any).relatedTarget as Element | null;
      if (!t) return;
      if (rt && typeof rt.closest === 'function' && rt.closest(HOVER_SELECTOR)) return;
      s.hover = false;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('mouseout', onOut, true);

    let rafId = 0;
    const tick = () => {
      // Smooth easing for the ring; dot snaps directly
      s.rx += (s.x - s.rx) * 0.18;
      s.ry += (s.y - s.ry) * 0.18;
      const ring = ringRef.current;
      const dot = dotRef.current;
      if (ring) {
        const size = s.hover ? 48 : 36;
        const half = size / 2;
        ring.style.width = `${size}px`;
        ring.style.height = `${size}px`;
        ring.style.transform = `translate3d(${s.rx - half}px, ${s.ry - half}px, 0) scale(${s.clicking ? 0.85 : 1})`;
        ring.style.borderColor = s.hover ? '#F4B400' : 'rgba(255,255,255,0.6)';
      }
      if (dot) {
        dot.style.transform = `translate3d(${s.x - 4}px, ${s.y - 4}px, 0)`;
        dot.style.backgroundColor = s.hover ? '#F4B400' : '#ffffff';
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('mouseout', onOut, true);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border-2 mix-blend-difference"
        style={{ width: 36, height: 36, opacity: 0, transition: 'opacity 0.2s, width 0.2s, height 0.2s, border-color 0.2s' }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-difference"
        style={{ width: 8, height: 8, opacity: 0, transition: 'opacity 0.2s, background-color 0.2s' }}
      />
      <style jsx global>{`
        @media (pointer: fine) and (prefers-reduced-motion: no-preference) {
          a, button, [role="button"], summary, [data-cursor-hover] {
            cursor: none;
          }
          /* Keep native text cursor for inputs — accessibility critical */
          ${NO_CURSOR_INTERFERENCE} {
            cursor: text !important;
          }
          html, body { cursor: none; }
        }
      `}</style>
    </>
  );
}
