"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfServiceModalProps {
  children: React.ReactNode;
}

export function TermsOfServiceModal({ children }: TermsOfServiceModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-3">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing and using FOTG Mobile's services, you accept and agree to be bound by the
                terms and provision of this agreement. If you do not agree to abide by the above,
                please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">2. Service Description</h3>
              <p className="text-muted-foreground mb-3">
                FOTG Mobile provides professional mobile device repair services including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Screen replacement and repair</li>
                <li>Battery replacement</li>
                <li>Charging port repair</li>
                <li>Camera and speaker repair</li>
                <li>Water damage restoration</li>
                <li>Motherboard repair</li>
                <li>Other electronic component repairs</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">3. Service Terms</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>3.1 Warranty:</strong> All repairs come with a 90-day warranty covering the
                  specific repair performed. Warranty does not cover accidental damage or misuse.
                </p>
                <p>
                  <strong>3.2 Turnaround Time:</strong> Standard repair turnaround is 1-3 business days.
                  Rush service may be available for an additional fee.
                </p>
                <p>
                  <strong>3.3 Payment Terms:</strong> Payment is due upon completion of service.
                  We accept cash, credit cards, and electronic payments.
                </p>
                <p>
                  <strong>3.4 Shipping:</strong> For mail-in repairs, customer is responsible for shipping
                  costs both ways. We recommend insured shipping.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">4. Customer Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Provide accurate device information and repair requirements</li>
                <li>Backup all personal data before service</li>
                <li>Remove personal data if requested (additional fee may apply)</li>
                <li>Pick up device within 30 days of repair completion</li>
                <li>Report any issues with repair within warranty period</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">5. Limitation of Liability</h3>
              <p className="text-muted-foreground">
                FOTG Mobile's liability is limited to the repair service provided. We are not responsible
                for data loss, software issues, or any consequential damages. Our maximum liability
                shall not exceed the repair cost paid by the customer.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">6. Refund Policy</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong>Diagnostic Fee:</strong> $25 diagnostic fee is non-refundable if repair is declined.
                </p>
                <p>
                  <strong>Repair Refunds:</strong> Refunds available within 7 days if repair fails.
                  Customer responsible for return shipping costs.
                </p>
                <p>
                  <strong>No Refunds:</strong> No refunds on completed repairs after 7 days.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">7. Intellectual Property</h3>
              <p className="text-muted-foreground">
                All content on our website and marketing materials are owned by FOTG Mobile and
                protected by copyright laws. Unauthorized use is prohibited.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">8. Governing Law</h3>
              <p className="text-muted-foreground">
                These terms are governed by the laws of the State of Florida. Any disputes shall
                be resolved in the courts of Pinellas County, Florida.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">9. Changes to Terms</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be effective
                immediately upon posting on our website. Continued use of our services constitutes
                acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">10. Contact Information</h3>
              <div className="text-muted-foreground">
                <p>For questions about these Terms of Service, contact us:</p>
                <div className="mt-2">
                  <p>Email: legal@fotgmobile.com</p>
                  <p>Phone: (727) 657-8390</p>
                  <p>Address: 123 Main St, Saint Petersburg, FL 33701</p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}