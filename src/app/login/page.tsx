'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/hooks/useApi';

const inputClass = 'mt-2 w-full border border-[#102744]/25 bg-white px-4 py-3.5 text-sm outline-none transition-colors focus:border-[#1e4e8c]';

export default function LoginPage() {
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
      const result = await login(email, password);
      router.push(result.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f4f0e7] text-[#102744] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between">
          <Link href="/"><Image src="/images/logo-color.png" alt="Robotix Institute" width={190} height={54} className="h-12 w-auto object-contain" priority /></Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> Home</Link>
        </div>
        <div className="my-auto w-full max-w-md py-16">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#87662d]">Student portal</p>
          <h1 className="mt-4 font-serif text-4xl">Welcome back.</h1>
          <p className="mt-3 text-sm leading-6 text-[#526174]">Sign in to continue your coursework and review your progress.</p>
          {error && <div role="alert" className="mt-6 border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <label className="block text-xs font-bold uppercase tracking-[0.12em]">Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} required /></label>
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-[0.12em]">Password<input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pr-12`} required /></label>
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute bottom-3.5 right-4 text-[#526174] hover:text-[#102744]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <div className="flex justify-end text-sm"><Link href="/forgot-password" className="font-semibold text-[#1e4e8c] hover:underline">Forgot password?</Link></div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 bg-[#1e4e8c] px-6 py-4 text-sm font-bold text-white hover:bg-[#102744] disabled:cursor-wait disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'} <LockKeyhole className="h-4 w-4" /></button>
          </form>
          <p className="mt-7 border-t border-[#102744]/15 pt-6 text-sm text-[#526174]">New learner? <Link href="/register" className="font-bold text-[#1e4e8c] hover:underline">Create a student account</Link></p>
          <p className="mt-3 text-sm text-[#526174]">Robotix administrator? <Link href="/admin/login" className="font-bold text-[#1e4e8c] hover:underline">Use admin sign in</Link></p>
        </div>
        <p className="text-xs text-[#738092]">© {new Date().getFullYear()} Robotix Institute Zambia</p>
      </section>
      <section className="hidden min-h-screen bg-[#102744] p-16 text-white lg:flex lg:flex-col lg:justify-end xl:p-24">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4b36f]">A place for sustained work</p>
        <blockquote className="mt-6 max-w-2xl font-serif text-4xl leading-tight xl:text-5xl">“Learning becomes visible when a student can build, test and explain.”</blockquote>
        <p className="mt-8 max-w-xl text-sm leading-7 text-white/60">Your portal keeps lessons, completed work and learning progress together in one private account.</p>
      </section>
    </main>
  );
}
