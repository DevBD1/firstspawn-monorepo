"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Bot, SendHorizontal, Sparkles } from "lucide-react";
import PixelButton from "@/components/ui/PixelButton";
import type { LandingContentModel } from "@/features/landing/types";
import { PixelCorners, joinClasses } from "./LandingShared";

interface LandingDiscoveryConsoleProps {
  content: LandingContentModel;
  embedded?: boolean;
  heroStatus: string;
  lang: string;
}

function StatusChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 border border-black bg-success/15 px-3 py-1.5 font-ui text-[10px] uppercase tracking-[0.3em] text-success shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
      <span className="h-2.5 w-2.5 border border-black bg-success" />
      {label}
    </span>
  );
}

function UserBubble({ message }: { message: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] border-2 border-black bg-background/88 px-4 py-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <p className="font-body text-sm leading-relaxed text-foreground sm:text-[15px]">
          {message}
        </p>
      </div>
    </div>
  );
}

function SuggestionCard({ content, lang }: { content: LandingContentModel; lang: string }) {
  const { card } = content.discoveryDemo;

  return (
    <div className="border-2 border-black bg-background/86 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-success">
            {card.status}
          </p>
          <h3 className="mt-2 font-display text-base leading-snug text-foreground sm:text-lg">
            {card.title}
          </h3>
          <p className="mt-3 font-body text-sm leading-relaxed text-foreground/70">
            {card.description}
          </p>
        </div>
        <span className="shrink-0 border border-black bg-fs-diamond/15 px-3 py-2 font-ui text-[11px] uppercase tracking-[0.24em] text-fs-diamond">
          {card.match}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="border border-black bg-bg-panel/92 px-2.5 py-1.5 font-ui text-[10px] uppercase tracking-[0.24em] text-foreground/75"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <PixelButton href={`/${lang}/discover`} size="md" variant="primary" className="flex-1">
          {content.landing.cta_primary}
        </PixelButton>
        <PixelButton
          href={`/${lang}/console`}
          size="md"
          variant="outline"
          disabled
          className="flex-1"
        >
          {content.landing.cta_secondary}
        </PixelButton>
      </div>
    </div>
  );
}

function AssistantBubble({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-black bg-fs-diamond/14 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
        <Bot className="h-5 w-5 text-fs-diamond" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 border-2 border-black bg-bg-panel/90 px-4 py-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="mb-3 flex items-center gap-2 border-b border-foreground/10 pb-3">
          <Sparkles className="h-4 w-4 text-fs-gold" aria-hidden="true" />
          <span className="font-ui text-[10px] uppercase tracking-[0.3em] text-foreground/60">
            {label}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function DemoThread({ content, lang }: { content: LandingContentModel; lang: string }) {
  return (
    <>
      <UserBubble message={content.discoveryDemo.prompt} />
      <AssistantBubble label={content.discoveryDemo.panelLabel}>
        <p className="font-body text-sm leading-relaxed text-foreground/78 sm:text-[15px]">
          {content.discoveryDemo.response}
        </p>
        <div className="mt-4">
          <SuggestionCard content={content} lang={lang} />
        </div>
      </AssistantBubble>
    </>
  );
}

function LiveThread({
  content,
  message,
  reduceMotion,
}: {
  content: LandingContentModel;
  message: string;
  reduceMotion: boolean;
}) {
  return (
    <>
      <UserBubble message={message} />
      <AssistantBubble label={content.discoveryDemo.panelLabel}>
        <div className="flex items-center gap-3">
          <span
            className={joinClasses(
              "h-3 w-3 border-2 border-black bg-success",
              reduceMotion ? "" : "animate-pulse"
            )}
          />
          <p className="font-body text-sm leading-relaxed text-foreground/75 sm:text-[15px]">
            {content.discoveryDemo.pendingMessage}
          </p>
        </div>
      </AssistantBubble>
    </>
  );
}

function Composer({
  onSubmit,
  onUpdate,
  placeholder,
  submitLabel,
  value,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: (value: string) => void;
  placeholder: string;
  submitLabel: string;
  value: string;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-auto">
      <div className="flex items-stretch gap-3 border-4 border-black bg-background/80 p-2 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        <input
          type="text"
          value={value}
          onChange={(event) => onUpdate(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 font-body text-sm text-foreground outline-none placeholder:text-foreground/35 sm:text-[15px]"
        />
        <PixelButton
          type="submit"
          size="md"
          variant="diamond"
          className="shrink-0 px-4 text-[10px]"
          aria-label={submitLabel}
        >
          <span className="inline-flex items-center gap-2">
            <SendHorizontal className="h-4 w-4" aria-hidden="true" />
            <span>{submitLabel}</span>
          </span>
        </PixelButton>
      </div>
    </form>
  );
}

export default function LandingDiscoveryConsole({
  content,
  embedded = false,
  heroStatus,
  lang,
}: LandingDiscoveryConsoleProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [draft, setDraft] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextPrompt = draft.trim();

    if (!nextPrompt) {
      return;
    }

    setSubmittedPrompt(nextPrompt);
    setMode("live");
    setDraft("");
  };

  return (
    <div
      className={joinClasses(
        "relative flex h-full flex-col overflow-hidden",
        embedded
          ? "min-h-0 bg-transparent p-0 shadow-none"
          : "min-h-[38rem] border-4 border-black bg-bg-panel/88 p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px] sm:p-6"
      )}
    >
      {embedded ? null : <PixelCorners />}
      <div
        className={joinClasses(
          "pointer-events-none absolute inset-x-12 top-0 h-24 rounded-full bg-fs-diamond/12 blur-3xl",
          embedded ? "opacity-70" : ""
        )}
      />

      <div className="relative z-10 flex h-full flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-foreground/12 pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black bg-fs-diamond/15 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <Sparkles className="h-5 w-5 text-fs-diamond" aria-hidden="true" />
            </span>
            <div>
              <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-fs-diamond/85">
                {content.brand}
              </p>
              <p className="mt-1 font-display text-sm text-foreground">
                {content.discoveryDemo.panelLabel}
              </p>
            </div>
          </div>
          <StatusChip label={heroStatus} />
        </div>

        <div
          className={joinClasses(
            "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden border-2 border-black bg-background/38 p-3 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.03)]",
            mode === "demo" ? "justify-between" : ""
          )}
        >
          <div className="space-y-4">
            {mode === "demo" ? (
              <DemoThread content={content} lang={lang} />
            ) : (
              <LiveThread content={content} message={submittedPrompt} reduceMotion={reduceMotion} />
            )}
          </div>

          <Composer
            value={draft}
            onUpdate={setDraft}
            onSubmit={handleSubmit}
            placeholder={content.discoveryDemo.composerPlaceholder}
            submitLabel={content.discoveryDemo.submitLabel}
          />
        </div>
      </div>
    </div>
  );
}
