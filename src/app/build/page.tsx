'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import { AiBlocksStudio } from '@/components/build/AiBlocksStudio';
import { useLearningProfile } from '@/components/learning/useLearningProfile';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, GlassCard, Input, Section, Select, Textarea } from '@/components/ui';
import { FirebaseProject, deleteProjectFromFirebase, saveProjectToFirebase, subscribeToProjects } from '@/lib/firebase';
import {
  attachAiBuilderManifest,
  buildAiBuilderCode,
  createAiBuilderManifest,
  getAiBuilderTemplateManifest,
  parseAiBuilderManifest,
  type AiBuilderManifest,
} from '@/lib/ai-builder-blocks';
import { builderTemplates, creatorPipelines } from '@/lib/ecosystem-data';
import { Bot, Boxes, Cloud, Edit3, Layers3, Puzzle, Sparkles, Trash2, WandSparkles } from 'lucide-react';

const starterManifest = createAiBuilderManifest();
const starterCode = attachAiBuilderManifest(buildAiBuilderCode(starterManifest), starterManifest);

const builderModes = [
  { title: 'AI apps', text: 'Prototype copilots, chatbots, and simple intelligence layers.', icon: Bot },
  { title: 'Dashboards', text: 'Shape admin, school, farming, and realtime monitoring surfaces.', icon: Layers3 },
  { title: 'Arduino systems', text: 'Store logic, workflows, and sensor-driven ideas in one builder flow.', icon: Boxes },
  { title: 'Web products', text: 'Move from concept to site, landing page, or digital prototype quickly.', icon: WandSparkles },
];

export default function BuildPage() {
  const { user } = useLearningProfile();
  const [projects, setProjects] = useState<FirebaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | undefined>();
  const [builderManifest, setBuilderManifest] = useState<AiBuilderManifest>(starterManifest);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'AI' as FirebaseProject['type'],
    code: starterCode,
  });

  const generatedProjectCode = useMemo(
    () => attachAiBuilderManifest(buildAiBuilderCode(builderManifest), builderManifest),
    [builderManifest]
  );

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    try {
      return subscribeToProjects(user.uid, (items) => {
        setProjects(items);
        setLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Projects could not be loaded.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setForm((current) => ({ ...current, code: generatedProjectCode }));
  }, [generatedProjectCode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (!user) throw new Error('Sign in before saving projects.');
      await saveProjectToFirebase(user.uid, { ...form, code: generatedProjectCode }, editingId);
      const resetManifest = createAiBuilderManifest();
      setBuilderManifest(resetManifest);
      setForm({
        title: '',
        description: '',
        type: 'AI',
        code: attachAiBuilderManifest(buildAiBuilderCode(resetManifest), resetManifest),
      });
      setEditingId(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Project could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const loadTemplateIntoBuilder = (template: (typeof builderTemplates)[number]) => {
    const nextManifest = getAiBuilderTemplateManifest(template.title);
    const nextType: FirebaseProject['type'] =
      template.category === 'Hardware'
        ? 'Arduino'
        : template.category === 'Robotics'
          ? 'Arduino'
          : template.category === 'AI'
            ? 'AI'
            : 'Programming';

    setBuilderManifest(nextManifest);
    setForm((current) => ({
      ...current,
      title: template.title,
      description: template.detail,
      type: nextType,
    }));
  };

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <Sparkles className="mr-1 h-3 w-3" />
                AI Builder
              </Badge>
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                A Scratch-style AI builder for playful apps, smart tools, and robot ideas.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                Stack colorful blocks, test fun AI behavior live, and save the whole concept into your Robotix creator workspace without needing to type code first.
              </p>
            </div>

            <GlassCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Builder mode', value: 'Active' },
                  { label: 'Saved concepts', value: projects.length.toString() },
                  { label: 'Creation style', value: 'Blocks first' },
                  { label: 'Next step', value: 'Run the app' },
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
          {builderModes.map((item) => (
            <GlassCard key={item.title} className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section className="py-4">
        <div className="grid gap-5 lg:grid-cols-3">
          {builderTemplates.map((template) => (
            <GlassCard key={template.title} className="p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-secondary">{template.category}</p>
              <h3 className="mt-3 font-heading text-xl font-semibold">{template.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{template.detail}</p>
              <button
                type="button"
                onClick={() => loadTemplateIntoBuilder(template)}
                className="mt-5 text-sm font-semibold text-brand-accent"
              >
                Load into brief
              </button>
            </GlassCard>
          ))}
        </div>
      </Section>

      <AuthGate>
        <Section className="py-8">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-brand-secondary" />
                <h2 className="font-heading text-2xl font-bold">Prototype brief</h2>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <Input
                  label="Project title"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  maxLength={80}
                  required
                  placeholder="Smart irrigation signal board"
                />
                <Select
                  label="Builder type"
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as FirebaseProject['type'] }))}
                  options={[
                    { value: 'AI', label: 'AI' },
                    { value: 'Arduino', label: 'Arduino' },
                    { value: 'Programming', label: 'Programming' },
                    { value: 'Game', label: 'Game' },
                  ]}
                />
                <Textarea
                  label="Prototype description"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  maxLength={240}
                  required
                  placeholder="Describe what the block-built app does and why it feels fun or useful."
                />
                <Textarea
                  label="Block builder notes"
                  value={builderManifest.notes}
                  onChange={(event) => setBuilderManifest((current) => ({ ...current, notes: event.target.value }))}
                  maxLength={1200}
                  placeholder="Add any extra app notes, learning goals, or feature ideas."
                />
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/60">
                  Your generated workflow and block stack are saved automatically inside the project. The AI Blocks Studio controls what gets stored.
                </div>
                {error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" loading={saving} icon={<Cloud className="h-4 w-4" />}>
                    {editingId ? 'Update prototype' : 'Save prototype'}
                  </Button>
                  {editingId ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const resetManifest = createAiBuilderManifest();
                        setEditingId(undefined);
                        setBuilderManifest(resetManifest);
                        setForm({
                          title: '',
                          description: '',
                          type: 'AI',
                          code: attachAiBuilderManifest(buildAiBuilderCode(resetManifest), resetManifest),
                        });
                      }}
                    >
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </GlassCard>

            <div className="space-y-6">
              <GlassCard className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-heading text-2xl font-bold">AI Blocks Studio</h2>
                  <Badge variant="success">Scratch-style builder ready</Badge>
                </div>
                <AiBlocksStudio manifest={builderManifest} onChange={setBuilderManifest} />
              </GlassCard>

              <GlassCard className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-secondary" />
                  <h2 className="font-heading text-2xl font-bold">Saved prototypes</h2>
                </div>
                {loading ? (
                  <p className="text-sm text-white/50">Loading prototypes...</p>
                ) : projects.length === 0 ? (
                  <p className="text-sm text-white/50">No prototypes yet. Save your first AI, robotics, or dashboard concept.</p>
                ) : (
                  <div className="grid gap-3">
                    {projects.map((project) => (
                      <div key={project.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="accent">{project.type}</Badge>
                          {project.code.includes('RobotixAIBuilderManifest') ? (
                            <Badge variant="primary">
                              <Puzzle className="mr-1 h-3 w-3" />
                              Blocks
                            </Badge>
                          ) : null}
                          <span className="text-xs text-white/35">
                            {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                        <p className="font-heading font-semibold text-white">{project.title}</p>
                        <p className="mt-1 text-sm text-white/55">{project.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<Edit3 className="h-4 w-4" />}
                            onClick={() => {
                              const parsed = parseAiBuilderManifest(project.code);
                              setEditingId(project.id);
                              setBuilderManifest(parsed.manifest);
                              setForm({
                                title: project.title,
                                description: project.description,
                                type: project.type,
                                code: project.code,
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => deleteProjectFromFirebase(project.id).catch((err) => setError(err instanceof Error ? err.message : 'Delete failed'))}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              <Link href="/dashboard" className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70 transition-colors hover:text-white">
                Open your digital identity dashboard to track XP, badges, projects, and creator momentum.
              </Link>

              <GlassCard className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-secondary" />
                  <h2 className="font-heading text-2xl font-bold">Publish next</h2>
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
            </div>
          </div>
        </Section>
      </AuthGate>
      <Footer />
    </main>
  );
}
