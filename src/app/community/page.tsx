'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, GlassCard, Input, LoadingSpinner, Section, Textarea } from '@/components/ui';
import { creatorPipelines, futureAfricaNodes } from '@/lib/ecosystem-data';
import { useApi, useAuth } from '@/hooks/useApi';
import {
  ArrowRight,
  Bot,
  BookOpen,
  Briefcase,
  Flame,
  Globe2,
  Heart,
  MessageCircle,
  Plus,
  RadioTower,
  Search,
  Send,
  Shield,
  Sparkles,
  Sprout,
  Users,
  Wifi,
} from 'lucide-react';

const tabs = ['Channels', 'Signal Feed', 'Mentors'] as const;
type TabKey = (typeof tabs)[number];

interface CommunityCategory {
  id: string;
  name: string;
  description: string;
  postCount: number;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
  category?: { id: string; name: string };
  user?: { id: string; firstName: string; lastName: string; avatar?: string };
  _count?: { comments: number };
}

interface CommunityComment {
  id: string;
  content: string;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; role?: string };
}

const fallbackCategories: CommunityCategory[] = [
  { id: 'robotics', name: 'Robotics', description: 'Build logs, systems design, autonomous machines, and practical robotics exchange.', postCount: 482 },
  { id: 'ai', name: 'AI', description: 'Model ideas, copilots, automation systems, prompts, and practical learning pathways.', postCount: 316 },
  { id: 'coding', name: 'Coding', description: 'JavaScript, Python, Arduino, embedded logic, and debugging conversations.', postCount: 558 },
  { id: 'cybersecurity', name: 'Cybersecurity', description: 'Safer systems, digital responsibility, and practical security awareness.', postCount: 124 },
  { id: 'agriculture', name: 'Agriculture', description: 'Smart irrigation, field data, weather systems, and agricultural automation.', postCount: 204 },
  { id: 'drones', name: 'Drones', description: 'Flight missions, mapping, data capture, and autonomous aerial workflows.', postCount: 178 },
  { id: 'iot', name: 'IoT', description: 'Connected sensors, dashboards, monitoring, and realtime device ecosystems.', postCount: 290 },
  { id: 'innovation', name: 'Innovation', description: 'Future-of-Africa thinking, prototypes, and bold ecosystem ideas.', postCount: 246 },
  { id: 'startups', name: 'Startups', description: 'Founder journeys, pilots, validation loops, and product-building strategy.', postCount: 139 },
] as const;

const fallbackPosts: CommunityPost[] = [
  {
    id: 'post-1',
    title: 'How should a school robotics club turn student projects into real startup prototypes?',
    content: 'Looking for a school-friendly pipeline from club builds to real pilot-ready prototypes without losing student ownership.',
    createdAt: new Date().toISOString(),
    isPinned: true,
    category: { id: 'innovation', name: 'Innovation' },
    user: { id: 'u1', firstName: 'Founder', lastName: 'Circle' },
    _count: { comments: 37 },
  },
  {
    id: 'post-2',
    title: 'Best sensor stack for a smart irrigation pilot built for Zambian weather conditions',
    content: 'Trying to balance affordability, reliability, and low-power monitoring for a school-linked agriculture pilot.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: { id: 'agriculture', name: 'Agriculture' },
    user: { id: 'u2', firstName: 'AgriTech', lastName: 'Network' },
    _count: { comments: 28 },
  },
  {
    id: 'post-3',
    title: 'Can students build AI-powered robotics portfolios that feel like future LinkedIn profiles?',
    content: 'Exploring how portfolios, badges, and published prototypes can create a stronger innovation identity for learners.',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    isPinned: true,
    category: { id: 'ai', name: 'AI' },
    user: { id: 'u3', firstName: 'Portfolio', lastName: 'Lab' },
    _count: { comments: 19 },
  },
];

const mentorCircles = [
  {
    name: 'Robotics Systems Mentor',
    specialty: 'Controls, electronics, and club project architecture.',
    availability: 'Available',
  },
  {
    name: 'AI and Vision Mentor',
    specialty: 'Model ideas, practical computer vision, and AI pathway support.',
    availability: 'Available',
  },
  {
    name: 'Startup Catalyst Mentor',
    specialty: 'Validation, product framing, pitch flow, and pilot readiness.',
    availability: 'Limited',
  },
];

const categoryIcons: Record<string, typeof Bot> = {
  robotics: Bot,
  ai: Sparkles,
  coding: BookOpen,
  cybersecurity: Shield,
  agriculture: Sprout,
  drones: RadioTower,
  iot: Wifi,
  innovation: Globe2,
  startups: Briefcase,
};

export default function CommunityPage() {
  const { get, post } = useApi();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('Channels');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<CommunityCategory[]>(fallbackCategories);
  const [posts, setPosts] = useState<CommunityPost[]>(fallbackPosts);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>(fallbackPosts[0].id);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', categoryId: '' });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [categoryRes, postsRes] = await Promise.all([
          fetch('/api/forum/categories?limit=20').then((res) => res.json()).catch(() => null),
          fetch('/api/forum/posts?limit=12').then((res) => res.json()).catch(() => null),
        ]);
        if (cancelled) return;

        const liveCategories = Array.isArray(categoryRes?.data)
          ? categoryRes.data.map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description || `${item.name} conversations across the Robotix ecosystem.`,
              postCount: item.postCount || 0,
            }))
          : [];
        const livePosts = Array.isArray(postsRes?.data?.posts) ? postsRes.data.posts : [];

        if (liveCategories.length > 0) {
          setCategories(liveCategories);
          setNewPost((current) => ({ ...current, categoryId: current.categoryId || liveCategories[0].id }));
        }
        if (livePosts.length > 0) {
          setPosts(livePosts);
          setSelectedPostId(livePosts[0].id);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const selected = posts.find((post) => post.id === selectedPostId);
    if (!selected) {
      setComments([]);
      return;
    }
    if (selected.id.startsWith('post-')) {
      setComments([]);
      return;
    }
    const selectedId = selected.id;

    let cancelled = false;
    async function loadComments() {
      setCommentsLoading(true);
      try {
        const res = await fetch(`/api/forum/comments?postId=${selectedId}&limit=40`).then((response) => response.json()).catch(() => null);
        if (!cancelled) {
          setComments(Array.isArray(res?.data) ? res.data : []);
        }
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [posts, selectedPostId]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((item) =>
      item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
    );
  }, [categories, search]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.category?.name.toLowerCase().includes(query)
    );
  }, [posts, search]);

  const selectedPost = filteredPosts.find((post) => post.id === selectedPostId) || filteredPosts[0] || null;
  const liveCategoryOptions = categories.filter((category) => !fallbackCategories.some((fallback) => fallback.id === category.id));

  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to publish a community post.');
      return;
    }
    if (!newPost.categoryId) {
      toast.error('A live category is required before posting.');
      return;
    }

    setPosting(true);
    try {
      const res = await post<CommunityPost>('/forum/posts', newPost);
      if (res.data) {
        setPosts((current) => [res.data!, ...current]);
        setSelectedPostId(res.data.id);
        setNewPost({ title: '', content: '', categoryId: newPost.categoryId });
        setComposerOpen(false);
        setActiveTab('Signal Feed');
        toast.success('Post published to the community.');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Could not create post');
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async () => {
    if (!selectedPost || !isAuthenticated) {
      toast.error('Sign in to join the discussion.');
      return;
    }
    if (selectedPost.id.startsWith('post-')) {
      toast.error('Comments are only enabled for live forum posts.');
      return;
    }

    setCommenting(true);
    try {
      const res = await post<CommunityComment>('/forum/comments', {
        postId: selectedPost.id,
        content: newComment,
      });
      if (res.data) {
        setComments((current) => [...current, res.data!]);
        setPosts((current) =>
          current.map((post) =>
            post.id === selectedPost.id
              ? { ...post, _count: { comments: (post._count?.comments || 0) + 1 } }
              : post
          )
        );
        setNewComment('');
        toast.success('Comment posted.');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Could not post comment');
    } finally {
      setCommenting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <Users className="mr-1 h-3 w-3" />
                Creator Network
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                The social operating layer for Africa&apos;s future builders.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                Robotix Community is where robotics clubs, AI creators, schools, startups, and mentors
                publish work, exchange ideas, and turn momentum into visible innovation.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" icon={<Plus className="h-5 w-5" />} onClick={() => setComposerOpen((value) => !value)}>
                  {composerOpen ? 'Close composer' : 'Create discussion'}
                </Button>
                <Link href="/game-gallery">
                  <Button variant="secondary" size="lg" icon={<ArrowRight className="h-5 w-5" />}>Explore creator releases</Button>
                </Link>
              </div>
            </div>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-accent">Network signals</p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold">Alive, moderated, and creator-led.</h2>
                </div>
                <Flame className="h-6 w-6 text-brand-accent" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Channels', value: categories.length.toString() },
                  { label: 'Signal feed', value: `${posts.length}+` },
                  { label: 'Mentor circles', value: mentorCircles.length.toString() },
                  { label: 'Expansion nodes', value: futureAfricaNodes.length.toString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/40">{item.label}</div>
                    <div className="mt-3 text-2xl font-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {composerOpen ? (
            <div className="mt-8">
              <GlassCard className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-2xl font-bold">Publish a community thread</h2>
                    <p className="mt-1 text-sm text-white/55">Share an idea, question, project insight, or collaboration request.</p>
                  </div>
                  <Badge variant="primary">Live forum</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    value={newPost.title}
                    onChange={(event) => setNewPost((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Discussion title"
                  />
                  <select
                    value={newPost.categoryId}
                    onChange={(event) => setNewPost((current) => ({ ...current, categoryId: event.target.value }))}
                    className="input-field"
                  >
                    <option value="">Select live category</option>
                    {liveCategoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <Textarea
                  className="mt-4 min-h-[140px]"
                  value={newPost.content}
                  onChange={(event) => setNewPost((current) => ({ ...current, content: event.target.value }))}
                  placeholder="Describe the problem, the prototype, or the idea you want the ecosystem to respond to."
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={handleCreatePost} loading={posting} icon={<Send className="h-4 w-4" />}>
                    Publish thread
                  </Button>
                  <Button variant="ghost" onClick={() => setComposerOpen(false)}>Cancel</Button>
                </div>
                {liveCategoryOptions.length === 0 ? (
                  <p className="mt-3 text-xs text-white/40">Live posting will unlock once forum categories are available from the backend.</p>
                ) : null}
              </GlassCard>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-brand-accent text-brand-dark shadow-glow-accent'
                      : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-brand-accent/25 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-80">
              <Input
                placeholder="Search channels, posts, or ideas..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <Section className="py-16">
          <LoadingSpinner size="lg" />
        </Section>
      ) : null}

      {!loading && activeTab === 'Channels' ? (
        <Section className="py-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category, index) => {
              const key = category.name.toLowerCase();
              const Icon = categoryIcons[key] || Sparkles;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard hover className="group h-full p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-2xl bg-brand-accent/10 p-3 text-brand-accent">
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="primary">{category.postCount} posts</Badge>
                    </div>
                    <h3 className="mt-5 font-heading text-2xl font-semibold">{category.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/58">{category.description}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </Section>
      ) : null}

      {!loading && activeTab === 'Signal Feed' ? (
        <Section className="py-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <motion.button
                  type="button"
                  key={post.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedPostId(post.id)}
                  className="w-full text-left"
                >
                  <GlassCard className={`p-6 transition-all ${selectedPost?.id === post.id ? 'ring-2 ring-brand-accent' : ''}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      {post.isPinned ? <Badge variant="accent">Pinned</Badge> : null}
                      {post.category?.name ? <Badge variant="primary">{post.category.name}</Badge> : null}
                    </div>
                    <h2 className="mt-4 font-heading text-2xl font-bold">{post.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-white/58">{post.content}</p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
                      <div className="text-white/45">
                        {post.user?.firstName || 'Robotix'} {post.user?.lastName ? `${post.user.lastName.charAt(0)}.` : ''}
                      </div>
                      <div className="flex items-center gap-4 text-white/45">
                        <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post._count?.comments || 0}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.button>
              ))}
            </div>

            <aside className="space-y-5">
              <GlassCard className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-brand-accent" />
                  <h3 className="font-heading text-xl font-bold">Thread detail</h3>
                </div>
                {selectedPost ? (
                  <>
                    <h4 className="font-heading text-lg font-semibold text-white">{selectedPost.title}</h4>
                    <p className="mt-2 text-sm text-white/58">{selectedPost.content}</p>
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">Comments</p>
                        <span className="text-xs text-white/40">{comments.length} loaded</span>
                      </div>
                      {commentsLoading ? (
                        <LoadingSpinner />
                      ) : comments.length === 0 ? (
                        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/45">
                          {selectedPost.id.startsWith('post-')
                            ? 'This preview thread does not have live comments attached yet.'
                            : 'No comments yet. Start the conversation.'}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {comments.map((comment) => (
                            <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium text-white">
                                  {comment.user?.firstName || 'Community'} {comment.user?.lastName ? `${comment.user.lastName.charAt(0)}.` : ''}
                                </p>
                                <span className="text-xs text-white/40">{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-white/58">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Textarea
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                        placeholder="Reply to this thread..."
                        className="min-h-[110px]"
                      />
                      <div className="mt-3 flex gap-3">
                        <Button onClick={handleComment} loading={commenting} icon={<Send className="h-4 w-4" />}>
                          Post comment
                        </Button>
                        {!isAuthenticated ? <span className="self-center text-xs text-white/40">Sign in required</span> : null}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-white/45">Select a thread to view comments and join the discussion.</p>
                )}
              </GlassCard>

              <GlassCard className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-accent" />
                  <h3 className="font-heading text-xl font-bold">Publish next</h3>
                </div>
                <div className="space-y-3">
                  {creatorPipelines.map((pipeline) => (
                    <Link
                      key={pipeline.title}
                      href={pipeline.destination}
                      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      <p className="font-semibold text-white">{pipeline.title}</p>
                      <p className="mt-2">{pipeline.detail}</p>
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </aside>
          </div>
        </Section>
      ) : null}

      {!loading && activeTab === 'Mentors' ? (
        <Section className="py-8">
          <div className="grid gap-5 md:grid-cols-3">
            {mentorCircles.map((mentor) => (
              <GlassCard key={mentor.name} className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-brand-secondary/10 p-3 text-brand-secondary">
                    <Users className="h-6 w-6" />
                  </div>
                  <Badge variant={mentor.availability === 'Available' ? 'success' : 'accent'}>{mentor.availability}</Badge>
                </div>
                <h2 className="font-heading text-xl font-semibold">{mentor.name}</h2>
                <p className="mt-3 text-sm leading-6 text-white/58">{mentor.specialty}</p>
              </GlassCard>
            ))}
          </div>
        </Section>
      ) : null}

      <Footer />
    </main>
  );
}
