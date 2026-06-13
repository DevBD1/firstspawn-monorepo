"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WLButton } from "@firstspawn/ui";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { getCountryOptions } from "@/lib/countries";

const WL_TAG_FEATURES = [
  "Survival",
  "Whitelist",
  "Economy",
  "Trading",
  "Towny",
  "Skyblock",
  "Quests",
  "RPG",
  "Hardcore",
  "Seasonal",
  "Creative",
  "Builds",
  "Showcase",
  "Dungeons",
  "Family-friendly",
];

function WLStepDots({ idx, steps }: { idx: number; steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <span
            className={`inline-flex items-center gap-2 font-body text-xs font-bold ${
              i === idx ? "text-foreground" : i < idx ? "text-success" : "text-muted"
            }`}
          >
            <span
              className={`font-mono text-[10.5px] w-5 h-5 inline-flex items-center justify-center rounded-lg ${
                i === idx
                  ? "bg-primary text-on-primary border border-primary-hover"
                  : i < idx
                    ? "text-success border border-success"
                    : "text-muted border border-border"
              }`}
            >
              {i < idx ? "✓" : i + 1}
            </span>
            {label}
          </span>
          {i < steps.length - 1 && <span className="text-border mx-1">—</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function WLListFlowClient({
  lang,
  dictionary,
}: {
  lang: string;
  dictionary: AppDictionary;
}) {
  const router = useRouter();
  const copy = dictionary.listFlow;
  const countries = dictionary.common.countries;
  const countryOptions = useMemo(() => getCountryOptions(lang, countries), [lang, countries]);
  const steps = [copy.steps.address, copy.steps.ownership, copy.steps.profile, copy.steps.publish];
  const [idx, setIdx] = useState(0);
  const [addr, setAddr] = useState("");
  const [pinged, setPinged] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [name, setName] = useState("Emberfall");
  const [blurb, setBlurb] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [country, setCountry] = useState("WW");
  const [published, setPublished] = useState(false);

  const slug = (name || "your-server")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const doPing = () => {
    if (!addr.trim()) return;
    setPinging(true);
    setTimeout(() => {
      setPinging(false);
      setPinged(true);
    }, 900);
  };

  const doVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1100);
  };

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : tags.length < 4 ? [...tags, t] : tags);
  };

  const handlePublish = () => {
    // Save to localStorage as a custom server for this user so it appears in owner console switcher
    try {
      const customServersStr = localStorage.getItem("fsproto.custom_servers");
      const customServers = customServersStr ? JSON.parse(customServersStr) : [];

      const newServer = {
        id: slug,
        slug: slug,
        name: name,
        description: blurb || copy.preview.fallbackBlurb,
        game: "mc_java",
        catalog_status: "active",
        freshness_status: "online",
        auth_mode: "official",
        country_code: country,
        logo_url: null,
        banner_url: null,
        last_ping_at: new Date().toISOString(),
        latest_metrics: {
          ping_ms: 41,
          online_players: 87,
          max_players: 150,
          minecraft_version: "1.21.4 · Java",
          occurred_at: new Date().toISOString(),
        },
        host: addr,
        port: 25565,
        socials: [
          { platform: "website", url: `https://${slug}.net`, display_order: 0 },
          { platform: "discord", url: `https://discord.gg/${slug}`, display_order: 1 },
        ],
        supported_clients: [{ client_name: "mc_java", client_version: "1.21.4" }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pending: true, // Marks it as pending crawl on the console dashboard
      };

      // Exclude previous duplicates of this server
      const filtered = customServers.filter((s: { slug: string }) => s.slug !== slug);
      localStorage.setItem("fsproto.custom_servers", JSON.stringify([...filtered, newServer]));
    } catch (e) {
      console.error(e);
    }
    setPublished(true);
  };

  const pingRow = (k: string, v: string, colorClass = "text-foreground") => (
    <div className="flex justify-between items-baseline gap-2">
      <span className="font-body text-[12.5px] text-muted">{k}</span>
      <span className={`font-mono text-xs font-bold ${colorClass}`}>{v}</span>
    </div>
  );

  return (
    <div className="max-w-[640px] mx-auto px-4 py-8">
      <h1 className="font-display font-semibold text-2xl text-foreground mb-1.5">
        {copy.header.title}
      </h1>
      <p className="font-body text-[13.5px] leading-relaxed text-muted mb-6">
        {copy.header.summary}
      </p>

      <WLStepDots idx={published ? 4 : idx} steps={steps} />

      {/* Step 1: Address */}
      {idx === 0 && (
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="font-display font-medium text-base text-foreground mb-1">
            {copy.address.title}
          </h2>
          <p className="font-body text-xs text-muted leading-relaxed mb-4">
            {copy.address.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={addr}
              onChange={(e) => {
                setAddr(e.target.value);
                setPinged(false);
              }}
              placeholder={copy.address.hostPlaceholder}
              className="font-mono text-xs leading-relaxed p-2.5 bg-secondary border border-border rounded-lg outline-none text-foreground focus:border-primary flex-1"
            />
            <WLButton variant="primary" onClick={doPing} disabled={!addr.trim() || pinging}>
              {pinging ? copy.address.pingingLabel : copy.address.checkServerLabel}
            </WLButton>
          </div>
          {pinged ? (
            <div className="mt-4 bg-secondary border border-border rounded-xl p-4 flex flex-col gap-2.5">
              {pingRow(copy.address.stats.status, copy.address.stats.reachable, "text-success")}
              {pingRow(copy.address.stats.version, "1.21.4 · Java")}
              {pingRow(copy.address.stats.onlineNow, "87 players", "text-success")}
              {pingRow(copy.address.stats.motd, "“Emberfall — seasonal survival”")}
              <div className="flex justify-end mt-2">
                <WLButton variant="primary" size="sm" onClick={() => setIdx(1)}>
                  {copy.address.continueLabel}
                </WLButton>
              </div>
            </div>
          ) : (
            <div className="font-mono text-[10px] text-muted mt-3">{copy.address.supportNote}</div>
          )}
        </div>
      )}

      {/* Step 2: Ownership */}
      {idx === 1 && (
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="font-display font-medium text-base text-foreground mb-1">
            {copy.ownership.title}
          </h2>
          <p className="font-body text-xs text-muted leading-relaxed mb-4">
            {copy.ownership.description}
          </p>
          <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-2">
            {copy.ownership.tokenLabel}
          </div>
          <div className="flex items-center justify-between bg-secondary border border-border rounded-lg p-2.5 mb-4 select-all">
            <span className="font-mono text-xs text-foreground font-bold tracking-wider">
              fs-verify-7K2M9X
            </span>
            <span className="font-body text-[10px] font-bold text-muted uppercase">
              {copy.ownership.copyLabel}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="border border-border rounded-xl p-3 flex flex-col">
              <div className="font-body font-bold text-xs text-foreground mb-1">
                {copy.ownership.motdTitle}
              </div>
              <div className="font-body text-[11.5px] leading-relaxed text-muted">
                {copy.ownership.motdBody}
              </div>
            </div>
            <div className="border border-border rounded-xl p-3 flex flex-col">
              <div className="font-body font-bold text-xs text-foreground mb-1">
                {copy.ownership.dnsTitle}
              </div>
              <div className="font-body text-[11.5px] leading-relaxed text-muted">
                {copy.ownership.dnsBodyPrefix}{" "}
                <span className="font-mono text-[10.5px] bg-secondary px-1 py-0.5 rounded">{`_firstspawn.${addr.replace(/^play\./, "") || copy.ownership.dnsFallbackDomain}`}</span>
                {copy.ownership.dnsBodySuffix}
              </div>
            </div>
          </div>
          {verified ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-body text-xs font-bold text-success">
                {copy.ownership.verifiedLabel}
              </span>
              <WLButton variant="primary" size="sm" onClick={() => setIdx(2)}>
                {copy.ownership.continueLabel}
              </WLButton>
            </div>
          ) : (
            <WLButton variant="primary" onClick={doVerify} disabled={verifying}>
              {verifying ? copy.ownership.checkingLabel : copy.ownership.verifyLabel}
            </WLButton>
          )}
        </div>
      )}

      {/* Step 3: Profile */}
      {idx === 2 && (
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="font-display font-medium text-base text-foreground mb-1">
              {copy.profile.title}
            </h2>
            <p className="font-body text-xs text-muted leading-relaxed">
              {copy.profile.description}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-1.5">
                {copy.profile.nameLabel}
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-body text-xs leading-relaxed p-2.5 bg-secondary border border-border rounded-lg outline-none text-foreground focus:border-primary w-full"
              />
              <div className="font-mono text-[10px] text-muted mt-1.5">{`firstspawn.com/${lang}/server/${slug}`}</div>
            </div>
            <div>
              <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-1.5">
                {copy.profile.blurbLabel.replace("{count}", String(140 - blurb.length))}
              </div>
              <input
                value={blurb}
                maxLength={140}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder={copy.profile.blurbPlaceholder}
                className="font-body text-xs leading-relaxed p-2.5 bg-secondary border border-border rounded-lg outline-none text-foreground focus:border-primary w-full"
              />
            </div>
            <div>
              <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-2">
                {copy.profile.tagsLabel.replace("{count}", String(tags.length))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {WL_TAG_FEATURES.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={`font-body text-xs font-semibold rounded-full px-3 py-1 cursor-pointer transition duration-120 border ${
                      tags.includes(t)
                        ? "bg-primary border-primary text-on-primary"
                        : "border-border text-muted hover:border-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-1.5">
                {copy.profile.countryLabel}
              </div>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="font-body text-xs leading-relaxed p-2.5 bg-secondary border border-border rounded-lg outline-none text-foreground focus:border-primary w-full appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888fa5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                }}
              >
                {countryOptions.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="font-mono text-[10px] text-muted mt-1.5">
                {copy.profile.countryHint}
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <WLButton variant="primary" onClick={() => setIdx(3)}>
                {copy.profile.previewLabel}
              </WLButton>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Publish */}
      {idx === 3 && (
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-sm flex flex-col">
          {!published ? (
            <>
              <h2 className="font-display font-medium text-base text-foreground mb-1">
                {copy.preview.draftTitle}
              </h2>
              <p className="font-body text-xs text-muted leading-relaxed mb-4">
                {copy.preview.draftDescription}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display font-medium text-base text-foreground mb-1">
                {copy.preview.publishedTitle}
              </h2>
              <p className="font-body text-xs text-muted leading-relaxed mb-4">
                {copy.preview.publishedDescription}
              </p>
            </>
          )}

          {/* Preview Box */}
          <div className="bg-secondary border border-border rounded-xl p-4 flex flex-col gap-2 mb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-display font-bold text-sm text-foreground">
                {name || copy.preview.fallbackName}
              </span>
              <span className="font-body text-[11px] font-semibold text-muted">
                {dictionary.serverCatalog.games.mcJava} · {countries[country]} ·{" "}
                {copy.preview.justListedLabel}
              </span>
            </div>
            <p className="font-body text-xs leading-relaxed text-muted">
              {blurb || copy.preview.fallbackBlurb}
            </p>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {(tags.length ? tags : ["Survival"]).map((t) => (
                <span
                  key={t}
                  className="font-body text-[10.5px] font-semibold text-muted border border-border rounded-full px-2 py-0.5 select-none bg-bg-panel"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 font-mono text-[10.5px] text-muted">
              <span className="text-success font-bold">{copy.preview.onlineMeasuredLabel}</span>
              <span>{copy.preview.rankUnrankedLabel}</span>
              <span>{copy.preview.standingLabel}</span>
            </div>
          </div>

          {!published ? (
            <div className="flex gap-3 flex-wrap">
              <WLButton variant="primary" onClick={handlePublish}>
                {copy.preview.publishLabel}
              </WLButton>
              <WLButton variant="outline" onClick={() => setIdx(2)}>
                {copy.preview.editProfileLabel}
              </WLButton>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <span className="font-mono text-xs text-muted border border-border rounded-lg p-2 bg-secondary select-all text-center flex-1">
                {`firstspawn.com/${lang}/server/${slug}`}
              </span>
              <WLButton variant="primary" onClick={() => router.push(`/${lang}/console`)}>
                {copy.preview.openConsoleLabel}
              </WLButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
