import Link from "next/link";
import { adminFetchAllServersAction, type AdminServer } from "@/app/actions/admin";
import { AdminIcon } from "./_components/icons";
import { FreshnessDot, KpiCard, PageTitle, Panel, StatusPill } from "./_components/ui";

export const dynamic = "force-dynamic";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ErrorState({ message }: { message: string }) {
  return (
    <Panel title="Catalog unavailable">
      <div className="flex items-start gap-3 font-body text-[13px] text-muted">
        <AdminIcon name="alert" size={16} className="mt-0.5 text-danger" />
        <div>
          <p className="m-0 text-foreground">Couldn&apos;t load the catalog from the API.</p>
          <p className="mt-1 font-mono text-[11px]">{message}</p>
          <p className="mt-2">
            Check that the API is running and your account is on the admin allowlist.
          </p>
        </div>
      </div>
    </Panel>
  );
}

export default async function AdminOverviewPage() {
  const result = await adminFetchAllServersAction();

  return (
    <div>
      <PageTitle
        title="Overview"
        blurb="A calm observatory of the catalog."
        right={
          <Link
            href="/admin/servers"
            className="inline-flex h-[38px] items-center gap-2 rounded-[var(--radius-control)] border border-primary-hover bg-primary px-3.5 font-ui text-[13px] font-bold text-on-primary transition-[filter] hover:brightness-110"
          >
            <AdminIcon name="plus" size={15} /> New server
          </Link>
        }
      />

      {!result.ok ? (
        <ErrorState message={`${result.code} — ${result.message}`} />
      ) : (
        <OverviewBody servers={result.data.servers} />
      )}
    </div>
  );
}

function OverviewBody({ servers }: { servers: AdminServer[] }) {
  const total = servers.length;
  const active = servers.filter((s) => s.catalog_status === "active").length;
  const suspended = servers.filter((s) => s.catalog_status === "suspended").length;
  const archived = servers.filter((s) => s.catalog_status === "archived").length;
  const online = servers.filter((s) => s.freshness_status === "online").length;
  // Editorial = no owner yet (claimable); the rest are owner-managed listings.
  const editorial = servers.filter((s) => s.owner_id === null).length;
  const owned = total - editorial;

  const recent = [...servers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Listings" value={total} sub={`${editorial} editorial · ${owned} owned`} />
        <KpiCard label="Active" value={active} accent="text-success" sub="published & public" />
        <KpiCard
          label="Online now"
          value={online}
          accent={online > 0 ? "text-success" : "text-muted"}
          sub="collector-measured"
        />
        <KpiCard
          label="Suspended"
          value={suspended}
          accent={suspended > 0 ? "text-danger" : "text-muted"}
          sub={`${archived} archived`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Recently added"
            sub={`${recent.length} of ${total}`}
            padded={false}
            action={
              <Link
                href="/admin/servers"
                className="inline-flex h-[34px] items-center gap-1.5 rounded-[var(--radius-control)] border border-border bg-secondary px-3 font-ui text-[12.5px] font-semibold text-foreground transition-[filter] hover:brightness-110"
              >
                Manage servers
              </Link>
            }
          >
            {recent.length === 0 ? (
              <div className="m-3 rounded-[12px] border border-dashed border-border p-6 text-center font-mono text-[12px] text-muted">
                No servers yet — add the first editorial listing.
              </div>
            ) : (
              <div className="px-2 pb-1">
                {recent.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border px-2 py-3 first:border-t-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-ui text-[13.5px] font-semibold text-foreground">
                          {s.name}
                        </span>
                        <FreshnessDot status={s.freshness_status} />
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-muted">
                        {s.host}:{s.port} · {s.country_code ?? "—"} · added{" "}
                        {relativeTime(s.created_at)}
                      </div>
                    </div>
                    <StatusPill status={s.catalog_status} />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="Catalog mix">
            <div className="flex flex-col gap-3">
              {[
                { label: "Active", value: active, cls: "bg-success" },
                { label: "Suspended", value: suspended, cls: "bg-danger" },
                { label: "Archived", value: archived, cls: "bg-art-dim" },
              ].map((row) => {
                const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
                return (
                  <div key={row.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-ui text-[12.5px]">
                      <span className="text-muted">{row.label}</span>
                      <span className="font-mono text-foreground">{row.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full ${row.cls}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Queues" sub="preview">
            <div className="flex flex-col gap-2.5">
              <Link
                href="/admin/moderation"
                className="flex items-center justify-between rounded-[10px] border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/50"
              >
                <span className="flex items-center gap-2.5 font-ui text-[13px] text-foreground">
                  <AdminIcon name="shield" size={16} className="text-muted" /> Moderation
                </span>
                <AdminIcon name="chevron-right" size={16} className="text-muted" />
              </Link>
              <Link
                href="/admin/support"
                className="flex items-center justify-between rounded-[10px] border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/50"
              >
                <span className="flex items-center gap-2.5 font-ui text-[13px] text-foreground">
                  <AdminIcon name="inbox" size={16} className="text-muted" /> Support
                </span>
                <AdminIcon name="chevron-right" size={16} className="text-muted" />
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
