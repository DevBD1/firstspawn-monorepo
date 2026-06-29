"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminSetServerStatusAction,
  type AdminCatalogStatus,
  type AdminServer,
  type AdminServerDetail,
} from "@/app/actions/admin";
import { AdminIcon } from "../../_components/icons";
import { FreshnessDot, StatusPill } from "../../_components/ui";
import CreateServerForm from "./CreateServerForm.client";

interface CountryOption {
  code: string;
  name: string;
}

// Status transitions an admin can take from the current state. Mirrors the
// lifecycle in docs/releases/v1-mvp.md §5.1 (active ↔ suspended → archived).
const ACTIONS: Record<
  AdminCatalogStatus,
  Array<{
    to: AdminCatalogStatus;
    label: string;
    icon: "check" | "ban" | "archive";
    tone: "ok" | "danger" | "quiet";
  }>
> = {
  active: [
    { to: "suspended", label: "Suspend", icon: "ban", tone: "danger" },
    { to: "archived", label: "Archive", icon: "archive", tone: "quiet" },
  ],
  suspended: [
    { to: "active", label: "Activate", icon: "check", tone: "ok" },
    { to: "archived", label: "Archive", icon: "archive", tone: "quiet" },
  ],
  archived: [{ to: "active", label: "Restore", icon: "check", tone: "ok" }],
};

const toneClass: Record<"ok" | "danger" | "quiet", string> = {
  ok: "border-success/50 text-success",
  danger: "border-danger/50 text-danger",
  quiet: "border-border text-foreground",
};

export default function ServersManager({
  initialServers,
  countryOptions,
}: {
  initialServers: AdminServer[];
  countryOptions: CountryOption[];
}) {
  const router = useRouter();
  const [servers, setServers] = useState<AdminServer[]>(initialServers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminCatalogStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: "ok" | "danger"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return servers.filter(
      (s) =>
        (statusFilter === "all" || s.catalog_status === statusFilter) &&
        (q === "" ||
          s.name.toLowerCase().includes(q) ||
          s.host.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q))
    );
  }, [servers, query, statusFilter]);

  const flash = (tone: "ok" | "danger", text: string) => {
    setToast({ tone, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreated = (server: AdminServerDetail) => {
    setServers((prev) => [server, ...prev.filter((s) => s.id !== server.id)]);
    setShowForm(false);
    flash("ok", `Created “${server.name}” · owner null`);
    startTransition(() => router.refresh());
  };

  const changeStatus = (server: AdminServer, to: AdminCatalogStatus) => {
    setPendingId(server.id);
    startTransition(async () => {
      const result = await adminSetServerStatusAction(server.id, to);
      setPendingId(null);
      if (result.ok) {
        setServers((prev) => prev.map((s) => (s.id === server.id ? result.data : s)));
        flash("ok", `“${server.name}” → ${to}`);
        router.refresh();
      } else {
        flash("danger", result.message);
      }
    });
  };

  const filters: Array<{ id: "all" | AdminCatalogStatus; label: string }> = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "suspended", label: "Suspended" },
    { id: "archived", label: "Archived" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-[38px] min-w-[240px] flex-1 items-center gap-2 rounded-[var(--radius-control)] border border-border bg-input-bg px-3 text-muted">
          <AdminIcon name="search" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, host, or slug…"
            className="w-full bg-transparent font-ui text-[13px] text-foreground outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`h-[38px] rounded-full border px-3.5 font-ui text-[12.5px] font-semibold transition-colors ${
                statusFilter === f.id
                  ? "border-primary/45 bg-secondary text-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex h-[38px] items-center gap-2 rounded-[var(--radius-control)] border border-primary-hover bg-primary px-3.5 font-ui text-[13px] font-bold text-on-primary transition-[filter] hover:brightness-110"
        >
          <AdminIcon name={showForm ? "x" : "plus"} size={15} />
          {showForm ? "Close" : "New server"}
        </button>
      </div>

      {toast && (
        <div
          className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 font-ui text-[12.5px] ${
            toast.tone === "ok"
              ? "border-success/40 bg-success/10 text-success"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          <AdminIcon name={toast.tone === "ok" ? "check" : "alert"} size={15} />
          {toast.text}
        </div>
      )}

      {showForm && (
        <CreateServerForm
          countryOptions={countryOptions}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-[var(--radius-panel)] border border-border bg-bg-panel shadow-[var(--shadow-card)]">
        <div className="hidden grid-cols-[2fr_1fr_140px_120px_220px] items-center gap-3 bg-secondary px-4 py-2.5 md:grid">
          {["Server", "Origin", "Status", "Live", "Actions"].map((h, i) => (
            <span
              key={h}
              className={`font-ui text-[11px] font-bold uppercase tracking-[0.13em] text-muted ${
                i === 4 ? "text-right" : ""
              }`}
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="m-4 rounded-[12px] border border-dashed border-border p-9 text-center font-mono text-[13px] text-muted">
            {servers.length === 0
              ? "No servers in the catalog yet — create the first editorial listing."
              : "No servers match those filters."}
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-1 items-center gap-3 border-t border-border px-4 py-3 md:grid-cols-[2fr_1fr_140px_120px_220px]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-ui text-[13.5px] font-semibold text-foreground">
                    {s.name}
                  </span>
                  {s.auth_mode === "offline_allowed" && (
                    <span className="rounded-[6px] border border-border px-1.5 font-mono text-[10px] text-muted">
                      cracked
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-muted">
                  {s.host}:{s.port} · /{s.slug}
                </div>
              </div>

              <div className="font-mono text-[12px] text-muted">
                {s.country_code ?? "—"} · {s.reach_scope}
              </div>

              <div>
                <StatusPill status={s.catalog_status} />
              </div>

              <div>
                <FreshnessDot status={s.freshness_status} />
              </div>

              <div className="flex items-center justify-start gap-1.5 md:justify-end">
                {pendingId === s.id ? (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted">
                    <AdminIcon name="refresh" size={13} /> saving…
                  </span>
                ) : (
                  ACTIONS[s.catalog_status].map((a) => (
                    <button
                      key={a.to}
                      onClick={() => changeStatus(s, a.to)}
                      className={`inline-flex h-[30px] items-center gap-1.5 rounded-[var(--radius-badge)] border bg-transparent px-2.5 font-ui text-[12px] font-semibold transition-[filter] hover:brightness-110 ${toneClass[a.tone]}`}
                    >
                      <AdminIcon name={a.icon} size={13} />
                      {a.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
        <AdminIcon name="info" size={13} />
        Servers created here have no owner. A later verified claim assigns ownership (v1-mvp §5.1).
      </p>
    </div>
  );
}
