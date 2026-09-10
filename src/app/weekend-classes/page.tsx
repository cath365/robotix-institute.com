import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import InstitutionalHeader from '@/components/layout/InstitutionalHeader';
import InstitutionalFooter from '@/components/layout/InstitutionalFooter';
import WeekendClassesSignupForm from '@/components/marketing/WeekendClassesSignupForm';
import { robotixProfile } from '@/lib/robotix-profile';
import { weekendClassesProfile } from '@/lib/weekend-classes';

const benefits = [
  'Hands-on robotics and electronics',
  'Coding and game creation',
  'Age-appropriate learning groups',
  'Project work and presentation skills',
];

export default function WeekendClassesPage() {
  return (
    <main className="admissions-page min-h-screen bg-white text-[#172132]">
      <InstitutionalHeader />

      <section className="relative overflow-hidden bg-[#eef6fb] pt-28 lg:min-h-[820px] lg:pt-28">
        <div className="absolute inset-x-0 top-0 h-28 bg-[#f5f1e8]" />
        <div className="absolute -right-40 top-12 hidden h-[710px] w-[710px] rounded-full bg-[#102744] lg:block" />
        <div className="absolute right-[-8rem] top-28 hidden h-[610px] w-[610px] rounded-full border-[12px] border-white bg-[#57d4ff] lg:block" />
        <div className="absolute -left-20 bottom-[-15rem] h-[400px] w-[850px] -rotate-6 bg-[#1e4e8c] lg:h-[470px]" />
        <div className="absolute left-[30%] bottom-[-22rem] hidden h-[500px] w-[700px] rotate-[16deg] bg-[#16315f] lg:block" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1e4e8c]">Robotix Institute admissions</p>
            <h1 className="mt-5 font-heading text-6xl font-black uppercase leading-[0.86] tracking-[-0.055em] text-[#102744] sm:text-7xl lg:text-[6.5rem]">
              Learn.<br />Code.<br /><span className="text-[#1e4e8c]">Build.</span>
            </h1>
            <div className="mt-8 inline-block bg-[#57d4ff] px-5 py-3 text-xl font-black uppercase tracking-tight text-[#102744] sm:text-2xl">Weekend intake enquiries open</div>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#425166]">Structured robotics, programming, and creative technology classes for learners ages 6–18 in Lusaka.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#apply" className="bg-[#102744] px-7 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white">Register interest</Link>
              <a href="tel:+260956355117" className="border-2 border-[#102744] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-[#102744]">Call admissions</a>
            </div>
          </div>

          <div className="relative z-10 min-h-[460px] lg:min-h-[650px]">
            <div className="absolute right-0 top-0 h-[390px] w-[390px] overflow-hidden rounded-full border-[10px] border-white shadow-2xl sm:h-[470px] sm:w-[470px] lg:h-[520px] lg:w-[520px]">
              <Image src={weekendClassesProfile.gallery[1].src} alt={weekendClassesProfile.gallery[1].alt} fill unoptimized className="object-cover" sizes="520px" />
            </div>
            <div className="absolute bottom-4 left-0 h-52 w-52 overflow-hidden rounded-full border-[8px] border-white shadow-xl sm:h-64 sm:w-64">
              <Image src={robotixProfile.officialMedia[3].src} alt={robotixProfile.officialMedia[3].caption} fill unoptimized className="object-cover" sizes="256px" />
            </div>
            <div className="absolute bottom-6 right-2 flex h-40 w-40 rotate-[-7deg] items-center justify-center rounded-full border-[7px] border-white bg-[#1e4e8c] text-center text-xl font-black uppercase leading-5 text-white shadow-xl sm:h-44 sm:w-44">Build your<br />future</div>
          </div>
        </div>
      </section>

      <section className="relative bg-white px-6 py-20 sm:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1e4e8c]">What learners experience</p>
            <h2 className="mt-4 max-w-2xl font-heading text-4xl font-bold leading-tight text-[#102744] sm:text-5xl">An active learning environment for curious young minds.</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#596675]">Learners work in small groups, receive guided instruction, and develop practical projects they can demonstrate and explain.</p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => <div key={benefit} className="flex items-center gap-3 border-b border-slate-200 pb-4 text-sm font-semibold text-[#243750]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#57d4ff] text-[#102744]"><Check className="h-4 w-4" /></span>{benefit}</div>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative min-h-[330px] overflow-hidden"><Image src={weekendClassesProfile.gallery[0].src} alt={weekendClassesProfile.gallery[0].alt} fill unoptimized className="object-cover" sizes="320px" /></div>
            <div className="flex min-h-[330px] flex-col justify-between bg-[#102744] p-7 text-white"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#57d4ff]">Individual development</p><p className="mt-5 font-serif text-2xl leading-8">Confidence grows when a learner can turn an idea into something real.</p></div><p className="text-sm leading-6 text-white/60">Problem-solving · teamwork · technical communication</p></div>
            <div className="flex min-h-[190px] flex-col justify-end bg-[#1e4e8c] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#57d4ff]">Group activities</p><p className="mt-3 text-sm leading-6 text-white/70">Collaborative challenges help learners practise communication and responsibility.</p></div>
            <div className="relative min-h-[190px] overflow-hidden"><Image src={robotixProfile.officialMedia[1].src} alt={robotixProfile.officialMedia[1].caption} fill unoptimized className="object-cover" sizes="320px" /></div>
          </div>
        </div>
      </section>

      <section className="bg-[#102744] px-6 py-16 text-white sm:px-10" id="apply">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-2 lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57d4ff]">Admissions enquiry</p><h2 className="mt-4 font-heading text-4xl font-bold">Tell us about your child.</h2></div>
            <p className="max-w-xl text-sm leading-7 text-white/65 lg:justify-self-end">Submit an interest form and the Robotix team can confirm current schedules, age-group placement, fees, and available spaces.</p>
          </div>
          <WeekendClassesSignupForm />
        </div>
      </section>

      <section className="bg-[#57d4ff] px-6 py-8 text-[#102744] sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 text-sm font-semibold md:grid-cols-3">
          <a href="tel:+260956355117" className="flex items-center gap-3"><Phone className="h-5 w-5" />+260 956 355 117</a>
          <a href="mailto:info@robotixinstitute.io" className="flex items-center gap-3"><Mail className="h-5 w-5" />info@robotixinstitute.io</a>
          <p className="flex items-center gap-3"><MapPin className="h-5 w-5" />{robotixProfile.address}</p>
        </div>
      </section>
      <InstitutionalFooter />
    </main>
  );
}
