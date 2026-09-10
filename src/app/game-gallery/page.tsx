'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, EmptyState, GlassCard, Input, LoadingSpinner, Section } from '@/components/ui';
import { useAuth } from '@/hooks/useApi';
import {
  ArrowRight,
  Crown,
  Gamepad2,
  Heart,
  Play,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';

interface GalleryCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string;
  thumbnail?: string;
  playCount: number;
  likeCount?: number;
  liked?: boolean;
  user?: { id: string; firstName: string; lastName: string };
}

const featuredTags = ['robotics', 'ai', 'coding', 'agriculture', 'multiplayer', 'scratch-style'];
const posterThemes = [
  'bg-[radial-gradient(circle_at_top_left,rgba(51,214,255,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(138,63,252,0.2),transparent_40%),linear-gradient(135deg,rgba(10,14,32,0.98),rgba(28,8,51,0.96))]',
  'bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_42%),linear-gradient(135deg,rgba(12,20,36,0.98),rgba(5,41,49,0.96))]',
  'bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_42%),linear-gradient(135deg,rgba(21,10,45,0.96),rgba(4,27,45,0.92))]',
];

function posterTheme(index: number) {
  return posterThemes[index % posterThemes.length];
}

function GalleryInner() {
  const params = useSearchParams();
  const focus = params?.get('view');
  const { token, isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'popular' | 'trending'>('trending');
  const [items, setItems] = useState<GalleryCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const url = `/api/game-projects?sort=${sort}&limit=24&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        const next = Array.isArray(json?.data) ? json.data : [];
        setItems(next);
      } catch {
        toast.error('Gallery load failed');
      } finally {
        setLoading(false);
      }
    };

    const id = setTimeout(load, query.trim() ? 300 : 0);
    return () => clearTimeout(id);
  }, [query, sort, token]);

  const creators = useMemo(() => {
    const names = items
      .map((item) => item.user ? `${item.user.firstName} ${item.user.lastName}` : null)
      .filter(Boolean);
    return new Set(names).size;
  }, [items]);

  const plays = useMemo(() => items.reduce((sum, item) => sum + (item.playCount || 0), 0), [items]);
  const likes = useMemo(() => items.reduce((sum, item) => sum + (item.likeCount || 0), 0), [items]);

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <Gamepad2 className="mr-1 h-3 w-3" />
                PlayVerse Creator Gallery
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                Published STEM games that feel like real creator releases.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                This gallery is the publishing face of PlayVerse: student games, experimental mechanics,
                STEM challenges, and creator-built worlds ready to play and share.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/game-lab">
                  <Button size="lg" icon={<Sparkles className="h-5 w-5" />}>Open PlayVerse Studio</Button>
                </Link>
                <Link href="/play">
                  <Button variant="secondary" size="lg" icon={<ArrowRight className="h-5 w-5" />}>Enter PlayVerse</Button>
                </Link>
              </div>
            </div>

            <GlassCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Published games', value: items.length.toString() },
                  { label: 'Creator accounts', value: creators.toString() },
                  { label: 'Total plays', value: plays.toLocaleString() },
                  { label: 'Total likes', value: likes.toLocaleString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/40">{item.label}</div>
                    <div className="mt-3 text-2xl font-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { title: 'STEM-ready mechanics', text: 'Games teach robotics, logic, AI, and engineering through play.', icon: Trophy },
            { title: 'Creator publishing', text: 'Students and builders can release polished projects into a visible gallery.', icon: Crown },
            { title: 'Discovery signals', text: 'Plays, likes, tags, and popularity make strong projects easier to find.', icon: Star },
            { title: 'Community crossover', text: 'Games can feed portfolios, community posts, and future competitions.', icon: Users },
          ].map((item) => (
            <GlassCard key={item.title} className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section className="py-4">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-xl">
            <Input
              placeholder="Search creator titles, tags, or themes..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['recent', 'popular', 'trending'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSort(mode)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  sort === mode
                    ? 'bg-brand-secondary text-white'
                    : 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white'
                }`}
              >
                {mode === 'popular' ? 'Most liked' : mode === 'trending' ? 'Popular this week' : 'Recent'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {featuredTags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/50">
              {tag}
            </span>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Gamepad2 className="w-8 h-8" />}
            title="No games published yet"
            description="Become the first published PlayVerse creator."
            action={
              isAuthenticated
                ? <Link href="/game-lab"><Button>Open studio</Button></Link>
                : <Link href="/register"><Button>Join Robotix</Button></Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <GlassCard className={`flex h-full flex-col overflow-hidden p-0 ${focus === game.slug ? 'ring-2 ring-brand-accent' : ''}`}>
                  <div
                    className={`relative min-h-[230px] border-b border-white/10 p-5 ${game.thumbnail ? '' : posterTheme(index)}`}
                    style={game.thumbnail ? {
                      backgroundImage: `linear-gradient(180deg, rgba(6,10,24,0.18), rgba(6,10,24,0.84)), url(${game.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } : undefined}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(4,7,18,0.28)_55%,rgba(4,7,18,0.78))]" />
                    <div className="relative flex h-full min-h-[190px] flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-[0_14px_28px_rgba(0,0,0,0.22)]">
                          <Gamepad2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right text-xs text-white/82">
                          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1">{game.playCount.toLocaleString()} plays</div>
                          <div className="mt-2 rounded-full border border-white/10 bg-black/20 px-3 py-1">{(game.likeCount || 0).toLocaleString()} likes</div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/72">
                          Popular this week
                        </div>
                        <h2 className="font-heading text-2xl font-bold text-white">{game.title}</h2>
                        <div className="mt-2 text-xs text-white/68">
                          By {game.user?.firstName || 'Robotix'} {game.user?.lastName ? `${game.user.lastName.charAt(0)}.` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full flex-col p-6">
                    <p className="flex-1 text-sm leading-6 text-white/58">{game.description || 'No description yet.'}</p>
                    {game.tags ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {game.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/54">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex items-center gap-4 text-xs text-white/42">
                        <span className="inline-flex items-center gap-1"><Play className="h-3 w-3" /> {game.playCount}</span>
                        <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {game.likeCount || 0}</span>
                      </div>
                      <Link href={`/game-lab/play/${game.slug}`}>
                        <Button size="sm" icon={<Play className="h-4 w-4" />}>Play now</Button>
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      <Footer />
    </main>
  );
}

export default function GameGalleryPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <GalleryInner />
    </Suspense>
  );
}
