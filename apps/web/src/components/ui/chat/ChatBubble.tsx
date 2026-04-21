import type { ReactNode } from "react";
import { joinClasses } from "@/components/ui/PagePrimitives";

interface ChatBubbleProps {
  align?: "start" | "end";
  children: ReactNode;
  className?: string;
  headerLabel?: string;
  leadingVisual?: ReactNode;
  surfaceClassName?: string;
}

/**
 * Reusable chat row primitive.
 * It handles left/right alignment, optional assistant chrome, and the shared bubble shell.
 */
export default function ChatBubble({
  align = "start",
  children,
  className,
  headerLabel,
  leadingVisual,
  surfaceClassName,
}: ChatBubbleProps) {
  const isAssistant = align === "start";

  return (
    <div
      className={joinClasses("flex gap-3", isAssistant ? "items-start" : "justify-end", className)}
    >
      {isAssistant && leadingVisual ? <div className="mt-1 shrink-0">{leadingVisual}</div> : null}
      <div
        className={joinClasses(
          isAssistant ? "min-w-0 flex-1" : "max-w-[88%]",
          "border-2 border-black px-4 py-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
          isAssistant ? "bg-bg-panel/90" : "bg-background/88",
          surfaceClassName
        )}
      >
        {headerLabel ? (
          <div className="mb-3 flex items-center gap-2 border-b border-foreground/10 pb-3">
            <span className="font-ui text-[10px] uppercase tracking-[0.3em] text-foreground/60">
              {headerLabel}
            </span>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
