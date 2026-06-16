"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { BottomNav } from "./BottomNav";
import { Icon } from "./Icon";

/**
 * Shared page frame: waits for the persisted store to hydrate, optionally
 * gates on an existing family, and renders the bottom navigation.
 */
export function AppFrame({
  children,
  requireFamily = true,
  nav = true,
}: {
  children: React.ReactNode;
  requireFamily?: boolean;
  nav?: boolean;
}) {
  const hydrated = useStore((s) => s.hydrated);
  const onboarded = useStore((s) => s.onboarded);
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (hydrated && requireFamily && !onboarded) {
      setRedirecting(true);
      router.replace("/welcome");
    }
  }, [hydrated, onboarded, requireFamily, router]);

  if (!hydrated || (requireFamily && !onboarded) || redirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-ink/50">
        <Icon name="Compass" size={40} className="animate-pulse text-forest" />
        <p className="text-sm">Charting your adventures…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-4">{children}</main>
      {nav && <BottomNav />}
    </div>
  );
}
