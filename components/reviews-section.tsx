"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, CheckCircle, Phone, Plus, Loader2 } from "lucide-react";
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
  date?: string;
  createdAt: Date;
  approved: boolean;
}

const overallStats = {
  totalReviews: 1247,
  averageRating: 4.9,
  fiveStars: 92,
  fourStars: 6,
  threeStars: 1,
  twoStars: 0.5,
  oneStar: 0.5,
};

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      {/* Customer Reviews */}
      <section className="bg-secondary section-padding-y border-b">
        <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  className="bg-background rounded-xl border p-6 shadow-sm"
                >
                  <CardContent className="p-0 space-y-4">
                    {/* Rating Stars */}
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>

                    {/* Review Text */}
                    <blockquote className="text-muted-foreground text-sm leading-relaxed">
                      &quot;{review.review}&quot;
                    </blockquote>

                    {/* Service Info */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {review.device}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {review.service}
                      </Badge>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {review.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-foreground font-medium text-sm">
                          {review.name}
                        </span>
                        <p className="text-muted-foreground text-xs">
                          {review.date}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
