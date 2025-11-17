"use client";

import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  zap: Zap,
  award: Award,
  "shield-check": ShieldCheck,
  "dollar-sign": DollarSign,
  shield: Shield,
  search: Search,
};

const IMAGES = [
  "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555685812-4b943f1f9a5d?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2070&auto=format&fit=crop",
];

export function FeatureSection9() {
  const features = siteData.features.list;
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // progress increments every 100ms, full cycle ~4000ms
    const tick = 100; // ms
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + (100 * tick) / 4000;
        if (next >= 100) {
          setCurrent((c) => (c + 1) % features.length);
          return 0;
        }
        return next;
      });
    }, tick);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="bg-secondary section-padding-y border-b" id="features">
      <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex max-w-3xl flex-col items-center text-center">
          <Tagline>{siteData.about.headline}</Tagline>
          <h2 className="heading-lg text-foreground">{siteData.features.headline}</h2>
          <p className="text-muted-foreground text-base">{siteData.about.description}</p>
        </div>

        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
          {/* Left: Feature list */}
          <div className="order-2 space-y-8 md:order-1">
            {features.map((feature, idx) => {
              const Icon = iconMap[feature.icon] || Shield;
              const active = idx === current;

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-6 md:gap-8 transition-all duration-500",
                    active ? "opacity-100" : "opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border-2 md:h-14 md:w-14",
                      active
                        ? "border-primary bg-primary/10 text-primary scale-105 shadow-[0_0_15px_rgba(192,15,102,0.18)]"
                        : "border-muted-foreground bg-muted"
                    )}
                  >
                    <Icon className="text-primary h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold md:text-2xl">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm md:text-base">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Image carousel (CSS transitions) */}
          <div className="relative order-1 h-[220px] overflow-hidden rounded-xl border border-primary/20 [box-shadow:0_5px_30px_-15px_rgba(192,15,102,0.3)] md:order-2 md:h-[320px] lg:h-[420px]">
            {IMAGES.slice(0, features.length).map((src, idx) => {
              const isActive = idx === current;
              return (
                <div
                  key={idx}
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-lg transition-all duration-700 ease-in-out",
                    isActive
                      ? "opacity-100 translate-y-0 scale-100 z-10"
                      : "opacity-0 translate-y-6 scale-95 z-0 pointer-events-none"
                  )}
                >
                  <img
                    src={src}
                    alt={features[idx]?.title ?? `feature-${idx}`}
                    className="h-full w-full object-cover"
                    width={1200}
                    height={700}
                  />

                  <div className="absolute left-4 bottom-4 rounded-lg bg-background/80 p-2 backdrop-blur-sm">
                    <span className="text-primary text-xs font-medium">{`Step ${idx + 1}`}</span>
                  </div>
                </div>
              );
            })}

            {/* progress bar */}
            <div className="absolute left-0 bottom-0 right-0 h-1 bg-background/60">
              <div
                className="h-full bg-primary transition-[width] duration-100 linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
