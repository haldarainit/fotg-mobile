"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
// links removed per request; cards are now static
import { Card, CardContent } from "@/components/ui/card";

const brands = [
  {
    name: "Samsung",
    badge: "Authorized Service Center",
    image: "/samsung-brand.jpg", // replace with your Samsung device image
    cta: "Start a Samsung repair",
    href: "/repair/samsung",
  },
  {
    name: "Apple",
    badge: "Apple Independent Repair Provider",
    image: "/apple-brand.jpg", // replace with your Apple device image
    cta: "Start an Apple repair",
    href: "/repair/apple",
  },
  {
    name: "Google",
    badge: "Authorized Service Provider",
    image: "/google-brand.jpg", // replace with your Google device image
    cta: "Start a Google repair",
    href: "/repair/google",
  },
];

export function BrandRepairSection() {
  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <div className="container-padding-x container mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10 lg:mb-12">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            The brand other brands trust
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            FOTG is an authorized repair provider for the world's top tech
            brands.
          </p>
        </div>

        {/* Brand Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {brands.map((brand) => (
            <div key={brand.name}>
              <Link
                href={`/get-a-quote?device=smartphone&brand=${encodeURIComponent(
                  brand.name.toLowerCase()
                )}`}
                className="block"
              >
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="flex h-full flex-col p-0">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      {/* Device Image */}
                      <Image
                        src={brand.image}
                        alt={`${brand.name} device`}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* CTA Text */}
                    <div className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5">
                      <h3 className="text-lg font-semibold md:text-xl">
                        {brand.cta}
                      </h3>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
