import { AdminIcon } from "../_components/icons";
import { PageTitle, Panel, PreviewBadge } from "../_components/ui";

// Mock support inbox. No support API exists yet (docs/releases/v1-mvp.md §7.2
// lists support + data-rights requests as an admin responsibility), so this is a
// static preview of the intended surface.
const TICKETS = [
  {
    id: "SUP-318",
    subject: "Can't verify ownership via DNS",
    from: "kade@orbis.gg",
    tag: "verification",
    age: "22m ago",
    state: "open",
  },
  {
    id: "SUP-314",
    subject: "Request to export my account data",
    from: "lena@example.com",
    tag: "data-rights",
    age: "2h ago",
    state: "open",
  },
  {
    id: "SUP-309",
    subject: "Server banner not updating",
    from: "owner@vaultmc.io",
    tag: "listing",
    age: "5h ago",
    state: "waiting",
  },
] as const;

const STATE: Record<string, string> = {
  open: "text-success border-success/40",
  waiting: "text-muted border-border border-dashed",
};

export default function AdminSupportPage() {
  return (
    <div>
      <PageTitle
        title="Support"
        blurb="Support requests and verified data-rights requests."
        right={<PreviewBadge />}
      />

      <Panel title="Inbox" sub={`${TICKETS.length} open`} padded={false}>
        {TICKETS.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border px-4 py-3.5 first:border-t-0"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui text-[13.5px] font-semibold text-foreground">
                  {t.subject}
                </span>
                <span className="rounded-[6px] border border-border px-1.5 font-mono text-[10px] text-muted">
                  {t.tag}
                </span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-muted">
                {t.from} · {t.id} · {t.age}
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-ui text-[11.5px] font-semibold ${STATE[t.state]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {t.state}
            </span>
          </div>
        ))}
      </Panel>

      <div className="mt-4 flex items-start gap-2.5 rounded-[12px] border border-dashed border-border bg-bg-panel px-4 py-3">
        <AdminIcon name="info" size={15} className="mt-0.5 text-muted" />
        <p className="m-0 font-body text-[12.5px] text-muted">
          <span className="font-semibold text-foreground">Preview.</span> The support and
          data-rights request system is not yet wired to an API.
        </p>
      </div>
    </div>
  );
}
