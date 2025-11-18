"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { siteData } from "@/lib/siteData";
import Link from "next/link";

// use real device images instead of icons
const devices = [
  { name: "Phone", src: "/phone.png" },
  { name: "Computer", src: "/computer.png" },
  { name: "Tablet", src: "/tablet.png" },
];

export function HeroSection2() {
  return (
    <section
      className="bg-secondary pt-2 pb-10 md:pt-8 md:pb-14"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x container mx-auto grid gap-8 lg:grid-cols-2 lg:items-center">
        {/* Left Column */}
        <div className="order-2 flex flex-col gap-2 lg:order-1 lg:gap-2">
          {/* Section Title */}
          <div className="flex flex-col gap-2">
            {/* <Tagline>{siteData.company.name}</Tagline> */}

            <h1
              id="hero-heading"
              className="heading-xl tracking-tight"
            >
              {siteData.hero.headline}
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
              {siteData.hero.subheadline}
            </p>
          </div>

          {/* Feature List */}
          {/* <div className="flex flex-col gap-1.5 md:gap-2">
            {siteData.features.list.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <div className="pt-0.5">
                  <Check className="text-primary h-4 w-4 md:h-5 md:w-5" />
                </div>
                <span className="text-card-foreground text-sm leading-5 md:text-base md:leading-6 font-medium">
                  {feature.title}
                </span>
              </div>
            ))}
          </div> */}

          {/* Device Cards Row */}
          <div className="mt-2 flex flex-wrap gap-1 justify-center sm:justify-start">
            {devices.map(({ name, src }) => {
              // map display name to device query values
              const mapName = (n: string) => {
                const key = n.toLowerCase();
                if (key.includes('phone')) return 'smartphone';
                if (key.includes('computer') || key.includes('laptop')) return 'laptop';
                if (key.includes('tablet')) return 'tablet';
                return 'smartphone';
              };
              const deviceQuery = mapName(name);

              return (
                <Link
                  key={name}
                  href={`/get-a-quote?device=${deviceQuery}`}
                  className="flex flex-col w-[46%] min-w-[140px] items-center gap-1 rounded-2xl px-3 py-1 sm:w-auto sm:px-4 sm:py-3"
                >
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-lg">
                    <Image
                      src={src}
                      alt={name}
                      width={150}
                      height={150}
                      className="object-contain"
                      sizes="200px"
                    />
                  </div>
                  <span className="text-sm font-semibold text-card-foreground md:text-base">
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link href="/get-a-quote">
              <Button className="w-full sm:w-auto">
                {siteData.hero.primaryCTA}
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="ghost"
                className="w-full justify-center gap-2 sm:w-auto"
              >
                {siteData.hero.secondaryCTA}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column – Image (replaces video) */}
        <div className="order-1 relative w-full lg:order-2">
          <div className="overflow-hidden">
            <div className="relative aspect-[16/11] w-full sm:aspect-[16/10] lg:aspect-[12/9]">
              <Image
                src="/hero.png" // update to your hero image path
                alt="Customer getting device repaired at the counter"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
