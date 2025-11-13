"use client"

import * as React from "react"
import {
  IconDeviceMobile,
  IconMessageCircle,
  IconStar,
  IconInnerShadowTop,
  IconHome,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Fotg Mobile</span>
              </a>
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
