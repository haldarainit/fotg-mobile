"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LogOut, Smartphone, Tablet, Wrench } from "lucide-react"
import { BrandsManagement } from "@/components/admin/brands-management"
import { ModelsManagement } from "@/components/admin/models-management"
import { RepairsManagement } from "@/components/admin/repairs-management"

export default function Page() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState("brands")

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Logged out successfully")
        router.push("/admin/login")
        router.refresh()
      } else {
        toast.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("An error occurred during logout")
    } finally {
      setIsLoggingOut(false)
    }
  }

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
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex justify-between items-center px-4 lg:px-6">
                <h1 className="text-3xl font-bold">Device Management</h1>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </div>

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
