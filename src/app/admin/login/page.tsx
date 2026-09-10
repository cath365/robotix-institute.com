'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useApi';

const inputClass = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#2478f3] focus:ring-2 focus:ring-[#2478f3]/15';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, { adminOnly: true });
      router.replace('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Administrator sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#eef3f8] text-slate-900 lg:grid-cols-[1fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-[#081d3d] px-16 py-14 text-white lg:flex lg:flex-col xl:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(36,120,243,0.3),transparent_38%),radial-gradient(circle_at_85%_75%,rgba(87,212,255,0.17),transparent_35%)]" />
        <Link href="/" className="relative z-10 w-fit"><Image src="/images/logo-white.png" alt="Robotix Institute" width={190} height={54} className="h-12 w-auto object-contain" priority /></Link>
        <div className="relative z-10 my-auto max-w-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/15 bg-white/10"><ShieldCheck className="h-7 w-7 text-[#57d4ff]" /></div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#57d4ff]">Restricted administration</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight">Operate the institute from one secure workspace.</h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/65">Access enrolment enquiries, school operations, programs, team coordination, and approved student work.</p>
        </div>
        <p className="relative z-10 text-xs text-white/40">Authorised Robotix Institute personnel only</p>
      </section>

      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden"><Image src="/images/logo-color.png" alt="Robotix Institute" width={180} height={50} className="h-11 w-auto object-contain" priority /></Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#102744]"><ArrowLeft className="h-4 w-4" /> Public website</Link>
        </div>
        <div className="my-auto w-full max-w-md py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2478f3]">Administration portal</p>
          <h2 className="mt-4 font-serif text-4xl text-[#102744]">Admin sign in.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Use the Firebase account authorised by Robotix Institute.</p>
          {error && <div role="alert" className="mt-6 border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-700">Admin email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} required /></label>
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-700">Password<input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pr-12`} required /></label>
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute bottom-3.5 right-4 text-slate-500 hover:text-slate-900" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <div className="flex items-center justify-between text-sm"><Link href="/login" className="font-semibold text-slate-600 hover:text-[#102744]">Student sign in</Link><Link href="/forgot-password" className="font-semibold text-[#1e4e8c] hover:underline">Forgot password?</Link></div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#2478f3] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#102744] disabled:cursor-wait disabled:opacity-60">{loading ? 'Verifying access...' : 'Enter admin dashboard'} <LockKeyhole className="h-4 w-4" /></button>
          </form>
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500"><strong className="text-slate-700">Security:</strong> Student accounts are rejected by this portal even when their password is correct.</div>
        </div>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Robotix Institute Zambia</p>
      </section>
    </main>
  );
}
