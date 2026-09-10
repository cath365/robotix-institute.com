'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, CircuitBoard, Code, Eye, Heart, Search, Video } from 'lucide-react';
import InstitutionalHeader from '@/components/layout/InstitutionalHeader';
import InstitutionalFooter from '@/components/layout/InstitutionalFooter';
import { schoolProjects } from '@/lib/school-projects';

interface ProjectCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  components: string[];
  likes: number;
  views: number;
  circuitUrl?: string | null;
  sourceCode?: string | null;
  tutorialMd?: string | null;
  videoUrl?: string | null;
  thumbnail?: string | null;
}

const fallbackProjects: ProjectCard[] = [
  { id: '1', slug: 'line-follower-robot', title: 'Line Follower Robot', description: 'A guided-path robot combining infrared sensing, control logic, motors, and practical classroom hardware.', category: 'Robotics', difficulty: 'beginner', components: ['Arduino Uno', 'IR sensors', 'Motor driver', 'DC motors'], likes: 342, views: 2890, sourceCode: 'available', tutorialMd: 'available' },
  { id: '2', slug: 'smart-irrigation-system', title: 'Smart Irrigation System', description: 'An agriculture automation build combining soil monitoring, irrigation logic, and connected systems.', category: 'Agriculture IoT', difficulty: 'intermediate', components: ['ESP32', 'Soil sensor', 'Water pump', 'Relay'], likes: 528, views: 4120, circuitUrl: 'available', sourceCode: 'available', tutorialMd: 'available' },
  { id: '3', slug: 'ai-object-detection-robot', title: 'AI Object Detection Robot', description: 'A mobile robot using embedded hardware and computer-vision principles to identify objects.', category: 'AI & Vision', difficulty: 'advanced', components: ['ESP32-CAM', 'Motor driver', 'Chassis', 'Battery'], likes: 389, views: 3100, sourceCode: 'available', videoUrl: 'available' },
];

const tones = ['bg-[#1e4e8c]', 'bg-[#102744]', 'bg-[#287aa9]'];

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [projects, setProjects] = useState<ProjectCard[]>(fallbackProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ limit: '24' });
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        if (search.trim()) params.set('search', search.trim());
        const response = await fetch(`/api/projects?${params.toString()}`).then((item) => item.json()).catch(() => null);
        if (cancelled) return;
        const liveProjects = Array.isArray(response?.data) ? response.data : [];
        if (liveProjects.length) setProjects(liveProjects);
        else if (!search.trim() && selectedCategory === 'All') setProjects(fallbackProjects);
        else setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search.trim() ? 250 : 0);
    setLoading(true);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, selectedCategory]);

  const categories = useMemo(() => Array.from(new Set(['All', ...fallbackProjects.map((project) => project.category), ...projects.map((project) => project.category)])), [projects]);

  return (
    <main className="min-h-screen bg-white text-[#172132]">
      <InstitutionalHeader />

      <section className="relative overflow-hidden bg-[#102744] pt-[116px] text-white">
        <div className="relative min-h-[700px]">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={schoolProjects[0]?.imageSrc} alt={schoolProjects[0]?.imageAlt} className="h-full w-full object-cover grayscale" />
            <div className="absolute inset-0 bg-[#07182e]/45" />
          </div>
          <div className="absolute inset-y-0 left-0 w-full bg-[#1e4e8c]/95 lg:w-[69%]" style={{ clipPath: 'polygon(0 0, 63% 0, 100% 72%, 59% 100%, 0 84%)' }} />
          <div className="absolute -bottom-24 -left-16 h-60 w-[80%] -rotate-6 bg-[#081d3d]" />
          <div className="absolute -bottom-28 left-[48%] hidden h-52 w-[48%] rotate-6 bg-[#57d4ff]/85 lg:block" />
          <div className="relative z-10 mx-auto flex min-h-[700px] max-w-7xl items-center px-6 pb-32 pt-16 sm:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#aeeeff]">Student engineering archive</p>
              <h1 className="mt-7 font-heading text-6xl font-black uppercase leading-[0.84] tracking-[-0.065em] sm:text-7xl lg:text-[6.6rem]">Imagine.<br />Design.<br /><span className="text-[#57d4ff]">Build.</span></h1>
              <p className="mt-8 max-w-xl text-xl font-bold uppercase leading-tight">Projects that demonstrate what Robotix learners understand and can create.</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="#archive" className="bg-[#57d4ff] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#102744]">Explore projects</Link><Link href="/build" className="border-2 border-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white">Create a prototype</Link></div>
            </div>
          </div>
          <div className="absolute bottom-20 right-[5%] z-20 hidden h-44 w-44 rotate-[-7deg] items-center justify-center rounded-full border-[7px] border-white bg-[#102744] text-center font-heading text-xl font-black uppercase leading-5 shadow-2xl lg:flex">Real ideas.<br />Working<br />systems.</div>
        </div>
      </section>

      <section className="bg-[#57d4ff] px-6 py-8 text-[#102744] sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[['School case studies', schoolProjects.length.toString()], ['Featured builds', fallbackProjects.length.toString()], ['Technical fields', '6+'], ['Learning method', 'Build + test']].map(([label, value]) => <div key={label} className="border-l-2 border-[#102744]/25 pl-5"><p className="font-heading text-3xl font-black">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.08em]">{label}</p></div>)}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">School case studies</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744] sm:text-5xl">Learning made visible.</h2></div><p className="max-w-xl text-base leading-8 text-[#596675] lg:justify-self-end">Each case study records the challenge, tools, concepts, and outcomes behind work completed with Robotix learners and partner schools.</p></div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {schoolProjects.map((project, index) => (
              <article key={project.slug} className="group flex flex-col border border-slate-200 bg-white shadow-[0_12px_40px_rgba(16,39,68,0.08)]">
                <div className="relative h-64 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.imageSrc} alt={project.imageAlt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className={`absolute inset-x-0 bottom-0 h-2 ${tones[index % tones.length]}`} />
                  <span className="absolute left-5 top-5 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#102744]">{project.periodLabel}</span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1e4e8c]">{project.schoolName}</p>
                  <h3 className="mt-4 font-heading text-2xl font-bold leading-tight text-[#102744]">{project.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-[#596675]">{project.description}</p>
                  <div className="mt-6 border-t border-slate-200 pt-5"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1e4e8c]">What students learned</p><ul className="mt-3 space-y-2">{project.learningOutcomes.slice(0, 3).map((outcome) => <li key={outcome} className="flex gap-2 text-xs leading-5 text-[#536175]"><Check className="mt-0.5 h-4 w-4 flex-none text-[#1e4e8c]" />{outcome}</li>)}</ul></div>
                  <Link href={`/projects/${project.slug}`} className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-[#102744]">Open case study <ArrowRight className="h-4 w-4 text-[#1e4e8c]" /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102744] px-6 py-20 text-white sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#57d4ff]">The project method</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] sm:text-5xl">An idea is only the first step.</h2><p className="mt-6 text-base leading-8 text-white/65">Students learn to move methodically from a problem to a tested, documented result.</p></div>
          <div className="grid sm:grid-cols-2">{[['01', 'Define', 'Understand the problem, users, and constraints.'], ['02', 'Design', 'Plan the logic, components, and physical system.'], ['03', 'Build', 'Write code, assemble hardware, and integrate parts.'], ['04', 'Test', 'Measure results, diagnose failures, and improve the work.']].map(([number, title, text]) => <div key={number} className="border border-white/15 p-7"><span className="text-xs font-black text-[#57d4ff]">{number}</span><h3 className="mt-4 font-heading text-2xl font-bold uppercase">{title}</h3><p className="mt-3 text-sm leading-6 text-white/60">{text}</p></div>)}</div>
        </div>
      </section>

      <section id="archive" className="bg-[#eef6fb] px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">Project archive</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744] sm:text-5xl">Explore the builds.</h2></div><p className="max-w-xl text-base leading-8 text-[#596675] lg:justify-self-end">Search by project name or narrow the archive by technical field.</p></div>
          <div className="mt-12 border-y-2 border-[#102744] py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex w-full max-w-xl items-center gap-3 border border-slate-300 bg-white px-4 py-3"><Search className="h-5 w-5 text-[#1e4e8c]" /><span className="sr-only">Search projects</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects or systems" className="w-full bg-transparent text-sm text-[#102744] outline-none placeholder:text-slate-400" /></label>
              <div className="flex flex-wrap gap-2">{categories.map((category) => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] ${selectedCategory === category ? 'bg-[#1e4e8c] text-white' : 'border border-slate-300 bg-white text-[#536175]'}`}>{category}</button>)}</div>
            </div>
          </div>

          {loading ? <div className="py-16 text-center text-sm font-bold uppercase tracking-[0.12em] text-[#1e4e8c]">Loading projects…</div> : projects.length === 0 ? <div className="border-b border-slate-300 py-16 text-center"><h3 className="font-heading text-2xl font-bold text-[#102744]">No matching projects</h3><p className="mt-2 text-sm text-[#596675]">Try another search or category.</p></div> : (
            <div className="grid gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <article key={project.id} className="flex min-h-[420px] flex-col bg-white shadow-[0_10px_35px_rgba(16,39,68,0.08)]">
                  <div className={`${tones[index % tones.length]} p-7 text-white`}><div className="flex items-start justify-between gap-4"><CircuitBoard className="h-9 w-9 text-[#57d4ff]" /><span className="border border-white/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]">{project.difficulty}</span></div><p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[#aeeeff]">{project.category}</p><h3 className="mt-3 font-heading text-3xl font-bold leading-tight">{project.title}</h3></div>
                  <div className="flex flex-1 flex-col p-7"><p className="text-sm leading-7 text-[#596675]">{project.description}</p><div className="mt-5 flex flex-wrap gap-2">{project.components.slice(0, 4).map((component) => <span key={component} className="border border-slate-200 bg-[#f6f9fc] px-2.5 py-1.5 text-[10px] font-semibold text-[#536175]">{component}</span>)}</div><div className="mt-5 flex gap-4 text-xs text-[#68768a]">{project.tutorialMd && <span className="flex gap-1"><BookOpen className="h-3.5 w-3.5" />Guide</span>}{project.sourceCode && <span className="flex gap-1"><Code className="h-3.5 w-3.5" />Code</span>}{project.videoUrl && <span className="flex gap-1"><Video className="h-3.5 w-3.5" />Video</span>}</div><div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-5"><div className="flex gap-4 text-xs text-[#68768a]"><span className="flex gap-1"><Heart className="h-3.5 w-3.5" />{project.likes}</span><span className="flex gap-1"><Eye className="h-3.5 w-3.5" />{project.views}</span></div><Link href={`/projects/${project.slug}`} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[#1e4e8c]">Open <ArrowRight className="h-4 w-4" /></Link></div></div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#57d4ff] px-6 py-16 text-[#102744] sm:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em]">Start a project</p><h2 className="mt-4 max-w-3xl font-heading text-4xl font-black uppercase leading-[0.95] sm:text-5xl">Build something worth explaining.</h2></div><div className="flex flex-wrap gap-3"><Link href="/build" className="bg-[#102744] px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white">Open builder</Link><Link href="/simulation" className="border-2 border-[#102744] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em]">Robotics lab</Link></div></div></section>

      <InstitutionalFooter />
    </main>
  );
}
