"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { siteData } from "@/lib/siteData";

export function FaqSection2() {
  return (
    <section
      className="bg-background section-padding-y border-b"
      aria-labelledby="faq-heading"
      id="faq"
    >
      <div className="container-padding-x container mx-auto">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="section-title-gap-lg flex flex-1 flex-col">
            <Tagline>FAQ</Tagline>
            <h1 id="faq-heading" className="heading-lg text-foreground">
              {siteData.faq.headline}
            </h1>
            <p className="text-muted-foreground">
              Find quick answers to common questions about our repair services,
              pricing, and process. Cannot find what you are looking for?{" "}
              <Link href="/contact-us" className="text-primary underline">
                Contact us.
              </Link>
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <Accordion type="single" collapsible aria-label="FAQ items">
              {siteData.faq.list.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
