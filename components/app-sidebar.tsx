"use client"

import * as React from "react"
import {
  IconDeviceMobile,
  IconMessageCircle,
  IconStar,
  IconCalendar,
  IconHome,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconHome,
    },
    {
      title: "All Models/Devices",
      url: "/admin/devices",
      icon: IconDeviceMobile,
    },
      {
        title: "Bookings",
        url: "/admin/bookings",
        icon: IconCalendar,
      },
    {
      title: "Reviews",
      url: "/admin/reviews",
      icon: IconStar,
    },
    {
      title: "Contact",
      url: "/admin/contact",
      icon: IconMessageCircle,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Fotg Mobile" width={28} height={28} className="object-contain" />
                <span className="text-base font-semibold">Fotg Mobile Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
