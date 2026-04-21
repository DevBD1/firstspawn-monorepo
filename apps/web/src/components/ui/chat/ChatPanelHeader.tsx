import type { ReactNode } from "react";
import { StatusChip, joinClasses } from "@/components/ui/PagePrimitives";

interface ChatPanelHeaderProps {
  eyebrow: string;
  icon: ReactNode;
  statusLabel: string;
  title: string;
  className?: string;
}

/**
 * Shared header block for chat panels with brand context on the left and status on the right.
 */
export default function ChatPanelHeader({
  eyebrow,
  icon,
  statusLabel,
  title,
  className,
}: ChatPanelHeaderProps) {
  return (
    <div
      className={joinClasses(
        "flex flex-wrap items-center justify-between gap-4 border-b-2 border-foreground/12 pb-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black bg-fs-diamond/15 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
          {icon}
        </span>
        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-fs-diamond/85">
            {eyebrow}
          </p>
          <p className="mt-1 font-display text-sm text-foreground">{title}</p>
        </div>
      </div>
      <StatusChip tone="success">
        <span className="h-2.5 w-2.5 border border-black bg-success" />
        {statusLabel}
      </StatusChip>
    </div>
  );
}
