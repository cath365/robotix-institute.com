import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge, Button, EmptyState } from '@/components/ui';
import { Calendar, MapPin, Users } from 'lucide-react';

export const metadata: Metadata = { title: 'Events' };

const upcoming = [
  {
    name: 'Zambia Robotics Challenge 2026 — Kickoff',
    date: 'Jun 12, 2026',
    location: 'University of Zambia, Lusaka',
    desc: 'Opening ceremony, rule walkthrough, and team meet-and-greet for the national competition.',
    cta: { label: 'View Competition', href: '/competitions' },
  },
  {
    name: 'IoT Maker Workshop',
    date: 'Jul 5, 2026',
    location: 'Online + Lusaka Hub',
    desc: 'Build your first ESP32 weather station in 3 hours. Free for Robotix Institute students.',
    cta: { label: 'Reserve a seat', href: '/contact' },
  },
  {
    name: 'AI for Robotics — Bootcamp',
    date: 'Aug 17–21, 2026',
    location: 'Online',
    desc: 'Five-day intensive on computer vision and TinyML for embedded systems.',
    cta: { label: 'Pre-register', href: '/contact' },
  },
];

export default function EventsPage() {
  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />
      <section className="pt-32 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Badge variant="accent" className="mb-3">
            <Calendar className="w-3 h-3 mr-1" /> Events
          </Badge>
          <h1 className="font-heading text-4xl font-bold text-white">Upcoming Events</h1>
          <p className="text-white/60 mt-2">Workshops, competitions, hackathons & meetups.</p>
        </div>
      </section>
      <Section>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8" />}
            title="No events scheduled"
            description="Check back soon — we host competitions, workshops, and hackathons regularly."
            action={<Link href="/contact"><Button>Get Notified</Button></Link>}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map((e) => (
              <GlassCard key={e.name} className="p-6 flex flex-col">
                <Badge variant="accent" className="w-fit mb-3">{e.date}</Badge>
                <h3 className="font-heading font-semibold text-white mb-1">{e.name}</h3>
                <p className="text-xs text-white/40 flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" /> {e.location}
                </p>
                <p className="text-sm text-white/60 mb-4 flex-1">{e.desc}</p>
                <Link href={e.cta.href}><Button size="sm" className="w-full">{e.cta.label}</Button></Link>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>
      <Footer />
    </main>
  );
}
