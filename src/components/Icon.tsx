"use client";

import { icons, type LucideProps } from "lucide-react";

// Render any lucide icon by its string name (icons are stored as names in our
// data model so categories/achievements stay serializable).
export function Icon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Cmp = (icons as Record<string, React.ComponentType<LucideProps>>)[name];
  if (!Cmp) return <icons.Sparkles {...props} />;
  return <Cmp {...props} />;
}
