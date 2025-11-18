"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, CheckCircle, Phone, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { siteData } from "@/lib/siteData";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddReviewModal } from "@/components/add-review-modal";
import { toast } from "sonner";

interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  device: string;
  service: string;
  review: string;
  image?: string;
  date?: string;
  createdAt: Date;
  approved: boolean;
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [cardWidth, setCardWidth] = useState(300);
  const [cardsPerView, setCardsPerView] = useState(1);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reviews");
      const result = await response.json();

      if (result.success) {
        setReviews(result.data);
      } else {
        toast.error("Failed to load reviews");
      }
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
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

  const handleReviewAdded = () => {
    fetchReviews();
  };

  // Calculate stats from dynamic reviews
  const overallStats = {
    totalReviews: reviews.length,
    averageRating:
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length) *
              10
          ) / 10
        : 0,
    fiveStars:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === 5).length / reviews.length) *
              100
          )
        : 0,
    fourStars:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === 4).length / reviews.length) *
              100
          )
        : 0,
    threeStars:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === 3).length / reviews.length) *
              100
          )
        : 0,
    twoStars:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === 2).length / reviews.length) *
              100
          )
        : 0,
    oneStar:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === 1).length / reviews.length) *
              100
          )
        : 0,
  };

  // Auto-play functionality
  useEffect(() => {
    if (reviews.length === 0 || isHovered) return;

    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 3000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [reviews.length, isHovered, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return reviews.length - 1;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= reviews.length - 1) {
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

  // Create seamless infinite scroll array
  const displayReviews = reviews.length > 0 
    ? [reviews[reviews.length - 1], ...reviews, reviews[0]]
    : [];

  const cardGap = 16;
  const totalCardWidth = cardWidth + cardGap;

  return (
    <>
      {/* Hero Section */}
      <section className="bg-secondary section-padding-y border-b">
        <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg mx-auto flex max-w-3xl flex-col items-center text-center">
            <Tagline>Reviews</Tagline>
            <h1 className="heading-xl text-foreground">
              {siteData.testimonials.headline}
            </h1>
            <p className="text-muted-foreground text-base">
              Real reviews from real customers who trust FOTG Mobile for their
              device repairs. See why we're Dallas's top-rated mobile repair
              service.
            </p>
          </div>
        </div>
      </section>

      {/* Overall Rating Stats */}
      <section className="bg-background section-padding-y border-b">
        <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 className="heading-lg text-foreground">Our Rating</h2>
            <p className="text-muted-foreground text-base">
              Based on hundreds of satisfied customers across Dallas, DFW.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Overall Rating */}
            <Card className="bg-background rounded-xl border p-8 shadow-sm text-center">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-5xl font-bold text-foreground">
                    {overallStats.averageRating}
                  </span>
                  <span className="text-muted-foreground text-lg">/5</span>
                </div>
                <div className="flex justify-center mb-4">{renderStars(5)}</div>
                <p className="text-muted-foreground">
                  Based on {overallStats.totalReviews.toLocaleString()}+ reviews
                </p>
              </CardContent>
            </Card>

            {/* Rating Breakdown */}
            <Card className="bg-background rounded-xl border p-8 shadow-sm">
              <CardContent className="p-0">
                <h3 className="font-semibold text-foreground mb-6 text-center">
                  Rating Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { stars: 5, percentage: overallStats.fiveStars },
                    { stars: 4, percentage: overallStats.fourStars },
                    { stars: 3, percentage: overallStats.threeStars },
                    { stars: 2, percentage: overallStats.twoStars },
                    { stars: 1, percentage: overallStats.oneStar },
                  ].map(({ stars, percentage }) => (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-sm w-6">{stars}★</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-10 text-right">
                        {percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Highlights */}
            <Card className="bg-background rounded-xl border p-8 shadow-sm">
              <CardContent className="p-0">
                <h3 className="font-semibold text-foreground mb-6 text-center">
                  Why Choose Us
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-primary h-4 w-4" />
                    <span className="text-sm">Same-day repairs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-primary h-4 w-4" />
                    <span className="text-sm">Warranty on repairs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-primary h-4 w-4" />
                    <span className="text-sm">Genuine parts only</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-primary h-4 w-4" />
                    <span className="text-sm">Free diagnostics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Reviews Carousel */}
      <section className="bg-secondary section-padding-y border-b">
        <div className="container mx-auto flex flex-col gap-10 md:gap-12 px-4 sm:px-6 lg:px-8">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 className="heading-lg text-foreground">Customer Reviews</h2>
            <p className="text-muted-foreground text-base">
              Here's what our customers have to say about their repair
              experience.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your Review
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="relative w-full">
              {/* Mobile Navigation - Top Right */}
              <div className="absolute -top-16 right-0 flex gap-2 z-20 md:hidden">
                <button
                  onClick={handlePrevious}
                  className="w-10 h-10 rounded-full bg-background border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-background border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Desktop Navigation - Outside Left */}
              <button
                onClick={handlePrevious}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 lg:-translate-x-16 w-12 h-12 rounded-full bg-background border shadow-lg items-center justify-center hover:bg-accent transition-all z-20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Desktop Navigation - Outside Right */}
              <button
                onClick={handleNext}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 lg:translate-x-16 w-12 h-12 rounded-full bg-background border shadow-lg items-center justify-center hover:bg-accent transition-all z-20"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Carousel Container */}
              <div
                className="overflow-hidden"
                style={{
                  maxWidth: cardsPerView === 1 ? `${cardWidth}px` : '100%',
                  margin: cardsPerView === 1 ? '0 auto' : '0',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${(currentIndex + 1) * totalCardWidth}px)`,
                  }}
                >
                  {displayReviews.map((review, index) => (
                    <div
                      key={`${review.id}-${index}`}
                      className="relative rounded-3xl overflow-hidden flex-shrink-0"
                      style={{
                        width: `${cardWidth}px`,
                        minWidth: `${cardWidth}px`,
                        height: "500px",
                        marginRight: `${cardGap}px`,
                      }}
                    >
                      {/* Background Image */}
                      {review.image ? (
                        <img
                          src={review.image}
                          alt={`${review.name}'s device`}
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
                                {review.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-primary font-medium line-clamp-1">
                                {review.device}
                              </p>
                            </div>

                            {/* Service Badge */}
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                {review.service}
                              </Badge>
                            </div>

                            {/* Review Text */}
                            <p className="text-xs sm:text-sm text-foreground leading-relaxed line-clamp-3">
                              {review.review}
                            </p>

                            {/* Rating Stars & Date */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex gap-1">
                                {renderStars(review.rating)}
                              </div>
                              {review.date && (
                                <span className="text-xs text-muted-foreground">
                                  {review.date}
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
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      currentIndex === index
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 w-2"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-background section-padding-y">
        <div className="container-padding-x container mx-auto">
          <Card className="bg-primary/5 border-primary/20 rounded-xl p-8 text-center">
            <CardContent className="p-0">
              <div className="flex flex-col items-center gap-6">
                <div>
                  <h3 className="heading-sm text-foreground mb-4">
                    Join Our Happy Customers
                  </h3>
                  <p className="text-muted-foreground text-base mb-6 max-w-2xl">
                    Experience the same quality service that earned us hundreds
                    of 5-star reviews. Get your device repaired by Dallas's most
                    trusted mobile repair experts.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg">
                    <a href="/contact-us">Get Free Quote</a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href={`tel:${siteData.contact.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      {siteData.contact.phone}
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Add Review Modal */}
      <AddReviewModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onReviewAdded={handleReviewAdded}
      />
    </>
  );
}
