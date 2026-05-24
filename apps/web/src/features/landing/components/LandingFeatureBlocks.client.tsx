"use client";

import { motion } from "framer-motion";
import { PixelCard } from "@firstspawn/ui";
import type { LandingContentModel } from "@/features/landing/types";

interface LandingFeatureBlocksProps {
  content: LandingContentModel;
}

export default function LandingFeatureBlocks({ content }: LandingFeatureBlocksProps) {
  return (
    <section className="space-y-12 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mb-4 block font-ui text-xs uppercase tracking-[0.5em] text-primary">
          {content.landing.features.eyebrow}
        </span>
        <h2 className="mb-6 font-ui text-4xl uppercase text-foreground md:text-5xl">
          {content.landing.features.title}
        </h2>
        <div className="mx-auto mb-8 h-1 w-24 bg-primary opacity-50" />
        <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-foreground/80 md:text-lg">
          {content.landing.features.subtitle}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {content.features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0 }}
          >
            <PixelCard
              variant="panel"
              className="h-full group hover:border-primary/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-primary text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-2xl group-hover:bg-success transition-colors">
                  {feature.icon}
                </div>
                <span className="font-ui text-xs text-muted tracking-[0.3em] uppercase">
                  MODULE_{index + 1}
                </span>
              </div>
              <h3 className="font-ui text-xl uppercase mb-3 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="font-body text-sm text-muted leading-relaxed">{feature.description}</p>

              <div className="mt-auto pt-8">
                <div className="h-1 w-full bg-black">
                  <div className="h-full bg-primary/20 w-1/3" />
                </div>
              </div>
            </PixelCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
