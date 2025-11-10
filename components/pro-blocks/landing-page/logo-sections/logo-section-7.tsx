"use client";

import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { siteData } from "@/lib/siteData";

export function LogoSection10() {
  return (
    <section className="bg-secondary border-b pb-16 lg:pb-24">
      <div className="container-padding-x container mx-auto">
        <div className="flex flex-col items-center gap-8 md:gap-12">
          <div className="section-title-gap-lg flex max-w-xl flex-col items-center text-center">
            <Tagline variant="ghost">{siteData.brands.headline}</Tagline>
          </div>

          <div className="relative w-full overflow-hidden">
            <div className="animate-infinite-scroll flex w-max items-center">
              {[...siteData.brands.logos, ...siteData.brands.logos, ...siteData.brands.logos].map((logoItem, index) => {
                const uniqueKey = `logo-wrapper-${logoItem.id}-${index}`;
                return (
                  <div
                    key={uniqueKey}
                    className="w-48 shrink-0 flex items-center justify-center px-4"
                  >
                    <Image
                      src={logoItem.src}
                      alt={logoItem.alt}
                      width={120}
                      height={40}
                      className="h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes infinite-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        .animate-infinite-scroll {
          animation: infinite-scroll 30s linear infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}