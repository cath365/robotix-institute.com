'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge, Button, ProgressBar, LoadingSpinner, EmptyState } from '@/components/ui';
import { useAuth, useApi } from '@/hooks/useApi';
import { ArrowLeft, Map, Clock, Users, CheckCircle2, Circle, Rocket, BookOpen, Trophy } from 'lucide-react';

interface PathStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: string;
  duration: number;
  resourceUrl?: string;
}

interface PathDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  category: string;
  duration: number;
  thumbnail?: string;
  steps: PathStep[];
  _count: { enrollments: number };
  enrollment?: {
    id: string;
    currentStep: number;
    completed: boolean;
  } | null;
}

const stepIcon = {
  course: BookOpen,
  project: Rocket,
  quiz: CheckCircle2,
  challenge: Trophy,
} as const;

export default function PathDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { post } = useApi();
  const [path, setPath] = useState<PathDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/paths/${params.slug}`);
        const data = await res.json();
        if (res.ok && data.data) setPath(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.slug]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/paths/${params.slug}`)}`);
      return;
    }
    if (!path) return;
    setEnrolling(true);
    try {
      const res = await post('/paths/enroll', { learningPathId: path.id });
      if (res.success) {
        toast.success('Enrolled! Time to learn.');
        // Refresh state
        const refresh = await fetch(`/api/paths/${params.slug}`);
        const data = await refresh.json();
        if (data.data) setPath(data.data);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-brand-dark min-h-screen">
        <Navbar />
        <div className="pt-32"><LoadingSpinner size="lg" /></div>
      </main>
    );
  }

  if (!path) {
    return (
      <main className="bg-brand-dark min-h-screen">
        <Navbar />
        <Section className="pt-28">
          <EmptyState
            icon={<Map className="w-8 h-8" />}
            title="Learning path not found"
            description="This path may have been retired or never existed."
            action={<Link href="/paths"><Button>Browse Paths</Button></Link>}
          />
        </Section>
        <Footer />
      </main>
    );
  }

  const completedSteps = path.enrollment?.currentStep ?? 0;
  const progressPct = path.steps.length > 0 ? (completedSteps / path.steps.length) * 100 : 0;

  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />

      <section className="pt-28 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link href="/paths" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> All Learning Paths
          </Link>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="primary">{path.category}</Badge>
              <Badge
                variant={
                  path.difficulty === 'beginner' ? 'success' :
                  path.difficulty === 'advanced' ? 'danger' : 'accent'
                }
              >
                {path.difficulty}
              </Badge>
            </div>
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-3">
              {path.title}
            </h1>
            <p className="text-white/60 max-w-3xl mb-4">{path.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/40 mb-6">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> ~{Math.round(path.duration / 60)}h</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {path._count.enrollments} learners</span>
              <span className="flex items-center gap-1"><Map className="w-4 h-4" /> {path.steps.length} steps</span>
            </div>
            {path.enrollment ? (
              <GlassCard className="p-4 mb-8 max-w-md">
                <p className="text-xs text-white/50 mb-2">
                  You're {Math.round(progressPct)}% through this path
                </p>
                <ProgressBar value={progressPct} />
                <p className="text-xs text-white/30 mt-2">
                  Step {completedSteps} of {path.steps.length}
                  {path.enrollment.completed && ' · Completed 🎉'}
                </p>
              </GlassCard>
            ) : (
              <Button onClick={handleEnroll} loading={enrolling} icon={<Rocket className="w-4 h-4" />}>
                {isAuthenticated ? 'Enroll in Path' : 'Sign in to Enroll'}
              </Button>
            )}
          </motion.div>

          <h2 className="font-heading text-xl font-bold text-white mt-12 mb-4">Curriculum</h2>
          <div className="space-y-3">
            {path.steps.map((step) => {
              const Icon = (stepIcon as any)[step.type] || BookOpen;
              const done = step.order < completedSteps;
              const current = step.order === completedSteps;
              return (
                <GlassCard key={step.id} className={`p-4 flex items-start gap-4 ${current ? 'border-brand-accent/40' : ''}`}>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      done ? 'bg-green-500/20 text-green-400' :
                      current ? 'bg-brand-accent/20 text-brand-accent' :
                      'bg-white/5 text-white/30'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-white/30">Step {step.order + 1}</span>
                      <Badge variant="primary">{step.type}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-white/50 mt-1">{step.description}</p>
                    {step.duration > 0 && (
                      <p className="text-xs text-white/30 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {step.duration} min
                      </p>
                    )}
                  </div>
                  {step.resourceUrl && (
                    <Link href={step.resourceUrl}>
                      <Button variant="ghost" size="sm">Open</Button>
                    </Link>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
