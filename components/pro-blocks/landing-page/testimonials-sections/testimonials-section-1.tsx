"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  review: string;
  date: string;
  device?: string;
  service?: string;
  image?: string;
}

export default function TestimonialsSection1() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [cardWidth, setCardWidth] = useState(300);
  const [cardsPerView, setCardsPerView] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/reviews");
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.data.slice(0, 6));
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Update card width and cards per view based on screen size
  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 640) {
        setCardWidth(300);
        setCardsPerView(1);
      } else if (window.innerWidth < 768) {
        setCardWidth(340);
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardWidth(320);
        setCardsPerView(2);
      } else if (window.innerWidth < 1280) {
        setCardWidth(300);
        setCardsPerView(3);
      } else {
        setCardWidth(320);
        setCardsPerView(4);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (testimonials.length === 0 || isHovered) return;

    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 3000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [testimonials.length, isHovered, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return testimonials.length - 1;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= testimonials.length - 1) {
        return 0;
      }
      return prev + 1;
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-primary fill-current" : "text-muted-foreground"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <section className="bg-secondary section-padding-y border-b">
        <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <Tagline>Testimonials</Tagline>
            <h2 className="heading-lg text-foreground">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background flex flex-col gap-4 rounded-3xl border p-6 shadow-sm h-[400px]"
              >
                <div className="h-full bg-muted animate-pulse rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Create seamless infinite scroll array
  const displayTestimonials = [
    testimonials[testimonials.length - 1],
    ...testimonials,
    testimonials[0],
  ];

  const cardGap = 16; // gap between cards
  const totalCardWidth = cardWidth + cardGap;

  return (
    <section
      className="bg-secondary section-padding-y border-b"
      aria-labelledby="testimonial-title"
    >
      <div className="container mx-auto flex flex-col gap-10 md:gap-12 px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center mb-2">
          <Tagline>Testimonials</Tagline>
          <h2 id="testimonial-title" className="heading-lg text-foreground">
            What Our Customers Say
          </h2>
        </div>

        {/* Testimonials Carousel */}
        {testimonials.length > 0 ? (
          <div className="relative w-full">
            {/* Mobile Navigation - Top Right */}
            <div className="absolute -top-10 right-0 flex gap-2 z-20 md:hidden">
              <button
                onClick={handlePrevious}
                className="w-10 h-10 rounded-full bg-background border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-background border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Desktop Navigation - Outside Left */}
            <button
              onClick={handlePrevious}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 lg:-translate-x-16 w-12 h-12 rounded-full bg-background border shadow-lg items-center justify-center hover:bg-accent transition-all z-20"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Desktop Navigation - Outside Right */}
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 lg:translate-x-16 w-12 h-12 rounded-full bg-background border shadow-lg items-center justify-center hover:bg-accent transition-all z-20"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Carousel Container */}
            <div
              className="overflow-hidden mt-1"
              style={{
                maxWidth: cardsPerView === 1 ? `${cardWidth}px` : '100%',
                margin: cardsPerView === 1 ? '0 auto' : '0',
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              ref={scrollRef}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${(currentIndex + 1) * totalCardWidth}px)`,
                }}
              >
                {displayTestimonials.map((testimonial, index) => (
                  <div
                    key={`${testimonial.id}-${index}`}
                    className="relative rounded-3xl overflow-hidden flex-shrink-0"
                    style={{
                      width: `${cardWidth}px`,
                      minWidth: `${cardWidth}px`,
                      height: "500px",
                      marginRight: `${cardGap}px`,
                    }}
                  >
                    {/* Background Image */}
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={`${testimonial.name}'s device`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                    {/* Content Card - Positioned at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <Card className="bg-white/95 backdrop-blur-sm rounded-2xl border-0 shadow-xl">
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          {/* Name & Device */}
                          <div>
                            <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 line-clamp-1">
                              {testimonial.name}
                            </h3>
                            {testimonial.device && (
                              <p className="text-xs sm:text-sm text-primary font-medium line-clamp-1">
                                {testimonial.device}
                              </p>
                            )}
                          </div>

                          {/* Service Badge */}
                          {testimonial.service && (
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                {testimonial.service}
                              </Badge>
                            </div>
                          )}

                          {/* Review Text */}
                          <blockquote className="text-xs sm:text-sm text-foreground leading-relaxed line-clamp-3">
                            &quot;{testimonial.review}&quot;
                          </blockquote>

                          {/* Rating Stars & Date */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex gap-1">
                              {renderStars(testimonial.rating)}
                            </div>
                            {testimonial.date && (
                              <span className="text-xs text-muted-foreground">
                                {testimonial.date}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === index
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 w-2"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full text-center py-8">
            <p className="text-muted-foreground">
              No testimonials available yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
