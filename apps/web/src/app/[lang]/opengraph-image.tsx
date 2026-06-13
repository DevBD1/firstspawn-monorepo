import { ImageResponse } from "next/og";

export const runtime = "edge";

// Image metadata
export const alt = "FirstSpawn - Find your forever server";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// WorldLight tokens (mirrors packages/ui brand.css; Satori can't read CSS vars).
const WL = {
  bg: "#12151E",
  panel: "#1A1F2B",
  border: "#2A3040",
  foreground: "#EDEFF4",
  muted: "#8B92A6",
  primary: "#E5A04C",
};

// Sigil mark (same cells as packages/ui Sigil), rendered as an SVG data URI so
// Satori draws it reliably.
const SIGIL_CELLS = [
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 3],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
];

function sigilDataUri(color: string) {
  const u = 4.8;
  const rects = SIGIL_CELLS.map(
    ([x, y]) => `<rect x="${x * u}" y="${y * u}" width="${u}" height="${u}" fill="${color}"/>`
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Load the WorldLight display font (Unbounded) for the title. Falls back to the
// default Satori font if the fetch fails so the card always renders.
async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Unbounded:wght@700").then(
      (res) => res.text()
    );
    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const displayFont = await loadDisplayFont();
  const titleFontFamily = displayFont ? "Unbounded" : "sans-serif";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: WL.bg,
        backgroundImage: `linear-gradient(145deg, ${WL.bg} 0%, #1a1c2e 52%, #3a2e33 84%, #6b4a33 100%)`,
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(to right, ${WL.border} 1px, transparent 1px), linear-gradient(to bottom, ${WL.border} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: 0.12,
        }}
      />

      {/* Warm dawn glow */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 38%, rgba(229,160,76,0.18) 0%, transparent 62%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
          padding: "56px 64px",
          borderRadius: 16,
          border: `1px solid ${WL.border}`,
          background: "rgba(26,31,43,0.72)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sigilDataUri(WL.primary)}
          width={72}
          height={72}
          alt=""
          style={{ marginBottom: 28 }}
        />

        {/* Label pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 15,
            letterSpacing: "3px",
            color: WL.primary,
            textTransform: "uppercase",
            fontWeight: 700,
            padding: "6px 16px",
            borderRadius: 999,
            border: `1px solid rgba(229,160,76,0.4)`,
            background: "rgba(229,160,76,0.10)",
            marginBottom: 24,
          }}
        >
          Verified server discovery
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 78,
            fontFamily: titleFontFamily,
            fontWeight: 700,
            color: WL.foreground,
            lineHeight: 1,
            marginBottom: 22,
            letterSpacing: "-1px",
            display: "flex",
          }}
        >
          <span>FIRST</span>
          <span style={{ color: WL.primary }}>SPAWN</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: WL.muted,
            textAlign: "center",
            maxWidth: 760,
            fontWeight: 400,
            lineHeight: 1.45,
          }}
        >
          Find your forever server. Real performance, genuine community, and rankings that
          can&apos;t be bought — for Minecraft &amp; Hytale.
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: displayFont
        ? [
            {
              name: "Unbounded",
              data: displayFont,
              style: "normal",
              weight: 700,
            },
          ]
        : [],
    }
  );
}
