import type { ReactNode } from "react";
import {
  PageBackdrop,
  PageContainer,
  PageSectionHeader,
  PageSurface,
  StatusChip,
  joinClasses,
} from "./PagePrimitives";

interface CenteredPageShellProps {
  badge?: string;
  children?: ReactNode;
  className?: string;
  description: string;
  title: string;
}

export function CenteredPageShell({
  badge,
  children,
  className,
  description,
  title,
}: CenteredPageShellProps) {
  return (
    <main className="relative min-h-[calc(100vh-84px)] overflow-hidden bg-background py-12 md:py-16">
      <PageBackdrop />
      <PageContainer className="relative z-10">
        <PageSurface className={joinClasses("mx-auto max-w-5xl p-6 md:p-10", className)}>
          <div className="space-y-6">
            {badge ? <StatusChip>{badge}</StatusChip> : null}
            <PageSectionHeader title={title} subtitle={description} />
            {children}
          </div>
        </PageSurface>
      </PageContainer>
    </main>
  );
}

interface LegalPageShellProps {
  description: string;
  locale: string;
  localeLabel: string;
  noticeBadge: string;
  noticeBody: string;
  title: string;
}

export function LegalPageShell({
  description,
  locale,
  localeLabel,
  noticeBadge,
  noticeBody,
  title,
}: LegalPageShellProps) {
  return (
    <CenteredPageShell
      badge={noticeBadge}
      className="max-w-4xl"
      description={description}
      title={title}
    >
      <div className="space-y-4">
        <p className="font-ui text-sm uppercase tracking-[0.28em] text-foreground/55">
          {localeLabel}: <span className="text-fs-gold">{locale.toUpperCase()}</span>
        </p>
        <p className="max-w-2xl font-body text-sm leading-relaxed text-muted">{noticeBody}</p>
      </div>
    </CenteredPageShell>
  );
}
