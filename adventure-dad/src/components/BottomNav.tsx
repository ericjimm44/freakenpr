"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { cx } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: "Compass" },
  { href: "/missions", label: "Missions", icon: "Map" },
  { href: "/map", label: "Atlas", icon: "Globe2" },
  { href: "/lore", label: "Lore", icon: "BookOpen" },
  { href: "/family", label: "Family", icon: "Users" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 mt-auto border-t border-ink/10 bg-parchment/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {TABS.map((t) => {
          const active =
            t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cx(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition",
                active ? "text-forest" : "text-ink/45 hover:text-ink/70"
              )}
            >
              <Icon name={t.icon} size={22} strokeWidth={active ? 2.4 : 1.9} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
