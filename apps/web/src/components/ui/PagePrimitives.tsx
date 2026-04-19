import type { ComponentPropsWithoutRef, ReactNode } from "react";

export const joinClasses = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export function PixelCorners({ className }: { className?: string }) {
  const cornerClass = joinClasses(
    "absolute h-2.5 w-2.5 border border-black bg-fs-diamond shadow-[0_0_10px_rgba(34,211,238,0.18)]",
    className
  );

  return (
    <>
      <span className={joinClasses(cornerClass, "left-2 top-2")} />
      <span className={joinClasses(cornerClass, "right-2 top-2")} />
      <span className={joinClasses(cornerClass, "bottom-2 left-2")} />
      <span className={joinClasses(cornerClass, "bottom-2 right-2")} />
    </>
  );
}

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
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(74,222,128,0.08),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.46)_100%)]" />
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
        "relative overflow-hidden border-4 border-black bg-background/78 shadow-[8px_8px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px]",
        className
      )}
      {...props}
    >
      <PixelCorners />
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
        <p className="font-ui text-[11px] uppercase tracking-[0.38em] text-fs-diamond/80">
          {eyebrow}
        </p>
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
    danger: "border-danger/60 bg-danger/12 text-danger",
    diamond: "border-fs-diamond/60 bg-fs-diamond/12 text-fs-diamond",
    gold: "border-fs-gold/60 bg-fs-gold/12 text-fs-gold",
    success: "border-success/60 bg-success/12 text-success",
  };

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-2 border-2 px-3 py-1.5 font-ui text-[10px] uppercase tracking-[0.3em] shadow-[3px_3px_0_0_rgba(0,0,0,1)]",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
