'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge } from '@/components/ui';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How old do I need to be to join?',
    a: 'Robotix Institute publicly offers programs from pre-elementary through older teen learners, with different pathways such as Little Einsteins, Byte Buddies, Imagineering, and Code Quest.',
  },
  {
    q: 'Is the platform free?',
    a: 'Most courses, the Coder Play Station, the Game Arena, and community features are free. Some advanced certifications and physical kits are paid.',
  },
  {
    q: 'Do I need an Arduino kit to start?',
    a: 'No. You can do most beginner courses 100% in the browser using our Simulation Lab and Coder Play Station. Kits are recommended once you reach intermediate projects.',
  },
  {
    q: 'Can I use my own ESP32 / Arduino?',
    a: 'Yes! All our tutorials work with standard Arduino UNO, ESP32, and ESP8266 boards. The IoT Control Center lets you connect your own device via MQTT.',
  },
  {
    q: 'How do certificates work?',
    a: 'When you complete a course (all lessons + final quiz ≥ 70%), a verifiable certificate is issued automatically. Each certificate has a unique code anyone can verify at /verify/[code].',
  },
  {
    q: 'How do competitions work?',
    a: 'Form a team (1-4 students), pick an active competition, submit your project (video + repo), and judges score it. Winners get prizes, badges, and platform-wide recognition.',
  },
  {
    q: 'Is the playground safe?',
    a: 'Yes. JavaScript runs in a sandboxed eval with a strict timeout. Python runs entirely in your browser via Pyodide. C++ and Arduino code is analyzed but not executed (you upload it to a real board).',
  },
  {
    q: 'I forgot my password',
    a: 'Visit /forgot-password and enter your email. You\'ll receive a reset link within a few minutes.',
  },
  {
    q: 'How can my school partner with you?',
    a: 'We love working with schools. Use the contact page or email info@robotixinstitute.io to start a partnership conversation.',
  },
  {
    q: 'Where do you ship?',
    a: 'Anywhere in Zambia. Lusaka delivery is 1-2 days; other towns 3-5 days. International on request.',
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="accent" className="mb-3">
            <HelpCircle className="w-3 h-3 mr-1" /> Help Center
          </Badge>
          <h1 className="font-heading text-4xl font-bold text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-white/60">
            Quick answers to common questions about Robotix Institute.
          </p>
        </div>
      </section>

      <Section className="pb-24">
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <GlassCard key={i} className="overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-white">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-white/70">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>
      </Section>
      <Footer />
    </main>
  );
}
