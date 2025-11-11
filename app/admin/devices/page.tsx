"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LogOut, Plus } from "lucide-react"

export default function Page() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
                <h1 className="text-3xl font-bold">All Models/Devices</h1>
                <div className="flex gap-2">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Device
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Management</CardTitle>
                    <CardDescription>
                      Manage all mobile device models and their repair information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-6xl mb-4">📱</div>
                      <h3 className="text-xl font-semibold mb-2">Device Management Coming Soon</h3>
                      <p className="text-muted-foreground max-w-md">
                        This section will allow you to add, edit, and manage all mobile device models 
                        that you repair. You'll be able to set pricing, add device specifications, 
                        and manage repair categories.
                      </p>
                      <Button className="mt-6" disabled>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Device
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
