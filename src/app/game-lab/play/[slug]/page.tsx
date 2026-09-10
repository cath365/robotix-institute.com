'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { GameLabPreview } from '@/components/game-lab/GameLabPreview';
import { Badge, Button, GlassCard, LoadingSpinner, Section } from '@/components/ui';
import { useApi, useAuth } from '@/hooks/useApi';
import {
  ArrowLeft,
  Gamepad2,
  Heart,
  Play,
  Share2,
  Sparkles,
  User2,
} from 'lucide-react';

interface GameProjectPayload {
  id: string;
  slug: string;
  title: string;
  description?: string;
  code: string;
  tags?: string;
  playCount: number;
  likeCount: number;
  liked?: boolean;
  user?: { id: string; firstName: string; lastName: string; avatar?: string };
}

export default function GamePlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const { token, isAuthenticated } = useAuth();
  const { post } = useApi();
  const [game, setGame] = useState<GameProjectPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);

  const load = useCallback(async () => {
    try {
      const url = `/api/game-projects/${slug}?play=1`;
      const res = await fetch(url, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Unavailable');
      }
      setGame(json.data as GameProjectPayload);
      setErr(null);
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : 'Error');
      setGame(null);
    }
  }, [slug, token]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async () => {
    if (!game) return;
    if (!isAuthenticated) {
      toast.error('Sign in to like creator games.');
      return;
    }

    setLiking(true);
    try {
      const res = await post<{ liked: boolean; likeCount: number }>(`/game-projects/${slug}/like`, {});
      if (res.data) {
        setGame((current) => current ? { ...current, liked: res.data!.liked, likeCount: res.data!.likeCount } : current);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Could not update like');
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: game?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Game link copied');
      }
    } catch {
      // ignored
    }
  };

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link href="/game-gallery">
              <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>Gallery</Button>
            </Link>
            <Link href={`/game-lab/${slug}`}>
              <Button variant="ghost" size="sm">Edit in studio</Button>
            </Link>
          </div>

          {err ? (
            <GlassCard className="mx-auto max-w-lg p-8 text-center text-red-300">{err}</GlassCard>
          ) : game == null ? (
            <LoadingSpinner size="lg" />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <Badge variant="accent" className="mb-4">
                  <Gamepad2 className="mr-1 h-3 w-3" />
                  PlayVerse Release
                </Badge>
                <h1 className="font-heading text-4xl font-bold sm:text-5xl">{game.title}</h1>
                <p className="mt-4 max-w-2xl text-lg text-white/65">
                  {game.description || 'A published creator game built inside PlayVerse Studio.'}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/50">
                  <span className="inline-flex items-center gap-1"><Play className="h-4 w-4" /> {game.playCount.toLocaleString()} plays</span>
                  <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {game.likeCount.toLocaleString()} likes</span>
                  {game.user ? (
                    <span className="inline-flex items-center gap-2">
                      <User2 className="h-4 w-4" />
                      {game.user.firstName} {game.user.lastName}
                    </span>
                  ) : null}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={toggleLike} loading={liking} icon={<Heart className="h-4 w-4" />}>
                    {game.liked ? 'Unlike' : 'Like release'}
                  </Button>
                  <Button variant="secondary" onClick={handleShare} icon={<Share2 className="h-4 w-4" />}>Share</Button>
                </div>
                {game.tags ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {game.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/55">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <GlassCard className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Plays', value: game.playCount.toLocaleString() },
                    { label: 'Likes', value: game.likeCount.toLocaleString() },
                    { label: 'Creator mode', value: 'Published' },
                    { label: 'Surface', value: 'PlayVerse' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-white/40">{item.label}</div>
                      <div className="mt-3 text-2xl font-bold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </section>

      {game ? (
        <>
          <Section className="py-8">
            <div className="grid gap-4 lg:grid-cols-3">
              {[
                { title: 'Creator release', text: 'This game is a visible published artifact, not just an editor demo.' },
                { title: 'STEM play value', text: 'It can support learning, challenge design, and future creator identity.' },
                { title: 'Ecosystem crossover', text: 'Published releases can feed community, portfolios, and competitions.' },
              ].map((item) => (
                <GlassCard key={item.title} className="p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/58">{item.text}</p>
                </GlassCard>
              ))}
            </div>
          </Section>

          <Section className="py-4">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-brand-dark-surface">
              <div className="border-b border-white/10 px-5 py-4">
                <h2 className="font-heading text-2xl font-bold text-white">Play the release</h2>
              </div>
              <div className="p-3 sm:p-5">
                <GameLabPreview code={game.code} title={game.title} />
              </div>
            </div>
          </Section>
        </>
      ) : null}

      <Footer />
    </main>
  );
}
