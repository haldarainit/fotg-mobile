"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { siteData } from "@/lib/siteData";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { useState } from "react";

export function ContactUsSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    device: "",
    issue: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-secondary section-padding-y border-b">
        <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg mx-auto flex max-w-3xl flex-col items-center text-center">
            <Tagline>Contact</Tagline>
            <h1 className="heading-xl text-foreground">
              {siteData.contact.headline}
            </h1>
            <p className="text-muted-foreground text-base">
              {siteData.contact.description}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="bg-background section-padding-y border-b">
        <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 className="heading-lg text-foreground">Get In Touch</h2>
            <p className="text-muted-foreground text-base">
              Multiple ways to reach us. Choose what works best for you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Phone */}
            <Card className="bg-background rounded-xl border p-6 shadow-sm text-center">
              <CardContent className="flex flex-col items-center gap-4 p-0">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Phone className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">
                    Call Us
                  </h3>
                  <a
                    href={`tel:${siteData.contact.phone}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {siteData.contact.phone}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="bg-background rounded-xl border p-6 shadow-sm text-center">
              <CardContent className="flex flex-col items-center gap-4 p-0">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Mail className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">
                    Email Us
                  </h3>
                  <a
                    href={`mailto:${siteData.contact.email}`}
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    {siteData.contact.email}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="bg-background rounded-xl border p-6 shadow-sm text-center">
              <CardContent className="flex flex-col items-center gap-4 p-0">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <MapPin className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">
                    Visit Us
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {siteData.contact.address}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="bg-background rounded-xl border p-6 shadow-sm text-center">
              <CardContent className="flex flex-col items-center gap-4 p-0">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Clock className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">
                    Business Hours
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {siteData.contact.hours}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="bg-secondary section-padding-y border-b">
        <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 className="heading-lg text-foreground">Send Us a Message</h2>
            <p className="text-muted-foreground text-base">
              Fill out the form below and we'll get back to you within 24 hours
              with a free quote.
            </p>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <Card className="bg-background rounded-xl border p-8 shadow-sm">
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="device">Device Model *</Label>
                      <Input
                        id="device"
                        name="device"
                        value={formData.device}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., iPhone 14 Pro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issue">Issue Type *</Label>
                      <Input
                        id="issue"
                        name="issue"
                        value={formData.issue}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Cracked screen"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Details</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us more about the problem..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message & Get Free Quote
                  </Button>

                  <p className="text-muted-foreground text-sm text-center">
                    By submitting this form, you agree to receive communication
                    from {siteData.company.name}.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Contact CTA */}
      <section className="bg-background section-padding-y">
        <div className="container-padding-x container mx-auto">
          <Card className="bg-primary/5 border-primary/20 rounded-xl p-8 text-center">
            <CardContent className="p-0">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-xl">
                  <MessageCircle className="text-primary h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-foreground heading-sm mb-3">
                    Need Emergency Repair?
                  </h3>
                  <p className="text-muted-foreground text-base mb-6">
                    Call us directly for same-day appointments and emergency
                    device recovery services.
                  </p>
                  <Button size="lg">
                    <Phone className="mr-2 h-4 w-4" />
                    Call {siteData.contact.phone}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
