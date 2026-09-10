'use client';

import './globals.css';
import Link from 'next/link';
import { useEffect } from 'react';

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app error]', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4 text-white font-body">
        <h1 className="font-heading text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-white/60 text-center text-sm max-w-md mb-6">
          {process.env.NODE_ENV === 'development' ? (
            <>
              <code className="block text-left bg-white/10 rounded-lg p-3 mb-4 text-brand-accent break-words whitespace-pre-wrap">
                {error.message}
              </code>
              Try a hard refresh. If this persists after sign-in, open DevTools → Application → Local Storage,
              delete keys starting with{' '}
              <code className="text-brand-accent">robotix</code>, then reload.
            </>
          ) : (
            <>
              Please try again in a moment. If the issue continues, contact support with reference{' '}
              {error.digest ? <span className="text-brand-accent">{error.digest}</span> : ''}.
            </>
          )}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-brand-accent text-brand-dark font-heading font-semibold px-6 py-2 text-sm hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-white/20 px-6 py-2 text-sm hover:bg-white/10"
          >
            Home
          </Link>
        </div>
      </body>
    </html>
  );
}
