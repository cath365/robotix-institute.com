'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Search } from 'lucide-react';
import InstitutionalHeader from '@/components/layout/InstitutionalHeader';
import InstitutionalFooter from '@/components/layout/InstitutionalFooter';

const programmes = [
  { number: '01', slug: 'robotics-fundamentals', title: 'Little Einsteins', group: 'Early years', ages: 'Pre-elementary', level: 'Foundation', description: 'A playful introduction to machines, patterns and simple instructions using LEGO robots and age-appropriate visual coding.', studies: ['Motor skills and making', 'Sequences and simple logic', 'Learning through guided play'] },
  { number: '02', slug: 'arduino-robotics', title: 'Byte Buddies', group: 'Primary school', ages: 'Ages 7–10', level: 'Foundation', description: 'A structured first course in robotics and programming that turns curiosity into sound problem-solving habits.', studies: ['Visual programming', 'Robotic mechanisms', 'Team-based challenges'] },
  { number: '03', slug: 'ai-robotics', title: 'Imagineering', group: 'Junior secondary', ages: 'Ages 11–14', level: 'Intermediate', description: 'Project-led study of sensors, connected devices, drones and robotics for learners ready to build more capable systems.', studies: ['Sensors and electronics', 'Text-based coding', 'AI and IoT concepts'] },
  { number: '04', slug: 'game-development', title: 'Code Quest', group: 'Senior secondary', ages: 'Ages 15–18', level: 'Advanced', description: 'A focused programming pathway for older learners developing technical independence and a portfolio of completed work.', studies: ['Programming foundations', 'Games and applications', 'Project documentation'] },
  { number: '05', slug: 'smart-agriculture-automation', title: 'Holiday Camps', group: 'Short programme', ages: 'Age-banded groups', level: 'All levels', description: 'Intensive school-break sessions that give learners time to design, test and complete a practical technology project.', studies: ['Robotics builds', 'Creative coding', 'Project presentation'] },
  { number: '06', slug: 'innovation-leadership', title: 'Community Programmes', group: 'Access programme', ages: 'Schools and communities', level: 'Adapted delivery', description: 'Partner-led teaching for schools and community organisations seeking wider access to robotics and digital literacy.', studies: ['School-based delivery', 'Digital foundations', 'Locally relevant projects'] },
] as const;

const filters = ['All programmes', 'Foundation', 'Intermediate', 'Advanced', 'All levels'] as const;

export default function CoursesPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All programmes');
  const visibleProgrammes = useMemo(() => {
    const term = query.trim().toLowerCase();
    return programmes.filter((programme) => {
      const matchesFilter = filter === 'All programmes' || programme.level === filter;
      const matchesQuery = !term || [programme.title, programme.group, programme.ages, programme.description, ...programme.studies].some((value) => value.toLowerCase().includes(term));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <main className="min-h-screen bg-[#f4f0e7] text-[#102744]">
      <InstitutionalHeader />

      <section className="border-b border-[#102744]/15 pt-[116px]">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex min-h-[540px] flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#87662d]">Courses of study · Lusaka</p>
            <h1 className="mt-7 max-w-xl font-serif text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl xl:text-7xl">Serious learning begins with making.</h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-[#34465b] sm:text-lg">Robotix programmes introduce young people to engineering and computing through careful instruction, repeated practice and purposeful projects.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="#programme-list" className="inline-flex items-center gap-3 bg-[#102744] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#1e4e8c]">View programmes <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/contact" className="border border-[#102744]/35 px-6 py-4 text-sm font-semibold transition-colors hover:bg-white">Speak with an educator</Link>
            </div>
          </div>
          <div className="relative min-h-[440px] overflow-hidden bg-[#102744] lg:min-h-[540px]">
            <Image src="https://www.robotixinstitute.io/assets/uploads/media-uploader/081595315304.jpg" alt="A Robotix Institute learner assembling a wheeled robot" fill priority unoptimized sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-[#102744]/95 px-7 py-6 text-white sm:px-10"><p className="font-serif text-xl">Knowledge is secured through practice.</p><p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/55">The Robotix teaching principle</p></div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-14 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#87662d]">A considered progression</p><h2 className="mt-4 max-w-md font-serif text-3xl leading-tight sm:text-4xl">From first principles to independent projects.</h2></div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              ['Understand', 'Learners meet the idea through demonstration, discussion and close guidance.'],
              ['Construct', 'They use tools and code to build, test and correct a working solution.'],
              ['Explain', 'They present their decisions and show what the finished work can do.'],
            ].map(([title, detail], index) => <div key={title} className="border-l border-[#87662d]/45 pl-5"><span className="text-xs font-bold text-[#87662d]">0{index + 1}</span><h3 className="mt-3 font-serif text-xl">{title}</h3><p className="mt-3 text-sm leading-6 text-[#526174]">{detail}</p></div>)}
          </div>
        </div>
      </section>

      <section id="programme-list" className="scroll-mt-28 px-6 py-16 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 border-b border-[#102744]/20 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#87662d]">Programme guide</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">Choose the right stage.</h2></div>
            <div className="flex w-full max-w-2xl flex-col gap-4">
              <label className="relative block"><span className="sr-only">Search programmes</span><Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#526174]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by age, subject or programme" className="w-full border-b border-[#102744]/35 bg-transparent py-3 pl-7 pr-3 text-sm outline-none placeholder:text-[#526174] focus:border-[#1e4e8c]" /></label>
              <div className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Filter programmes">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`text-xs font-semibold uppercase tracking-[0.1em] ${filter === item ? 'text-[#1e4e8c] underline decoration-2 underline-offset-8' : 'text-[#526174] hover:text-[#102744]'}`}>{item}</button>)}</div>
            </div>
          </div>

          <div className="divide-y divide-[#102744]/20">
            {visibleProgrammes.map((programme) => (
              <article key={programme.slug} className="grid gap-6 py-10 lg:grid-cols-[90px_1.05fr_0.9fr_150px] lg:items-start lg:gap-10">
                <div className="text-sm font-bold text-[#87662d]">{programme.number}</div>
                <div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#526174]">{programme.group}</p><h3 className="mt-2 font-serif text-3xl sm:text-4xl">{programme.title}</h3><div className="mt-4 flex gap-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#1e4e8c]"><span>{programme.ages}</span><span aria-hidden="true">·</span><span>{programme.level}</span></div><p className="mt-5 max-w-xl text-sm leading-7 text-[#46576a]">{programme.description}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#526174]">Areas of study</p><ul className="mt-4 space-y-3">{programme.studies.map((study) => <li key={study} className="flex gap-3 text-sm text-[#34465b]"><Check className="mt-0.5 h-4 w-4 flex-none text-[#87662d]" />{study}</li>)}</ul></div>
                <Link href={`/courses/${programme.slug}`} className="inline-flex items-center justify-between border-b border-[#102744] pb-2 text-sm font-semibold hover:text-[#1e4e8c]">Course details <ArrowRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
          {visibleProgrammes.length === 0 && <p className="py-16 text-center text-[#526174]">No programme matches that search. Try a broader age or subject term.</p>}
        </div>
      </section>

      <section className="bg-[#1e4e8c] px-6 py-16 text-white sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4b36f]">Admissions guidance</p><h2 className="mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">Not sure which programme fits your learner?</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">Tell us their age, experience and interests. Our team will recommend an appropriate starting point.</p></div><Link href="/weekend-classes" className="inline-flex shrink-0 items-center gap-3 bg-white px-6 py-4 text-sm font-bold text-[#102744] hover:bg-[#f4f0e7]">View admissions <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <InstitutionalFooter />
    </main>
  );
}
