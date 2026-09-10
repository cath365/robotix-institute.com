'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button, Input, GlassCard } from '@/components/ui';
import { sendFirebasePasswordReset } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await sendFirebasePasswordReset(email);
      setDone(true);
    } catch (resetError) {
      const code = typeof resetError === 'object' && resetError && 'code' in resetError ? String(resetError.code) : '';
      // Firebase may hide missing accounts when email-enumeration protection is enabled.
      if (code === 'auth/user-not-found') setDone(true);
      else setError('The reset email could not be sent. Check the address and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4">
      <div className="circuit-overlay" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo-white.png"
              alt="Robotix Institute"
              width={220}
              height={60}
              className="h-14 w-auto object-contain mx-auto"
              priority
            />
          </Link>
        </div>

        <GlassCard className="p-8">
          <Link href="/login" className="text-xs text-white/40 hover:text-white inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to sign in
          </Link>

          {done ? (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-3" />
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-sm text-white/60 mb-6">
                If an account exists for <span className="text-white">{email}</span>, you&apos;ll receive a password reset link shortly.
              </p>
              <Link href="/login">
                <Button className="w-full">Return to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-2xl font-bold text-white text-center mb-2">
                Forgot your password?
              </h2>
              <p className="text-white/50 text-center mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={onSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
                <Button type="submit" className="w-full" loading={submitting}>
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
