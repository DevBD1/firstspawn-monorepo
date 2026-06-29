import type { SVGProps } from "react";

// Inline Lucide path data (stroke 1.75, rounded joins) — mirrors the Worldlight
// admin kit. Inlined so the console needs no icon dependency or network.
const PATHS: Record<string, string[]> = {
  dashboard: ["M3 3h7v9H3z", "M14 3h7v5h-7z", "M14 12h7v9h-7z", "M3 16h7v5H3z"],
  server: ["M2 2h20v8H2z", "M2 14h20v8H2z", "M6 6h.01", "M6 18h.01"],
  shield: [
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
    "M12 8v4",
    "M12 16h.01",
  ],
  inbox: [
    "M22 12h-6l-2 3h-4l-2-3H2",
    "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  ],
  external: [
    "M15 3h6v6",
    "M10 14 21 3",
    "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
  ],
  "chevron-right": ["m9 18 6-6-6-6"],
  plus: ["M12 5v14", "M5 12h14"],
  search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "m21 21-4.3-4.3"],
  check: ["M20 6 9 17l-5-5"],
  x: ["M18 6 6 18", "m6 6 12 12"],
  ban: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "m4.9 4.9 14.2 14.2"],
  archive: ["M4 4h16v4H4z", "M6 8v12h12V8", "M10 12h4"],
  refresh: [
    "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
    "M21 3v5h-5",
    "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
    "M8 16H3v5",
  ],
  info: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 16v-4", "M12 8h.01"],
  globe: [
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
    "M2 12h20",
    "M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20z",
  ],
  alert: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    "M12 9v4",
    "M12 17h.01",
  ],
  clock: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"],
  users: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  pulse: ["M22 12h-4l-3 9L9 3l-3 9H2"],
};

export type AdminIconName = keyof typeof PATHS | string;

export function AdminIcon({
  name,
  size = 18,
  className,
  ...props
}: { name: AdminIconName; size?: number } & SVGProps<SVGSVGElement>) {
  const paths = PATHS[name];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
      {...props}
    >
      {(paths ?? []).map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
