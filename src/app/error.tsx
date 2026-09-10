'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function RouteErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[route error]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-white text-center">
      <h1 className="font-heading text-xl font-bold mb-2">This page crashed</h1>
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-left max-w-xl w-full mb-6 p-4 rounded-xl bg-white/10 text-xs text-brand-accent overflow-auto whitespace-pre-wrap">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-brand-accent text-brand-dark font-semibold px-5 py-2 text-sm"
        >
          Reload section
        </button>
        <Link href="/" className="rounded-xl border border-white/20 px-5 py-2 text-sm hover:bg-white/10">
          Home
        </Link>
      </div>
    </div>
  );
}
