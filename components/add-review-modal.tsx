"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  rating: z.number().min(1).max(5),
  device: z.string().min(1, "Please enter your device model"),
  service: z.string().min(1, "Please select the service type"),
  review: z.string().min(10, "Review must be at least 10 characters"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface AddReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewAdded: () => void;
}

interface ServiceOption {
  _id: string;
  name: string;
  repairId: string;
}

export function AddReviewModal({
  open,
  onOpenChange,
  onReviewAdded,
}: AddReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/admin/repairs?activeOnly=true");
        if (response.ok) {
          const data = await response.json();
          setServices(data.data || []);
        } else {
          // Fallback to hardcoded services if API fails
          setServices([
            { _id: "1", name: "Screen Replacement", repairId: "screen" },
            { _id: "2", name: "Battery Replacement", repairId: "battery" },
            { _id: "3", name: "Water Damage Repair", repairId: "water" },
            { _id: "4", name: "Camera Repair", repairId: "camera" },
            { _id: "5", name: "Charging Port Repair", repairId: "charging" },
            { _id: "6", name: "Speaker Repair", repairId: "speaker" },
            { _id: "7", name: "Back Glass Replacement", repairId: "backglass" },
            { _id: "8", name: "Button Repair", repairId: "button" },
            { _id: "9", name: "Face ID/Touch ID Repair", repairId: "faceid" },
            { _id: "10", name: "Software Issues", repairId: "software" },
            { _id: "11", name: "Data Recovery", repairId: "data" },
            { _id: "12", name: "General Diagnosis", repairId: "diagnosis" },
            { _id: "13", name: "Other", repairId: "other" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        // Fallback to hardcoded services
        setServices([
          { _id: "1", name: "Screen Replacement", repairId: "screen" },
          { _id: "2", name: "Battery Replacement", repairId: "battery" },
          { _id: "3", name: "Water Damage Repair", repairId: "water" },
          { _id: "4", name: "Camera Repair", repairId: "camera" },
          { _id: "5", name: "Charging Port Repair", repairId: "charging" },
          { _id: "6", name: "Speaker Repair", repairId: "speaker" },
          { _id: "7", name: "Back Glass Replacement", repairId: "backglass" },
          { _id: "8", name: "Button Repair", repairId: "button" },
          { _id: "9", name: "Face ID/Touch ID Repair", repairId: "faceid" },
          { _id: "10", name: "Software Issues", repairId: "software" },
          { _id: "11", name: "Data Recovery", repairId: "data" },
          { _id: "12", name: "General Diagnosis", repairId: "diagnosis" },
          { _id: "13", name: "Other", repairId: "other" },
        ]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: "",
      email: "",
      rating: 0,
      device: "",
      service: "",
      review: "",
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    await submitReview(data);
  };

  const submitReview = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("rating", data.rating.toString());
      formData.append("device", data.device);
      formData.append("service", data.service);
      formData.append("review", data.review);

      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Review submitted successfully!");
        form.reset();
        setSelectedRating(0);
        onOpenChange(false);
        onReviewAdded();
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue("rating", rating);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Your Review</DialogTitle>
          <DialogDescription>
            Share your experience with FOTG Mobile. Your review helps other
            customers and helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="device"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Model</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your device model (e.g., iPhone 15 Pro)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loadingServices}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingServices ? "Loading services..." : "Select service type"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {services.map((service) => (
                          <SelectItem key={service._id} value={service.name}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`h-8 w-8 cursor-pointer transition-colors ${
                            rating <= (hoverRating || selectedRating)
                              ? "text-primary fill-current"
                              : "text-muted-foreground"
                          }`}
                          onMouseEnter={() => setHoverRating(rating)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleRatingClick(rating)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with our service..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Review
              </Button>
            </div>
          </form>
        </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}