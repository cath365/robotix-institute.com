'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';

const BRIDGE_URL = 'http://127.0.0.1:3210';

interface BridgeBoard {
  port: string;
  fqbn?: string;
  label: string;
  protocol?: string;
}

export default function UploadSetupPage() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [message, setMessage] = useState('Checking local uploader bridge...');
  const [boards, setBoards] = useState<BridgeBoard[]>([]);

  const refresh = useCallback(async () => {
    setStatus('checking');
    try {
      const healthRes = await fetch(`${BRIDGE_URL}/health`);
      const health = await healthRes.json() as { ok?: boolean; message?: string };
      const boardsRes = await fetch(`${BRIDGE_URL}/boards`);
      const boardData = boardsRes.ok ? await boardsRes.json() as { boards?: BridgeBoard[] } : { boards: [] };
      setBoards(boardData.boards ?? []);
      setStatus(health.ok ? 'online' : 'offline');
      setMessage(health.message || (health.ok ? 'Uploader bridge online.' : 'Uploader bridge unavailable.'));
    } catch {
      setStatus('offline');
      setBoards([]);
      setMessage('The local bridge is offline. Start `npm run arduino:bridge` on this machine.');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-[#c5e0e3] text-[#1f3a41]">
      <Navbar />
      <div className="px-4 pb-10 pt-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-[28px] border border-[#86b1b7] bg-[#edf6f7] p-6 shadow-[0_20px_50px_rgba(32,57,62,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4e7078]">Robotix Upload Setup</p>
                <h1 className="mt-2 text-3xl font-semibold text-[#214149]">Bridge the IDE to real Arduino hardware</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f7a82]">
                  This page helps you power the Robotix Arduino IDE with a local uploader bridge, so verify and upload actions can call `arduino-cli` on your machine.
                </p>
              </div>
              <div className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${status === 'online' ? 'bg-[#dff6e8] text-[#0c7b4d]' : status === 'checking' ? 'bg-white text-[#5f7a82]' : 'bg-[#fff2d8] text-[#9a6300]'}`}>
                {status === 'online' ? 'Bridge online' : status === 'checking' ? 'Checking' : 'Bridge offline'}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-[#c6dbde] bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#50727a]">Status</p>
                <p className="mt-2 text-sm leading-6 text-[#214149]">{message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { void refresh(); }}
                    className="rounded-md bg-[#2e666b] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#24545a]"
                  >
                    Refresh
                  </button>
                  <Link
                    href="/playground"
                    className="rounded-md border border-[#c6dbde] bg-[#f8fbfb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#355861] hover:bg-[#eef7f8]"
                  >
                    Back to IDE
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-[#c6dbde] bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#50727a]">Run this</p>
                <pre className="mt-3 rounded-xl bg-[#f3f9fa] p-3 font-mono text-[12px] text-[#214149]">npm run arduino:bridge</pre>
                <p className="mt-3 text-xs leading-5 text-[#5f7a82]">The IDE checks `http://127.0.0.1:3210` for health, board detection, verify, and upload.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#86b1b7] bg-[#edf6f7] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#50727a]">1. Install CLI</p>
              <pre className="mt-3 rounded-xl bg-white p-3 font-mono text-[12px] text-[#214149]">arduino-cli version</pre>
              <p className="mt-3 text-xs leading-5 text-[#5f7a82]">Make sure `arduino-cli` is installed and available on your system PATH.</p>
            </div>

            <div className="rounded-2xl border border-[#86b1b7] bg-[#edf6f7] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#50727a]">2. Install cores</p>
              <pre className="mt-3 rounded-xl bg-white p-3 font-mono text-[12px] text-[#214149]">arduino-cli core install arduino:avr{'\n'}arduino-cli core install esp32:esp32</pre>
              <p className="mt-3 text-xs leading-5 text-[#5f7a82]">Add the AVR and ESP32 board packages you want the Robotix IDE to support.</p>
            </div>

            <div className="rounded-2xl border border-[#86b1b7] bg-[#edf6f7] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#50727a]">3. Plug a board in</p>
              <pre className="mt-3 rounded-xl bg-white p-3 font-mono text-[12px] text-[#214149]">arduino-cli board list</pre>
              <p className="mt-3 text-xs leading-5 text-[#5f7a82]">Once your board appears there, the Robotix IDE should surface it in the classic Arduino upload toolbar.</p>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#86b1b7] bg-[#edf6f7] p-6 shadow-[0_18px_40px_rgba(32,57,62,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#50727a]">Detected Boards</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#214149]">Local bridge board scan</h2>
              </div>
              <div className="text-xs text-[#5f7a82]">{boards.length} board{boards.length === 1 ? '' : 's'} detected</div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {boards.length > 0 ? boards.map((board) => (
                <div key={`${board.port}-${board.fqbn || 'unknown'}`} className="rounded-2xl border border-[#c6dbde] bg-white p-4">
                  <p className="text-sm font-semibold text-[#214149]">{board.label}</p>
                  <p className="mt-1 text-xs text-[#0f666d]">{board.port}</p>
                  <p className="mt-2 text-xs leading-5 text-[#5f7a82]">
                    {board.fqbn || 'No FQBN detected yet'}
                    {board.protocol ? ` • ${board.protocol}` : ''}
                  </p>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-[#c6dbde] bg-white p-5 text-sm text-[#5f7a82]">
                  No boards detected yet. Start the bridge, connect a board, and refresh this page.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
