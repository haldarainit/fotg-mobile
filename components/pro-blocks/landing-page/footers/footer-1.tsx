"use client";

import { Logo } from "@/components/pro-blocks/logo";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { siteData } from "@/lib/siteData";
import { Instagram, Phone, Mail, MapPin, Clock } from "lucide-react";
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal";
import { TermsOfServiceModal } from "@/components/terms-of-service-modal";

export function Footer1() {
  return (
    <footer
      className="bg-background section-padding-y"
      role="contentinfo"
      aria-label="Site footer"
      id="contact"
    >
      <div className="container-padding-x container mx-auto flex flex-col gap-12 lg:gap-16">
        {/* Top Section */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="Go to homepage">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional mobile repair services with quality guaranteed.
            </p>
            {/* Social Media Links */}
            <div className="flex gap-4">
              <Link
                href={siteData.contact.social.instagram}
                target="_blank"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href={siteData.contact.social.tiktok}
                target="_blank"
                aria-label="TikTok"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col gap-3 text-sm" aria-label="Footer navigation">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/get-a-quote"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Get A Quote
              </Link>
              <Link
                href="/reviews"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Reviews
              </Link>
              <Link
                href="/contact-us"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Contact Us</h3>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={`tel:${siteData.contact.phone}`}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {siteData.contact.phone}
              </a>
              <a
                href={`tel:${siteData.contact.phone2}`}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {siteData.contact.phone2}
              </a>
              <a
                href={`mailto:${siteData.contact.email}`}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {siteData.contact.email}
              </a>
              <div className="text-muted-foreground flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>{siteData.contact.address}</span>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Business Hours</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="text-muted-foreground flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5" />
                <span>{siteData.contact.hours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <Separator role="presentation" />

        {/* Bottom Section */}
        <div className="flex w-full flex-col-reverse items-center gap-6 text-sm lg:flex-row lg:justify-between lg:gap-6">
          {/* Copyright Text */}
          <p className="text-muted-foreground text-center lg:text-left">
            © {new Date().getFullYear()} {siteData.company.name}. All rights reserved.
          </p>

          {/* Legal Navigation */}
          <nav
            className="flex flex-col items-center gap-6 text-sm md:flex-row md:gap-8"
            aria-label="Legal links"
          >
            <PrivacyPolicyModal>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </button>
            </PrivacyPolicyModal>
            <TermsOfServiceModal>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </button>
            </TermsOfServiceModal>
          </nav>
        </div>
      </div>
    </footer>
  );
}
