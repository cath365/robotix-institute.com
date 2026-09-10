'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useApi';

const inputClass = 'mt-2 w-full border border-[#102744]/25 bg-white px-4 py-3.5 text-sm outline-none transition-colors focus:border-[#1e4e8c]';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.');
    if (form.password !== form.confirmPassword) return setError('The two passwords do not match.');
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role: 'STUDENT' });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f4f0e7] text-[#102744] lg:grid-cols-[0.82fr_1.18fr]">
      <section className="hidden min-h-screen bg-[#102744] p-16 text-white lg:flex lg:flex-col lg:justify-between xl:p-24">
        <Link href="/"><Image src="/images/logo-white.png" alt="Robotix Institute" width={190} height={54} className="h-12 w-auto object-contain" priority /></Link>
        <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4b36f]">Your student record</p><h1 className="mt-6 max-w-xl font-serif text-4xl leading-tight xl:text-5xl">One account for your learning, projects and progress.</h1><ul className="mt-10 space-y-4 text-sm text-white/70">{['Continue lessons from where you stopped', 'Keep completed work in one place', 'Build a record of practical achievement'].map((item) => <li key={item} className="flex gap-3"><Check className="h-5 w-5 flex-none text-[#57d4ff]" />{item}</li>)}</ul></div>
        <p className="text-xs text-white/40">Student accounts are personal and should not be shared.</p>
      </section>
      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between lg:justify-end"><Link href="/" className="lg:hidden"><Image src="/images/logo-color.png" alt="Robotix Institute" width={170} height={48} className="h-11 w-auto" /></Link><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> Home</Link></div>
        <div className="my-auto w-full max-w-xl py-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#87662d]">Student registration</p>
          <h2 className="mt-4 font-serif text-4xl">Create your account.</h2>
          <p className="mt-3 text-sm leading-6 text-[#526174]">Registration is open to Robotix learners. Staff and instructor access is issued separately by the institute.</p>
          {error && <div role="alert" className="mt-6 border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2"><label className="block text-xs font-bold uppercase tracking-[0.12em]">First name<input required autoComplete="given-name" value={form.firstName} onChange={update('firstName')} className={inputClass} /></label><label className="block text-xs font-bold uppercase tracking-[0.12em]">Last name<input required autoComplete="family-name" value={form.lastName} onChange={update('lastName')} className={inputClass} /></label></div>
            <label className="block text-xs font-bold uppercase tracking-[0.12em]">Email address<input required type="email" autoComplete="email" value={form.email} onChange={update('email')} className={inputClass} /></label>
            <div className="relative"><label className="block text-xs font-bold uppercase tracking-[0.12em]">Password<input required minLength={8} type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={update('password')} className={`${inputClass} pr-12`} /></label><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute bottom-3.5 right-4 text-[#526174]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            <label className="block text-xs font-bold uppercase tracking-[0.12em]">Confirm password<input required minLength={8} type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} className={inputClass} /></label>
            <p className="text-xs leading-5 text-[#738092]">By creating an account, you agree to use the learning portal responsibly and accept our <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy notice</Link>.</p>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 bg-[#1e4e8c] px-6 py-4 text-sm font-bold text-white hover:bg-[#102744] disabled:cursor-wait disabled:opacity-60">{loading ? 'Creating account…' : 'Create student account'} <UserPlus className="h-4 w-4" /></button>
          </form>
          <p className="mt-7 border-t border-[#102744]/15 pt-6 text-sm text-[#526174]">Already registered? <Link href="/login" className="font-bold text-[#1e4e8c] hover:underline">Sign in to your portal</Link></p>
        </div>
      </section>
    </main>
  );
}
