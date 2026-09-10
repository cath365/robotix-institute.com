import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge, Button } from '@/components/ui';
import { BookOpen, Code, Cpu, Wifi, Trophy, Sparkles, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Get started with Robotix Institute — guides, tutorials, and references.',
};

const sections = [
  {
    icon: Sparkles,
    title: 'Getting Started',
    desc: 'Create your account, take the first lesson, write your first robot program.',
    href: '/courses',
  },
  {
    icon: Code,
    title: 'Coder Play Station',
    desc: 'Write & run Python, JavaScript, C++, Arduino, and MicroPython right in your browser.',
    href: '/playground',
  },
  {
    icon: Cpu,
    title: 'Simulation Lab',
    desc: '3D robot simulation — test movements, sensors, obstacle avoidance.',
    href: '/simulation',
  },
  {
    icon: Wifi,
    title: 'IoT Control',
    desc: 'Connect a real ESP32 over MQTT, view sensors, and send commands.',
    href: '/iot',
  },
  {
    icon: Trophy,
    title: 'Competitions',
    desc: 'Form a team, submit a project, win prizes and recognition.',
    href: '/competitions',
  },
  {
    icon: BookOpen,
    title: 'Learning Paths',
    desc: 'Curated multi-course tracks (e.g. "Become an IoT Developer in 3 months").',
    href: '/paths',
  },
];

export default function DocsPage() {
  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="accent" className="mb-3">Documentation</Badge>
          <h1 className="font-heading text-4xl font-bold text-white mb-3">Everything you need to build</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Hands-on guides for every part of the platform. Start anywhere.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((s) => (
            <Link key={s.href} href={s.href}>
              <GlassCard hover className="p-6 h-full">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-3">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-sm text-white/60 mb-3">{s.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-brand-accent font-medium">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <GlassCard className="p-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-3">Can&apos;t find what you need?</h2>
          <p className="text-white/60 mb-5">Our community forum and AI Tutor can help.</p>
          <div className="flex justify-center gap-3">
            <Link href="/community"><Button>Ask the Community</Button></Link>
            <Link href="/ai-tutor"><Button variant="secondary">Ask the AI Tutor</Button></Link>
          </div>
        </GlassCard>
      </Section>

      <Footer />
    </main>
  );
}
