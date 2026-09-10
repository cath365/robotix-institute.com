'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GlassCard, Badge, Button } from '@/components/ui';
import { useAuthStore } from '@/store';

interface Row {
  id: string;
  slug: string;
  title: string;
  user?: { firstName: string; lastName: string };
  status: string;
  createdAt: string;
}

export default function AdminGameLabQueue() {
  const token = useAuthStore((s) => s.token);
  const [pending, setPending] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game-projects?status=PENDING&limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      setPending(Array.isArray(j.data) ? j.data : []);
    } catch {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const decide = async (slug: string, approve: boolean, reason?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/game-projects/${slug}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approve,
          ...(approve ? {} : { reason: reason || 'Please adjust and resubmit.' }),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || j.error);
      toast.success(approve ? 'Published' : 'Rejected');
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-white text-lg">Game Lab moderation</h2>
          <Badge variant="accent">{pending.length} pending</Badge>
        </div>
        {loading ? <p className="text-white/40 text-sm">Loading…</p> : pending.length === 0 ? (
          <p className="text-white/40 text-sm">No submissions in the queue 🎉</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-medium text-white">{g.title}</p>
                  <p className="text-xs text-white/40">
                    {[g.user?.firstName, g.user?.lastName].filter(Boolean).join(' ') || 'Creator'} · slug{' '}
                    <code className="text-brand-accent">{g.slug}</code>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/game-lab/play/${g.slug}`} target="_blank">
                    <Button size="sm" variant="ghost">Preview</Button>
                  </Link>
                  <Button size="sm" variant="primary" onClick={() => decide(g.slug, true)}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => decide(g.slug, false)}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </section>
  );
}
