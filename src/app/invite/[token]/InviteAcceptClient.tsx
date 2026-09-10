'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, GlassCard, Input } from '@/components/ui';
import { useAuthStore } from '@/store';
import { LockKeyhole, UserPlus } from 'lucide-react';

export default function InviteAcceptClient({ token }: { token: string }) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/team/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Invite could not be accepted.');
      login(json.data.user, json.data.token);
      router.push('/team');
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : 'Invite could not be accepted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 aurora-bg opacity-75" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-8">
            <Badge variant="accent" className="mb-4">
              <UserPlus className="mr-1 h-3 w-3" />
              Team Invite
            </Badge>
            <h1 className="font-heading text-3xl font-bold">Create your Robotix team account</h1>
            <p className="mt-3 text-sm leading-6 text-white/62">
              Set a password to accept your invitation and open the workspace assigned to your role.
            </p>
            {error ? (
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {error}
              </div>
            ) : null}
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                icon={<LockKeyhole className="h-4 w-4" />}
                required
              />
              <Input
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                icon={<LockKeyhole className="h-4 w-4" />}
                required
              />
              <Button type="submit" loading={loading}>
                Accept invite
              </Button>
            </form>
          </GlassCard>
        </div>
      </section>
      <Footer />
    </main>
  );
}
