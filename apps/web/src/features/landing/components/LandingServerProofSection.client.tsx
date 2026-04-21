"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Database, Server } from "lucide-react";
import PixelButton from "@/components/ui/PixelButton";
import ServerCard from "@/features/server/components/ServerCard";
import type { LandingContentModel } from "@/features/landing/types";
import type { PublicServerListItem } from "@/lib/servers-api";
import type { ServerCardCopy } from "@/features/server/lib/server-copy";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { PixelCorners, SectionHeader, joinClasses } from "./LandingShared";

interface LandingServerProofSectionProps {
  content: LandingContentModel;
  lang: string;
  serverCardCopy: ServerCardCopy;
  servers: PublicServerListItem[];
}

const formatNumber = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString() : "0";

export default function LandingServerProofSection({
  content,
  lang,
  serverCardCopy,
  servers,
}: LandingServerProofSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const copy = content.landing.serverProof;
  const featuredServers = servers.slice(0, 3);

  return (
    <motion.section {...getRevealProps(reduceMotion)} className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          className="mx-0 max-w-3xl text-left"
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={copy.subtitle}
        />
        <PixelButton href={`/${lang}/discover`} size="md" variant="diamond">
          {copy.viewAllLabel}
        </PixelButton>
      </div>

      {featuredServers.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {featuredServers.map((server, index) => (
            <motion.div key={server.slug} {...getRevealProps(reduceMotion, index * 0.05)}>
              <ServerCard
                slug={server.slug}
                name={server.name}
                description={server.description}
                game={server.game}
                gameVersion={server.latest_metrics.minecraft_version}
                isOnline={server.freshness_status === "online"}
                lang={lang}
                maxPlayers={server.latest_metrics.max_players}
                onlinePlayers={server.latest_metrics.online_players}
                pingMs={server.latest_metrics.ping_ms}
                region={server.region}
                copy={serverCardCopy}
                variant="landing"
                badges={[
                  {
                    label:
                      server.freshness_status === "online" ? copy.liveLabel : copy.verifiedLabel,
                    tone: server.freshness_status === "online" ? "trending" : "verified",
                  },
                ]}
                sortHighlight={{
                  helper: `${
                    server.latest_metrics.max_players
                      ? formatNumber(server.latest_metrics.max_players)
                      : "?"
                  } ${copy.playerHelperSuffix}`,
                  label: copy.rankedByLabel,
                  tone: "players",
                  value: `${formatNumber(server.latest_metrics.online_players)} ${
                    serverCardCopy.online
                  }`,
                }}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden border-4 border-black bg-bg-panel/86 p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:p-8">
          <PixelCorners />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
            <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-fs-diamond/12 text-fs-diamond shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
              <Database className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-lg leading-relaxed tracking-[0.14em] text-foreground">
                {copy.emptyTitle}
              </h3>
              <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-foreground/68 md:text-base">
                {copy.emptyDescription}
              </p>
            </div>
            <div
              className={joinClasses(
                "flex items-center gap-3 border-2 border-success/60 bg-success/10 px-4 py-3 font-ui text-[11px] uppercase tracking-[0.28em] text-success"
              )}
            >
              <Server className="h-4 w-4" aria-hidden="true" />
              {copy.liveLabel}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
