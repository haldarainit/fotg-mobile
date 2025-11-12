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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, X } from "lucide-react";
import Image from "next/image";

interface Brand {
  _id: string;
  name: string;
  logo: string;
}

interface DeviceModel {
  _id: string;
  name: string;
  image: string;
  imagePublicId: string;
  brandId: {
    _id: string;
    name: string;
    logo: string;
  };
  deviceType: string;
  variants: string[];
  colors: Array<{ id: string; name: string; hex: string }>;
  active: boolean;
}

export function ModelsManagement() {
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingModel, setEditingModel] = useState<DeviceModel | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    brandId: "",
    deviceType: "",
    variants: [""],
    colors: [{ id: "", name: "", hex: "#000000" }],
    active: true,
  });

  const DEVICE_TYPES = ["smartphone", "tablet", "laptop"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modelsRes, brandsRes] = await Promise.all([
        fetch("/api/admin/models"),
        fetch("/api/admin/brands?activeOnly=true"),
      ]);

      if (modelsRes.ok) {
        const data = await modelsRes.json();
        setModels(data.models || []);
      }

      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<{ url: string; publicId: string } | null> => {
    if (!imageFile) return null;

    const formDataUpload = new FormData();
    formDataUpload.append("file", imageFile);
    formDataUpload.append("folder", "models");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        return { url: data.url, publicId: data.publicId };
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = editingModel?.image || "";
      let imagePublicId = editingModel?.imagePublicId || "";

      // Upload new image if selected
      if (imageFile) {
        const uploadResult = await uploadImage();
        if (uploadResult) {
          imageUrl = uploadResult.url;
          imagePublicId = uploadResult.publicId;

          // Delete old image if updating
          if (editingModel?.imagePublicId) {
            await fetch("/api/upload", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicId: editingModel.imagePublicId }),
            });
          }
        } else {
          toast.error("Failed to upload image");
          setIsSubmitting(false);
          return;
        }
      }

      // Clean up colors and variants
      const cleanedColors = formData.colors
        .filter((c) => c.name && c.hex)
        .map((c, idx) => ({
          id: c.id || `color-${idx + 1}`,
          name: c.name,
          hex: c.hex,
        }));

      const cleanedVariants = formData.variants.filter((v) => v.trim());

      const payload = {
        ...formData,
        image: imageUrl,
        imagePublicId: imagePublicId,
        colors: cleanedColors,
        variants: cleanedVariants,
      };

      const url = editingModel
        ? `/api/admin/models?id=${editingModel._id}`
        : "/api/admin/models";

      const response = await fetch(url, {
        method: editingModel ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          editingModel
            ? "Model updated successfully"
            : "Model created successfully"
        );
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save model");
      }
    } catch (error) {
      console.error("Error saving model:", error);
      toast.error("Failed to save model");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (model: DeviceModel) => {
    if (!confirm(`Are you sure you want to delete ${model.name}?`)) return;

    try {
      // Delete image from Cloudinary
      if (model.imagePublicId) {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: model.imagePublicId }),
        });
      }

      const response = await fetch(`/api/admin/models?id=${model._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Model deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete model");
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("Failed to delete model");
    }
  };

  const handleEdit = (model: DeviceModel) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      brandId: model.brandId._id,
      deviceType: model.deviceType,
      variants: model.variants.length > 0 ? model.variants : [""],
      colors:
        model.colors.length > 0
          ? model.colors
          : [{ id: "", name: "", hex: "#000000" }],
      active: model.active,
    });
    setImagePreview(model.image);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brandId: "",
      deviceType: "",
      variants: [""],
      colors: [{ id: "", name: "", hex: "#000000" }],
      active: true,
    });
    setEditingModel(null);
    setImageFile(null);
    setImagePreview("");
  };

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, ""] });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index: number, value: string) => {
    const newVariants = [...formData.variants];
    newVariants[index] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { id: "", name: "", hex: "#000000" }],
    });
  };

  const removeColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  const updateColor = (
    index: number,
    field: "name" | "hex",
    value: string
  ) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData({ ...formData, colors: newColors });
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
        <h2 className="text-2xl font-bold">Device Models Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingModel ? "Edit Model" : "Add New Model"}
              </DialogTitle>
              <DialogDescription>
                {editingModel
                  ? "Update device model information"
                  : "Create a new device model"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Model Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., iPhone 15 Pro Max"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Brand */}
                <div className="space-y-2">
                  <Label htmlFor="brandId">Brand *</Label>
                  <Select
                    value={formData.brandId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, brandId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Device Type */}
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device Type *</Label>
                  <Select
                    value={formData.deviceType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, deviceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Device Image</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Image preview"
                        fill
                        className="object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
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
                      onChange={handleImageChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload device image (PNG, JPG recommended)
                    </p>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-2">
                <Label>Model Variants (Alternative names/codes)</Label>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={variant}
                      onChange={(e) => updateVariant(index, e.target.value)}
                      placeholder="e.g., A2893, iPhone16,1"
                    />
                    {formData.variants.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeVariant(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <Label>Available Colors *</Label>
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={color.name}
                      onChange={(e) =>
                        updateColor(index, "name", e.target.value)
                      }
                      placeholder="Color name (e.g., Midnight Black)"
                      className="flex-1"
                      required
                    />
                    <Input
                      type="color"
                      value={color.hex}
                      onChange={(e) =>
                        updateColor(index, "hex", e.target.value)
                      }
                      className="w-20"
                      required
                    />
                    {formData.colors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeColor(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addColor}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Color
                </Button>
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
                  className="text-sm font-medium leading-none cursor-pointer"
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
                    !formData.brandId ||
                    !formData.deviceType ||
                    formData.colors.filter((c) => c.name && c.hex).length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingModel ? (
                    "Update Model"
                  ) : (
                    "Create Model"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Models Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Model Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Colors</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">
                    No models yet. Add your first model!
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              models.map((model) => (
                <TableRow key={model._id}>
                  <TableCell>
                    {model.image ? (
                      <div className="w-12 h-12 relative">
                        <Image
                          src={model.image}
                          alt={model.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center text-xl">
                        📱
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{model.brandId.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {model.deviceType.charAt(0).toUpperCase() +
                        model.deviceType.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {model.colors.slice(0, 3).map((color) => (
                        <div
                          key={color.id}
                          className="w-6 h-6 rounded-full border-2"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                      {model.colors.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{model.colors.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={model.active ? "default" : "secondary"}>
                      {model.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(model)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(model)}
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
