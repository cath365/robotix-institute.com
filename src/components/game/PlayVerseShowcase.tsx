'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Flame, Play, Sparkles, Stars, Trophy } from 'lucide-react';
import { Badge, Button, GlassCard } from '@/components/ui';

type ShelfMode = 'popular' | 'trending' | 'recent';

interface ShowcaseGame {
  id: string;
  slug: string;
  title: string;
  description?: string;
  tags?: string;
  thumbnail?: string | null;
  playCount: number;
  likeCount?: number;
}

const SHELF_OPTIONS: { id: ShelfMode; label: string; icon: typeof Trophy; helper: string }[] = [
  { id: 'popular', label: 'Featured', icon: Sparkles, helper: 'Most liked creator releases' },
  { id: 'trending', label: 'Trending', icon: Flame, helper: 'Most played right now' },
  { id: 'recent', label: 'New', icon: Stars, helper: 'Freshly published games' },
];

const posterThemes = [
  'bg-[radial-gradient(circle_at_top_left,rgba(51,214,255,0.22),transparent_45%),linear-gradient(135deg,rgba(8,17,36,0.98),rgba(24,8,48,0.95))]',
  'bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_45%),linear-gradient(135deg,rgba(12,20,36,0.98),rgba(5,41,49,0.96))]',
  'bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.18),transparent_45%),linear-gradient(135deg,rgba(21,10,45,0.96),rgba(4,27,45,0.92))]',
];

function posterTheme(index: number) {
  return posterThemes[index % posterThemes.length];
}

export function PlayVerseShowcase() {
  const [activeShelf, setActiveShelf] = useState<ShelfMode>('popular');
  const [gamesByShelf, setGamesByShelf] = useState<Record<ShelfMode, ShowcaseGame[]>>({
    popular: [],
    trending: [],
    recent: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShelves = async () => {
      setLoading(true);
      try {
        const [popularRes, trendingRes, recentRes] = await Promise.all([
          fetch('/api/game-projects?sort=popular&limit=8'),
          fetch('/api/game-projects?sort=trending&limit=8'),
          fetch('/api/game-projects?sort=recent&limit=8'),
        ]);
        const [popularJson, trendingJson, recentJson] = await Promise.all([
          popularRes.json(),
          trendingRes.json(),
          recentRes.json(),
        ]);
        setGamesByShelf({
          popular: Array.isArray(popularJson?.data) ? popularJson.data : [],
          trending: Array.isArray(trendingJson?.data) ? trendingJson.data : [],
          recent: Array.isArray(recentJson?.data) ? recentJson.data : [],
        });
      } catch {
        setGamesByShelf({ popular: [], trending: [], recent: [] });
      } finally {
        setLoading(false);
      }
    };

    loadShelves();
  }, []);

  const activeGames = useMemo(() => gamesByShelf[activeShelf] || [], [activeShelf, gamesByShelf]);
  const activeMeta = useMemo(
    () => SHELF_OPTIONS.find((item) => item.id === activeShelf) || SHELF_OPTIONS[0],
    [activeShelf]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="accent" className="mb-3">Live PlayVerse Shelf</Badge>
          <h3 className="font-heading text-3xl font-bold text-white">Featured, trending, and brand-new games from Robotix creators.</h3>
          <p className="mt-3 max-w-3xl text-white/62">
            This carousel merchandises published PlayVerse releases like a real browser arcade while keeping every click inside the Robotix universe.
          </p>
        </div>
        <Link href="/game-gallery">
          <Button variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>Open full gallery</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {SHELF_OPTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveShelf(item.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                activeShelf === item.id
                  ? 'border-brand-secondary/40 bg-brand-secondary/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/58 hover:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">{activeMeta.label} shelf</div>
            <p className="mt-1 text-xs text-white/48">{activeMeta.helper}</p>
          </div>
          <Badge variant="primary">{activeGames.length} releases</Badge>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="min-h-[280px] rounded-[1.5rem] border border-white/10 bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : activeGames.length === 0 ? (
          <GlassCard className="p-6 text-sm text-white/55">
            No published games are available on this shelf yet. Once creators publish, they will show up here automatically.
          </GlassCard>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {activeGames.map((game, index) => (
              <Link key={game.id} href={`/game-lab/play/${game.slug}`} className="min-w-[286px] max-w-[286px] shrink-0">
                <GlassCard className="flex h-full flex-col overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1">
                  <div
                    className={`relative min-h-[215px] border-b border-white/10 p-5 ${game.thumbnail ? '' : posterTheme(index)}`}
                    style={game.thumbnail ? {
                      backgroundImage: `linear-gradient(180deg, rgba(6,10,24,0.18), rgba(6,10,24,0.84)), url(${game.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } : undefined}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(4,7,18,0.28)_55%,rgba(4,7,18,0.78))]" />
                    <div className="relative flex h-full min-h-[175px] flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <Badge variant="accent" className="border-white/10 bg-black/20 text-white">Play on Robotix</Badge>
                        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/78">
                          {game.playCount.toLocaleString()} plays
                        </div>
                      </div>
                      <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/72">
                          <Play className="h-3 w-3" />
                          Launch release
                        </div>
                        <h4 className="font-heading text-2xl font-bold text-white">{game.title}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex-1 text-sm leading-6 text-white/58">
                      {game.description || 'A creator-built PlayVerse release ready to play inside Robotix.'}
                    </p>
                    {game.tags ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {game.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/54">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-5 flex items-center justify-between text-xs text-white/42">
                      <span>{(game.likeCount || 0).toLocaleString()} likes</span>
                      <span className="inline-flex items-center gap-1 text-brand-secondary">
                        Play now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
