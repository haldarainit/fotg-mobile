"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { siteData } from "@/lib/siteData";
import { useAuth } from "@/hooks/use-auth";

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Get A Quote", href: "/get-a-quote" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact Us", href: "/contact-us" },
  // { label: "FAQ", href: "#faq" },
] as const;

interface NavMenuItemsProps {
  className?: string;
}

const NavMenuItems = ({ className }: NavMenuItemsProps) => (
  <div className={`flex flex-col gap-1 lg:flex-row ${className ?? ""}`}>
    {MENU_ITEMS.map(({ label, href }) => (
      <Link key={label} href={href}>
        <Button variant="ghost" className="w-full md:w-auto">
          {label}
        </Button>
      </Link>
    ))}
  </div>
);

export function LpNavbar1() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <nav className="bg-background sticky top-0 isolate z-50 border-b py-3.5 lg:py-4">
      <div className="relative container m-auto flex flex-col justify-between gap-4 px-6 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt={siteData.company.name}
              width={60}
              height={10}
              className="object-contain"
            />
            <span className="font-semibold text-foreground text-2xl whitespace-nowrap">
              {siteData.company.name}
            </span>
          </Link>
          <Button
            variant="ghost"
            className="flex size-9 items-center justify-center lg:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden w-full flex-row justify-end gap-5 lg:flex">
          <NavMenuItems />
          <Link href="/contact-us">
            <Button>Get In Touch</Button>
          </Link>
          {!isLoading && (
            isAuthenticated ? (
              <Link href="/admin">
                <Button variant="outline" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/admin/login">
                <Button variant="outline" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Admin Login
                </Button>
              </Link>
            )
          )}
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="flex w-full flex-col justify-end gap-5 pb-2.5 lg:hidden">
            <NavMenuItems />
            <Link href="/get-in-touch">
              <Button className="w-full">Get In Touch</Button>
            </Link>
            {!isLoading && (
              isAuthenticated ? (
                <Link href="/admin">
                  <Button variant="outline" className="w-full gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/admin/login">
                  <Button variant="outline" className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Admin Login
                  </Button>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
