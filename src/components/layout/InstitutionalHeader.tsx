'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Mail, Menu, Phone, X } from 'lucide-react';
import { useAuthStore } from '@/store';
import { robotixProfile } from '@/lib/robotix-profile';

const links = [
  { label: 'Programs', href: '/courses' },
  { label: 'Schools', href: '/partners' },
  { label: 'Student Work', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function InstitutionalHeader() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const portalHref = user?.role === 'ADMIN' ? '/admin' : isAuthenticated ? '/dashboard' : '/login';

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-white shadow-sm">
      <div className="bg-[#102744] text-white">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-6 text-[10px] font-semibold uppercase tracking-[0.14em] sm:px-10 lg:px-16 xl:px-24">
          <div className="flex items-center gap-5">
            <span className="hidden text-white/55 sm:inline">Follow Robotix</span>
            <a href={robotixProfile.facebook} target="_blank" rel="noreferrer" aria-label="Robotix Institute on Facebook" className="text-[#57d4ff] hover:text-white"><Facebook className="h-4 w-4" /></a>
            <a href={robotixProfile.instagram} target="_blank" rel="noreferrer" aria-label="Robotix Institute on Instagram" className="text-[#57d4ff] hover:text-white"><Instagram className="h-4 w-4" /></a>
          </div>
          <div className="flex items-center gap-5 text-white/75">
            <Link href="/admin/login" className="hidden hover:text-white sm:inline">Admin access</Link>
            <a href="tel:+260956355117" className="hidden items-center gap-2 hover:text-white sm:flex"><Phone className="h-3.5 w-3.5 text-[#57d4ff]" />+260 956 355 117</a>
            <a href="mailto:info@robotixinstitute.io" className="flex items-center gap-2 hover:text-white"><Mail className="h-3.5 w-3.5 text-[#57d4ff]" /><span className="hidden sm:inline">info@robotixinstitute.io</span><span className="sm:hidden">Email us</span></a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-16 xl:px-24">
        <Link href="/" className="flex items-center" aria-label="Robotix Institute home">
          <Image src="/images/logo-color.png" alt="Robotix Institute" width={190} height={54} className="h-12 w-auto object-contain" priority />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className="text-sm font-medium text-[#26364a] transition-colors hover:text-[#87662d]">{link.label}</Link>)}
          <Link href="/weekend-classes" className="bg-[#1e4e8c] px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-[#102744]">Admissions</Link>
          <Link href={portalHref} className="border-l border-[#102744]/20 pl-8 text-sm font-semibold text-[#102744]">{isAuthenticated ? 'My portal' : 'Student portal'}</Link>
        </nav>
        <button type="button" onClick={() => setOpen((value) => !value)} className="p-2 text-[#102744] lg:hidden" aria-label="Toggle navigation" aria-expanded={open}>{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </div>
      {open && (
        <nav className="border-t border-[#102744]/15 bg-white px-6 py-5 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-7xl flex-col">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-[#102744]/10 py-3 text-sm font-medium text-[#26364a]">{link.label}</Link>)}
            <Link href="/admin/login" onClick={() => setOpen(false)} className="border-b border-[#102744]/10 py-3 text-sm font-medium text-[#26364a]">Admin access</Link>
            <Link href={portalHref} onClick={() => setOpen(false)} className="mt-4 bg-[#102744] px-5 py-3 text-center text-sm font-semibold text-white">{isAuthenticated ? 'My portal' : 'Student portal'}</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
