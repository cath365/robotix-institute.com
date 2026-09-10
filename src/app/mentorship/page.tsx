import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge, Button } from '@/components/ui';
import { Users, GraduationCap, Heart, ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Mentorship' };

export default function MentorshipPage() {
  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="accent" className="mb-3">
            <Heart className="w-3 h-3 mr-1" /> Mentorship Program
          </Badge>
          <h1 className="font-heading text-4xl font-bold text-white mb-3">
            Learn from working engineers
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Get paired with a senior robotics or IoT engineer for 1:1 sessions, project review, and career guidance.
          </p>
        </div>
      </section>

      <Section className="grid md:grid-cols-3 gap-6">
        {[
          { icon: GraduationCap, title: 'For Students', desc: 'Free 1:1 mentorship for top-performing learners. Apply via your dashboard after completing 2 courses.' },
          { icon: Users, title: 'For Mentors', desc: 'Volunteer 2 hours/month. Get our Mentor badge, mentor-only events, and the joy of teaching.' },
          { icon: Heart, title: 'For Schools', desc: 'Adopt our curriculum and get a dedicated Robotix mentor for your STEM program.' },
        ].map((c) => (
          <GlassCard key={c.title} className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-3">
              <c.icon className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-semibold text-white mb-1">{c.title}</h3>
            <p className="text-sm text-white/60">{c.desc}</p>
          </GlassCard>
        ))}
      </Section>

      <Section>
        <GlassCard className="p-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-3">Want to get involved?</h2>
          <p className="text-white/60 mb-5">Drop us a line — we onboard new mentors monthly.</p>
          <Link href="/contact">
            <Button icon={<ArrowRight className="w-4 h-4" />}>Apply to Mentor / Join Program</Button>
          </Link>
        </GlassCard>
      </Section>
      <Footer />
    </main>
  );
}
