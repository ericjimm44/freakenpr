"use client";

import { useStore } from "@/store/useStore";
import { Icon } from "./Icon";
import { downloadBackup, backupFilename, newMemoriesSince } from "@/lib/backup";

// Local-first safety net: when there are new memories since the last backup,
// gently prompt a one-tap export. Keeps a single-phone setup durable without
// any cloud account.
export function BackupNudge() {
  const family = useStore((s) => s.family);
  const missions = useStore((s) => s.missions);
  const lastBackupAt = useStore((s) => s.lastBackupAt);
  const exportData = useStore((s) => s.exportData);
  const markBackedUp = useStore((s) => s.markBackedUp);

  if (!family) return null;
  const count = newMemoriesSince(missions, lastBackupAt);
  if (count === 0) return null;

  const backup = () => {
    downloadBackup(backupFilename(family.surname), exportData());
    markBackedUp();
  };

  return (
    <div className="card flex items-center gap-3 border-gold/40 bg-gold/10 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/25 text-clay">
        <Icon name="ShieldCheck" size={20} />
      </span>
      <div className="flex-1">
        <p className="font-display text-sm font-bold leading-tight">
          {count} new {count === 1 ? "memory" : "memories"} to back up
        </p>
        <p className="text-[11px] text-ink/55">Save a copy so nothing is ever lost.</p>
      </div>
      <button onClick={backup} className="btn-primary px-4 py-2 text-xs">
        <Icon name="Download" size={14} /> Back up
      </button>
    </div>
  );
}
