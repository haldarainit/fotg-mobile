"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, Trash2, Calendar, Clock, Package, MapPin } from "lucide-react";

interface Booking {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerType: "private" | "business";
  deviceType: string;
  brandName: string;
  modelName: string;
  colorName: string;
  serviceMethod: "location" | "pickup";
  bookingDate?: string;
  bookingTimeSlot?: string;
  shippingAddress?: {
    houseNumber: string;
    streetName: string;
    city: string;
    zipcode: string;
    country: string;
  };
  repairs: Array<{
    repairName: string;
    price: number;
    duration: string;
    partQuality?: {
      id: string;
      name: string;
    };
  }>;
  pricing: {
    subtotal: number;
    discount: number;
    discountRuleName?: string;
    tax: number;
    taxPercentage: number;
    total: number;
  };
  notes?: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export function BookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter === "all" 
        ? "/api/admin/bookings" 
        : `/api/admin/bookings?status=${statusFilter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      } else {
        toast.error("Failed to load bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId, status }),
      });

      if (response.ok) {
        toast.success("Booking status updated");
        fetchBookings();
        if (selectedBooking?._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: status as any });
        }
      } else {
        toast.error("Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking status");
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Booking deleted");
        fetchBookings();
        setShowDetailsDialog(false);
      } else {
        toast.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "confirmed":
        return "secondary";
      case "in-progress":
        return "default";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bookings Management</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all customer bookings
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {booking.firstName} {booking.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.email}</p>
                      <p className="text-sm text-muted-foreground">{booking.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.modelName}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.brandName} • {booking.colorName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {booking.serviceMethod === "location" ? "At Location" : "Ship Device"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.serviceMethod === "location" && booking.bookingDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{formatDate(booking.bookingDate)}</p>
                          <p className="text-xs text-muted-foreground">{booking.bookingTimeSlot}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${booking.pricing.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(booking.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View and manage booking information
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">
                      {selectedBooking.firstName} {selectedBooking.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customer Type:</span>
                    <p className="font-medium capitalize">{selectedBooking.customerType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedBooking.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedBooking.phone}</p>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div>
                <h3 className="font-semibold mb-3">Device Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Brand:</span>
                    <p className="font-medium">{selectedBooking.brandName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <p className="font-medium">{selectedBooking.modelName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Color:</span>
                    <p className="font-medium">{selectedBooking.colorName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Device Type:</span>
                    <p className="font-medium capitalize">{selectedBooking.deviceType}</p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="font-semibold mb-3">Service Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Service Method:</span>
                    <p className="font-medium">
                      {selectedBooking.serviceMethod === "location"
                        ? "Service at Location"
                        : "Ship Device (Pick-up & Delivery)"}
                    </p>
                  </div>
                  
                  {selectedBooking.serviceMethod === "location" && selectedBooking.bookingDate && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Booking Date:</span>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(selectedBooking.bookingDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time Slot:</span>
                        <p className="font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {selectedBooking.bookingTimeSlot}
                        </p>
                      </div>
                    </>
                  )}

                  {selectedBooking.serviceMethod === "pickup" && selectedBooking.shippingAddress && (
                    <div>
                      <span className="text-muted-foreground">Pickup Address:</span>
                      <p className="font-medium flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1" />
                        <span>
                          {selectedBooking.shippingAddress.houseNumber}{" "}
                          {selectedBooking.shippingAddress.streetName}
                          <br />
                          {selectedBooking.shippingAddress.city},{" "}
                          {selectedBooking.shippingAddress.zipcode}
                          <br />
                          {selectedBooking.shippingAddress.country}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Repairs */}
              <div>
                <h3 className="font-semibold mb-3">Repairs</h3>
                <div className="space-y-2">
                  {selectedBooking.repairs.map((repair, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                      <div>
                        <p className="font-medium">{repair.repairName}</p>
                        {repair.partQuality && (
                          <p className="text-xs text-muted-foreground">
                            {repair.partQuality.name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{repair.duration}</p>
                      </div>
                      <p className="font-semibold">${repair.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-semibold mb-3">Pricing</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${selectedBooking.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedBooking.pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount
                        {selectedBooking.pricing.discountRuleName && (
                          <span className="text-xs"> ({selectedBooking.pricing.discountRuleName})</span>
                        )}:
                      </span>
                      <span>-${selectedBooking.pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedBooking.pricing.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tax ({selectedBooking.pricing.taxPercentage}%):
                      </span>
                      <span>${selectedBooking.pricing.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedBooking.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <h3 className="font-semibold mb-3">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Status Management */}
              <div>
                <h3 className="font-semibold mb-3">Status Management</h3>
                <div className="flex gap-2">
                  <Select
                    value={selectedBooking.status}
                    onValueChange={(value) => updateBookingStatus(selectedBooking._id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between border-t pt-4">
                <Button
                  variant="destructive"
                  onClick={() => deleteBooking(selectedBooking._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Booking
                </Button>
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
