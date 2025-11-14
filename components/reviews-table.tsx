"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Trash2, Check, X, Star, RefreshCw } from "lucide-react"

interface Review {
  _id: string
  name: string
  email: string
  rating: number
  device: string
  service: string
  review: string
  approved: boolean
  createdAt: string
}

export function ReviewsTable() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    approvedCount: 0,
    pendingCount: 0,
  })

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews")
      const data = await response.json()
      if (data.success) {
        setReviews(data.data)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to fetch reviews")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleApproval = async (reviewId: string, approved: boolean) => {
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, approved }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(data.message)
        fetchReviews()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error("Error updating review:", error)
      toast.error("Failed to update review")
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        toast.success(data.message)
        fetchReviews()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      toast.error("Failed to delete review")
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reviews</CardDescription>
            <CardTitle className="text-3xl">{stats.totalReviews}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Rating</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-1">
              {stats.averageRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approvedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.pendingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reviews Management</CardTitle>
              <CardDescription>Approve, reject, or delete customer reviews</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReviews()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="max-w-md">Review Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium">{review.name}</TableCell>
                    <TableCell>{review.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {review.rating}
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </TableCell>
                    <TableCell>{review.device}</TableCell>
                    <TableCell>{review.service}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="max-h-20 overflow-y-auto text-sm">
                        {review.review}
                      </div>
                    </TableCell>
                    <TableCell>
                      {review.approved ? (
                        <Badge variant="default" className="bg-green-600">
                          ✓ Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                          ⏳ Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!review.approved ? (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproval(review._id, true)}
                            title="Approve review"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-600 hover:bg-orange-50"
                            onClick={() => handleApproval(review._id, false)}
                            title="Reject review"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(review._id)}
                          title="Delete review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
