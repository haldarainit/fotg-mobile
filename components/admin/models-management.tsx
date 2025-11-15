"use client";

import { useState, useEffect, useRef } from "react";
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
import { Plus, Edit, Trash2, Loader2, X, RefreshCw } from "lucide-react";
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
  const [repairsList, setRepairsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkPreviewRows, setBulkPreviewRows] = useState<any[] | null>(null);
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [bulkDryRunAnalysis, setBulkDryRunAnalysis] = useState<any[] | null>(null);
  const [bulkBrandDialogOpen, setBulkBrandDialogOpen] = useState(false);
  const [bulkDialogBrand, setBulkDialogBrand] = useState<string>("all");
  const [bulkDialogDeviceType, setBulkDialogDeviceType] = useState<string>("all");
  const [bulkAwaitingFile, setBulkAwaitingFile] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement | null>(null);
  const [editingModel, setEditingModel] = useState<DeviceModel | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalModels, setTotalModels] = useState(0);
  const modelsPerPage = 20;

  const [formData, setFormData] = useState({
    name: "",
    brandId: "",
    deviceType: "",
    variants: [""],
    colors: [{ id: "", name: "", hex: "#000000" }],
    modelRepairs: [] as Array<{
      repairId: string;
      basePrice: number;
      qualityPrices?: Array<{ id: string; name: string; description?: string; duration?: string; price: number }>;
    }>,
    active: true,
  });

  const DEVICE_TYPES = ["smartphone", "tablet", "laptop"];

  // Prevent number inputs from changing value when user scrolls while focused.
  // We use a ref so the same handler reference can be added/removed.
  const wheelHandlerRef = useRef<(e: WheelEvent) => void>(() => {});

  useEffect(() => {
    // initialize handler
    wheelHandlerRef.current = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "INPUT") {
        const input = target as HTMLInputElement;
        if (input.type === "number") {
          e.preventDefault();
        }
      }
    };

    return () => {
      // cleanup just in case
      window.removeEventListener("wheel", wheelHandlerRef.current as EventListener, { capture: true } as AddEventListenerOptions);
    };
  }, []);

  const disableNumberInputScroll = () => {
    window.addEventListener("wheel", wheelHandlerRef.current as EventListener, { passive: false, capture: true } as AddEventListenerOptions);
  };

  const enableNumberInputScroll = () => {
    window.removeEventListener("wheel", wheelHandlerRef.current as EventListener, { capture: true } as EventListenerOptions);
  };

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterDeviceType, setFilterDeviceType] = useState("all");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch when page changes
  useEffect(() => {
    fetchData();
  }, [currentPage]);

  // When filters change, reset to page 1 and fetch (avoid double fetch)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData();
    }
  }, [debouncedSearch, filterBrand, filterDeviceType]);

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setFilterBrand("all");
    setFilterDeviceType("all");
    setCurrentPage(1);
    // Fetch immediately to reflect cleared state
    fetchData();
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Build query params for models endpoint
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", String(modelsPerPage));
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterBrand && filterBrand !== "all") params.append("brandId", filterBrand);
      if (filterDeviceType && filterDeviceType !== "all") params.append("deviceType", filterDeviceType);

      const [modelsRes, brandsRes, repairsRes] = await Promise.all([
          fetch(`/api/admin/models?${params.toString()}`),
          fetch("/api/admin/brands?activeOnly=true"),
          fetch("/api/admin/repairs"),
        ]);

      if (modelsRes.ok) {
        const data = await modelsRes.json();
        console.log("Fetched models:", data);
        setModels(data.data || data.models || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalModels(data.pagination.total);
        }
      } else {
        const errorData = await modelsRes.json();
        console.error("Error fetching models:", errorData);
        toast.error(`Failed to load models: ${errorData.details || errorData.error}`);
      }

      if (brandsRes.ok) {
        const data = await brandsRes.json();
        console.log("Fetched brands:", data);
        setBrands(data.data || data.brands || []);
      }
      if (repairsRes && repairsRes.ok) {
        const data = await repairsRes.json();
        console.log("Fetched repairs:", data);
        setRepairsList(data.data || data.repairs || []);
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
      console.error("Error uploading image:", error);
      return null;
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
              credentials: "include",
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
        name: formData.name,
        brandId: formData.brandId,
        deviceType: formData.deviceType,
        image: imageUrl,
        imagePublicId: imagePublicId,
        variants: cleanedVariants,
        colors: cleanedColors,
        // include model-specific repairs (associations + prices)
        repairs: formData.modelRepairs || [],
        active: formData.active,
      };

      console.log("Submitting model payload:", payload);

      const url = editingModel
        ? `/api/admin/models`
        : "/api/admin/models";

      const body = editingModel 
        ? JSON.stringify({ ...payload, id: editingModel._id })
        : JSON.stringify(payload);

      const response = await fetch(url, {
        method: editingModel ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        credentials: "include",
      });

      const responseData = await response.json();
      console.log("Model response:", responseData);

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
        console.error("Error response:", responseData);
        toast.error(responseData.error || "Failed to save model");
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
          credentials: "include",
        });
      }

      const response = await fetch(`/api/admin/models?id=${model._id}`, {
        method: "DELETE",
        credentials: "include",
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
      // map existing model repairs to form structure
      modelRepairs: (model as any).repairs
        ? (model as any).repairs.map((r: any) => ({
            repairId: r.repairId?._id || r.repairId,
            basePrice: r.basePrice || 0,
            qualityPrices: r.qualityPrices || [],
          }))
        : [],
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
      modelRepairs: [],
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

  // Model-repair association helpers
  const addModelRepair = () => {
    setFormData({
      ...formData,
      modelRepairs: [
        ...formData.modelRepairs,
        { repairId: "", basePrice: 0, qualityPrices: [] },
      ],
    });
  };

  const removeModelRepair = (index: number) => {
    setFormData({
      ...formData,
      modelRepairs: formData.modelRepairs.filter((_, i) => i !== index),
    });
  };

  const updateModelRepairField = (
    index: number,
    field: string,
    value: any
  ) => {
    const newList = [...formData.modelRepairs];
    (newList[index] as any)[field] = value;
    setFormData({ ...formData, modelRepairs: newList });
  };

  const updateModelRepairQualityPrice = (
    modelRepairIndex: number,
    qualityIndex: number,
    price: number
  ) => {
    const newList = [...formData.modelRepairs];
    if (!newList[modelRepairIndex].qualityPrices) newList[modelRepairIndex].qualityPrices = [];
    
    // Get the repair details to extract quality option info
    const repairId = newList[modelRepairIndex].repairId;
    const selectedRepair = repairsList.find(r => r._id === repairId);
    const qualityOption = selectedRepair?.qualityOptions?.[qualityIndex];
    
    newList[modelRepairIndex].qualityPrices![qualityIndex] = {
      id: qualityOption?.id || `quality_${qualityIndex}`,
      name: qualityOption?.name || `Quality ${qualityIndex + 1}`,
      description: qualityOption?.description,
      duration: selectedRepair?.duration,
      price,
    };
    setFormData({ ...formData, modelRepairs: newList });
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
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 mr-2">
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />

            <Select value={filterBrand} onValueChange={(value) => setFilterBrand(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDeviceType} onValueChange={(value) => setFilterDeviceType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DEVICE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={clearFilters} disabled={isLoading}>
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </DialogTrigger>
          <DialogContent 
            className="max-w-3xl max-h-[90vh] overflow-y-auto"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
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

              {/* Model-specific Repairs */}
              <div className="space-y-4">
                <Label>Repairs / Services for this Model</Label>
                <p className="text-xs text-muted-foreground">Select repair services for this model and set model-specific prices. Selected services will show below for pricing configuration.</p>

                {/* Repair Selection Checkboxes */}
                <div className="space-y-2">
                  {/* Select all control */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all-repairs"
                        checked={repairsList.length > 0 && formData.modelRepairs.length === repairsList.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // select all repairs
                            const all = repairsList.map((repair) => ({
                              repairId: repair._id,
                              basePrice: repair.basePrice || 0,
                              qualityPrices: repair.hasQualityOptions && repair.qualityOptions ?
                                repair.qualityOptions.map((q: any) => ({
                                  id: q.id,
                                  name: q.name,
                                  description: q.description,
                                  duration: q.duration,
                                  price: q.priceMultiplier ? (repair.basePrice || 0) * q.priceMultiplier : (repair.basePrice || 0),
                                })) : [],
                            }));
                            setFormData({ ...formData, modelRepairs: all });
                          } else {
                            // deselect all
                            setFormData({ ...formData, modelRepairs: [] });
                          }
                        }}
                      />
                      <label htmlFor="select-all-repairs" className="text-sm font-medium cursor-pointer">Select All Repairs</label>
                    </div>
                    <div className="text-xs text-muted-foreground">Total: {repairsList.length}</div>
                  </div>

                  <Label className="text-sm font-medium">Available Repair Services</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                    {repairsList.map((repair) => {
                      const isSelected = formData.modelRepairs.some(mr => mr.repairId === repair._id);
                      return (
                        <div key={repair._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`repair-${repair._id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // Add repair with default price
                                const newRepair = {
                                  repairId: repair._id,
                                  basePrice: repair.basePrice || 0,
                                  qualityPrices: repair.hasQualityOptions && repair.qualityOptions ?
                                    repair.qualityOptions.map((q: any) => ({
                                      id: q.id,
                                      name: q.name,
                                      description: q.description,
                                      duration: q.duration,
                                      price: q.priceMultiplier ? repair.basePrice * q.priceMultiplier : repair.basePrice
                                    })) : []
                                };
                                setFormData({
                                  ...formData,
                                  modelRepairs: [...formData.modelRepairs, newRepair]
                                });
                              } else {
                                // Remove repair
                                setFormData({
                                  ...formData,
                                  modelRepairs: formData.modelRepairs.filter(mr => mr.repairId !== repair._id)
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`repair-${repair._id}`}
                            className="text-sm font-medium cursor-pointer flex-1"
                          >
                            {repair.name}
                            {repair.hasQualityOptions && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {repair.qualityOptions?.length || 0} options
                              </Badge>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.modelRepairs.length} repair service(s)
                  </p>
                </div>

                {/* Selected Repairs Pricing */}
                {formData.modelRepairs.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Configure Pricing for Selected Services</Label>
                    <div className="space-y-3">
                      {formData.modelRepairs.map((mr, idx) => {
                        const selectedRepair = repairsList.find((r) => r._id === mr.repairId) || repairsList.find((r) => r.repairId === mr.repairId);
                        return (
                          <Card key={idx} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-sm">{selectedRepair?.name || 'Unknown Repair'}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeModelRepair(idx)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs">Base Price ($)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={mr.basePrice}
                                  onChange={(e) => updateModelRepairField(idx, "basePrice", parseFloat(e.target.value) || 0)}
                                  onWheel={(e) => e.preventDefault()}
                                  onFocus={() => disableNumberInputScroll()}
                                  onBlur={() => enableNumberInputScroll()}
                                  placeholder="0.00"
                                  className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>

                              {/* Quality prices override */}
                              {selectedRepair && selectedRepair.hasQualityOptions && selectedRepair.qualityOptions && (
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-xs">Quality Option Prices</Label>
                                  <div className="grid grid-cols-1 gap-2">
                                    {selectedRepair.qualityOptions.map((q: any, qi: number) => {
                                      const currentQualityPrice = mr.qualityPrices?.[qi]?.price ?? (q.priceMultiplier ? mr.basePrice * q.priceMultiplier : mr.basePrice);
                                      return (
                                        <div key={q.id} className="flex gap-2 items-center p-2 border rounded">
                                          <div className="flex-1">
                                            <div className="text-xs font-medium">{q.name}</div>
                                            {q.description && <div className="text-xs text-muted-foreground">{q.description}</div>}
                                          </div>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={currentQualityPrice}
                                            onChange={(e) => updateModelRepairQualityPrice(idx, qi, parseFloat(e.target.value) || 0)}
                                            onWheel={(e) => e.preventDefault()}
                                            onFocus={() => disableNumberInputScroll()}
                                            onBlur={() => enableNumberInputScroll()}
                                            placeholder="0.00"
                                            className="w-24 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
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
        
        {/* Bulk upload input (hidden) and button */}
        <input
          id="bulk-upload-input"
          ref={bulkInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={async (e) => {
            const input = e.currentTarget as HTMLInputElement;
            const f = input.files?.[0];
            if (!f) {
              // clear value to allow re-selecting same file later
              input.value = '';
              return;
            }
            try {
              setIsLoading(true);
              const fd = new FormData();
              fd.append('file', f);
              // send to parse route to get preview
              const res = await fetch('/api/admin/models/bulk/parse', {
                method: 'POST',
                body: fd,
                credentials: 'include',
              });
              const data = await res.json();
              if (res.ok && data.success) {
                setBulkPreviewRows(data.preview || []);
                setBulkPreviewOpen(true);
                // run a dry-run analysis to detect duplicates/errors before import
                try {
                  const dryRes = await fetch('/api/admin/models/bulk/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rows: data.preview || [], brandId: (filterBrand === 'all' ? undefined : filterBrand) || filterBrand, deviceType: filterDeviceType === 'all' ? undefined : filterDeviceType, dryRun: true }),
                    credentials: 'include',
                  });
                  const dryJson = await dryRes.json();
                  if (dryRes.ok && dryJson.success) {
                    setBulkDryRunAnalysis(dryJson.analysis || null);
                  } else {
                    setBulkDryRunAnalysis(null);
                  }
                } catch (err) {
                  console.error('Dry-run error', err);
                  setBulkDryRunAnalysis(null);
                }
                // if we were awaiting a file from the pre-upload dialog, close it now
                if (bulkAwaitingFile) {
                  setBulkBrandDialogOpen(false);
                  setBulkAwaitingFile(false);
                }
              } else {
                toast.error(data.error || 'Failed to parse file');
              }
            } catch (err) {
              console.error('Parse error', err);
              toast.error('Failed to parse file');
            } finally {
              setIsLoading(false);
              // clear the input value using the captured element to avoid synthetic-event nullification
              input.value = '';
            }
          }}
        />

        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={() => {
            if (!filterBrand || filterBrand === 'all') {
              // open dialog to choose brand/device type before uploading
              setBulkDialogBrand('all');
              setBulkDialogDeviceType(filterDeviceType || 'all');
              setBulkBrandDialogOpen(true);
            } else {
              bulkInputRef.current?.click();
            }
          }}
        >
          Bulk Upload
        </Button>

        {/* Dialog to select Brand/Device Type before bulk upload when none selected */}
        <Dialog open={bulkBrandDialogOpen} onOpenChange={setBulkBrandDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Brand for Bulk Upload</DialogTitle>
              <DialogDescription>Choose the brand (and optionally device type) to map parsed models to before uploading the file.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div>
                <Label>Brand *</Label>
                <Select value={bulkDialogBrand} onValueChange={(v) => setBulkDialogBrand(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">-- Select Brand --</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Device Type (optional)</Label>
                <Select value={bulkDialogDeviceType} onValueChange={(v) => setBulkDialogDeviceType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {DEVICE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBulkBrandDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  if (!bulkDialogBrand || bulkDialogBrand === 'all') {
                    toast.error('Please select a brand to continue');
                    return;
                  }
                  // Apply chosen filters and open file picker — keep dialog open until file chosen
                  setFilterBrand(bulkDialogBrand);
                  setFilterDeviceType(bulkDialogDeviceType || 'all');
                  setBulkAwaitingFile(true);
                  // open file picker; dialog will close after a file is picked and parsed
                  setTimeout(() => bulkInputRef.current?.click(), 150);
                }}>Continue</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog for bulk rows */}
        <Dialog open={bulkPreviewOpen} onOpenChange={setBulkPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk import preview</DialogTitle>
              <DialogDescription>Review parsed rows and uncheck any you don't want to import.</DialogDescription>
            </DialogHeader>
            <div className="p-4">
              {bulkPreviewRows && bulkPreviewRows.length > 0 ? (
                <div className="space-y-3">
                  {/* Dry-run summary */}
                  {bulkDryRunAnalysis && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <strong>Preview analysis:</strong>
                        <span className="ml-2">Create: {(bulkDryRunAnalysis.filter(a => a.action === 'create').length)}</span>
                        <span className="ml-2">Skipped: {(bulkDryRunAnalysis.filter(a => a.action === 'skip').length)}</span>
                        <span className="ml-2">Errors: {(bulkDryRunAnalysis.filter(a => a.action === 'error').length)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Mapped Brand: {brands.find(b=>b._id===filterBrand)?.name || 'N/A'} • Type: {filterDeviceType === 'all' ? 'Any' : filterDeviceType}</div>
                    </div>
                  )}
                  <table className="w-full text-sm table-auto border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Import</th>
                        <th className="p-2 text-left">Model</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Variants</th>
                        <th className="p-2 text-left">Colours</th>
                        <th className="p-2 text-left">Image URL</th>
                        <th className="p-2 text-left">Repairs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreviewRows.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">
                            <input type="checkbox" defaultChecked data-row-index={i} />
                          </td>
                          <td className="p-2">{r.name}</td>
                          <td className="p-2">
                            {bulkDryRunAnalysis && bulkDryRunAnalysis[i] ? (
                              bulkDryRunAnalysis[i].action === 'create' ? (
                                <span className="text-green-600">Will create</span>
                              ) : bulkDryRunAnalysis[i].action === 'skip' ? (
                                <span className="text-yellow-700">Skipped</span>
                              ) : (
                                <span className="text-red-600">Error</span>
                              )
                            ) : (
                              <span className="text-muted-foreground">Unknown</span>
                            )}
                          </td>
                          <td className="p-2">{(r.variants || []).join(', ')}</td>
                          <td className="p-2">{(r.colours || []).map((c:any)=>c.name).join(', ')}</td>
                          <td className="p-2 break-all">{r.imageUrl}</td>
                          <td className="p-2">{(r.repairsParsed || []).map((rp:any)=>rp.name + (rp.price?` ($${rp.price})`:'')).join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setBulkPreviewOpen(false)}>Cancel</Button>
                    <Button onClick={async () => {
                      // collect selected rows
                      const checkboxes = Array.from(document.querySelectorAll<HTMLInputElement>('[data-row-index]'));
                      const selectedRows = checkboxes.filter(cb => cb.checked).map(cb => bulkPreviewRows[Number(cb.dataset.rowIndex)]);
                      if (selectedRows.length === 0) {
                        toast.error('No rows selected');
                        return;
                      }
                      if (!filterBrand || filterBrand === 'all') {
                        toast.error('Select a Brand filter before importing');
                        return;
                      }
                      // If dry-run found per-row errors, prevent import for those rows
                      if (bulkDryRunAnalysis) {
                        const checkboxesAll = Array.from(document.querySelectorAll<HTMLInputElement>('[data-row-index]'));
                        const problematic = checkboxesAll.filter(cb => cb.checked && bulkDryRunAnalysis[Number(cb.dataset.rowIndex)] && bulkDryRunAnalysis[Number(cb.dataset.rowIndex)].action === 'error');
                        if (problematic.length > 0) {
                          toast.error('One or more selected rows have errors; fix them before importing');
                          return;
                        }
                      }
                      setIsLoading(true);
                      try {
                        const res = await fetch('/api/admin/models/bulk/create', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ rows: selectedRows, brandId: filterBrand, deviceType: filterDeviceType === 'all' ? undefined : filterDeviceType }),
                          credentials: 'include',
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          const createdCount = data.created?.length || 0;
                          const skippedCount = data.skipped?.length || 0;
                          const errorCount = data.errors?.length || 0;
                          toast.success('Imported ' + createdCount + ' models');
                          if (skippedCount > 0) toast.warning('Skipped ' + skippedCount + ' duplicate model(s)');
                          if (errorCount > 0) toast.error('Failed to import ' + errorCount + ' row(s)');
                          fetchData();
                          setBulkPreviewOpen(false);
                          setBulkPreviewRows(null);
                        } else {
                          console.error('Create failed', data);
                          toast.error(data.error || 'Import failed');
                        }
                      } catch (err) {
                        console.error('Import error', err);
                        toast.error('Import failed');
                      } finally {
                        setIsLoading(false);
                      }
                    }}>Import selected</Button>
                  </div>
                </div>
              ) : (
                <div>No rows parsed</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        </div>
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
                  <TableCell>{model.brandId?.name || 'N/A'}</TableCell>
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {models.length > 0 ? ((currentPage - 1) * modelsPerPage) + 1 : 0} to {Math.min(currentPage * modelsPerPage, totalModels)} of {totalModels} models
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isLoading}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
