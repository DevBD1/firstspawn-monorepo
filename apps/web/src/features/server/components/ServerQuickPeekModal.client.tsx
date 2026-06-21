"use client";

import React, { useEffect, useState } from "react";
import { WLButton } from "@firstspawn/ui";
import type { PublicServerListItem } from "@/lib/servers-api";
import type { RankSignalsDictionary, ServerCatalogDictionary } from "@/lib/dictionaries/schema";
import { getServerDetail } from "@/app/actions/servers";

type ServerRowCopy = ServerCatalogDictionary["row"];
type ServerModalCopy = ServerCatalogDictionary["modal"];

interface Signals {
  activity: number;
  trust: number;
  freshness: number;
}

// Mirrors the derivation used by the landing and discover list rows so the
// quick-peek modal shows the same numbers the user clicked from.
function getServerSignals(s: PublicServerListItem): Signals {
  const online = s.latest_metrics?.online_players ?? 0;
  const max = s.latest_metrics?.max_players ?? 100;
  const activity = max > 0 ? Math.min(100, Math.max(10, Math.round((online / max) * 100))) : 50;

  const charSum = s.name.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const trust = 65 + (charSum % 31);

  let freshness = 90;
  if (s.last_ping_at) {
    const elapsedMs = Date.now() - new Date(s.last_ping_at).getTime();
    const elapsedMins = Math.floor(elapsedMs / 60000);
    freshness = Math.max(10, 100 - Math.min(90, elapsedMins));
  }

  return { activity, trust, freshness };
}

function getGameName(game: string, gameNames: ServerRowCopy["gameNames"]) {
  if (game === "mc_java") return gameNames.mcJava;
  if (game === "mc_bedrock") return gameNames.mcBedrock;
  if (game === "hytale") return gameNames.hytale;
  return gameNames.fallback;
}

interface ServerQuickPeekModalProps {
  server: PublicServerListItem;
  lang: string;
  voted: boolean;
  onVote: () => void;
  onClose: () => void;
  onOpenFull: () => void;
  rowCopy: ServerRowCopy;
  rankCopy: RankSignalsDictionary;
  modalCopy: ServerModalCopy;
  getCountryName: (code: string | null) => string;
}

export default function ServerQuickPeekModal({
  server: s,
  lang,
  voted,
  onVote,
  onClose,
  onOpenFull,
  rowCopy,
  rankCopy,
  modalCopy,
  getCountryName,
}: ServerQuickPeekModalProps) {
  const [copied, setCopied] = useState(false);

  const sig = getServerSignals(s);
  const isVerified = s.name.length % 3 === 0;
  const online = s.latest_metrics?.online_players ?? 0;
  const uptime = (98.0 + (s.name.length % 20) / 10).toFixed(1);
  const votes = (1200 + s.name.charCodeAt(0) * 15 + (voted ? 1 : 0)) / 1000;

  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleCopyAddress = async () => {
    // The list payload has no host/port, so resolve the real join address
    // lazily; fall back to the shareable profile URL if it can't be fetched.
    let address = `${window.location.origin}/${lang}/server/${s.slug}`;
    try {
      const detail = await getServerDetail(s.slug);
      if (detail?.host) {
        address = detail.port === 25565 ? detail.host : `${detail.host}:${detail.port}`;
      }
    } catch {
      // keep the profile-URL fallback
    }
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked — nothing actionable to surface here
    }
  };

  const countryLabel =
    !s.country_code || s.country_code === "WW"
      ? rowCopy.globalRegionLabel
      : getCountryName(s.country_code);

  const statTile = (label: string, value: string, accent?: "success" | "gold") => (
    <div className="bg-secondary/40 border border-border rounded-xl px-3.5 py-2.5">
      <div
        className={`font-mono text-[15px] font-bold leading-tight ${
          accent === "success"
            ? "text-success"
            : accent === "gold"
              ? "text-fs-gold"
              : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="font-body text-[11px] text-muted mt-0.5">{label}</div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={s.name}
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[rgba(8,10,16,0.6)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[min(640px,100%)] max-h-[90vh] overflow-y-auto bg-bg-panel border border-border rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
      >
        {/* Banner */}
        <div className="relative">
          <div
            className="h-[150px] flex items-center justify-center select-none"
            style={{
              background:
                "repeating-linear-gradient(45deg, color-mix(in srgb, var(--art) 15%, transparent) 0 11px, color-mix(in srgb, var(--art) 6%, transparent) 11px 22px)",
            }}
          >
            <span className="font-mono text-[10px] tracking-wider text-muted/80 bg-background/25 px-2 py-0.5 rounded">
              {modalCopy.bannerLabel.replace("{name}", s.name)}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label={modalCopy.closeLabel}
            className="absolute right-3 top-3 w-8 h-8 rounded-full bg-background/70 text-foreground border border-border flex items-center justify-center cursor-pointer hover:bg-background"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-5 pb-6">
          {/* Title row */}
          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
            <span className="font-display font-semibold text-xl text-foreground">{s.name}</span>
            {isVerified && (
              <span className="font-body text-[9.5px] font-bold tracking-wide text-fs-gold border border-fs-gold/30 rounded-full px-1.5 py-0.5 leading-none">
                {rowCopy.verifiedBadge}
              </span>
            )}
            <span className="font-body text-xs font-semibold text-muted inline-flex items-center gap-1.5">
              {getGameName(s.game, rowCopy.gameNames)}
              {" · "}
              <span className="font-mono text-[9px] font-bold border border-border rounded px-1.5 py-0.5 leading-none uppercase">
                {s.country_code || "WW"}
              </span>
              {countryLabel}
            </span>
          </div>

          <p className="font-body text-sm leading-relaxed text-muted mb-3.5">
            {s.description || rowCopy.noDescription}
          </p>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
            {statTile(modalCopy.onlineNowLabel, online.toLocaleString(), "success")}
            {statTile(modalCopy.uptimeLabel, `${uptime}%`)}
            {statTile(modalCopy.votesLabel, `${votes.toFixed(1)}k`)}
            {statTile(
              modalCopy.standingLabel,
              isVerified ? modalCopy.verifiedStanding : String(sig.trust),
              isVerified ? "gold" : undefined
            )}
          </div>

          {/* Signal bars */}
          <div className="flex flex-col gap-2 mb-4">
            {(
              [
                [rankCopy.activityLabel, sig.activity],
                [rankCopy.trustLabel, sig.trust],
                [rankCopy.freshnessLabel, sig.freshness],
              ] as const
            ).map(([label, v]) => (
              <div
                key={label}
                className="grid grid-cols-[76px_1fr_34px] items-center gap-2.5 text-left"
              >
                <span className="font-body text-[11.5px] font-semibold text-muted">{label}</span>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${v}%` }}></div>
                </div>
                <span className="font-mono text-[11px] text-foreground text-right">{v}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <WLButton variant="primary" fullWidth onClick={handleCopyAddress}>
              {copied ? modalCopy.copiedLabel : modalCopy.copyAddressLabel}
            </WLButton>
            <WLButton variant={voted ? "success" : "quiet"} fullWidth onClick={onVote}>
              {voted ? modalCopy.votedLabel : modalCopy.voteLabel}
            </WLButton>
          </div>

          <div className="text-center mt-3">
            <button
              onClick={onOpenFull}
              className="font-body text-[13px] font-bold text-primary hover:underline cursor-pointer"
            >
              {modalCopy.viewFullProfileLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
