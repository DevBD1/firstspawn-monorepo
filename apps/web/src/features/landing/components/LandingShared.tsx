import type { ReactNode } from "react";

interface SectionHeaderProps {
  className?: string;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}

export const joinClasses = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export function PixelCorners() {
  return (
    <>
      <div className="absolute -left-1 -top-1 h-3 w-3 bg-fs-diamond" />
      <div className="absolute -right-1 -top-1 h-3 w-3 bg-fs-diamond" />
      <div className="absolute -bottom-1 -left-1 h-3 w-3 bg-fs-diamond" />
      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-fs-diamond" />
    </>
  );
}

export function SectionHeader({ className, eyebrow, subtitle, title }: SectionHeaderProps) {
  return (
    <div className={joinClasses("mx-auto max-w-3xl space-y-4 text-center", className)}>
      {eyebrow ? (
        <p className="font-ui text-[11px] uppercase tracking-[0.42em] text-fs-diamond/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-2xl leading-tight text-foreground sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="font-body text-sm uppercase tracking-[0.16em] text-foreground/65 md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function SectionSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClasses(className)}>{children}</div>;
}
