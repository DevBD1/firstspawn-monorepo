"use client";

import { type FormEvent, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import ChatBubble from "@/components/ui/chat/ChatBubble";
import ChatComposer from "@/components/ui/chat/ChatComposer";
import ChatPanelHeader from "@/components/ui/chat/ChatPanelHeader";
import { PixelCorners, joinClasses } from "@/components/ui/PagePrimitives";
import PixelButton from "@/components/ui/PixelButton";
import type { LandingContentModel } from "@/features/landing/types";

interface LandingDiscoveryChatDemoProps {
  content: LandingContentModel;
  embedded?: boolean;
  lang: string;
  statusLabel: string;
}

// Landing-owned recommendation card. Shared chat primitives stay generic, but this CTA content is landing-specific.
function SuggestionCard({ content, lang }: { content: LandingContentModel; lang: string }) {
  const { recommendationCard } = content.discoveryChatDemo.demoThread;

  return (
    <div className="border-2 border-black bg-background/86 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-success">
            {recommendationCard.statusLabel}
          </p>
          <h3 className="mt-2 font-display text-base leading-snug text-foreground sm:text-lg">
            {recommendationCard.title}
          </h3>
          <p className="mt-3 font-body text-sm leading-relaxed text-foreground/70">
            {recommendationCard.description}
          </p>
        </div>
        <span className="shrink-0 border border-black bg-fs-diamond/15 px-3 py-2 font-ui text-[11px] uppercase tracking-[0.24em] text-fs-diamond">
          {recommendationCard.matchLabel}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {recommendationCard.tags.map((tag) => (
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
          {content.landing.hero.actions.primaryLabel}
        </PixelButton>
        <PixelButton
          href={`/${lang}/console`}
          size="md"
          variant="outline"
          disabled
          className="flex-1"
        >
          {content.landing.hero.actions.secondaryLabel}
        </PixelButton>
      </div>
    </div>
  );
}

// Default mock thread shown before the user submits a real prompt.
function DemoThread({ content, lang }: { content: LandingContentModel; lang: string }) {
  return (
    <>
      <ChatBubble align="end">
        <p className="font-body text-sm leading-relaxed text-foreground sm:text-[15px]">
          {content.discoveryChatDemo.demoThread.userPrompt}
        </p>
      </ChatBubble>
      <ChatBubble
        align="start"
        headerLabel={content.discoveryChatDemo.title}
        leadingVisual={
          <span className="inline-flex h-11 w-11 items-center justify-center border-2 border-black bg-fs-diamond/14 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            <Bot className="h-5 w-5 text-fs-diamond" aria-hidden="true" />
          </span>
        }
      >
        <p className="font-body text-sm leading-relaxed text-foreground/78 sm:text-[15px]">
          {content.discoveryChatDemo.demoThread.assistantReply}
        </p>
        <div className="mt-4">
          <SuggestionCard content={content} lang={lang} />
        </div>
      </ChatBubble>
    </>
  );
}

// Temporary live state. We keep the user's first real prompt and swap the assistant side to a waiting shell.
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
      <ChatBubble align="end">
        <p className="font-body text-sm leading-relaxed text-foreground sm:text-[15px]">
          {message}
        </p>
      </ChatBubble>
      <ChatBubble
        align="start"
        headerLabel={content.discoveryChatDemo.title}
        leadingVisual={
          <span className="inline-flex h-11 w-11 items-center justify-center border-2 border-black bg-fs-diamond/14 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            <Bot className="h-5 w-5 text-fs-diamond" aria-hidden="true" />
          </span>
        }
      >
        <div className="flex items-center gap-3">
          <span
            className={joinClasses(
              "h-3 w-3 border-2 border-black bg-success",
              reduceMotion ? "" : "animate-pulse"
            )}
          />
          <p className="font-body text-sm leading-relaxed text-foreground/75 sm:text-[15px]">
            {content.discoveryChatDemo.assistantWaitingMessage}
          </p>
        </div>
      </ChatBubble>
    </>
  );
}

/**
 * Landing-specific chat demo.
 * It starts with a mock conversation and switches to a live-widget shell after the first real submit.
 */
export default function LandingDiscoveryChatDemo({
  content,
  embedded = false,
  lang,
  statusLabel,
}: LandingDiscoveryChatDemoProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [draft, setDraft] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");

  // The first meaningful submit clears the mock thread and becomes the first real user message.
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
        <ChatPanelHeader
          eyebrow={content.brand}
          title={content.discoveryChatDemo.title}
          statusLabel={statusLabel}
          icon={<Sparkles className="h-5 w-5 text-fs-diamond" aria-hidden="true" />}
        />

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

          <ChatComposer
            value={draft}
            onUpdate={setDraft}
            onSubmit={handleSubmit}
            placeholder={content.discoveryChatDemo.composer.placeholder}
            submitLabel={content.discoveryChatDemo.composer.submitLabel}
          />
        </div>
      </div>
    </div>
  );
}
