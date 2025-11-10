"use client";

import { Phone, Package, Wrench, CheckCircle } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { siteData } from "@/lib/siteData";

const stepIcons = [Phone, Package, Wrench, CheckCircle];

export function HowItWorksSection() {
  return (
    <section
      className="bg-background section-padding-y border-b"
      id="how-it-works"
    >
      <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
          <Tagline>Process</Tagline>
          <h2 className="heading-lg text-foreground">
            {siteData.howItWorks.headline}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {siteData.howItWorks.steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <div key={index} className="flex flex-col items-center gap-5 text-center">
                <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-[0px_0px_0px_4px_rgba(7,46,106,0.05)]">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-foreground font-semibold">
                    {step.step}. {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
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
