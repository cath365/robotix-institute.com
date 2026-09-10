'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowRight, Clock3, Mail, MapPin, Phone, Send } from 'lucide-react';
import InstitutionalHeader from '@/components/layout/InstitutionalHeader';
import InstitutionalFooter from '@/components/layout/InstitutionalFooter';
import { robotixProfile } from '@/lib/robotix-profile';

const enquiryRoutes = [
  { number: '01', title: 'Families and learners', detail: 'Course selection, age groups, weekend classes, holiday camps and admissions.' },
  { number: '02', title: 'Schools and organisations', detail: 'School clubs, curriculum support, staff engagement and programme delivery.' },
  { number: '03', title: 'Partners and media', detail: 'Community initiatives, CSR programmes, events, demonstrations and press enquiries.' },
];

const fieldClass = 'mt-2 w-full border border-[#102744]/25 bg-white px-4 py-3.5 text-sm text-[#102744] outline-none transition-colors placeholder:text-[#738092] focus:border-[#1e4e8c]';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please complete your name, email address and message.');
      return;
    }

    setSending(true);
    setSubmittedRef('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || 'Your message could not be sent. Please use the direct email address.');

      setSubmittedRef(result?.data?.id || 'Received');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      toast.success('Your enquiry has been received by Robotix Institute.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Your message could not be sent. Please use the direct email address.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f0e7] text-[#102744]">
      <InstitutionalHeader />

      <section className="border-b border-[#102744]/15 pt-[116px]">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-[440px] flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#87662d]">Contact the Institute</p>
            <h1 className="mt-7 max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl xl:text-7xl">Let us begin with the right conversation.</h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-[#34465b] sm:text-lg">Speak with our team about a learner, a school programme, or a partnership. We will direct your enquiry to the person best placed to help.</p>
          </div>
          <div className="flex min-h-[390px] items-end bg-[#102744] px-7 py-12 text-white sm:px-10 lg:min-h-[440px] lg:px-14">
            <div className="w-full">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4b36f]">Robotix Institute Zambia</p>
              <address className="mt-8 space-y-6 not-italic">
                <p className="flex gap-4 border-b border-white/15 pb-5 text-sm leading-6 text-white/75"><MapPin className="mt-0.5 h-5 w-5 flex-none text-[#57d4ff]" />{robotixProfile.address}</p>
                <a href="mailto:info@robotixinstitute.io" className="flex gap-4 border-b border-white/15 pb-5 text-sm text-white/75 hover:text-white"><Mail className="h-5 w-5 flex-none text-[#57d4ff]" />info@robotixinstitute.io</a>
                <a href="tel:+260956355117" className="flex gap-4 text-sm text-white/75 hover:text-white"><Phone className="h-5 w-5 flex-none text-[#57d4ff]" />+260 956 355 117</a>
              </address>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#87662d]">How we can help</p><h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">Choose the purpose of your enquiry.</h2></div>
            <div className="grid gap-8 md:grid-cols-3">
              {enquiryRoutes.map((route) => <div key={route.number} className="border-l border-[#87662d]/45 pl-5"><span className="text-xs font-bold text-[#87662d]">{route.number}</span><h3 className="mt-4 font-serif text-xl">{route.title}</h3><p className="mt-3 text-sm leading-6 text-[#526174]">{route.detail}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <aside>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#87662d]">Before you write</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">A little context helps us respond well.</h2>
            <p className="mt-6 text-sm leading-7 text-[#526174]">For learner enquiries, include the learner&apos;s age and any previous coding experience. Schools may include the expected class size, location and preferred dates.</p>

            <dl className="mt-10 divide-y divide-[#102744]/20 border-y border-[#102744]/20">
              <div className="flex gap-4 py-5"><Clock3 className="h-5 w-5 flex-none text-[#87662d]" /><div><dt className="text-xs font-bold uppercase tracking-[0.14em]">Office hours</dt><dd className="mt-2 text-sm leading-6 text-[#526174]">{robotixProfile.openHours}</dd></div></div>
              <div className="flex gap-4 py-5"><Phone className="h-5 w-5 flex-none text-[#87662d]" /><div><dt className="text-xs font-bold uppercase tracking-[0.14em]">Additional line</dt><dd className="mt-2"><a href="tel:+260774743071" className="text-sm text-[#526174] hover:text-[#1e4e8c]">+260 774 743 071</a></dd></div></div>
            </dl>

            <Link href="/courses" className="mt-8 inline-flex items-center gap-3 border-b border-[#102744] pb-2 text-sm font-semibold hover:text-[#1e4e8c]">Review our programmes <ArrowRight className="h-4 w-4" /></Link>
          </aside>

          <div className="bg-white p-6 shadow-[0_18px_60px_rgba(16,39,68,0.08)] sm:p-10 lg:p-12">
            <div className="border-b border-[#102744]/15 pb-7"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#87662d]">Enquiry form</p><h2 className="mt-3 font-serif text-3xl">Write to our team</h2><p className="mt-3 text-sm leading-6 text-[#526174]">Required fields are marked with an asterisk.</p></div>
            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="text-xs font-bold uppercase tracking-[0.12em]">Full name *<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label>
                <label className="text-xs font-bold uppercase tracking-[0.12em]">Email address *<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} /></label>
              </div>
              <label className="block text-xs font-bold uppercase tracking-[0.12em]">Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="For example: school robotics programme" className={fieldClass} /></label>
              <label className="block text-xs font-bold uppercase tracking-[0.12em]">Message *<textarea required rows={7} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us how we can help." className={`${fieldClass} resize-y`} /></label>
              <div className="flex flex-col gap-4 border-t border-[#102744]/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" disabled={sending} className="inline-flex items-center justify-center gap-3 bg-[#1e4e8c] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#102744] disabled:cursor-wait disabled:opacity-60">{sending ? 'Sending…' : 'Send enquiry'} <Send className="h-4 w-4" /></button>
                {submittedRef && <p role="status" className="text-xs text-[#526174]">Received · Reference {submittedRef}</p>}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-[#1e4e8c] px-6 py-14 text-white sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4b36f]">Prefer direct contact?</p><p className="mt-2 font-serif text-2xl">Call +260 956 355 117</p></div><a href="mailto:info@robotixinstitute.io" className="inline-flex items-center gap-3 text-sm font-semibold text-white hover:text-[#57d4ff]">Email the institute <ArrowRight className="h-4 w-4" /></a></div>
      </section>

      <InstitutionalFooter />
    </main>
  );
}
