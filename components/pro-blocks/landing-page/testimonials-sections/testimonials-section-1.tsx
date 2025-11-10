"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { siteData } from "@/lib/siteData";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export default function TestimonialsSection1() {
  return (
    <section
      className="bg-secondary section-padding-y border-b"
      aria-labelledby="testimonial-title"
    >
      <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
        {/* Section Title */}
        <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
          <Tagline>Testimonials</Tagline>
          <h2 id="testimonial-title" className="heading-lg text-foreground">
            {siteData.testimonials.headline}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {siteData.testimonials.list.map((testimonial, index) => (
            <div
              key={index}
              className="bg-background flex flex-col gap-4 rounded-xl border p-6 shadow-sm"
            >
              {/* Rating Stars */}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="text-primary h-5 w-5 fill-current"
                  />
                ))}
              </div>

              {/* Review Text */}
              <blockquote className="text-muted-foreground text-sm leading-relaxed">
                &quot;{testimonial.review}&quot;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {testimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground font-medium text-sm">
                  {testimonial.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
