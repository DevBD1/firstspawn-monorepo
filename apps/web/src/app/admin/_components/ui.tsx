import type { ReactNode } from "react";
import type { AdminCatalogStatus, AdminFreshness } from "@/app/actions/admin";

export function SectionLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-ui text-[11px] font-bold uppercase tracking-[0.13em] text-muted ${className}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  blurb,
  right,
}: {
  title: string;
  blurb?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="m-0 font-display text-[26px] font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {blurb && <p className="mt-1.5 font-body text-[13.5px] text-muted">{blurb}</p>}
      </div>
      {right}
    </div>
  );
}

export function Panel({
  title,
  sub,
  action,
  children,
  padded = true,
}: {
  title?: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-panel)] border border-border bg-bg-panel shadow-[var(--shadow-card)]">
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
          <div className="flex flex-col gap-0.5">
            <SectionLabel>{title}</SectionLabel>
            {sub && <span className="font-mono text-[11px] text-muted">{sub}</span>}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "p-4" : ""}>{children}</div>
    </section>
  );
}

const CATALOG_STATUS: Record<AdminCatalogStatus, { cls: string; label: string; dashed?: boolean }> =
  {
    active: { cls: "text-success border-success/40", label: "Active" },
    suspended: { cls: "text-danger border-danger/40", label: "Suspended" },
    archived: { cls: "text-muted border-border", label: "Archived", dashed: true },
  };

export function StatusPill({ status }: { status: AdminCatalogStatus }) {
  const s = CATALOG_STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-ui text-[11.5px] font-semibold ${s.cls} ${
        s.dashed ? "border-dashed" : ""
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

const FRESHNESS: Record<AdminFreshness, { cls: string; label: string }> = {
  online: { cls: "text-success", label: "Online" },
  offline: { cls: "text-danger", label: "Offline" },
  unknown: { cls: "text-muted", label: "Unknown" },
};

export function FreshnessDot({ status }: { status: AdminFreshness }) {
  const f = FRESHNESS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] ${f.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {f.label}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  accent = "text-foreground",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[var(--radius-card)] border border-border bg-bg-panel p-4 shadow-[var(--shadow-card)]">
      <SectionLabel>{label}</SectionLabel>
      <div className={`font-mono text-[26px] font-bold leading-none tracking-[-0.02em] ${accent}`}>
        {value}
      </div>
      {sub && <div className="font-mono text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

export function PreviewBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-0.5 font-ui text-[11px] font-semibold uppercase tracking-wide text-muted">
      Preview · mock data
    </span>
  );
}
