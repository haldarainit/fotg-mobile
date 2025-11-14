import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FOTG Mobile - Professional Mobile Repair Services",
  description:
    "FOTG Mobile provides fast, reliable, and affordable mobile repair services for smartphones, tablets, and more. Quality guaranteed repairs in Dallas, Texas.",
  keywords: ["mobile repair", "phone repair", "smartphone repair", "tablet repair", "Dallas", "Texas"],
  authors: [{ name: "FOTG Mobile" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "FOTG Mobile - Professional Mobile Repair Services",
    description: "Fast, reliable, and affordable mobile repair services in Dallas, Texas. Quality guaranteed repairs for all your devices.",
    url: "https://fotgmobile.com",
    siteName: "FOTG Mobile",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "FOTG Mobile Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FOTG Mobile - Professional Mobile Repair Services",
    description: "Fast, reliable, and affordable mobile repair services in Dallas, Texas.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`${onest.variable} relative antialiased`} suppressHydrationWarning>
          {children}
          <Toaster richColors />
        </body>
      </html>
    </>
  );
}
