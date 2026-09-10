'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, KeyRound, Lock } from 'lucide-react';
import { Button, GlassCard, Input } from '@/components/ui';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams?.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('This reset link is missing its token. Request a new password reset email.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Could not reset your password.');
      }

      setDone(true);
      setTimeout(() => router.push('/login'), 1200);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not reset your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4">
      <div className="circuit-overlay" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo-white.png"
              alt="Robotix Institute"
              width={220}
              height={60}
              className="mx-auto h-14 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <GlassCard className="p-8">
          <Link href="/login" className="mb-4 inline-flex items-center gap-1 text-xs text-white/40 hover:text-white">
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>

          {done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-400" />
              <h2 className="mb-2 font-heading text-2xl font-bold text-white">Password updated</h2>
              <p className="mb-6 text-sm text-white/60">
                Your Robotix password has been reset successfully. Redirecting you back to sign in.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-center font-heading text-2xl font-bold text-white">Choose a new password</h2>
              <p className="mb-6 text-center text-white/50">
                Set a fresh password for your Robotix Institute account.
              </p>

              {error ? (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-5">
                <Input
                  label="New password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  required
                />
                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<KeyRound className="h-4 w-4" />}
                  required
                />
                <Button type="submit" className="w-full" loading={submitting}>
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
