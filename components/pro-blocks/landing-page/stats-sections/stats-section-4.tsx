"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { siteData } from "@/lib/siteData";

export function StatsSection4() {
  return (
    <section className="bg-background section-padding-y border-b">
      <div className="container-padding-x container mx-auto">
        <div className="flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <Tagline>Our Impact</Tagline>
            <h2 className="heading-lg text-foreground">Trusted by Thousands</h2>
            <p className="text-muted-foreground">
              Our commitment to quality and customer satisfaction speaks for
              itself. Here's what we've accomplished serving the Dallas
              community.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:gap-6 lg:flex-row">
            <Card className="bg-secondary rounded-xl border-none p-6 shadow-none">
              <CardContent className="flex flex-col gap-2 p-0 md:gap-3">
                <h3 className="text-primary font-semibold">Devices Repaired</h3>
                <span className="text-foreground text-3xl font-semibold md:text-4xl">
                  10K+
                </span>

                <p className="text-muted-foreground text-base">
                  Successfully fixed smartphones, tablets, and other mobile
                  devices across Texas with quality guaranteed repairs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary rounded-xl border-none p-6 shadow-none">
              <CardContent className="flex flex-col gap-2 p-0 md:gap-3">
                <h3 className="text-primary font-semibold">
                  Average Repair Time
                </h3>
                <span className="text-foreground text-3xl font-semibold md:text-4xl">
                  24hrs
                </span>
                <p className="text-muted-foreground text-base">
                  Most repairs completed within 24 hours, with many same-day
                  fixes to get you back online quickly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary rounded-xl border-none p-6 shadow-none">
              <CardContent className="flex flex-col gap-2 p-0 md:gap-3">
                <h3 className="text-primary font-semibold">Customer Rating</h3>
                <span className="text-foreground text-3xl font-semibold md:text-4xl">
                  4.9/5
                </span>
                <p className="text-muted-foreground text-base">
                  Exceptional customer satisfaction with fast, reliable, and
                  affordable mobile repair services in Dallas, DFW.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
