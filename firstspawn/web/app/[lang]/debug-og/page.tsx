import { Locale } from "../../../lib/i18n-config";

export default async function DebugOG({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#111",
        color: "white",
        gap: "2rem",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontFamily: "monospace", fontSize: "1.5rem" }}>
        OpenGraph Preview: <span style={{ color: "#22d3ee" }}>{lang}</span>
      </h1>
      <div
        style={{
          border: "2px dashed #333",
          padding: "1rem",
          maxWidth: "100%",
        }}
      >
        {/* Using a timestamp to prevent caching during dev */}
        <img
          src={`/${lang}/opengraph-image?t=${Date.now()}`}
          alt="Open Graph Preview"
          style={{
            maxWidth: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>
      <p style={{ fontFamily: "monospace", color: "#666" }}>
        Path: /{lang}/opengraph-image
      </p>
    </div>
  );
}
