"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  children: React.ReactNode;
}

export function PrivacyPolicyModal({ children }: PrivacyPolicyModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-3">1. Information We Collect</h3>
              <p className="text-muted-foreground mb-3">
                We collect information you provide directly to us, such as when you create an account,
                submit a repair request, or contact us for support.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Personal information (name, email, phone number)</li>
                <li>Device information for repair services</li>
                <li>Payment information for billing purposes</li>
                <li>Communication records when you contact us</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">2. How We Use Your Information</h3>
              <p className="text-muted-foreground mb-3">
                We use the information we collect to provide, maintain, and improve our services.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Process and fulfill repair requests</li>
                <li>Communicate with you about your service</li>
                <li>Send you updates and marketing communications</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">3. Information Sharing</h3>
              <p className="text-muted-foreground mb-3">
                We do not sell, trade, or otherwise transfer your personal information to third parties
                without your consent, except as described in this policy.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>With service providers who assist our operations</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">4. Data Security</h3>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction. However, no method of
                transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">5. Your Rights</h3>
              <p className="text-muted-foreground mb-3">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">6. Cookies</h3>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your experience on our website,
                analyze usage, and assist in our marketing efforts. You can control cookie settings
                through your browser preferences.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">7. Contact Us</h3>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-2 text-muted-foreground">
                <p>Email: privacy@fotgmobile.com</p>
                <p>Phone: (727) 657-8390</p>
                <p>Address: 123 Main St, Saint Petersburg, FL 33701</p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}