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
  "/fe2.jpg",
  "/fe1.jpg",
  "/fe3.jpg",
  "/fe4.jpg",
  "/fe5.jpg",
  "/fe6.jpg",
];

export function FeatureSection9() {
  const features = siteData.features.list;
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset to ensure we start fresh
    setCurrent(0);
    setProgress(0);
  }, []);

  useEffect(() => {
    // Each section displays for 4 seconds
    const displayDuration = 4000;
    const updateInterval = 50;

    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const increment = (100 / displayDuration) * updateInterval;
        const newProgress = prevProgress + increment;

        if (newProgress >= 100) {
          // Move to next feature
          setCurrent((prevCurrent) => {
            const nextIndex = (prevCurrent + 1) % features.length;
            // console.log(
            //   "Moving to feature:",
            //   nextIndex + 1,
            //   "of",
            //   features.length
            // );
            return nextIndex;
          });
          return 0;
        }
        return newProgress;
      });
    }, updateInterval);

    return () => clearInterval(timer);
  }, [features.length]);

  // Use the current index to determine the active feature and image
  const activeFeature = features[current];
  const activeImageSrc = IMAGES[current % IMAGES.length];

  return (
    <section className="bg-secondary section-padding-y border-b" id="features">
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

        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
          {/* Left: Feature list */}
          <div className="order-2 space-y-8 md:order-1">
            {features.map((feature, idx) => {
              const Icon = iconMap[feature.icon] || Shield;
              const active = idx === current;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrent(idx);
                    setProgress(0); // Reset progress on manual click
                  }}
                  className={cn(
                    "flex items-center gap-6 md:gap-8 transition-all duration-500 cursor-pointer", // Added cursor-pointer
                    active ? "opacity-100" : "opacity-50 hover:opacity-75"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border-2 md:h-14 md:w-14 transition-all duration-500",
                      active
                        ? "border-primary bg-primary/10 text-primary scale-105 shadow-[0_0_15px_rgba(192,15,102,0.18)]"
                        : "border-muted-foreground bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon
                      className={cn("h-5 w-5", active ? "text-primary" : "")}
                    />
                  </div>

                  <div className="flex-1">
                    <h3
                      className={cn(
                        "text-xl font-semibold md:text-2xl transition-colors duration-500",
                        active ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Image display (Single element transition) */}
          <div className="relative order-1 h-[220px] overflow-hidden rounded-xl border border-primary/20 [box-shadow:0_5px_30px_-15px_rgba(192,15,102,0.3)] md:order-2 md:h-[320px] lg:h-[420px]">
            {/* The image container uses opacity/transform transitions */}
            <div
              key={current} // Key forces transition on current change
              className="absolute inset-0 transition-all duration-700 ease-in-out opacity-100 translate-y-0 scale-100"
            >
              <img
                src={activeImageSrc}
                alt={activeFeature.title ?? `feature-${current}`}
                className="h-full w-full object-cover"
                width={1200}
                height={700}
              />

              <div className="absolute left-4 bottom-4 rounded-lg bg-background/80 p-2 backdrop-blur-sm">
                <span className="text-primary text-xs font-medium">
                  {`Step ${current + 1}`}
                </span>
              </div>
            </div>

            {/* progress bar */}
            <div className="absolute left-0 bottom-0 right-0 h-1 bg-background/60 z-20">
              <div
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
