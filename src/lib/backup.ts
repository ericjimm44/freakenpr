import type { Mission } from "./types";

/** Trigger a browser download of the backup JSON. */
export function downloadBackup(filename: string, json: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function backupFilename(surname: string): string {
  const slug = surname.replace(/\s+/g, "-").toLowerCase();
  const date = new Date().toISOString().slice(0, 10);
  return `adventure-dad-${slug}-${date}.json`;
}

/** How many completed memories exist that postdate the last backup. */
export function newMemoriesSince(missions: Mission[], lastBackupAt?: string): number {
  if (!lastBackupAt) return missions.filter((m) => m.status === "completed").length;
  const cutoff = new Date(lastBackupAt).getTime();
  return missions.filter(
    (m) => m.status === "completed" && m.completedAt && new Date(m.completedAt).getTime() > cutoff
  ).length;
}

/**
 * Ask the browser to make our localStorage persistent so the OS won't silently
 * evict the family's memories under storage pressure. Safe no-op where
 * unsupported. Returns whether storage is now persisted.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
