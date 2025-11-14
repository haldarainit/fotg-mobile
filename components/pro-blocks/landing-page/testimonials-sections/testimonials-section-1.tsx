"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  review: string;
  date: string;
}

export default function TestimonialsSection1() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/reviews");
        if (response.ok) {
          const data = await response.json();
          // Take only the first 3 testimonials for the section
          setTestimonials(data.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (isLoading) {
    return (
      <section className="bg-secondary section-padding-y border-b">
        <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <Tagline>Testimonials</Tagline>
            <h2 className="heading-lg text-foreground">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="h-5 w-5 bg-muted animate-pulse rounded" />
                  ))}
                </div>
                <div className="h-16 bg-muted animate-pulse rounded" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
            What Our Customers Say
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {/* First set of testimonials */}
            {testimonials.length > 0 ? testimonials.concat(testimonials).map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="bg-background flex flex-col gap-4 rounded-xl border p-6 shadow-sm flex-shrink-0 mr-6"
                style={{ width: '400px', minWidth: '400px' }}
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
            )) : (
              <div className="w-full text-center py-8">
                <p className="text-muted-foreground">No testimonials available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
