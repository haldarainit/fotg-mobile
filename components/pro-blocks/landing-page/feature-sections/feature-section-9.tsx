"use client";

import {
  Zap,
  Award,
  ShieldCheck,
  DollarSign,
  Shield,
  Search,
} from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { siteData } from "@/lib/siteData";

const iconMap: Record<string, any> = {
  zap: Zap,
  award: Award,
  "shield-check": ShieldCheck,
  "dollar-sign": DollarSign,
  shield: Shield,
  search: Search,
};

export function FeatureSection9() {
  return (
    <section
      className="bg-secondary section-padding-y border-b"
      id="features"
    >
      <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex max-w-3xl flex-col items-center text-center">
          <Tagline>{siteData.about.headline}</Tagline>
          <h2 className="heading-lg text-foreground">
            {siteData.features.headline}
          </h2>
          <p className="text-muted-foreground text-base">
            {siteData.about.description}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {siteData.features.list.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Shield;
            return (
              <div key={index} className="flex flex-col items-center gap-5 text-center">
                <div className="bg-background flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-[0px_0px_0px_4px_rgba(7,46,106,0.05)]">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-foreground font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
