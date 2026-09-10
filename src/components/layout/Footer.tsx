'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Building2, Mail, MapPin, Phone } from 'lucide-react';
import { robotixProfile } from '@/lib/robotix-profile';

const footerSections = [
  {
    title: 'Programs',
    links: [
      { label: 'Courses', href: '/courses' },
      { label: 'PlayVerse', href: '/play' },
      { label: 'Builder', href: '/build' },
      { label: 'Simulation Lab', href: '/simulation' },
      { label: 'AI Tutor', href: '/ai-tutor' },
    ],
  },
  {
    title: 'Institute',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Community', href: '/community' },
    ],
  },
  {
    title: 'Access',
    links: [
      { label: 'Register', href: '/register' },
      { label: 'Login', href: '/login' },
      { label: 'Admin login', href: '/admin/login' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/15 bg-[linear-gradient(180deg,rgba(33,73,127,0.96),rgba(15,35,72,0.98))]">
      <div className="circuit-overlay" />
      <div className="aurora-bg absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Image
                src="/images/logo-white.png"
                alt="Robotix Institute"
                width={180}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="max-w-sm text-sm text-white/60">
              {robotixProfile.summary}
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/55">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-brand-accent" />
                <span>{robotixProfile.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-accent" />
                <a href="mailto:info@robotixinstitute.io" className="hover:text-brand-accent">
                  info@robotixinstitute.io
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-accent" />
                <a href="tel:+260956355117" className="hover:text-brand-accent">
                  +260 956 355 117
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 flex-none text-brand-accent" />
                <span>Founded in 2020 and publicly active across robotics, coding, camps, schools, and community programs.</span>
              </div>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 font-heading font-semibold text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/50 transition-colors hover:text-brand-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Robotix Institute Zambia. All rights reserved.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-accent transition-colors hover:text-brand-accent-light"
          >
            Start a school or partnership conversation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
