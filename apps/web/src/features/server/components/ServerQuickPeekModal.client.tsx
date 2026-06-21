"use client";

import { useEffect, useRef, useState } from "react";
import { WLButton } from "@firstspawn/ui";
import type { PublicServerListItem } from "@/lib/servers-api";
import type { ServerCatalogDictionary } from "@/lib/dictionaries/schema";
import { getGameName } from "@/features/server/lib/server-copy";
import { getServerDetail } from "@/app/actions/servers";

type Props = {
  server: PublicServerListItem;
  lang: string;
  onClose: () => void;
  onOpenFull: () => void;
  rowCopy: ServerCatalogDictionary["row"];
  modalCopy: ServerCatalogDictionary["modal"];
  getCountryName: (code: string | null) => string;
};

/** Quick peek intentionally shows only measured probe facts and declared catalog copy. */
export default function ServerQuickPeekModal({
  server,
  lang,
  onClose,
  onOpenFull,
  rowCopy,
  modalCopy,
  getCountryName,
}: Props) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);
  const copyAddress = async () => {
    let address = `${window.location.origin}/${lang}/server/${server.slug}`;
    const detail = await getServerDetail(server.slug).catch(() => null);
    if (detail?.host)
      address = detail.port === 25565 ? detail.host : `${detail.host}:${detail.port}`;
    await navigator.clipboard.writeText(address).catch(() => undefined);
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1600);
  };
  const players = server.latest_observation.online_players;
  const availability = server.availability_30d.percent;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={server.name}
      onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-xl border border-border bg-bg-panel p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-foreground">{server.name}</h2>
            <p className="mt-1 font-mono text-[10px] uppercase text-muted">
              {getCountryName(server.country_code)} · {getGameName(server.game, rowCopy.gameNames)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={modalCopy.closeLabel}
            className="text-muted"
          >
            ×
          </button>
        </div>
        <p className="my-5 text-sm leading-relaxed text-muted">
          {server.description || rowCopy.noDescription}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border p-3">
            <strong className="block font-mono text-lg text-success">
              {players?.toLocaleString() ?? "—"}
            </strong>
            <span className="text-xs text-muted">{modalCopy.onlineNowLabel}</span>
          </div>
          <div className="border border-border p-3">
            <strong className="block font-mono text-lg text-foreground">
              {availability === null ? "—" : `${availability.toFixed(2)}%`}
            </strong>
            <span className="text-xs text-muted">{modalCopy.uptimeLabel}</span>
            <span className="mt-1 block font-mono text-[9px] text-muted">
              {server.availability_30d.coverage_percent.toFixed(1)}% {modalCopy.coverageLabel}
            </span>
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] text-muted">{modalCopy.provenanceNote}</p>
        <div className="mt-5 flex gap-3">
          <WLButton variant="primary" fullWidth onClick={copyAddress}>
            {copied ? modalCopy.copiedLabel : modalCopy.copyAddressLabel}
          </WLButton>
          <WLButton variant="quiet" fullWidth onClick={onOpenFull}>
            {modalCopy.viewFullProfileLabel}
          </WLButton>
        </div>
      </div>
    </div>
  );
}
