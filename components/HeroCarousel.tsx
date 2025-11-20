"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const slides: HeroSlide[] = [
    {
      id: 1,
      title: "Dallas First Fully Mobile Repair Shop",
      subtitle: "We come to you!",
      buttonText: "Contact Us",
      buttonLink: "/contact-us",
      image: "/hero/1.jpeg",
    },
    {
      id: 2,
      title: "Expert Phone , Tablet & Laptop Repairs",
      subtitle: "Same-day service available",
      buttonText: "Get A Quote",
      buttonLink: "/get-a-quote",
      image: "/hero/2.jpeg",
    },
    {
      id: 3,
      title: "Professional Screen Replacements",
      subtitle: "Quality parts, guaranteed",
      buttonText: "Booking",
      buttonLink: "/get-a-quote",
      image: "/hero/3.jpeg",
    },
    {
      id: 4,
      title: "Fast & Reliable Service",
      subtitle: "Trusted by thousands. Check out our reviews.",
      buttonText: "Reviews",
      buttonLink: "/reviews",
      image: "/hero/4.jpeg",
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isHovered) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000); // 4 seconds per slide

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered, slides.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section
      className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image with Next.js Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              quality={90}
              className="object-cover"
              sizes="100vw"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Content */}
          <div className="relative z-20 h-full flex items-center justify-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                {/* Title - Slide from top */}
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 transition-all duration-700 ${
                    index === currentIndex
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{
                    transitionDelay: index === currentIndex ? "200ms" : "0ms",
                  }}
                >
                  {slide.title}
                </h1>

                {/* Subtitle - Slide from top with delay */}
                <p
                  className={`text-lg sm:text-xl md:text-2xl text-white/90 mb-8 transition-all duration-700 ${
                    index === currentIndex
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{
                    transitionDelay: index === currentIndex ? "400ms" : "0ms",
                  }}
                >
                  {slide.subtitle}
                </p>

                {/* Button - Slide from left */}
                <div
                  className={`transition-all duration-700 ${
                    index === currentIndex
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{
                    transitionDelay: index === currentIndex ? "600ms" : "0ms",
                  }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
                  >
                    <a href={slide.buttonLink}>{slide.buttonText}</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      {/* Left Button */}
      <button
        onClick={handlePrevious}
        className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Right Button */}
      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-8 sm:w-10"
                : "bg-white/50 w-2 sm:w-2.5 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
