"use client";

import { PixelButton } from "@firstspawn/ui";
import type { LandingContentModel } from "@/features/landing/types";

interface LandingReturnCtaProps {
  content: LandingContentModel;
}

export default function LandingReturnCta({ content }: LandingReturnCtaProps) {
  const copy = content.landing.returnCta;

  return (
    <section className="pb-16 pt-0">
      <div className="flex justify-center border-t-2 border-primary/25 pt-8">
        <PixelButton href="#discovery-console" variant="outline" size="md">
          {copy.label}
        </PixelButton>
      </div>
    </section>
  );
}
