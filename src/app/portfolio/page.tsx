'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge, Button, Input, Textarea, ProgressBar, EmptyState, LoadingSpinner } from '@/components/ui';
import { useAuth, useApi } from '@/hooks/useApi';
import { creatorPipelines, familySignals, futureAfricaNodes } from '@/lib/ecosystem-data';
import {
  ArrowRight, Award, Code, Cpu, Trophy, Star, ExternalLink, Github,
  Linkedin, Globe, BookOpen, Zap, Plus,
  Edit3, Save, X, Sparkles, Image as ImageIcon, ShieldCheck, RadioTower, Compass
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'certificate' | 'achievement' | 'code';
  imageUrl?: string;
  linkUrl?: string;
  date: string;
}

interface PortfolioData {
  id: string;
  headline?: string;
  about?: string;
  skills: string[];
  website?: string;
  isPublic: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  };
  items: PortfolioItem[];
  stats: {
    certificates: number;
    codeProjects: number;
    robotProjects: number;
    achievements: number;
  };
}

const ITEM_TYPES = [
  { id: 'project', label: 'Project', icon: Cpu },
  { id: 'certificate', label: 'Certificate', icon: Award },
  { id: 'achievement', label: 'Achievement', icon: Trophy },
  { id: 'code', label: 'Code', icon: Code },
] as const;

export default function PortfolioPage() {
  const { user, isAuthenticated, token } = useAuth();
  const { get, post } = useApi();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  // Edit form state
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [website, setWebsite] = useState('');
  const [skillsText, setSkillsText] = useState('');

  // New item form state
  const [newItem, setNewItem] = useState({
    title: '', description: '', type: 'project' as PortfolioItem['type'], imageUrl: '', linkUrl: '',
  });

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const res = await get<{ portfolio?: PortfolioData; canCreate?: boolean } | PortfolioData>('/portfolio');
      const data = res.data as any;
      if (data?.portfolio === null) {
        setCanCreate(true);
        setPortfolio(null);
      } else {
        setPortfolio(data);
        setHeadline(data?.headline || '');
        setAbout(data?.about || '');
        setWebsite(data?.website || '');
        setSkillsText((data?.skills || []).join(', '));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, get]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      const res = await post('/portfolio', {
        headline,
        about,
        website,
        skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      });
      if (res.success) {
        toast.success('Portfolio saved');
        setEditing(false);
        await load();
      }
    } catch (e: any) {
      toast.error(e?.message || 'Could not save');
    }
  };

  const handleAddItem = async () => {
    if (!portfolio) return;
    if (!newItem.title || !newItem.description) {
      toast.error('Please add a title and description');
      return;
    }
    try {
      const res = await fetch('/api/portfolio/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          title: newItem.title,
          description: newItem.description,
          type: newItem.type,
          ...(newItem.imageUrl ? { imageUrl: newItem.imageUrl } : {}),
          ...(newItem.linkUrl ? { linkUrl: newItem.linkUrl } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Project added to portfolio');
        setAdding(false);
        setNewItem({ title: '', description: '', type: 'project', imageUrl: '', linkUrl: '' });
        await load();
      } else {
        throw new Error(data?.message || data?.error || 'Failed to add');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Could not add item');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="bg-brand-dark min-h-screen">
        <Navbar />
        <Section className="pt-32">
          <EmptyState
            icon={<Sparkles className="w-8 h-8" />}
            title="Build your robotics portfolio"
            description="Showcase your projects, certificates and achievements. Sign in to get started."
            action={<Link href="/login"><Button>Sign In</Button></Link>}
          />
        </Section>
        <Footer />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="bg-brand-dark min-h-screen">
        <Navbar />
        <div className="pt-32"><LoadingSpinner size="lg" /></div>
      </main>
    );
  }

  // First-time experience
  if (!portfolio && canCreate) {
    return (
      <main className="bg-brand-dark min-h-screen">
        <Navbar />
        <Section className="pt-28">
          <GlassCard className="p-10 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-white mb-3">
              Create your portfolio
            </h1>
            <p className="text-white/60 mb-6">
              A public profile to showcase the robots you&apos;ve built, the courses
              you&apos;ve completed, and the awards you&apos;ve earned. It takes 30 seconds.
            </p>
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={async () => {
                try {
                  await post('/portfolio', { headline: '', about: '', skills: [], isPublic: true });
                  toast.success('Portfolio created!');
                  await load();
                } catch (e: any) {
                  toast.error(e?.message || 'Could not create');
                }
              }}
            >
              Create My Portfolio
            </Button>
          </GlassCard>
        </Section>
        <Footer />
      </main>
    );
  }

  if (!portfolio) {
    return (
      <main className="bg-brand-dark min-h-screen">
        <Navbar />
        <Section className="pt-28">
          <EmptyState
            icon={<Sparkles className="w-8 h-8" />}
            title="Portfolio unavailable"
            description="We couldn't load your portfolio right now."
          />
        </Section>
        <Footer />
      </main>
    );
  }

  const fullName = `${portfolio.user.firstName} ${portfolio.user.lastName}`;
  const initials = `${portfolio.user.firstName.charAt(0)}${portfolio.user.lastName.charAt(0)}`;
  const creatorSignal = Math.min(
    100,
    portfolio.items.length * 14 +
    portfolio.stats.achievements * 8 +
    portfolio.stats.codeProjects * 6 +
    portfolio.stats.robotProjects * 7
  );

  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />

      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="circuit-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-3xl font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-bold text-white">{fullName}</h1>
                {portfolio.isPublic && <Badge variant="success">Public</Badge>}
                <Button size="sm" variant="ghost" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setEditing(!editing)}>
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              {portfolio.headline && (
                <p className="text-brand-accent font-medium mb-1">{portfolio.headline}</p>
              )}
              {portfolio.about && (
                <p className="text-white/60 max-w-2xl mb-4">{portfolio.about}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {portfolio.user.githubUrl && (
                  <a href={portfolio.user.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {portfolio.user.linkedinUrl && (
                  <a href={portfolio.user.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {portfolio.website && (
                  <a href={portfolio.website} target="_blank" rel="noreferrer" aria-label="Website" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <GlassCard className="p-6 space-y-4">
                  <Input label="Headline" placeholder="e.g. Robotics Engineer & IoT Developer" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                  <Textarea label="About" placeholder="Tell visitors about you, your interests, projects you love..." value={about} onChange={(e) => setAbout(e.target.value)} />
                  <Input label="Website (optional)" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
                  <Input label="Skills (comma-separated)" placeholder="Arduino, Python, ESP32, IoT" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} icon={<Save className="w-4 h-4" />}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Section className="py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Cpu, label: 'Robot Projects', value: portfolio.stats.robotProjects, color: 'from-blue-500 to-purple-500' },
            { icon: Code, label: 'Code Projects', value: portfolio.stats.codeProjects, color: 'from-green-500 to-emerald-500' },
            { icon: Award, label: 'Certificates', value: portfolio.stats.certificates, color: 'from-yellow-500 to-orange-500' },
            { icon: Trophy, label: 'Achievements', value: portfolio.stats.achievements, color: 'from-pink-500 to-red-500' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="py-8 grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-accent" /> Skills
            </h3>
            {portfolio.skills.length === 0 ? (
              <p className="text-xs text-white/40">Add skills via Edit ↑</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {portfolio.skills.map((s) => (
                  <li key={s}>
                    <Badge variant="primary">{s}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent" /> Identity signal
            </h3>
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/40">
                  <span>Creator visibility</span>
                  <span>{creatorSignal}%</span>
                </div>
                <ProgressBar value={creatorSignal} className="mt-3" />
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/58">
                This portfolio now behaves more like an innovation identity surface than a static student profile.
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-accent" /> Parent and mentor view
            </h3>
            <div className="space-y-3">
              {familySignals.map((signal) => (
                <div key={signal.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-medium text-white">{signal.title}</p>
                  <p className="mt-2 text-xs leading-5 text-white/52">{signal.detail}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-accent" /> My Items
            </h2>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAdding(!adding)}>
              {adding ? 'Cancel' : 'Add Item'}
            </Button>
          </div>

          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard className="p-6 mb-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Title" placeholder="e.g. Smart Farm Monitor" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-white/70">Type</label>
                      <select
                        value={newItem.type}
                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value as PortfolioItem['type'] })}
                        className="input-field"
                      >
                        {ITEM_TYPES.map((t) => (
                          <option key={t.id} value={t.id} className="bg-brand-dark">{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Textarea label="Description" placeholder="What makes this project interesting?" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="mt-3" />
                  <div className="grid sm:grid-cols-2 gap-4 mt-3">
                    <Input label="Image URL (optional)" placeholder="https://..." value={newItem.imageUrl} onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })} icon={<ImageIcon className="w-4 h-4" />} />
                    <Input label="Link (optional)" placeholder="https://github.com/..." value={newItem.linkUrl} onChange={(e) => setNewItem({ ...newItem, linkUrl: e.target.value })} icon={<ExternalLink className="w-4 h-4" />} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddItem} icon={<Save className="w-4 h-4" />}>Save Item</Button>
                    <Button variant="ghost" onClick={() => setAdding(false)} icon={<X className="w-4 h-4" />}>Cancel</Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {portfolio.items.length === 0 ? (
            <EmptyState
              icon={<Plus className="w-8 h-8" />}
              title="No items yet"
              description="Add your first project, certificate, or achievement to start building your portfolio."
              action={<Button onClick={() => setAdding(true)} icon={<Plus className="w-4 h-4" />}>Add Item</Button>}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {portfolio.items.map((p, i) => {
                const Type = ITEM_TYPES.find((t) => t.id === p.type)?.icon || Cpu;
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <GlassCard hover className="p-5 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="primary" className="capitalize">{p.type}</Badge>
                        <span className="text-xs text-white/30">{new Date(p.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Type className="w-4 h-4 text-brand-accent" />
                        <h4 className="font-heading font-semibold text-white">{p.title}</h4>
                      </div>
                      <p className="text-xs text-white/50 mb-3 flex-1">{p.description}</p>
                      {p.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.title} className="w-full h-32 object-cover rounded-lg mb-3" loading="lazy" />
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                        <span className="text-xs text-white/30 flex items-center gap-1">
                          <Star className="w-3 h-3" /> Portfolio
                        </span>
                        {p.linkUrl ? (
                          <a href={p.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-accent flex items-center gap-1 hover:text-brand-accent-light">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-white/20">No link</span>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <RadioTower className="h-5 w-5 text-brand-accent" />
              <h2 className="font-heading text-2xl font-bold text-white">Creator publishing pipeline</h2>
            </div>
            <div className="space-y-3">
              {creatorPipelines.map((pipeline) => (
                <a
                  key={pipeline.title}
                  href={pipeline.destination}
                  className="block rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{pipeline.title}</p>
                    <ArrowRight className="h-4 w-4 text-brand-accent" />
                  </div>
                  <p className="mt-2 text-sm text-white/58">{pipeline.detail}</p>
                </a>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-brand-accent" />
              <h2 className="font-heading text-2xl font-bold text-white">Future Africa visibility</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {futureAfricaNodes.slice(0, 4).map((node) => (
                <div key={`${node.city}-${node.country}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-secondary">{node.status}</p>
                  <p className="mt-2 font-semibold text-white">{node.city}, {node.country}</p>
                  <p className="mt-2 text-sm text-white/58">{node.focus}</p>
                  <p className="mt-3 text-xs text-white/40">{node.signal}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-white/55">
              Your portfolio can eventually become the visible proof layer for work shared across schools, community, media, and ecosystem showcases.
            </p>
          </GlassCard>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
