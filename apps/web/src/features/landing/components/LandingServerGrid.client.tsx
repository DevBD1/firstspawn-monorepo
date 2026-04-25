"use client";

import { motion } from "framer-motion";
import { PixelButton, PixelCard } from "@firstspawn/ui";
import type { LandingContentModel } from "@/features/landing/types";
import type { PublicServerListItem } from "@/lib/servers-api";

interface LandingServerGridProps {
  content: LandingContentModel;
  servers: PublicServerListItem[];
  lang: string;
}

export default function LandingServerGrid({ content, servers, lang }: LandingServerGridProps) {
  const copy = content.landing.serverProof;

  return (
    <section className="space-y-12 py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-4 border-black pb-8">
        <div>
          <span className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-2 block">
            {copy.eyebrow}
          </span>
          <h2 className="font-ui text-4xl uppercase text-foreground">{copy.title}</h2>
        </div>
        <PixelButton variant="primary" size="md" href={`/${lang}/discover`}>
          {copy.viewAllLabel}
        </PixelButton>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {servers.slice(0, 6).map((server, index) => (
          <motion.div
            key={server.slug}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0 }}
          >
            <PixelCard
              variant="panel"
              className="h-full hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="font-body text-[10px] text-muted tracking-tighter uppercase">
                  NODE://{server.slug.toUpperCase().slice(0, 8)}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 ${server.freshness_status === "online" ? "bg-success animate-retro-pulse" : "bg-danger"}`}
                  />
                  <span className="font-ui text-[10px] uppercase tracking-widest text-foreground">
                    {server.freshness_status === "online" ? "Live" : "Offline"}
                  </span>
                </div>
              </div>

              <h3 className="font-ui text-xl uppercase mb-2 text-foreground group-hover:text-primary transition-colors">
                {server.name}
              </h3>

              <p className="font-body text-sm text-muted line-clamp-2 mb-6 flex-grow leading-relaxed">
                {server.description}
              </p>

              <div className="mt-auto border-t-2 border-black pt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="block font-ui text-[9px] uppercase text-muted tracking-tighter mb-1">
                    Players
                  </span>
                  <span className="font-body text-sm text-foreground">
                    {server.latest_metrics.online_players} / {server.latest_metrics.max_players}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-ui text-[9px] uppercase text-muted tracking-tighter mb-1">
                    Version
                  </span>
                  <span className="font-body text-sm text-foreground">
                    {server.latest_metrics.minecraft_version || "N/A"}
                  </span>
                </div>
              </div>
            </PixelCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
