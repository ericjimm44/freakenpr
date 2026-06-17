"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would report to Sentry/analytics.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-clay/15 text-3xl">
        🧭
      </span>
      <h1 className="font-display text-2xl font-black">We lost the trail</h1>
      <p className="max-w-xs text-sm text-ink/60">
        Something went sideways on this adventure. Your memories are safe.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
