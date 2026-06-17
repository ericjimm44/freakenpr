import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-sky/15 text-3xl">
        🗺️
      </span>
      <h1 className="font-display text-2xl font-black">Off the map</h1>
      <p className="max-w-xs text-sm text-ink/60">
        This page isn&apos;t on any of our routes yet.
      </p>
      <Link href="/" className="btn-primary">
        Back to base camp
      </Link>
    </div>
  );
}
