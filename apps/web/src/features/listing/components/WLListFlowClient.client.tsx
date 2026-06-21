"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WLButton } from "@firstspawn/ui";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { getCountryOptions } from "@/lib/countries";
import type { ServerReachScope } from "@/lib/servers-api";
import {
  checkAvailabilityAction,
  checkVerificationAction,
  probeServerAction,
  publishServerAction,
  requestVerificationTokenAction,
  type ListingGame,
  type ProbeResult,
  type VerificationMethod,
} from "@/app/actions/listing";

const WL_GAMES: ReadonlyArray<{ id: ListingGame; defaultPort: number }> = [
  { id: "mc_java", defaultPort: 25565 },
  { id: "mc_bedrock", defaultPort: 19132 },
  { id: "hytale", defaultPort: 25565 },
];

const defaultPortFor = (game: ListingGame): number =>
  WL_GAMES.find((g) => g.id === game)?.defaultPort ?? 25565;

const gameSupportsMotd = (game: ListingGame): boolean => game !== "hytale";

/** A bare IPv4/IPv6 literal has no domain to host a DNS TXT record. */
function isIpLiteral(host: string): boolean {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return true;
  }
  return host.includes(":");
}

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

/** Splits a "host" or "host:port" string into its parts, defaulting the game's port. */
function parseAddress(raw: string, defaultPort: number): { host: string; port: number } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.+):(\d{1,5})$/);
  if (match) {
    const port = Number(match[2]);
    if (port >= 1 && port <= 65535) {
      return { host: match[1], port };
    }
  }
  return { host: trimmed, port: defaultPort };
}

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
  const reachCopy = dictionary.common.reach;
  const countryOptions = useMemo(
    () => getCountryOptions(lang, countries, { includeWorldwide: false }),
    [lang, countries]
  );
  const steps = [copy.steps.address, copy.steps.ownership, copy.steps.profile, copy.steps.publish];
  const [idx, setIdx] = useState(0);

  // Step 1 — address & probe
  const [game, setGame] = useState<ListingGame>("mc_java");
  const [geyser, setGeyser] = useState(false);
  const [addr, setAddr] = useState("");
  const [probing, setProbing] = useState(false);
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);
  const [addressTaken, setAddressTaken] = useState(false);

  // Step 2 — ownership verification
  const [token, setToken] = useState<string | null>(null);
  const [dnsRecordName, setDnsRecordName] = useState<string | null>(null);
  const [method, setMethod] = useState<VerificationMethod>("motd");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [ownershipProof, setOwnershipProof] = useState<string | null>(null);

  // Step 3 — profile
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [country, setCountry] = useState("US");
  const [reach, setReach] = useState<ServerReachScope>("local");
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  // Step 4 — publish
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const slug =
    (name || "your-server")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "unnamed-server";
  const profileSlug = createdSlug ?? slug;

  const parsed = useMemo(() => parseAddress(addr, defaultPortFor(game)), [addr, game]);
  const hostIsIp = useMemo(() => isIpLiteral(parsed.host), [parsed.host]);
  // DNS needs a domain; MOTD needs a status protocol (Hytale has none).
  const dnsAvailable = !hostIsIp;
  const motdAvailable = gameSupportsMotd(game);
  const noVerificationMethod = !dnsAvailable && !motdAvailable;
  // The method actually used, constrained to what the game/address supports.
  const effectiveMethod: VerificationMethod = !motdAvailable
    ? "dns"
    : !dnsAvailable
      ? "motd"
      : method;
  const gameCopy = dictionary.serverCatalog.games;
  const gameLabel = (g: ListingGame): string =>
    g === "mc_bedrock" ? gameCopy.mcBedrock : g === "hytale" ? gameCopy.hytale : gameCopy.mcJava;

  // Fetch a real verification token when the ownership step opens.
  useEffect(() => {
    if (idx !== 1 || token || !addr.trim()) {
      return;
    }
    let active = true;
    requestVerificationTokenAction(parsed.host, parsed.port).then((result) => {
      if (!active) return;
      if (result.ok) {
        setToken(result.data.token);
        setDnsRecordName(result.data.dns_record_name);
      }
    });
    return () => {
      active = false;
    };
  }, [idx, addr, token, parsed.host, parsed.port]);

  // Debounced live check that the chosen name isn't already taken (Step 3).
  // All state updates run inside the timeout (async), never synchronously in the effect.
  useEffect(() => {
    const trimmed = name.trim();
    let active = true;
    const tooShort = idx !== 2 || trimmed.length < 2;
    const handle = setTimeout(
      () => {
        if (!active) return;
        if (tooShort) {
          setNameAvailable(null);
          return;
        }
        checkAvailabilityAction({ name: trimmed }).then((result) => {
          if (active && result.ok) {
            setNameAvailable(result.data.name_available);
          }
        });
      },
      tooShort ? 0 : 400
    );
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [name, idx]);

  const resetVerification = () => {
    setToken(null);
    setDnsRecordName(null);
    setVerified(false);
    setOwnershipProof(null);
    setVerifyError(null);
  };

  const doPing = async () => {
    if (!addr.trim() || probing) return;
    setProbing(true);
    setProbeError(null);
    setProbe(null);
    setAddressTaken(false);
    const result = await probeServerAction(parsed.host, parsed.port, game);
    if (result.ok && result.data.reachable) {
      // Only block on a taken address once we know the server is real.
      const availability = await checkAvailabilityAction({
        host: parsed.host,
        port: parsed.port,
      });
      setProbing(false);
      if (availability.ok && availability.data.address_available === false) {
        setAddressTaken(true);
        return;
      }
      setProbe(result.data);
    } else if (result.ok) {
      setProbing(false);
      setProbeError(copy.address.errorUnreachable);
    } else {
      setProbing(false);
      setProbeError(result.message || copy.address.errorUnreachable);
    }
  };

  const copyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — the token remains selectable on screen.
    }
  };

  const doVerify = async () => {
    if (verifying) return;
    setVerifying(true);
    setVerifyError(null);
    const result = await checkVerificationAction(parsed.host, parsed.port, effectiveMethod, game);
    setVerifying(false);
    if (result.ok) {
      setOwnershipProof(result.data.ownership_proof);
      setVerified(true);
    } else {
      setVerifyError(
        result.code === "VERIFICATION_FAILED" ? copy.ownership.failedLabel : result.message
      );
    }
  };

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : tags.length < 4 ? [...tags, t] : tags);
  };

  const handlePublish = async () => {
    if (publishing || !ownershipProof) return;
    setPublishing(true);
    setPublishError(null);
    const result = await publishServerAction({
      name: name.trim(),
      description: (blurb.trim() || copy.preview.fallbackBlurb).slice(0, 4000),
      host: parsed.host,
      port: parsed.port,
      game,
      geyser_enabled: game === "mc_java" && geyser,
      country_code: country,
      reach_scope: reach,
      method: effectiveMethod,
      ownership_proof: ownershipProof,
      tags,
    });
    setPublishing(false);
    if (result.ok) {
      setCreatedSlug(result.data.slug);
      setPublished(true);
    } else {
      setPublishError(result.message || copy.preview.publishErrorLabel);
    }
  };

  const canPublish = name.trim().length >= 2 && !!ownershipProof && nameAvailable !== false;

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

          {/* Software / game selector — changes the probe protocol and default port. */}
          <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-2">
            {copy.address.softwareLabel}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {WL_GAMES.map(({ id }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (id === game) return;
                  setGame(id);
                  setProbe(null);
                  setProbeError(null);
                  setAddressTaken(false);
                  resetVerification();
                }}
                className={`font-body text-xs font-bold rounded-lg px-3 py-2 border cursor-pointer transition ${
                  game === id
                    ? "border-primary bg-secondary/40 text-foreground"
                    : "border-border text-muted hover:border-foreground"
                }`}
              >
                {gameLabel(id)}
              </button>
            ))}
          </div>
          {game === "mc_java" && (
            <label className="flex items-start gap-2 mb-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={geyser}
                onChange={(e) => setGeyser(e.target.checked)}
                className="mt-0.5 accent-[var(--primary)]"
              />
              <span className="font-body text-[11.5px] leading-relaxed text-muted">
                {copy.address.geyserLabel}
              </span>
            </label>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={addr}
              onChange={(e) => {
                setAddr(e.target.value);
                setProbe(null);
                setProbeError(null);
                setAddressTaken(false);
                // A changed address invalidates any verification tied to the old one.
                resetVerification();
              }}
              placeholder={copy.address.hostPlaceholder.replace(
                "{port}",
                String(defaultPortFor(game))
              )}
              className="font-mono text-xs leading-relaxed p-2.5 bg-secondary border border-border rounded-lg outline-none text-foreground focus:border-primary flex-1"
            />
            <WLButton variant="primary" onClick={doPing} disabled={!addr.trim() || probing}>
              {probing ? copy.address.pingingLabel : copy.address.checkServerLabel}
            </WLButton>
          </div>
          {probe ? (
            <div className="mt-4 bg-secondary border border-border rounded-xl p-4 flex flex-col gap-2.5">
              {pingRow(copy.address.stats.status, copy.address.stats.reachable, "text-success")}
              {/* The public probe is authoritative only for reachability and current players. */}
              {game !== "hytale" && (
                <>
                  {pingRow(
                    copy.address.stats.onlineNow,
                    probe.online_players != null ? `${probe.online_players}` : "—",
                    "text-success"
                  )}
                </>
              )}
              <div className="flex justify-end mt-2">
                <WLButton variant="primary" size="sm" onClick={() => setIdx(1)}>
                  {copy.address.continueLabel}
                </WLButton>
              </div>
            </div>
          ) : addressTaken ? (
            <div className="mt-4 bg-secondary border border-danger/40 rounded-xl p-4">
              <span className="font-body text-xs text-danger leading-relaxed">
                {copy.address.errorAddressTaken}
              </span>
            </div>
          ) : probeError ? (
            <div className="mt-4 bg-secondary border border-danger/40 rounded-xl p-4">
              <span className="font-body text-xs text-danger leading-relaxed">{probeError}</span>
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
          <button
            type="button"
            onClick={copyToken}
            className="flex items-center justify-between bg-secondary border border-border rounded-lg p-2.5 mb-4 text-left cursor-pointer hover:border-foreground transition"
          >
            <span className="font-mono text-xs text-foreground font-bold tracking-wider select-all">
              {token ?? "…"}
            </span>
            <span className="font-body text-[10px] font-bold text-muted uppercase">
              {copied ? "✓" : copy.ownership.copyLabel}
            </span>
          </button>
          <div className="font-body text-[11px] text-muted leading-relaxed mb-2">
            {copy.ownership.selectHint}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              disabled={!motdAvailable}
              onClick={() => motdAvailable && setMethod("motd")}
              className={`border rounded-xl p-3 flex flex-col text-left transition ${
                !motdAvailable
                  ? "border-border opacity-50 cursor-not-allowed"
                  : effectiveMethod === "motd"
                    ? "border-primary bg-secondary/40 cursor-pointer"
                    : "border-border hover:border-foreground cursor-pointer"
              }`}
            >
              <div className="font-body font-bold text-xs text-foreground mb-1">
                {copy.ownership.motdTitle}
              </div>
              <div className="font-body text-[11.5px] leading-relaxed text-muted">
                {motdAvailable ? copy.ownership.motdBody : copy.ownership.motdUnavailable}
              </div>
            </button>
            <button
              type="button"
              disabled={!dnsAvailable}
              onClick={() => dnsAvailable && setMethod("dns")}
              className={`border rounded-xl p-3 flex flex-col text-left transition ${
                !dnsAvailable
                  ? "border-border opacity-50 cursor-not-allowed"
                  : effectiveMethod === "dns"
                    ? "border-primary bg-secondary/40 cursor-pointer"
                    : "border-border hover:border-foreground cursor-pointer"
              }`}
            >
              <div className="font-body font-bold text-xs text-foreground mb-1">
                {copy.ownership.dnsTitle}
              </div>
              <div className="font-body text-[11.5px] leading-relaxed text-muted">
                {dnsAvailable ? (
                  <>
                    {copy.ownership.dnsBodyPrefix}{" "}
                    <span className="font-mono text-[10.5px] bg-secondary px-1 py-0.5 rounded">
                      {dnsRecordName ?? `_firstspawn.${copy.ownership.dnsFallbackDomain}`}
                    </span>
                    {copy.ownership.dnsBodySuffix}
                  </>
                ) : (
                  copy.ownership.dnsUnavailable
                )}
              </div>
            </button>
          </div>
          {noVerificationMethod && (
            <div className="font-body text-xs text-danger leading-relaxed mb-3">
              {copy.ownership.noMethodHint}
            </div>
          )}
          {verifyError && (
            <div className="font-body text-xs text-danger leading-relaxed mb-3">{verifyError}</div>
          )}
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
            <WLButton
              variant="primary"
              onClick={doVerify}
              disabled={verifying || !token || noVerificationMethod}
            >
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
                placeholder={copy.preview.fallbackName}
                className={`font-body text-xs leading-relaxed p-2.5 bg-secondary border rounded-lg outline-none text-foreground w-full ${
                  nameAvailable === false
                    ? "border-danger focus:border-danger"
                    : "border-border focus:border-primary"
                }`}
              />
              {nameAvailable === false ? (
                <div className="font-body text-[10.5px] text-danger mt-1.5">
                  {copy.profile.nameTakenLabel}
                </div>
              ) : (
                <div className="font-mono text-[10px] text-muted mt-1.5">{`firstspawn.com/${lang}/server/${slug}`}</div>
              )}
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
            <div>
              <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-1.5">
                {reachCopy.label}
              </div>
              <div className="flex gap-2">
                {(["local", "regional", "global"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReach(value)}
                    className={`font-body text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                      reach === value
                        ? "bg-primary border-primary text-on-primary"
                        : "border-border text-muted hover:border-foreground"
                    }`}
                  >
                    {reachCopy[value]}
                  </button>
                ))}
              </div>
              <div className="font-mono text-[10px] text-muted mt-1.5">{reachCopy.hint}</div>
            </div>
            <div className="flex justify-end mt-2">
              <WLButton
                variant="primary"
                onClick={() => setIdx(3)}
                disabled={name.trim().length < 2 || nameAvailable === false}
              >
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
                {gameLabel(game)}
                {game === "mc_java" && geyser ? ` (+${gameCopy.mcBedrock})` : ""} ·{" "}
                {countries[country]} · {copy.preview.justListedLabel}
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
              <span className="text-success font-bold">
                {probe?.online_players != null
                  ? copy.preview.onlineMeasuredLabel.replace(
                      "{count}",
                      String(probe.online_players)
                    )
                  : copy.preview.reachableLabel}
              </span>
              <span>{copy.preview.rankUnrankedLabel}</span>
              <span>{copy.preview.standingLabel}</span>
            </div>
          </div>

          {publishError && (
            <div className="font-body text-xs text-danger leading-relaxed mb-3">{publishError}</div>
          )}

          {!published ? (
            <div className="flex gap-3 flex-wrap">
              <WLButton
                variant="primary"
                onClick={handlePublish}
                disabled={!canPublish || publishing}
              >
                {publishing ? copy.preview.publishingLabel : copy.preview.publishLabel}
              </WLButton>
              <WLButton variant="outline" onClick={() => setIdx(2)} disabled={publishing}>
                {copy.preview.editProfileLabel}
              </WLButton>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <a
                href={`/${lang}/server/${profileSlug}`}
                className="font-mono text-xs text-muted border border-border rounded-lg p-2 bg-secondary select-all text-center flex-1 hover:border-foreground transition"
              >
                {`firstspawn.com/${lang}/server/${profileSlug}`}
              </a>
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
