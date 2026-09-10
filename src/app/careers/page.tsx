import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge, Button } from '@/components/ui';
import { Briefcase, MapPin, Clock, GraduationCap, HeartHandshake, Wrench } from 'lucide-react';
import CareersApplicationForm from './CareersApplicationForm';

export const metadata: Metadata = { title: 'Careers' };

const jobs: { title: string; type: string; location: string; href: string }[] = [
  // Add openings here when hiring
];

export default function CareersPage() {
  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="accent" className="mb-3">
            <Briefcase className="w-3 h-3 mr-1" /> Careers
          </Badge>
          <h1 className="font-heading text-4xl font-bold text-white mb-3">
            Help us teach a million African engineers
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            We&apos;re a teaching-first institute looking for people who can help children build, code, test, and believe in their ideas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#apply">
              <Button>Apply for future roles</Button>
            </a>
            <Link href="/contact">
              <Button variant="secondary">Ask about hiring</Button>
            </Link>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { title: 'Teach hands-on STEM', text: 'Guide learners through robotics, coding, electronics, games, and projects.', icon: GraduationCap },
            { title: 'Support real classes', text: 'Help with school visits, weekend programs, camps, demos, and parent follow-ups.', icon: HeartHandshake },
            { title: 'Build practical labs', text: 'Prepare materials, maintain kits, support IDE/game tools, and document lessons.', icon: Wrench },
          ].map((item) => (
            <GlassCard key={item.title} className="p-5">
              <div className="rounded-2xl bg-brand-accent/10 p-3 text-brand-accent w-fit">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-heading text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section id="openings" className="py-8">
        <div className="mb-6">
          <Badge variant="accent" className="mb-3">Open roles</Badge>
          <h2 className="font-heading text-3xl font-bold text-white">Available jobs</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            When Robotix has a specific job available, it will appear here. General applications are still welcome below.
          </p>
        </div>

        <div className="space-y-3">
          {jobs.length === 0 ? (
            <GlassCard className="p-6 text-sm leading-6 text-white/60">
              No specific job opening is listed right now. You can still apply for future teaching, operations, internship, or outreach roles.
            </GlassCard>
          ) : null}
          {jobs.map((j) => (
            <GlassCard key={j.title} className="p-5 flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-white">{j.title}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-white/40 mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {j.type}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {j.location}</span>
                </div>
              </div>
              <Link href={j.href}><Button variant="secondary" size="sm">Apply</Button></Link>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section id="apply" className="py-8">
        <CareersApplicationForm />
      </Section>
      <Footer />
    </main>
  );
}
