import { LoadingSpinner } from '@/components/ui';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-white/40 mt-4">Loading…</p>
      </div>
    </div>
  );
}
