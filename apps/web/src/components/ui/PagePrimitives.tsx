import type { ComponentPropsWithoutRef, ReactNode } from "react";

export const joinClasses = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export function PageContainer({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={joinClasses(
        "mx-auto w-full max-w-[96rem] px-4 md:px-8 2xl:max-w-[104rem]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageBackdrop({
  className,
  children,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={joinClasses("pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />
      {children}
    </div>
  );
}

export function PageSurface({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={joinClasses(
        "relative overflow-hidden bg-bg-panel border border-border rounded-[12px] shadow-[0_1px_0_rgba(0,0,0,0.4)] backdrop-blur-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function PageSectionHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={joinClasses("space-y-3", className)}>
      {eyebrow ? (
        <p className="font-ui text-[11px] uppercase tracking-[0.38em] text-fs-gold/80">{eyebrow}</p>
      ) : null}
      <h1 className="font-display text-xl leading-tight tracking-[0.14em] text-foreground md:text-2xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="max-w-3xl font-body text-sm leading-relaxed text-foreground/70 md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function StatusChip({
  children,
  tone = "diamond",
  className,
}: {
  children: ReactNode;
  className?: string;
  tone?: "diamond" | "success" | "danger" | "gold";
}) {
  const toneClasses: Record<NonNullable<typeof tone>, string> = {
    danger: "border-danger/40 bg-danger/10 text-danger",
    diamond: "border-primary/40 bg-primary/10 text-foreground",
    gold: "border-fs-gold/40 bg-fs-gold/10 text-fs-gold",
    success: "border-success/40 bg-success/10 text-success",
  };

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-2 border rounded-full px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
