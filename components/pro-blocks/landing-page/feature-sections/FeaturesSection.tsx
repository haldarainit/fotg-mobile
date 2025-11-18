"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Same-day repairs",
    image: "/girl-repair.jpg", // replace with your image
  },
  {
    title: "700+ stores nationwide",
    image: "/fotg-repair.jpg", // replace with your image
  },
  {
    title: "Low price guarantee",
    image: "/low-repair.jpg", // replace with your image
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <div className="container-padding-x container mx-auto">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Left Column - Feature Images Grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-5">
            {/* Large top card spanning full width */}
            <div className="col-span-2 overflow-hidden rounded-3xl bg-muted">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={features[0].image}
                  alt={features[0].title}
                  fill
                  className="object-cover"
                />
                {/* <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <h3 className="text-center text-2xl font-bold text-white md:text-3xl">
                    {features[0].title}
                  </h3>
                </div> */}
              </div>
            </div>

            {/* Bottom two cards */}
            {features.slice(1).map((feature, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl bg-muted"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                  {/* <div className="absolute inset-0 flex items-center justify-center bg-black/20 p-4">
                    <h3 className="text-center text-lg font-bold text-white md:text-xl lg:text-2xl">
                      {feature.title}
                    </h3>
                  </div> */}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Content */}
          <div className="flex flex-col justify-center gap-6 lg:gap-8">
            <div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Your tech is in good hands
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
                Our local experts have completed 21 million+ repairs, and they
                can help you too, whether you need a fix, setup, accessories, or
                even a cleaning for your phone or game console.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/contact-us">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-green-600 px-8 hover:bg-green-700 sm:w-auto"
                >
                  contact us
                </Button>
              </Link>
              <Link href="/get-a-quote">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full rounded-full px-8 sm:w-auto"
                >
                  Start a repair
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
