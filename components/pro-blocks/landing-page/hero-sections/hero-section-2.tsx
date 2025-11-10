"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { siteData } from "@/lib/siteData";
import Link from "next/link";

export function HeroSection2() {
  return (
    <section
      className="bg-secondary section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x container mx-auto flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
        {/* Left Column */}
        <div className="flex flex-1 flex-col gap-6 lg:gap-8">
          {/* Section Title */}
          <div className="section-title-gap-xl flex flex-col">
            {/* Tagline */}
            <Tagline>{siteData.company.name}</Tagline>
            {/* Main Heading */}
            <h1 id="hero-heading" className="heading-xl">
              {siteData.hero.headline}
            </h1>
            {/* Description */}
            <p className="text-muted-foreground text-base lg:text-lg">
              {siteData.hero.subheadline}
            </p>
          </div>

          {/* Feature List */}
          <div className="flex flex-col gap-2 md:gap-3">
            {siteData.features.list.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="pt-0.5">
                  <Check className="text-primary h-5 w-5" />
                </div>
                <span className="text-card-foreground text-base leading-6 font-medium">
                  {feature.title}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="#pricing">
              <Button>{siteData.hero.primaryCTA}</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost">
                {siteData.hero.secondaryCTA}
                <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full flex-1">
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={siteData.hero.videoUrl}
              title="FOTG Mobile Repair Services"
              className="h-full w-full rounded-xl"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}
