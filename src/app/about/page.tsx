import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Mail, MapPin, Phone } from 'lucide-react';
import InstitutionalHeader from '@/components/layout/InstitutionalHeader';
import InstitutionalFooter from '@/components/layout/InstitutionalFooter';
import { robotixProfile } from '@/lib/robotix-profile';

export const metadata: Metadata = {
  title: 'About Robotix Institute',
  description: 'Learn about Robotix Institute Zambia, our mission, teaching philosophy, leadership, partnerships, and work in practical STEM education.',
};

const principles = [
  ['Learn by building', 'Concepts become meaningful when students use them to create a working system.'],
  ['Think like an engineer', 'Learners investigate, test, document, improve, and explain their decisions.'],
  ['Grow with guidance', 'Structured pathways meet students at the right stage and raise the challenge over time.'],
  ['Build for Zambia', 'Technical education should help young people understand and solve problems around them.'],
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-[#172132]">
      <InstitutionalHeader />

      <section className="relative overflow-hidden bg-[#102744] pt-[116px] text-white">
        <div className="relative min-h-[680px]">
          <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
            <Image src={robotixProfile.officialMedia[1].src} alt={robotixProfile.officialMedia[1].caption} fill priority unoptimized className="object-cover" sizes="(max-width: 1024px) 100vw, 62vw" />
            <div className="absolute inset-0 bg-[#07182e]/30 lg:bg-transparent" />
          </div>
          <div className="absolute inset-y-0 left-0 w-full bg-[#1e4e8c]/95 lg:w-[65%]" style={{ clipPath: 'polygon(0 0, 72% 0, 100% 100%, 0 82%)' }} />
          <div className="absolute -bottom-28 -left-20 h-56 w-[75%] -rotate-6 bg-[#081d3d]" />
          <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl items-center px-6 pb-28 pt-16 sm:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#aeeeff]">About Robotix Institute Zambia</p>
              <h1 className="mt-7 font-heading text-6xl font-black uppercase leading-[0.86] tracking-[-0.06em] sm:text-7xl lg:text-[6.5rem]">We teach<br />young minds<br /><span className="text-[#57d4ff]">to build.</span></h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-white/80">A Lusaka-based institute where robotics, computing, and engineering become practical tools for curiosity, confidence, and meaningful invention.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#57d4ff] px-6 py-8 text-[#102744] sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {robotixProfile.impactStats.map((stat) => <div key={stat.label} className="border-l-2 border-[#102744]/25 pl-5"><p className="font-heading text-3xl font-black">{stat.value}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.08em]">{stat.label}</p></div>)}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">Our story</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744] sm:text-5xl">Technology education made tangible.</h2></div>
          <div className="border-l-4 border-[#57d4ff] pl-7 sm:pl-10">
            <p className="font-serif text-2xl leading-10 text-[#263c56]">Founded in Lusaka, Robotix Institute was created to give young people a place where technology is not merely consumed—it is understood, questioned, and built.</p>
            <p className="mt-7 text-base leading-8 text-[#596675]">Since 2020, the institute has delivered robotics, coding, camps, school programs, and community initiatives. Learners progress from visual programming and foundational mechanics to sensors, text-based coding, artificial intelligence, IoT, and independent project work.</p>
            <p className="mt-5 text-base leading-8 text-[#596675]">Our ambition is practical: help students develop the judgment and confidence to turn ideas into working solutions.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#eef6fb] px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">How we teach</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744] sm:text-5xl">A classroom should feel like a laboratory.</h2></div><p className="max-w-xl text-base leading-8 text-[#596675] lg:justify-self-end">Every program combines sound instruction with repeated practice. Students learn the principle, apply it, encounter failure, improve the design, and communicate what they discovered.</p></div>
          <div className="mt-14 grid border-y-2 border-[#102744] md:grid-cols-2 lg:grid-cols-4">
            {principles.map(([title, description], index) => <div key={title} className="border-b border-[#102744]/20 p-7 md:border-r lg:border-b-0 last:border-r-0"><span className="text-xs font-black text-[#1e4e8c]">0{index + 1}</span><h3 className="mt-5 font-heading text-2xl font-bold uppercase text-[#102744]">{title}</h3><p className="mt-4 text-sm leading-7 text-[#596675]">{description}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="grid grid-cols-2">
            <div className="relative min-h-[300px]"><Image src={robotixProfile.officialMedia[2].src} alt={robotixProfile.officialMedia[2].caption} fill unoptimized className="object-cover" sizes="330px" /></div>
            <div className="flex min-h-[300px] flex-col justify-end bg-[#1e4e8c] p-8 text-white"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#aeeeff]">Purpose</p><p className="mt-4 font-serif text-2xl leading-8">Inspire the next wave of engineers and innovators.</p></div>
            <div className="flex min-h-[240px] flex-col justify-center bg-[#102744] p-8 text-white"><p className="text-xl font-black uppercase">From curiosity<br />to capability.</p><p className="mt-4 text-sm leading-6 text-white/65">A pathway built around real tools, real challenges, and visible outcomes.</p></div>
            <div className="relative min-h-[240px]"><Image src={robotixProfile.officialMedia[3].src} alt={robotixProfile.officialMedia[3].caption} fill unoptimized className="object-cover" sizes="330px" /></div>
          </div>
          <div className="flex flex-col justify-center px-2 py-8 lg:px-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">What learners gain</p>
            <h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744]">Knowledge is only the beginning.</h2>
            <ul className="mt-8 space-y-5">{['Confidence with technical tools and systems', 'Discipline in testing and improving ideas', 'Teamwork and clear technical communication', 'A portfolio of practical, explainable work', 'A stronger sense of what they can become'].map((item) => <li key={item} className="flex gap-4 text-sm font-semibold text-[#435167]"><span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#57d4ff] text-[#102744]"><Check className="h-4 w-4" /></span>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="bg-[#102744] px-6 py-20 text-white sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#57d4ff]">Leadership and people</p>
          <div className="mt-5 grid gap-8 border-b border-white/20 pb-12 lg:grid-cols-2 lg:items-end"><h2 className="font-heading text-4xl font-black uppercase leading-[0.95] sm:text-5xl">People committed to practical education.</h2><p className="max-w-xl text-base leading-8 text-white/65 lg:justify-self-end">Robotix is led and supported by educators, engineers, builders, and community collaborators who believe young people deserve serious opportunities to create.</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3">
            {robotixProfile.people.slice(0, 3).map((person, index) => <div key={person.name} className="border-b border-white/15 py-8 md:border-r md:px-8 first:pl-0 last:border-r-0"><div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#57d4ff] bg-[#1e4e8c] font-heading text-xl font-black">{person.name.split(' ').map((part) => part[0]).join('')}</div><p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-[#57d4ff]">{index === 0 ? 'Leadership' : 'Institute team'}</p><h3 className="mt-2 font-heading text-2xl font-bold">{person.name}</h3><p className="mt-2 text-sm text-white/60">{person.role}</p>{person.linkedin && <a href={person.linkedin} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-white/75 hover:text-[#57d4ff]">Professional profile <ArrowRight className="h-4 w-4" /></a>}</div>)}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">Our journey</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744]">Milestones that shaped our work.</h2></div>
          <div className="border-t-2 border-[#102744]">{robotixProfile.milestones.map((item) => <div key={`${item.date}-${item.title}`} className="grid gap-3 border-b border-slate-200 py-6 sm:grid-cols-[150px_1fr]"><p className="text-xs font-black uppercase tracking-[0.1em] text-[#1e4e8c]">{item.date}</p><div><h3 className="font-heading text-xl font-bold text-[#102744]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#596675]">{item.detail}</p></div></div>)}</div>
        </div>
      </section>

      <section className="bg-[#e8f5fb] px-6 py-20 sm:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">Working together</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744]">Partnership expands possibility.</h2></div><div className="border-t-2 border-[#102744]">{robotixProfile.partnerships.slice(0, 4).map((partner) => <div key={partner.name} className="grid gap-2 border-b border-[#102744]/15 py-5 sm:grid-cols-[0.75fr_1.25fr]"><h3 className="font-heading text-lg font-bold text-[#102744]">{partner.name}</h3><p className="text-sm leading-6 text-[#596675]">{partner.detail}</p></div>)}</div></div>
          <Link href="/partners" className="mt-10 inline-flex items-center gap-3 bg-[#1e4e8c] px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white">Explore partnerships <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="bg-[#57d4ff] px-6 py-16 text-[#102744] sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em]">Visit Robotix Institute</p><h2 className="mt-4 max-w-3xl font-heading text-4xl font-black uppercase leading-[0.95] sm:text-5xl">Come and see what young people can build.</h2></div><div className="space-y-3 text-sm font-semibold"><p className="flex gap-3"><MapPin className="h-5 w-5" />{robotixProfile.address}</p><a href="tel:+260956355117" className="flex gap-3"><Phone className="h-5 w-5" />+260 956 355 117</a><a href="mailto:info@robotixinstitute.io" className="flex gap-3"><Mail className="h-5 w-5" />info@robotixinstitute.io</a></div></div>
      </section>

      <InstitutionalFooter />
    </main>
  );
}
