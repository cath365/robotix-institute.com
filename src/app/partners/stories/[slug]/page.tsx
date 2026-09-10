import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, GlassCard, Section } from '@/components/ui';
import { allSchoolStories, getSchoolStory } from '@/lib/school-stories';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  School,
  Shield,
  Sparkles,
} from 'lucide-react';

type StoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return allSchoolStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getSchoolStory(slug);

  if (!story) {
    return { title: 'School Story' };
  }

  return {
    title: `${story.name} | Schools & Partnerships`,
    description: story.summary,
  };
}

export default async function SchoolStoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = getSchoolStory(slug);

  if (!story) {
    notFound();
  }

  const relatedStories = allSchoolStories.filter((item) => item.slug !== story.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <Link
            href="/partners"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-brand-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to schools and partnerships
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
            <div>
              <Badge variant="accent" className="mb-4">
                <School className="mr-1 h-3 w-3" />
                {story.status}
              </Badge>
              {story.logoSrc ? (
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/12 bg-white/90 p-3 shadow-lg shadow-black/20">
                  <Image
                    src={story.logoSrc}
                    alt={story.logoAlt ?? `${story.name} logo`}
                    width={160}
                    height={160}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : null}
              <h1 className="font-heading text-4xl font-bold sm:text-5xl">{story.name}</h1>
              <p className="mt-4 max-w-2xl text-lg text-white/65">{story.lead}</p>

              <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-white/45">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {story.period}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {story.location}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/partners">
                  <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to schools page</Button>
                </Link>
                <a href="#sources">
                  <Button variant="secondary" icon={<Shield className="h-4 w-4" />}>
                    View source references
                  </Button>
                </a>
              </div>
            </div>

            <GlassCard className="overflow-hidden p-0">
              <div className="relative h-[320px]">
                <Image
                  src={story.imageSrc}
                  alt={story.imageAlt}
                  width={1400}
                  height={960}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
              </div>
              <div className="p-5 text-sm leading-6 text-white/60">{story.imageCaption}</div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {story.metrics.map((metric) => (
            <GlassCard key={metric.label} className="p-5 shine-effect school-lift">
              <div className="text-xs uppercase tracking-[0.2em] text-white/42">{metric.label}</div>
              <div className="mt-3 text-2xl font-bold text-white">{metric.value}</div>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">Story overview</h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-white/64">
              {story.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">Why this is on the page</h2>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-brand-secondary">Highlight</div>
              <p className="mt-2 text-sm leading-6 text-white/64">{story.highlight}</p>
            </div>
            <div className="mt-4 space-y-3">
              {story.evidence.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-white/60"
                >
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </Section>

      <Section className="py-8">
        <GlassCard className="p-6 shine-effect">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Badge variant="accent" className="mb-3">
                <Clock3 className="mr-1 h-3 w-3" />
                Weekend Classes
              </Badge>
              <h2 className="font-heading text-3xl font-bold">Why this matters for parents</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Robotix publicly describes robotics as a powerful after-school companion and lists opening hours
                of Saturday to Wednesday, 10AM to 7PM. That gives families a practical route into coding,
                robotics, and creative technology even when the school day is already full.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                'Children get a hands-on environment where they build, test, code, and solve problems instead of only reading about technology.',
                'Weekend and after-school learning can turn curiosity into confidence without competing directly with the normal school timetable.',
                'Parents looking for a serious but exciting STEM path can use Robotix as a flexible extension of what their children are already learning in school.',
              ].map((line) => (
                <div
                  key={line}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-white/62 school-lift"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/weekend-classes">
              <Button>Ask about weekend classes</Button>
            </Link>
            <Link href="/partners">
              <Button variant="secondary">Back to school profiles</Button>
            </Link>
          </div>
        </GlassCard>
      </Section>

      <Section className="py-8" id="sources">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">Source references</h2>
            </div>
            <p className="mb-4 text-sm leading-6 text-white/58">
              The main reading experience stays on Robotix. These links are here only if someone wants to
              verify the original public sources directly.
            </p>
            <div className="space-y-3">
              {story.sourceLinks.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/64 transition hover:border-brand-secondary/30 hover:text-white"
                >
                  <span>{source.label}</span>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-brand-secondary" />
                </a>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <School className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-heading text-2xl font-bold">More internal school stories</h2>
            </div>
            <div className="space-y-3">
              {relatedStories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/partners/stories/${item.slug}`}
                  className="block rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-brand-secondary/30 hover:bg-white/[0.05]"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-white/42">{item.status}</div>
                  <div className="mt-2 text-lg font-semibold text-white">{item.name}</div>
                  <p className="mt-2 text-sm leading-6 text-white/60">{item.summary}</p>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
