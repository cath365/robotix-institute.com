import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Check, HeartHandshake, School, Users } from 'lucide-react';
import InstitutionalHeader from '@/components/layout/InstitutionalHeader';
import InstitutionalFooter from '@/components/layout/InstitutionalFooter';
import { robotixProfile } from '@/lib/robotix-profile';
import { featuredSchoolStories } from '@/lib/school-stories';

export const metadata: Metadata = {
  title: 'Schools and Partners',
  description: 'Partner with Robotix Institute to deliver practical robotics, coding, and STEM education in schools and communities across Zambia.',
};

const partnerTypes = [
  { icon: School, number: '01', title: 'Schools', text: 'Curriculum enrichment, robotics clubs, workshops, camps, and structured after-school programs.' },
  { icon: Building2, number: '02', title: 'Corporate partners', text: 'Purpose-led programs that connect social investment with measurable STEM learning outcomes.' },
  { icon: HeartHandshake, number: '03', title: 'Community organizations', text: 'Inclusive technology education for underserved learners, orphanages, and community groups.' },
  { icon: Users, number: '04', title: 'Innovation partners', text: 'Technical mentorship, learning spaces, showcases, and pathways into Zambia’s wider innovation ecosystem.' },
];

const deliverySteps = [
  ['Listen', 'We begin with the learners, institutional goals, available time, and learning environment.'],
  ['Design', 'Robotix develops an age-appropriate program with clear topics, projects, resources, and outcomes.'],
  ['Deliver', 'Instructors lead practical sessions using robotics hardware, programming tools, and guided challenges.'],
  ['Evaluate', 'Projects, participation, and learner demonstrations provide visible evidence of progress.'],
];

const schoolPartners = [
  {
    shortName: 'AISL',
    name: 'American International School of Lusaka',
    href: '/partners/stories/american-international-school-lusaka-spotlight',
    logo: 'https://resources.finalsite.net/images/v1709790451/aislusakaorg/gmksdmwbadfkmkkt86cx/AISLLogo000000.png',
  },
  {
    shortName: 'LICS',
    name: 'Lusaka International Community School',
    href: '/partners/stories/lics-smart-house-reference',
    logo: 'https://lics.sch.zm/wp-content/uploads/2023/11/lics.svg',
  },
  {
    shortName: 'ISL',
    name: 'International School of Lusaka',
    href: '/partners/stories/international-school-of-lusaka-spotlight',
    logo: 'https://static.wixstatic.com/media/7e2a23_d603d5d41b9844e4ba69437b1f2699c4~mv2.png/v1/fill/w_250,h_200,al_c,q_90,enc_avif,quality_auto/logo.png',
  },
] as const;

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-white text-[#172132]">
      <InstitutionalHeader />

      <section className="relative overflow-hidden bg-[#102744] pt-[116px] text-white">
        <div className="relative min-h-[700px]">
          <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
            <Image src={robotixProfile.officialMedia[1].src} alt={robotixProfile.officialMedia[1].caption} fill priority unoptimized className="object-cover" sizes="(max-width: 1024px) 100vw, 62vw" />
            <div className="absolute inset-0 bg-[#07182e]/40 lg:bg-transparent" />
          </div>
          <div className="absolute inset-y-0 left-0 w-full bg-[#1e4e8c]/95 lg:w-[68%]" style={{ clipPath: 'polygon(0 0, 66% 0, 100% 70%, 60% 100%, 0 83%)' }} />
          <div className="absolute -bottom-24 -left-16 h-60 w-[78%] -rotate-6 bg-[#081d3d]" />
          <div className="absolute -bottom-28 left-[50%] hidden h-52 w-[46%] rotate-6 bg-[#57d4ff]/85 lg:block" />
          <div className="relative z-10 mx-auto flex min-h-[700px] max-w-7xl items-center px-6 pb-32 pt-16 sm:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#aeeeff]">Schools · Organizations · Industry</p>
              <h1 className="mt-7 font-heading text-6xl font-black uppercase leading-[0.84] tracking-[-0.065em] sm:text-7xl lg:text-[6.4rem]">Build the<br />future<br /><span className="text-[#57d4ff]">together.</span></h1>
              <p className="mt-8 max-w-xl text-xl font-bold uppercase leading-tight">Partnerships that turn access, instruction, and opportunity into practical learning.</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="#partner" className="bg-[#57d4ff] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#102744]">Become a partner</Link><Link href="#case-studies" className="border-2 border-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white">See our work</Link></div>
            </div>
          </div>
          <div className="absolute bottom-20 right-[5%] z-20 hidden h-44 w-44 rotate-[-7deg] items-center justify-center rounded-full border-[7px] border-white bg-[#102744] text-center font-heading text-xl font-black uppercase leading-5 shadow-2xl lg:flex">Education<br />with<br />impact.</div>
        </div>
      </section>

      <section className="bg-[#57d4ff] px-6 py-8 text-[#102744] sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[['Learners reached', '2,500+'], ['Awards', '6'], ['Northmead pilot', '5 months'], ['Pilot learners', '40']].map(([label, value]) => <div key={label} className="border-l-2 border-[#102744]/25 pl-5"><p className="font-heading text-3xl font-black">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.08em]">{label}</p></div>)}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">Ways to work with us</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744] sm:text-5xl">One mission. Different forms of partnership.</h2></div><p className="max-w-xl text-base leading-8 text-[#596675] lg:justify-self-end">Robotix works with institutions that want young people to gain more than exposure to technology. Together, we create structured opportunities to understand, build, and demonstrate.</p></div>
          <div className="mt-14 grid border-y-2 border-[#102744] md:grid-cols-2 lg:grid-cols-4">
            {partnerTypes.map((type) => <article key={type.title} className="border-b border-[#102744]/20 p-7 md:border-r lg:border-b-0 last:border-r-0"><div className="flex items-center justify-between"><type.icon className="h-8 w-8 text-[#1e4e8c]" /><span className="text-xs font-black text-[#1e4e8c]">{type.number}</span></div><h3 className="mt-7 font-heading text-2xl font-bold uppercase text-[#102744]">{type.title}</h3><p className="mt-4 text-sm leading-7 text-[#596675]">{type.text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="case-studies" className="bg-[#eef6fb] px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">Partnership in practice</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744] sm:text-5xl">Programs with visible outcomes.</h2></div><p className="max-w-xl text-base leading-8 text-[#596675] lg:justify-self-end">These documented school programs show how Robotix adapts technical learning to different ages, environments, and institutional goals.</p></div>
          <div className="mt-12 border-y-2 border-[#102744] bg-white">
            <p className="border-b border-[#102744]/15 px-6 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#1e4e8c]">Schools working with Robotix Institute</p>
            <div className="grid md:grid-cols-3 md:divide-x md:divide-[#102744]/15">
              {schoolPartners.map((school) => (
                <Link key={school.shortName} href={school.href} className="group flex min-h-[220px] flex-col items-center justify-center border-b border-[#102744]/15 px-8 py-8 text-center last:border-b-0 md:border-b-0">
                  <div className="relative h-24 w-full max-w-[230px]"><Image src={school.logo} alt={`${school.name} logo`} fill unoptimized className="object-contain transition-transform duration-300 group-hover:scale-[1.03]" sizes="230px" /></div>
                  <h3 className="mt-6 text-sm font-bold leading-5 text-[#102744]">{school.name}</h3>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#1e4e8c]">{school.shortName}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#596675]">View school record <ArrowRight className="h-3.5 w-3.5 text-[#1e4e8c] transition-transform group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {featuredSchoolStories.map((story, index) => (
              <article key={story.slug} className="group bg-white shadow-[0_12px_40px_rgba(16,39,68,0.1)]">
                <div className="relative h-[360px] overflow-hidden">
                  <Image src={story.imageSrc} alt={story.imageAlt} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 50vw" />
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-[#57d4ff]" />
                  <span className="absolute left-6 top-6 bg-[#102744] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">Case study 0{index + 1}</span>
                </div>
                <div className="p-8">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.1em] text-[#1e4e8c]"><span>{story.period}</span><span>{story.location}</span></div>
                  <h3 className="mt-5 font-heading text-3xl font-bold leading-tight text-[#102744]">{story.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#596675]">{story.summary}</p>
                  <div className="mt-6 border-l-4 border-[#57d4ff] bg-[#eef6fb] p-5"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1e4e8c]">Why it matters</p><p className="mt-2 text-sm leading-6 text-[#435167]">{story.highlight}</p></div>
                  <Link href={`/partners/stories/${story.slug}`} className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-[#102744]">Read the case study <ArrowRight className="h-4 w-4 text-[#1e4e8c]" /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102744] px-6 py-20 text-white sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#57d4ff]">How partnership works</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] sm:text-5xl">Designed around your learners.</h2><p className="mt-6 text-base leading-8 text-white/65">A strong program starts with context, not a generic package. We align the learning experience with age, objectives, resources, and the institution’s calendar.</p></div>
          <div className="grid sm:grid-cols-2">{deliverySteps.map(([title, text], index) => <article key={title} className="border border-white/15 p-7"><span className="text-xs font-black text-[#57d4ff]">0{index + 1}</span><h3 className="mt-5 font-heading text-2xl font-bold uppercase">{title}</h3><p className="mt-3 text-sm leading-7 text-white/60">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">Documented collaborators</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744]">A growing network for STEM access.</h2><p className="mt-6 text-base leading-8 text-[#596675]">Our work is strengthened by organizations that contribute resources, reach, expertise, learning environments, and public platforms.</p></div>
          <div className="border-t-2 border-[#102744]">
            {robotixProfile.partnerships.map((partner, index) => <article key={partner.name} className="grid gap-3 border-b border-slate-200 py-6 sm:grid-cols-[60px_0.75fr_1.25fr]"><span className="text-xs font-black text-[#1e4e8c]">0{index + 1}</span><h3 className="font-heading text-xl font-bold text-[#102744]">{partner.name}</h3><p className="text-sm leading-6 text-[#596675]">{partner.detail}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#e8f5fb] px-6 py-20 sm:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[460px] overflow-hidden"><Image src={robotixProfile.officialMedia[0].src} alt={robotixProfile.officialMedia[0].caption} fill unoptimized className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /><div className="absolute bottom-0 left-0 bg-[#1e4e8c] p-7 text-white"><p className="font-heading text-2xl font-bold uppercase">Practical learning.<br />Shared purpose.</p></div></div>
          <div className="lg:px-10"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e4e8c]">What a program can include</p><h2 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744]">Built for the classroom and beyond.</h2><ul className="mt-8 space-y-5">{['Age-based robotics and coding pathways', 'School clubs and after-school programs', 'Teacher-supported workshops and demonstrations', 'Holiday camps and intensive project sessions', 'Community access and sponsored learner cohorts', 'Student showcases and outcome reporting'].map((item) => <li key={item} className="flex gap-4 text-sm font-semibold text-[#435167]"><span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#57d4ff] text-[#102744]"><Check className="h-4 w-4" /></span>{item}</li>)}</ul></div>
        </div>
      </section>

      <section id="partner" className="bg-[#57d4ff] px-6 py-16 text-[#102744] sm:px-10 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em]">Start a conversation</p><h2 className="mt-4 max-w-3xl font-heading text-4xl font-black uppercase leading-[0.95] sm:text-5xl">Let’s design a program that matters.</h2><p className="mt-5 max-w-2xl text-base leading-7">Tell us about your school, organization, learners, and goals. We’ll help identify a practical starting point.</p></div><div className="flex flex-wrap gap-3"><Link href="/contact" className="bg-[#102744] px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white">Contact partnerships</Link><a href="mailto:info@robotixinstitute.io" className="border-2 border-[#102744] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em]">Email Robotix</a></div></div>
      </section>

      <InstitutionalFooter />
    </main>
  );
}
