"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Tablet, Wrench } from "lucide-react"
import { BrandsManagement } from "@/components/admin/brands-management"
import { ModelsManagement } from "@/components/admin/models-management"
import { RepairsManagement } from "@/components/admin/repairs-management"

export default function Page() {
  const [activeTab, setActiveTab] = useState("brands")

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="All Models/Devices" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 max-w-2xl">
                    <TabsTrigger value="brands" className="gap-2">
                      <Smartphone className="h-4 w-4" />
                      Brands
                    </TabsTrigger>
                    <TabsTrigger value="models" className="gap-2">
                      <Tablet className="h-4 w-4" />
                      Models
                    </TabsTrigger>
                    <TabsTrigger value="repairs" className="gap-2">
                      <Wrench className="h-4 w-4" />
                      Repairs
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="brands" className="mt-6">
                    <BrandsManagement />
                  </TabsContent>

                  <TabsContent value="models" className="mt-6">
                    <ModelsManagement />
                  </TabsContent>

                  <TabsContent value="repairs" className="mt-6">
                    <RepairsManagement />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
