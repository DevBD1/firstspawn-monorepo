import { AdminIcon } from "../_components/icons";
import { PageTitle, Panel, PreviewBadge } from "../_components/ui";

// Mock moderation queue. The data model exists (server_moderation_logs, the
// claim/edit/delist flows in docs/releases/v1-mvp.md §7), but no review API is
// wired yet, so this surface is intentionally static and clearly labelled.
const QUEUE = [
  {
    id: "VQ-2041",
    kind: "report",
    title: "Inflated player count",
    server: "Tideborn",
    detail: "Owner-declared 5,000 vs. a measured peak of 700.",
    severity: "high",
    age: "4m ago",
  },
  {
    id: "VQ-2036",
    kind: "claim",
    title: "Ownership claim",
    server: "Ironhold",
    detail: "DNS TXT record detected — awaiting final propagation check.",
    severity: "medium",
    age: "1h ago",
  },
  {
    id: "VQ-2031",
    kind: "edit",
    title: "Public edit · description + tags",
    server: "Hollowreach",
    detail: "Review newest revision before publishing.",
    severity: "low",
    age: "3h ago",
  },
] as const;

const SEVERITY: Record<string, string> = {
  high: "text-danger border-danger/45",
  medium: "text-muted border-border border-dashed",
  low: "text-muted border-border border-dashed",
};

const KIND_ICON: Record<string, "alert" | "shield" | "info"> = {
  report: "alert",
  claim: "shield",
  edit: "info",
};

export default function AdminModerationPage() {
  return (
    <div>
      <PageTitle
        title="Moderation"
        blurb="Claims, reports, and edits awaiting a decision."
        right={<PreviewBadge />}
      />

      <Panel
        title="Review queue"
        sub={`${QUEUE.length} open · structured approve / reject`}
        padded={false}
      >
        {QUEUE.map((q) => (
          <div
            key={q.id}
            className="grid grid-cols-[28px_1fr_auto] items-center gap-3 border-t border-border px-4 py-3.5 first:border-t-0"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-border bg-background text-muted">
              <AdminIcon name={KIND_ICON[q.kind]} size={14} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui text-[13.5px] font-semibold text-foreground">
                  {q.title}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 font-ui text-[10.5px] font-bold uppercase tracking-wide ${SEVERITY[q.severity]}`}
                >
                  {q.severity}
                </span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-muted">
                {q.server} · {q.id} · {q.age} — {q.detail}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="inline-flex h-[30px] cursor-not-allowed items-center gap-1.5 rounded-[var(--radius-badge)] border border-success/40 px-2.5 font-ui text-[12px] font-semibold text-success opacity-60"
              >
                <AdminIcon name="check" size={13} /> Approve
              </button>
              <button
                disabled
                className="inline-flex h-[30px] cursor-not-allowed items-center gap-1.5 rounded-[var(--radius-badge)] border border-border px-2.5 font-ui text-[12px] font-semibold text-muted opacity-60"
              >
                <AdminIcon name="x" size={13} /> Reject
              </button>
            </div>
          </div>
        ))}
      </Panel>

      <div className="mt-4 flex items-start gap-2.5 rounded-[12px] border border-dashed border-border bg-bg-panel px-4 py-3">
        <AdminIcon name="info" size={15} className="mt-0.5 text-muted" />
        <p className="m-0 font-body text-[12.5px] text-muted">
          <span className="font-semibold text-foreground">Preview.</span> Actions are disabled until
          the moderation review API (claims, reports, edits, delisting) is implemented. The data
          model and audit log already exist in the schema.
        </p>
      </div>
    </div>
  );
}
