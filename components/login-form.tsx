"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Login successful!")
        setRemainingAttempts(null)
        router.push("/admin")
        router.refresh()
      } else {
        // Handle rate limiting
        if (response.status === 429) {
          toast.error(data.error || "Too many login attempts. Please try again later.")
          setRemainingAttempts(0)
        } else {
          toast.error(data.error || "Login failed")
          
          // Show remaining attempts if available
          if (data.remainingAttempts !== undefined) {
            setRemainingAttempts(data.remainingAttempts)
            if (data.remainingAttempts > 0) {
              toast.warning(`${data.remainingAttempts} attempt(s) remaining before lockout`)
            }
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
          {remainingAttempts !== null && remainingAttempts < 5 && (
            <div className={cn(
              "text-sm font-medium mt-2 p-2 rounded-md",
              remainingAttempts === 0 
                ? "bg-destructive/10 text-destructive" 
                : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
            )}>
              {remainingAttempts === 0 
                ? "⚠️ Account temporarily locked due to too many failed attempts" 
                : `⚠️ Warning: ${remainingAttempts} login attempt(s) remaining`}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
