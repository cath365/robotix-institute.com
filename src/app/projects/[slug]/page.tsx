'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, EmptyState, GlassCard, LoadingSpinner, Section } from '@/components/ui';
import { creatorPipelines } from '@/lib/ecosystem-data';
import { getSchoolProjectBySlug } from '@/lib/school-projects';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CircuitBoard,
  Code2,
  Cpu,
  Eye,
  Github,
  Heart,
  Share2,
  Sparkles,
  Video,
  Wrench,
} from 'lucide-react';

interface RobotProjectDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  components: string[] | string;
  circuitUrl?: string;
  sourceCode?: string;
  tutorialMd?: string;
  videoUrl?: string;
  thumbnail?: string;
  category: string;
  difficulty: string;
  likes: number;
  views: number;
  createdAt: string;
  schoolName?: string;
  periodLabel?: string;
  projectFocus?: string;
  learningOutcomes?: string[];
  evidence?: string[];
  sourceLinks?: Array<{ label: string; href: string }>;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
  };
}

function isLikelyUrl(value?: string) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<RobotProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const load = async () => {
      let loaded = false;
      try {
        const res = await fetch(`/api/projects/${params.slug}`);
        const data = await res.json();
        if (res.ok && data.data) {
          setProject(data.data);
          loaded = true;
        }
      } catch {
        // ignore
      }

      if (!loaded) {
        const fallbackProject = getSchoolProjectBySlug(params.slug);
        if (fallbackProject) {
          setProject({
            id: fallbackProject.id,
            title: fallbackProject.title,
            slug: fallbackProject.slug,
            description: fallbackProject.description,
            components: fallbackProject.components,
            tutorialMd: fallbackProject.story.join('\n\n'),
            thumbnail: fallbackProject.imageSrc,
            category: fallbackProject.category,
            difficulty: fallbackProject.difficulty,
            likes: 0,
            views: 0,
            createdAt: fallbackProject.createdAt,
            schoolName: fallbackProject.schoolName,
            periodLabel: fallbackProject.periodLabel,
            projectFocus: fallbackProject.projectFocus,
            learningOutcomes: fallbackProject.learningOutcomes,
            evidence: fallbackProject.evidence,
            sourceLinks: fallbackProject.sourceLinks,
          });
        }
      }

      setLoading(false);
    };
    load();
  }, [params.slug]);

  const components = useMemo(() => {
    if (!project) return [] as string[];
    if (Array.isArray(project.components)) return project.components;
    try {
      return JSON.parse(project.components);
    } catch {
      return [];
    }
  }, [project]);

  const handleLike = async () => {
    if (!project) return;
    setLiking(true);
    try {
      const res = await fetch(`/api/projects/${project.slug}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.data?.likes != null) {
        setProject({ ...project, likes: data.data.likes });
        toast.success('Project liked');
      } else if (res.status === 401) {
        toast.error('Please sign in to like projects');
      }
    } catch {
      toast.error('Could not like project');
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: project?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch {
      // ignored
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-dark">
        <Navbar />
        <div className="pt-32"><LoadingSpinner size="lg" /></div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-brand-dark">
        <Navbar />
        <Section className="pt-28">
          <EmptyState
            icon={<Cpu className="w-8 h-8" />}
            title="Project not found"
            description="This project may have been removed or never existed."
            action={<Link href="/projects"><Button>Browse Projects</Button></Link>}
          />
        </Section>
        <Footer />
      </main>
    );
  }

  const sourceIsUrl = isLikelyUrl(project.sourceCode);

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <Link href="/projects" className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All Projects
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="primary">{project.category}</Badge>
                <Badge variant={project.difficulty === 'beginner' ? 'success' : project.difficulty === 'advanced' ? 'danger' : 'accent'}>
                  {project.difficulty}
                </Badge>
                {project.schoolName ? <Badge variant="accent">{project.schoolName}</Badge> : null}
              </div>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">{project.title}</h1>
              <p className="mt-4 max-w-3xl text-lg text-white/65">{project.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/50">
                {project.user ? (
                  <span className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary text-xs font-bold text-white">
                      {project.user.firstName.charAt(0)}{project.user.lastName.charAt(0)}
                    </div>
                    {project.user.firstName} {project.user.lastName}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {project.views}</span>
                <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {project.likes}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(project.createdAt).toLocaleDateString()}</span>
                {project.periodLabel ? <span>{project.periodLabel}</span> : null}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {!project.schoolName ? (
                  <Button onClick={handleLike} loading={liking} icon={<Heart className="h-4 w-4" />}>Like project</Button>
                ) : null}
                <Button variant="secondary" onClick={handleShare} icon={<Share2 className="h-4 w-4" />}>Share build</Button>
                {sourceIsUrl ? (
                  <a href={project.sourceCode} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" icon={<Github className="h-4 w-4" />}>Source</Button>
                  </a>
                ) : null}
                {project.videoUrl ? (
                  <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" icon={<Video className="h-4 w-4" />}>Watch video</Button>
                  </a>
                ) : null}
              </div>
            </motion.div>

            <GlassCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Components', value: components.length.toString() },
                  { label: project.schoolName ? 'School' : 'Views', value: project.schoolName ?? project.views.toLocaleString() },
                  { label: project.schoolName ? 'Focus' : 'Likes', value: project.projectFocus ?? project.likes.toLocaleString() },
                  { label: 'Publishing routes', value: creatorPipelines.length.toString() },
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

      {project.thumbnail ? (
        <Section className="py-4">
          <div className="overflow-hidden rounded-[28px] border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.thumbnail} alt={project.title} className="w-full object-cover" />
          </div>
        </Section>
      ) : null}

      <Section className="py-8">
        <div className="grid gap-5 lg:grid-cols-4">
          {[
            { title: 'Build context', text: 'Position this system as a real-world robotics or innovation response, not just a class assignment.', icon: Sparkles },
            { title: 'Hardware depth', text: 'Surface components, wiring assumptions, and reproducible steps for other builders.', icon: CircuitBoard },
            { title: 'Code clarity', text: 'Make the source understandable enough for iteration, remixing, and future school deployment.', icon: Code2 },
            { title: 'Shareability', text: 'Publish into community, portfolios, media, and creator showcases from one identity layer.', icon: ArrowRight },
          ].map((item) => (
            <GlassCard key={item.title} className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="mb-3 flex items-center gap-2 font-heading text-2xl font-bold">
                <BookOpen className="h-5 w-5 text-brand-accent" /> About this project
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-white/70">{project.description}</p>
            </GlassCard>

            {project.learningOutcomes?.length ? (
              <GlassCard className="p-6">
                <h2 className="mb-3 flex items-center gap-2 font-heading text-2xl font-bold">
                  <Sparkles className="h-5 w-5 text-brand-accent" /> What students learned
                </h2>
                <div className="space-y-3">
                  {project.learningOutcomes.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/70">
                      {item}
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : null}

            {project.evidence?.length ? (
              <GlassCard className="p-6">
                <h2 className="mb-3 flex items-center gap-2 font-heading text-2xl font-bold">
                  <CircuitBoard className="h-5 w-5 text-brand-accent" /> Public evidence
                </h2>
                <div className="space-y-3">
                  {project.evidence.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/70">
                      {item}
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : null}

            {project.tutorialMd ? (
              <GlassCard className="p-6">
                <h2 className="mb-3 flex items-center gap-2 font-heading text-2xl font-bold">
                  <Code2 className="h-5 w-5 text-brand-accent" /> Build notes and tutorial
                </h2>
                <div className="whitespace-pre-wrap text-sm leading-7 text-white/70">{project.tutorialMd}</div>
              </GlassCard>
            ) : null}

            {project.sourceCode && !sourceIsUrl ? (
              <GlassCard className="p-6">
                <h2 className="mb-3 flex items-center gap-2 font-heading text-2xl font-bold">
                  <Github className="h-5 w-5 text-brand-accent" /> Source preview
                </h2>
                <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/25 p-4 text-xs leading-6 text-white/80">
                  {project.sourceCode}
                </pre>
              </GlassCard>
            ) : null}
          </div>

          <aside className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-bold">
                <Wrench className="h-5 w-5 text-brand-accent" /> Components
              </h2>
              <div className="space-y-2">
                {components.length === 0 ? (
                  <p className="text-sm text-white/40">No components listed.</p>
                ) : components.map((component: string) => (
                  <div key={component} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/68">
                    {component}
                  </div>
                ))}
              </div>
            </GlassCard>

            {project.circuitUrl ? (
              <GlassCard className="p-6">
                <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-bold">
                  <CircuitBoard className="h-5 w-5 text-brand-accent" /> Wiring and circuit
                </h2>
                <a href={project.circuitUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="w-full">Open diagram</Button>
                </a>
              </GlassCard>
            ) : null}

            {project.sourceLinks?.length ? (
              <GlassCard className="p-6">
                <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-bold">
                  <BookOpen className="h-5 w-5 text-brand-accent" /> Source references
                </h2>
                <div className="space-y-3">
                  {project.sourceLinks.map((source) => (
                    <a
                      key={source.href}
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      {source.label}
                    </a>
                  ))}
                </div>
              </GlassCard>
            ) : null}

            <GlassCard className="p-6">
              <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-bold">
                <Sparkles className="h-5 w-5 text-brand-accent" /> Publish next
              </h2>
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

      <Footer />
    </main>
  );
}
