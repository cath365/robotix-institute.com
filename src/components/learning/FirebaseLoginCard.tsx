'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Lock, LogIn, LogOut, Mail } from 'lucide-react';
import { Badge, Button, GlassCard, Input } from '@/components/ui';
import { isFirebaseConfigured, signInWithFirebaseEmail, signInWithGoogle, signOutFirebase } from '@/lib/firebase';
import { useLearningProfile } from '@/components/learning/useLearningProfile';

export function FirebaseLoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user } = useLearningProfile();
  const [status, setStatus] = useState(isFirebaseConfigured() ? 'Firebase Auth ready' : 'Firebase Auth not configured');
  const [loading, setLoading] = useState(false);
  const firebaseReady = isFirebaseConfigured();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signInWithFirebaseEmail(email, password);
      setStatus('Signed in for this learning session');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  if (!firebaseReady) {
    return (
      <GlassCard className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand-accent" />
            <h2 className="font-heading text-lg font-bold">Learning account</h2>
          </div>
          <Badge variant="primary">Coming online</Badge>
        </div>

        <p className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white/65">
          Learning sync, saved progress, and Firebase sign-in are being connected. Public lessons are still available while the account layer is prepared.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/learn">
            <Button type="button" size="sm" variant="secondary">Browse lessons</Button>
          </Link>
          <Link href="/login">
            <Button type="button" size="sm" variant="ghost">Use main login</Button>
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-brand-accent" />
          <h2 className="font-heading text-lg font-bold">Firebase login</h2>
        </div>
        <Badge variant={firebaseReady ? 'success' : 'danger'}>{firebaseReady ? 'Live' : 'Setup needed'}</Badge>
      </div>
      {user ? (
        <div className="space-y-3">
          <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-100">
            Signed in as {user.email || user.displayName}
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={() => signOutFirebase()} icon={<LogOut className="h-4 w-4" />}>
            Sign out
          </Button>
        </div>
      ) : (
      <form onSubmit={submit} className="space-y-3">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="student@example.com"
          icon={<Mail className="h-4 w-4" />}
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          icon={<Lock className="h-4 w-4" />}
          required
        />
        <Button type="submit" size="sm" loading={loading} disabled={!firebaseReady} icon={<LogIn className="h-4 w-4" />}>
          Sign in
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={!firebaseReady} onClick={() => signInWithGoogle()} icon={<LogIn className="h-4 w-4" />}>
          Google
        </Button>
      </form>
      )}
      <p className="mt-3 text-xs text-white/45">{status}</p>
    </GlassCard>
  );
}
