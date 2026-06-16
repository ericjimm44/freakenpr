import type { Child } from "@/lib/types";
import { COLOR_HEX } from "@/lib/utils";

export function ChildAvatar({
  child,
  size = 40,
}: {
  child: Pick<Child, "name" | "avatarColor">;
  size?: number;
}) {
  const initials = child.name.slice(0, 1).toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-parchment ring-2 ring-parchment"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        backgroundColor: COLOR_HEX[child.avatarColor] ?? COLOR_HEX.sunset,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
