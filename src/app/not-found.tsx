import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';
import { Button, GlassCard } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-dark px-4">
      <div className="circuit-overlay" />
      <GlassCard className="max-w-lg w-full p-10 text-center relative z-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
          <Compass className="w-8 h-8" />
        </div>
        <p className="text-7xl font-heading font-extrabold gradient-text mb-2">404</p>
        <h1 className="font-heading text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-white/60 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/">
            <Button icon={<Home className="w-4 h-4" />}>Go Home</Button>
          </Link>
          <Link href="/courses">
            <Button variant="secondary" icon={<Search className="w-4 h-4" />}>Browse Courses</Button>
          </Link>
        </div>
      </GlassCard>
    </main>
  );
}
