'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Globe2,
  Rocket,
  Sparkles,
  Star,
  Target,
  Wifi,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AIAssistant } from '@/components/learning/AIAssistant';
import { ArduinoSimulator } from '@/components/learning/ArduinoSimulator';
import { CodePlayground } from '@/components/learning/CodePlayground';
import { useLearningProfile } from '@/components/learning/useLearningProfile';
import { Badge, Button, GlassCard, ProgressBar, Section } from '@/components/ui';
import { challengeArcs, connectivityModes, languageRoadmap } from '@/lib/ecosystem-data';
import { getLearningPath, LearningPathSlug } from '@/lib/learning-data';

export default function LearningPathPage() {
  const params = useParams<{ path: string }>();
  const path = getLearningPath(params.path);
  const { profile, completeLesson } = useLearningProfile();

  if (!path) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <Section className="pt-32">
          <GlassCard className="p-6">
            <h1 className="font-heading text-2xl font-bold">Learning path not found</h1>
            <Link href="/learn" className="mt-3 inline-block text-brand-accent">Back to learning paths</Link>
          </GlassCard>
        </Section>
        <Footer />
      </main>
    );
  }

  const Icon = path.icon;
  const completed = path.lessons.filter((lesson) => profile.completedLessonIds.includes(lesson.id)).length;
  const progress = Math.round((completed / path.lessons.length) * 100);
  const lesson = path.lessons[0];
  const lessonDone = profile.completedLessonIds.includes(lesson.id);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <Link href="/learn" className="mb-5 inline-flex items-center gap-2 text-sm text-white/55 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Learning paths
          </Link>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${path.accent}`}>
                <Icon className="h-8 w-8" />
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="accent">{path.badge}</Badge>
                <Badge variant="primary">{path.level}</Badge>
              </div>
              <h1 className="font-heading text-4xl font-bold">{path.title}</h1>
              <p className="mt-3 max-w-2xl text-lg text-white/60">{path.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/play"><Button variant="secondary">Open related challenge</Button></Link>
                <Link href="/build"><Button>Create a prototype</Button></Link>
              </div>
            </motion.div>

            <GlassCard className="p-5">
              <div className="mb-3 flex items-center justify-between text-sm text-white/60">
                <span>Mission progress</span>
                <span>{completed}/{path.lessons.length} complete</span>
              </div>
              <ProgressBar value={progress} />
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-white/5 p-3">
                  <Clock className="mx-auto mb-1 h-4 w-4 text-brand-accent" />
                  <p className="text-sm font-semibold">{lesson.minutes} min</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <Star className="mx-auto mb-1 h-4 w-4 text-brand-accent" />
                  <p className="text-sm font-semibold">{lesson.xp} XP</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                This path now behaves like a mission sector with code, AI support, simulation, and creator follow-through.
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { title: 'Concept', text: lesson.concept, icon: Sparkles },
            { title: 'Example', text: lesson.example, icon: Target },
            { title: 'Try it', text: lesson.tryIt, icon: Rocket },
            { title: 'Challenge', text: lesson.challenge, icon: CheckCircle2 },
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
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {path.slug === 'arduino' ? <ArduinoSimulator /> : null}
            <CodePlayground initialCode={lesson.starterCode} language={lesson.language} />

            <GlassCard className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-heading text-lg font-bold text-white">Finish the mission</p>
                  <p className="text-sm text-white/50">Complete the lesson to earn XP and unlock your badge.</p>
                </div>
                <Button
                  disabled={lessonDone}
                  onClick={() => completeLesson(lesson.id, lesson.xp)}
                  icon={<Rocket className="h-4 w-4" />}
                >
                  {lessonDone ? 'XP claimed' : `Claim ${lesson.xp} XP`}
                </Button>
              </div>
            </GlassCard>
          </div>

          <aside className="space-y-5">
            <AIAssistant context={path.slug as LearningPathSlug} />

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-brand-accent" />
                <h2 className="font-heading text-lg font-bold">Language readiness</h2>
              </div>
              <div className="space-y-3">
                {languageRoadmap.slice(0, 3).map((language) => (
                  <div key={language.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-medium text-white">{language.name}</p>
                    <p className="mt-1 text-xs text-white/50">{language.status}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Wifi className="h-5 w-5 text-brand-accent" />
                <h2 className="font-heading text-lg font-bold">Access modes</h2>
              </div>
              <div className="space-y-3">
                {connectivityModes.map((mode) => (
                  <div key={mode.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-medium text-white">{mode.title}</p>
                    <p className="mt-1 text-xs text-white/50">{mode.signal}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <p className="mb-3 font-heading font-semibold text-white">Related challenge arcs</p>
              <div className="space-y-3">
                {challengeArcs.slice(0, 2).map((challenge) => (
                  <div key={challenge.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{challenge.title}</p>
                      <Badge variant="accent">{challenge.xp}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-white/50">{challenge.detail}</p>
                  </div>
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
