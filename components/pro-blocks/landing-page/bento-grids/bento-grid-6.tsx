"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Monitor,
  Battery,
  Droplet,
  Plug,
  Camera,
  Code,
  Volume2,
  Smartphone,
} from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { siteData } from "@/lib/siteData";

const iconMap: Record<string, any> = {
  monitor: Monitor,
  battery: Battery,
  droplet: Droplet,
  plug: Plug,
  camera: Camera,
  code: Code,
  volume2: Volume2,
  smartphone: Smartphone,
};

export function BentoGrid6() {
  return (
    <section className="bg-background section-padding-y border-b" id="services">
      <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
        {/* Section Title */}
        <div className="section-title-gap-lg mx-auto flex max-w-2xl flex-col items-center text-center">
          {/* Tagline */}
          <Tagline>Services</Tagline>
          {/* Main Heading */}
          <h2 className="heading-lg">{siteData.services.headline}</h2>
          <p className="text-muted-foreground text-base">
            {siteData.services.introduction}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {siteData.services.list.map((service, index) => {
            const Icon = iconMap[service.icon] || Smartphone;
            return (
              <Card
                key={index}
                className="bg-muted/50 gap-0 overflow-hidden rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="flex flex-col gap-4 p-0">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="text-primary h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-foreground text-lg font-semibold">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {service.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
