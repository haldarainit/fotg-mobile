"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Upload, X, RefreshCw } from "lucide-react";
import Image from "next/image";

interface Brand {
  _id: string;
  name: string;
  logo: string;
  logoPublicId: string;
  deviceTypes: string[];
  active: boolean;
}

export function BrandsManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    deviceTypes: [] as string[],
    active: true,
  });

  const DEVICE_TYPES = [
    { id: "smartphone", label: "Smartphone" },
    { id: "tablet", label: "Tablet" },
    { id: "laptop", label: "Laptop" },
  ];

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/admin/brands");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched brands:", data);
        setBrands(data.data || data.brands || []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<{ url: string; publicId: string } | null> => {
    if (!logoFile) return null;

    const formData = new FormData();
    formData.append("file", logoFile);
    formData.append("folder", "brands");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        return { url: data.data.url, publicId: data.data.publicId };
      } else {
        const errorData = await response.json();
        console.error("Upload failed:", errorData.error);
        return null;
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      return null;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let logoUrl = editingBrand?.logo || "";
      let logoPublicId = editingBrand?.logoPublicId || "";

      // Upload new logo if selected
      if (logoFile) {
        const uploadResult = await uploadLogo();
        if (uploadResult) {
          logoUrl = uploadResult.url;
          logoPublicId = uploadResult.publicId;

          // Delete old logo if updating
          if (editingBrand?.logoPublicId) {
            await fetch("/api/upload", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicId: editingBrand.logoPublicId }),
              credentials: "include", // Include cookies for authentication
            });
          }
        } else {
          toast.error("Failed to upload logo");
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        name: formData.name,
        logo: logoUrl,
        logoPublicId: logoPublicId,
        deviceTypes: formData.deviceTypes,
        active: formData.active,
      };

      console.log("Submitting brand payload:", payload);

      const url = editingBrand
        ? `/api/admin/brands`
        : "/api/admin/brands";

      const body = editingBrand 
        ? JSON.stringify({ ...payload, id: editingBrand._id })
        : JSON.stringify(payload);

      const response = await fetch(url, {
        method: editingBrand ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        credentials: "include",
      });

      const responseData = await response.json();
      console.log("Brand response:", responseData);

      if (response.ok) {
        toast.success(
          editingBrand ? "Brand updated successfully" : "Brand created successfully"
        );
        setIsDialogOpen(false);
        resetForm();
        fetchBrands();
      } else {
        console.error("Error response:", responseData);
        toast.error(responseData.error || "Failed to save brand");
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error("Failed to save brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Are you sure you want to delete ${brand.name}?`)) return;

    try {
      // Delete logo from Cloudinary
      if (brand.logoPublicId) {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: brand.logoPublicId }),
        });
      }

      const response = await fetch(`/api/admin/brands?id=${brand._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Brand deleted successfully");
        fetchBrands();
      } else {
        toast.error("Failed to delete brand");
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Failed to delete brand");
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      deviceTypes: brand.deviceTypes,
      active: brand.active,
    });
    setLogoPreview(brand.logo);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      deviceTypes: [],
      active: true,
    });
    setEditingBrand(null);
    setLogoFile(null);
    setLogoPreview("");
  };

  const handleDeviceTypeToggle = (typeId: string) => {
    setFormData((prev) => ({
      ...prev,
      deviceTypes: prev.deviceTypes.includes(typeId)
        ? prev.deviceTypes.filter((id) => id !== typeId)
        : [...prev.deviceTypes, typeId],
    }));
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Brands Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBrands()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </DialogTitle>
              <DialogDescription>
                {editingBrand
                  ? "Update brand information"
                  : "Create a new brand for your repair business"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Apple, Samsung, Google"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Brand Logo *</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview("");
                          setLogoFile(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      required={!editingBrand && !logoPreview}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload brand logo (PNG, JPG, SVG recommended)
                    </p>
                  </div>
                </div>
                {!editingBrand && !logoFile && !logoPreview && (
                  <p className="text-xs text-red-500">
                    Brand logo is required
                  </p>
                )}
              </div>

              {/* Device Types */}
              <div className="space-y-2">
                <Label>Device Types *</Label>
                <div className="grid grid-cols-3 gap-4">
                  {DEVICE_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={formData.deviceTypes.includes(type.id)}
                        onCheckedChange={() => handleDeviceTypeToggle(type.id)}
                      />
                      <label
                        htmlFor={type.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.deviceTypes.length === 0 && (
                  <p className="text-xs text-red-500">
                    Please select at least one device type
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked as boolean })
                  }
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    formData.deviceTypes.length === 0 ||
                    (!editingBrand && !logoFile && !logoPreview)
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingBrand ? (
                    "Update Brand"
                  ) : (
                    "Create Brand"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Brands Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Device Types</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No brands yet. Add your first brand!</p>
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell>
                    {brand.logo ? (
                      <div className="w-12 h-12 relative">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center text-xl font-bold">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {brand.deviceTypes.map((type) => (
                        <Badge key={type} variant="outline">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={brand.active ? "default" : "secondary"}>
                      {brand.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(brand)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(brand)}
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
      </Card>
    </div>
  );
}
