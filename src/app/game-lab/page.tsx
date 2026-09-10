'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge, Button, EmptyState, LoadingSpinner } from '@/components/ui';
import { useApi, useAuth } from '@/hooks/useApi';
import { GAME_LAB_STARTER_CODE } from '@/constants/game-lab-template';
import { createDefaultGameBuilderConfig, createGameBuilderProject, GAME_BUILDER_PRESETS } from '@/lib/game-builder';
import {
  ArrowRight,
  ExternalLink,
  Gamepad2,
  Layers,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface GP {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  updatedAt: string;
  playCount: number;
}

const statusColor: Record<string, 'accent' | 'success' | 'danger' | 'primary'> = {
  DRAFT: 'primary',
  PENDING: 'accent',
  PUBLISHED: 'success',
  REJECTED: 'danger',
};

export default function GameLabDashboardPage() {
  const { isAuthenticated } = useAuth();
  const { get, post, del } = useApi();
  const [items, setItems] = useState<GP[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await get<GP[]>('/game-projects?mine=1&limit=50', { requireAuth: true });
      const raw = (res as { data?: GP[]; items?: GP[] }).data ?? (res as { items?: GP[] }).items ?? [];
      setItems(Array.isArray(raw) ? raw : []);
    } catch {
      toast.error('Could not load your PlayVerse projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void load();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createProject = async ({
    title,
    description,
    code,
    tags,
    templateId,
  }: {
    title: string;
    description: string;
    code: string;
    tags: string;
    templateId?: string;
  }) => {
    setCreating(true);
    try {
      const res = await post<{ slug: string }>('/game-projects', {
        title,
        description,
        code,
        tags,
        templateId,
      }, { requireAuth: true });

      if ((res as { success?: boolean }).success !== false && (res.data as { slug?: string })?.slug) {
        toast.success('New PlayVerse project created');
        window.location.href = `/game-lab/${(res.data as { slug: string }).slug}`;
      }
    } catch {
      toast.error('Create failed - are you logged in?');
    } finally {
      setCreating(false);
    }
  };

  const handleNew = async () => {
    await createProject({
      title: `PlayVerse Prototype ${new Date().toLocaleDateString()}`,
      description: '',
      code: GAME_LAB_STARTER_CODE,
      tags: '',
    });
  };

  const handleCreatePreset = async (presetId: (typeof GAME_BUILDER_PRESETS)[number]['id']) => {
    const presetProject = createGameBuilderProject(createDefaultGameBuilderConfig(presetId));
    await createProject({
      title: presetProject.title,
      description: presetProject.description,
      code: presetProject.code,
      tags: presetProject.tags,
      templateId: presetProject.templateId,
    });
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-brand-dark text-white">
        <Navbar />
        <Section className="pt-32">
          <EmptyState
            icon={<Gamepad2 className="h-10 w-10" />}
            title="PlayVerse Studio"
            description="Build immersive STEM games with Phaser.js, publish them to the PlayVerse, and earn creator status inside the Robotix ecosystem."
            action={<Link href="/login?next=/game-lab"><Button>Sign in to enter the studio</Button></Link>}
          />
        </Section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/10 pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <Gamepad2 className="mr-1 h-3 w-3" />
                PlayVerse Studio
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                Build publishable STEM games inside the Robotix universe.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                This is the game-creation layer of the ecosystem: prototypes, challenges, educational gameplay, and moderated publishing workflows in one futuristic creator surface.
              </p>
            </div>

            <GlassCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Projects', value: items.length.toString() },
                  { label: 'Publishing flow', value: 'Moderated' },
                  { label: 'Gameplay engine', value: 'Phaser.js' },
                  { label: 'Creator mode', value: 'Active' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/40">{item.label}</div>
                    <div className="mt-3 text-2xl font-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/play">
              <Button variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>Enter PlayVerse</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" icon={<Layers className="h-4 w-4" />}>Open identity dashboard</Button>
            </Link>
            <Link href="/game-gallery">
              <Button variant="ghost" icon={<ExternalLink className="h-4 w-4" />}>Public gallery</Button>
            </Link>
            <Button onClick={handleNew} loading={creating} icon={<Plus className="h-4 w-4" />}>New prototype</Button>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="mb-8">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge variant="accent" className="mb-3">
                <Sparkles className="mr-1 h-3 w-3" />
                Guided starters
              </Badge>
              <h2 className="font-heading text-3xl font-semibold text-white">Start with a Code.org-style game creator</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Each starter opens a working game with movement, scoring, objectives, and a live preview already wired up. Students can tweak the idea visually first, then continue editing the code.
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {GAME_BUILDER_PRESETS.map((preset) => (
              <GlassCard key={preset.id} className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="accent" className="mb-3">Guided starter</Badge>
                    <h3 className="font-heading text-xl font-semibold text-white">{preset.name}</h3>
                  </div>
                  <Badge variant="primary">{preset.id}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/60">{preset.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/36">{preset.helper}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {preset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-6">
                  <Button onClick={() => handleCreatePreset(preset.id)} loading={creating} icon={<Sparkles className="h-4 w-4" />}>
                    Create {preset.name}
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {loading ? <LoadingSpinner /> : items.length === 0 ? (
          <EmptyState
            icon={<Gamepad2 className="h-8 w-8" />}
            title="No PlayVerse projects yet"
            description="Start with a new prototype or a guided starter to enter the Robotix game creation pipeline."
            action={<Button onClick={handleNew} loading={creating} icon={<Plus className="h-4 w-4" />}>Create first prototype</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((g) => (
              <GlassCard key={g.id} className="flex flex-col gap-0 overflow-hidden p-0">
                <div
                  className="min-h-[160px] border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(51,214,255,0.18),transparent_45%),linear-gradient(135deg,rgba(8,17,36,0.98),rgba(24,8,48,0.95))] bg-cover bg-center p-5"
                  style={g.thumbnail ? { backgroundImage: `linear-gradient(180deg, rgba(6,10,24,0.18), rgba(6,10,24,0.84)), url(${g.thumbnail})` } : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading font-semibold text-white">{g.title}</h3>
                      <p className="mt-1 text-xs text-white/70">/{g.slug}</p>
                    </div>
                    <Badge variant={statusColor[g.status]}>{g.status}</Badge>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <p className="text-sm text-white/58">{g.description || 'No description yet. Shape the concept and submit it when ready.'}</p>
                  <div className="text-xs text-white/38">Plays recorded: {g.playCount}</div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <Link href={`/game-lab/${g.slug}`}><Button size="sm">Edit and run</Button></Link>
                    {g.status === 'PUBLISHED' && (
                      <Link href={`/game-gallery?view=${g.slug}`} target="_blank">
                        <Button size="sm" variant="secondary">View live</Button>
                      </Link>
                    )}
                    {g.status !== 'PUBLISHED' && g.status !== 'PENDING' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash2 className="h-3 w-3" />}
                        onClick={async () => {
                          if (!confirm('Permanently delete this PlayVerse project?')) return;
                          try {
                            await del(`/game-projects/${g.slug}`, { requireAuth: true });
                            toast.success('Deleted');
                            await load();
                          } catch {
                            toast.error('Delete failed');
                          }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>

      <Section className="pb-24">
        <GlassCard className="flex items-start gap-4 p-6">
          <ShieldCheck className="h-6 w-6 shrink-0 text-brand-secondary" />
          <div>
            <h3 className="mb-2 font-heading text-xl font-semibold">Publishing workflow</h3>
            <p className="text-sm leading-6 text-white/62">
              Save your draft, then hit <Send className="inline h-3 w-3" /> submit for review. An administrator approves projects before they appear in the public PlayVerse gallery, helping the ecosystem stay safe, high quality, and creator-driven.
            </p>
          </div>
        </GlassCard>
      </Section>
      <Footer />
    </main>
  );
}
