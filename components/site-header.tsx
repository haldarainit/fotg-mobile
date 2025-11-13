"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { LogOut } from "lucide-react"

interface SiteHeaderProps {
  title?: string;
}

export function SiteHeader({ title = "Documents" }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Map common admin routes to friendly titles. Add entries here for new pages.
  const routeTitleMap: Record<string, string> = {
    "/admin": "Dashboard - Contact Submissions",
    "/admin/devices": "All Models/Devices",
    "/admin/reviews": "Reviews",
    "/admin/contact": "Contact",
    "/admin/settings": "Settings",
  };

  const computedTitle = (() => {
    if (title && title !== "Documents") return title;
    if (!pathname) return title;
    // Exact match
    if (routeTitleMap[pathname]) return routeTitleMap[pathname];
    // Try matching prefixes (e.g., /admin/devices/123)
    const match = Object.keys(routeTitleMap).find((p) => pathname.startsWith(p + "/"));
    if (match) return routeTitleMap[match];
    // Fallback: derive from last path segment
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return title;
    const last = segments[segments.length - 1];
    // Beautify: replace dashes and capitalize
    return last.replace(/-/g, " ").replace(/(^|\s)\w/g, (c) => c.toUpperCase());
  })();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Logged out successfully");
        router.push("/admin/login");
      } else {
        toast.error(data.error || "Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("An error occurred during logout");
    }
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{computedTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
         

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
