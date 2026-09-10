import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Facebook, Instagram, Users } from 'lucide-react';
import InstitutionalHeader from '@/components/layout/InstitutionalHeader';
import InstitutionalFooter from '@/components/layout/InstitutionalFooter';
import { robotixProfile } from '@/lib/robotix-profile';

const pathways = robotixProfile.programs.slice(0, 4);
const outcomes = robotixProfile.impactStats.slice(0, 3);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f1e8] text-[#172132]">
      <InstitutionalHeader />

      <section className="relative overflow-hidden bg-[#102744] pt-[116px]">
        <div className="relative min-h-[720px] lg:min-h-[790px]">
          <Image src={robotixProfile.officialMedia[1].src} alt={robotixProfile.officialMedia[1].caption} fill priority unoptimized className="object-cover grayscale" sizes="100vw" />
          <div className="absolute inset-0 bg-[#07182e]/40" />
          <div className="absolute inset-y-0 right-0 hidden w-[54%] overflow-hidden lg:block">
            <Image src={robotixProfile.officialMedia[0].src} alt={robotixProfile.officialMedia[0].caption} fill priority unoptimized className="object-cover" sizes="54vw" />
          </div>
          <div className="absolute inset-y-0 left-0 w-full bg-[#1e4e8c]/95 lg:w-[67%]" style={{ clipPath: 'polygon(0 0, 54% 0, 100% 66%, 61% 100%, 0 82%)' }} />
          <div className="absolute bottom-[-8%] left-[-5%] h-[38%] w-[76%] bg-[#102744] shadow-2xl" style={{ clipPath: 'polygon(0 5%, 72% 0, 100% 100%, 6% 78%)' }} />
          <div className="absolute bottom-[-13%] left-[35%] hidden h-[32%] w-[58%] bg-[#57d4ff]/80 lg:block" style={{ clipPath: 'polygon(0 25%, 74% 0, 100% 75%, 18% 100%)' }} />
          <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-6 pb-32 pt-16 sm:px-10 lg:min-h-[790px] lg:pb-40">
            <div className="max-w-xl text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#aeeeff]">Robotics · Coding · Engineering</p>
              <p className="mt-8 text-3xl font-light uppercase">2026 / 2027</p>
              <h1 className="mt-1 font-heading text-6xl font-black uppercase leading-[0.84] tracking-[-0.065em] sm:text-7xl lg:text-[6.8rem]">Admissions<br />Now<br />Open</h1>
              <div className="mt-6 h-1.5 w-32 bg-[#57d4ff]" />
              <p className="mt-7 max-w-md text-xl font-bold uppercase leading-tight text-white">Fun, focused, hands-on learning for Zambia&apos;s next generation of builders.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/weekend-classes" className="bg-[#57d4ff] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#102744]">Admissions</Link>
                <Link href="/courses" className="border-2 border-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white">Programs</Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-20 right-[4%] z-20 hidden items-end gap-5 lg:flex">
            <div className="mb-5 bg-white px-6 py-4 text-right text-[#102744] shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#1e4e8c]">Simple registration</p><p className="mt-1 text-xl font-black uppercase">Apply online</p></div>
            <Link href="/weekend-classes" className="flex h-44 w-44 rotate-[-8deg] items-center justify-center rounded-full border-[7px] border-white bg-[#102744] text-center text-xl font-black uppercase leading-5 text-white shadow-2xl">Enrolment<br />enquiries<br />open</Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-10 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid grid-cols-2">
            <div className="relative min-h-[250px]"><Image src={robotixProfile.officialMedia[2].src} alt={robotixProfile.officialMedia[2].caption} fill unoptimized className="object-cover" sizes="320px" /></div>
            <div className="flex min-h-[250px] flex-col justify-center bg-[#1e4e8c] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#aeeeff]">Individual development</p><p className="mt-4 text-sm leading-6 text-white/75">Students gain confidence through guided technical work and individual problem-solving.</p></div>
            <div className="flex min-h-[210px] flex-col justify-center bg-[#102744] p-7 text-white"><p className="text-xl font-bold uppercase">Group activities</p><p className="mt-3 text-sm leading-6 text-white/65">Collaborative engineering challenges build communication and teamwork.</p></div>
            <div className="relative min-h-[210px]"><Image src={robotixProfile.officialMedia[3].src} alt={robotixProfile.officialMedia[3].caption} fill unoptimized className="object-cover" sizes="320px" /></div>
          </div>
          <div className="flex flex-col justify-center px-2 py-6 lg:px-10">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1e4e8c]">Interactive and engaging activities</p>
            <h2 className="mt-4 font-heading text-4xl font-black uppercase leading-[0.95] text-[#102744]">Learning that produces real work.</h2>
            <ul className="mt-8 space-y-4">
              {['Build and program working robots', 'Develop games, websites, and applications', 'Work with sensors, electronics, and IoT', 'Present projects and explain design decisions', 'Learn through structured individual and group activities'].map((item) => <li key={item} className="flex gap-3 text-sm font-medium text-[#435167]"><CheckCircle2 className="h-5 w-5 flex-none text-[#1e4e8c]" />{item}</li>)}
            </ul>
            <div className="mt-10 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-5">
              {outcomes.map((outcome) => <div key={outcome.label} className="px-4 first:pl-0"><p className="text-2xl font-black text-[#102744]">{outcome.value}</p><p className="mt-1 text-xs text-[#647083]">{outcome.label}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#87662d]">Our purpose</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[#102744] sm:text-5xl">Technical confidence, grounded in thoughtful teaching.</h2>
          </div>
          <div className="border-l border-[#a98747] pl-6 sm:pl-10">
            <p className="font-serif text-2xl leading-9 text-[#29394d] sm:text-3xl sm:leading-10">{robotixProfile.mission}</p>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#59616d]">Students do more than follow instructions. They investigate problems, test ideas, document their work, and learn to explain the decisions behind what they build.</p>
            <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#102744] underline decoration-[#a98747] underline-offset-8">Read about the institute <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section id="programs" className="bg-[#102744] px-6 py-20 text-white sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 border-b border-white/20 pb-12 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4b36f]">Programs of study</p>
              <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">A clear pathway from first principles to independent creation.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-white/65 lg:justify-self-end">Age-appropriate instruction combines computing fundamentals, physical robotics, and project work. Each stage develops technical ability and sound problem-solving habits.</p>
          </div>
          <div className="divide-y divide-white/20">
            {pathways.map((program, index) => (
              <Link key={program.title} href="/courses" className="group grid gap-5 py-9 transition-colors hover:bg-white/[0.035] sm:grid-cols-[80px_1fr_1.2fr_auto] sm:items-center sm:px-4">
                <span className="font-serif text-2xl text-[#d4b36f]">0{index + 1}</span>
                <div><h3 className="font-serif text-2xl">{program.title}</h3><p className="mt-1 text-sm text-white/50">{program.audience}</p></div>
                <p className="max-w-xl text-sm leading-6 text-white/65">{program.detail}</p>
                <ArrowRight className="h-5 w-5 text-[#d4b36f] transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="approach" className="bg-white px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#87662d]">The learning method</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[#102744] sm:text-5xl">Serious learning can still be full of wonder.</h2>
          </div>
          <div className="mt-14 grid border-y border-[#172132]/15 md:grid-cols-3 md:divide-x md:divide-[#172132]/15">
            {[
              ['Understand', 'Students first learn the scientific and computational ideas that make a system work.'],
              ['Build', 'Guided laboratory work turns theory into functioning code, circuits, and machines.'],
              ['Explain', 'Learners test, document, and present their decisions—the foundation of professional engineering practice.'],
            ].map(([title, description], index) => (
              <div key={title} className="py-10 md:px-8 first:pl-0 last:pr-0">
                <span className="text-xs font-semibold text-[#a98747]">0{index + 1}</span>
                <h3 className="mt-5 font-serif text-3xl text-[#102744]">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#59616d]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="student-work" className="bg-[#e9e2d5] px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="relative min-h-[480px] overflow-hidden">
            <Image src={robotixProfile.officialMedia[2].src} alt={robotixProfile.officialMedia[2].caption} fill unoptimized className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#87662d]">Student work</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[#102744] sm:text-5xl">Ideas become evidence when students build them.</h2>
            <p className="mt-7 text-base leading-8 text-[#4e5865]">Learners apply programming, electronics, and mechanical reasoning to practical challenges. Their work includes autonomous robots, smart irrigation, automated infrastructure, and connected-home systems.</p>
            <ul className="mt-8 space-y-4">
              {robotixProfile.projectsAndPlatforms.map((project) => (
                <li key={project.title} className="flex gap-3 text-sm leading-6 text-[#394552]"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#87662d]" /><span><strong className="text-[#102744]">{project.title}.</strong> {project.detail}</span></li>
              ))}
            </ul>
            <Link href="/projects" className="mt-9 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#102744] underline decoration-[#a98747] underline-offset-8">View student projects <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section id="schools" className="bg-white px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#87662d]">Schools and communities</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[#102744] sm:text-5xl">A teaching partner for institutions across Zambia.</h2>
            <p className="mt-6 text-base leading-7 text-[#59616d]">We work with schools, civic organizations, and industry partners to widen access to practical STEM education.</p>
            <Link href="/partners" className="mt-8 inline-flex items-center gap-2 bg-[#102744] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#183b64]">Discuss a school program <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="border-t border-[#172132]/15">
            {robotixProfile.partnerships.slice(0, 4).map((partner) => (
              <div key={partner.name} className="grid gap-3 border-b border-[#172132]/15 py-6 sm:grid-cols-[0.7fr_1.3fr]">
                <h3 className="font-serif text-xl text-[#102744]">{partner.name}</h3><p className="text-sm leading-6 text-[#59616d]">{partner.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#172132]/15 px-6 py-14 sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div className="flex items-start gap-4"><CalendarDays className="mt-1 h-5 w-5 text-[#87662d]" /><div><p className="font-serif text-lg text-[#102744]">Weekend learning</p><p className="mt-1 text-sm text-[#59616d]">Structured classes for young learners.</p></div></div>
          <div className="flex items-start gap-4"><Users className="mt-1 h-5 w-5 text-[#87662d]" /><div><p className="font-serif text-lg text-[#102744]">School programs</p><p className="mt-1 text-sm text-[#59616d]">Curriculum-aligned clubs and workshops.</p></div></div>
          <div className="flex items-start gap-4"><BookOpen className="mt-1 h-5 w-5 text-[#87662d]" /><div><p className="font-serif text-lg text-[#102744]">Project-based study</p><p className="mt-1 text-sm text-[#59616d]">Learning demonstrated through real work.</p></div></div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 sm:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#87662d]">From the institute</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[#102744] sm:text-5xl">Follow the work as it happens.</h2>
            <p className="mt-6 text-base leading-7 text-[#59616d]">Classroom moments, student builds, programme notices and community work are published through Robotix Institute&apos;s public social channels.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={robotixProfile.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-[#102744] px-5 py-3.5 text-sm font-semibold text-white"><Facebook className="h-4 w-4" /> Facebook</a>
              <a href={robotixProfile.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 border border-[#102744]/35 px-5 py-3.5 text-sm font-semibold text-[#102744]"><Instagram className="h-4 w-4" /> Instagram</a>
            </div>
          </div>
          <a href={robotixProfile.instagram} target="_blank" rel="noreferrer" className="grid overflow-hidden border border-[#102744]/15 bg-[#f5f1e8] sm:grid-cols-[220px_1fr]">
            <div className="relative min-h-[220px] bg-[#102744]"><Image src={robotixProfile.officialMedia[0].src} alt={robotixProfile.officialMedia[0].caption} fill unoptimized sizes="220px" className="object-cover" /></div>
            <div className="p-7 sm:p-9">
              <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#87662d]">Instagram profile</p><h3 className="mt-2 font-serif text-2xl text-[#102744]">{robotixProfile.instagramHandle}</h3></div><Instagram className="h-6 w-6 text-[#1e4e8c]" /></div>
              <p className="mt-5 text-sm leading-7 text-[#526174]">{robotixProfile.instagramSnapshot.biography}</p>
              <div className="mt-6 grid grid-cols-3 border-y border-[#102744]/15 py-4">{[[robotixProfile.instagramSnapshot.posts, 'Posts'], [robotixProfile.instagramSnapshot.followers, 'Followers'], [robotixProfile.instagramSnapshot.following, 'Following']].map(([value, label]) => <div key={label}><p className="font-serif text-xl text-[#102744]">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#738092]">{label}</p></div>)}</div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-[#738092]">Public profile snapshot · {robotixProfile.instagramSnapshot.verifiedOn}</p>
            </div>
          </a>
        </div>
      </section>

      <section className="bg-[#a98747] px-6 py-20 text-[#102744] sm:px-10 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em]">Admissions and enquiries</p><h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">Give a young mind the room and guidance to build.</h2></div>
          <div className="flex flex-col gap-3 sm:flex-row"><Link href="/weekend-classes" className="inline-flex items-center justify-center gap-2 bg-[#102744] px-6 py-3.5 text-sm font-semibold text-white">Weekend classes <ArrowRight className="h-4 w-4" /></Link><Link href="/contact" className="inline-flex items-center justify-center border border-[#102744]/40 px-6 py-3.5 text-sm font-semibold">Contact the institute</Link></div>
        </div>
      </section>

      <InstitutionalFooter />
    </main>
  );
}
