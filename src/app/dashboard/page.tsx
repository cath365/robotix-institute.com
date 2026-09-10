'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, FolderKanban, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '@/hooks/useApi';
import { useAuthStore } from '@/store';
import { learningPaths } from '@/lib/learning-data';

type ProfileCounts = { enrollments: number; codeProjects: number; robotProjects: number; certificates: number; achievements: number };

const portalLinks = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My learning', href: '/learn' },
  { label: 'My portfolio', href: '/portfolio' },
  { label: 'Project workspace', href: '/playground' },
  { label: 'Community', href: '/community' },
];

export default function DashboardPage() {
  const { user, token, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const [counts, setCounts] = useState<ProfileCounts | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error('Profile unavailable')))
      .then((result) => setCounts(result.data?._count || null))
      .catch(() => undefined);
    return () => controller.abort();
  }, [token]);

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f0e7] px-6 text-[#102744]">
        <div className="max-w-lg border-t-4 border-[#87662d] bg-white p-10 shadow-[0_20px_60px_rgba(16,39,68,0.1)]"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#87662d]">Student portal</p><h1 className="mt-5 font-serif text-4xl">Sign in to continue.</h1><p className="mt-4 text-sm leading-7 text-[#526174]">Your learning record and projects are held in your personal account.</p><div className="mt-8 flex gap-3"><Link href="/login" className="bg-[#1e4e8c] px-6 py-4 text-sm font-bold text-white">Sign in</Link><Link href="/register" className="border border-[#102744]/30 px-6 py-4 text-sm font-bold">Register</Link></div></div>
      </main>
    );
  }

  const firstName = user.firstName || 'Student';
  const stats = [
    { label: 'Course enrolments', value: counts?.enrollments ?? 0 },
    { label: 'Code projects', value: counts?.codeProjects ?? 0 },
    { label: 'Robot projects', value: counts?.robotProjects ?? 0 },
    { label: 'Certificates', value: counts?.certificates ?? 0 },
  ];

  return (
    <main className="min-h-screen bg-[#eef1f4] text-[#102744]">
      <header className="border-b border-[#102744]/15 bg-white">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-16">
          <Link href="/"><Image src="/images/logo-color.png" alt="Robotix Institute" width={185} height={52} className="h-11 w-auto" priority /></Link>
          <div className="hidden items-center gap-5 sm:flex"><div className="text-right"><p className="text-sm font-semibold">{user.firstName} {user.lastName}</p><p className="text-xs text-[#738092]">Student account</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102744] text-sm font-bold text-white">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</div></div>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="sm:hidden" aria-label="Toggle portal menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[250px_1fr]">
        <aside className={`${menuOpen ? 'block' : 'hidden'} border-b border-[#102744]/15 bg-[#102744] px-6 py-7 text-white lg:block lg:min-h-[calc(100vh-80px)] lg:border-b-0 lg:px-7`}>
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4b36f]">Student portal</p>
          <nav className="space-y-1">{portalLinks.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`block border-l-2 px-4 py-3 text-sm ${index === 0 ? 'border-[#57d4ff] bg-white/10 font-semibold text-white' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'}`}>{item.label}</Link>)}</nav>
          <button type="button" onClick={logout} className="mt-10 flex items-center gap-3 px-4 text-sm text-white/60 hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button>
        </aside>

        <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14 xl:px-20">
          <section className="flex flex-col gap-7 border-b border-[#102744]/15 pb-10 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#87662d]">Academic overview</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">Good day, {firstName}.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[#526174]">Continue your learning, review completed work and keep your project record up to date.</p></div>
            <Link href="/learn" className="inline-flex shrink-0 items-center gap-3 bg-[#1e4e8c] px-6 py-4 text-sm font-bold text-white hover:bg-[#102744]">Continue learning <ArrowRight className="h-4 w-4" /></Link>
          </section>

          <section className="grid gap-px border border-[#102744]/15 bg-[#102744]/15 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => <div key={stat.label} className="bg-white p-6"><p className="font-serif text-3xl">{stat.value}</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#738092]">{stat.label}</p></div>)}
          </section>

          <section className="mt-10 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="bg-white p-6 sm:p-8">
              <div className="flex items-end justify-between border-b border-[#102744]/15 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#87662d]">Curriculum</p><h2 className="mt-2 font-serif text-3xl">Learning pathways</h2></div><Link href="/learn" className="text-sm font-semibold text-[#1e4e8c]">View all</Link></div>
              <div className="divide-y divide-[#102744]/15">{learningPaths.map((path, index) => { const Icon = path.icon; return <Link key={path.slug} href={path.href} className="grid gap-4 py-6 sm:grid-cols-[46px_1fr_auto] sm:items-center"><div className="flex h-11 w-11 items-center justify-center bg-[#eef1f4]"><Icon className="h-5 w-5 text-[#1e4e8c]" /></div><div><p className="font-serif text-xl">{path.shortTitle}</p><p className="mt-1 text-sm text-[#526174]">{path.level} · {path.lessons.length} lesson{path.lessons.length === 1 ? '' : 's'}</p></div><span className="text-xs font-bold uppercase tracking-[0.12em] text-[#87662d]">0{index + 1}</span></Link>; })}</div>
            </div>

            <aside className="space-y-6">
              <div className="bg-[#1e4e8c] p-7 text-white"><BookOpen className="h-6 w-6 text-[#57d4ff]" /><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#d4b36f]">Next step</p><h2 className="mt-3 font-serif text-2xl">Begin with a learning path.</h2><p className="mt-3 text-sm leading-6 text-white/65">Choose a subject, complete its lesson and apply the idea in a small project.</p><Link href="/learn" className="mt-6 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-semibold">Open learning <ArrowRight className="h-4 w-4" /></Link></div>
              <div className="bg-white p-7"><UserRound className="h-6 w-6 text-[#87662d]" /><h2 className="mt-5 font-serif text-2xl">Your profile</h2><p className="mt-2 text-sm text-[#526174]">{user.email}</p><Link href="/portfolio" className="mt-6 flex items-center justify-between border-t border-[#102744]/15 pt-4 text-sm font-semibold">View portfolio <ArrowRight className="h-4 w-4" /></Link></div>
              <Link href="/playground" className="flex items-center gap-4 bg-white p-6"><FolderKanban className="h-6 w-6 text-[#1e4e8c]" /><div><p className="font-semibold">Project workspace</p><p className="mt-1 text-xs text-[#738092]">Write and save code</p></div></Link>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
