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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, X, RefreshCw, GripVertical, Upload } from "lucide-react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RepairItem {
  _id: string;
  name: string;
  repairId: string;
  icon: string;
  iconPublicId?: string;
  iconUrl?: string;
  deviceTypes: string[];
  basePrice: number;
  duration: string;
  description: string;
  subdescription?: string;
  hasQualityOptions: boolean;
  qualityOptions: Array<{
    id: string;
    name: string;
    duration: string;
    description: string;
    priceMultiplier: number;
  }>;
  active: boolean;
  position?: number;
}

interface SortableRowProps {
  repair: RepairItem;
  onEdit: (repair: RepairItem) => void;
  onDelete: (repair: RepairItem) => void;
}

function SortableRow({ repair, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: repair._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab hover:text-primary transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="font-medium">{repair.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {repair.deviceTypes.map((type) => (
            <Badge key={type} variant="outline">
              {type}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>{repair.duration}</TableCell>
      <TableCell>
        {repair.hasQualityOptions ? (
          <Badge variant="secondary">
            {repair.qualityOptions.length} options
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={repair.active ? "default" : "secondary"}>
          {repair.active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(repair)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(repair)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function RepairsManagement() {
  const [repairs, setRepairs] = useState<RepairItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRepair, setEditingRepair] = useState<RepairItem | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    deviceTypes: [] as string[],
    duration: "",
    description: "",
    subdescription: "",
    hasQualityOptions: false,
    qualityOptions: [] as Array<{
      id: string;
      name: string;
      description: string;
    }>,
    active: true,
  });

  const DEVICE_TYPES = [
    { id: "smartphone", label: "Smartphone" },
    { id: "tablet", label: "Tablet" },
    { id: "laptop", label: "Laptop" },
  ];

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const response = await fetch("/api/admin/repairs", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched repairs:', data);
        setRepairs(data.data || data.repairs || []);
      }
    } catch (error) {
      console.error("Error fetching repairs:", error);
      toast.error("Failed to load repairs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadIcon = async (): Promise<{ url: string; publicId: string } | null> => {
    if (!iconFile) return null;

    const formDataUpload = new FormData();
    formDataUpload.append("file", iconFile);
    formDataUpload.append("folder", "repairs");

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
      console.error("Error uploading icon:", error);
      return null;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = repairs.findIndex((repair) => repair._id === active.id);
      const newIndex = repairs.findIndex((repair) => repair._id === over.id);

      const newRepairs = arrayMove(repairs, oldIndex, newIndex);
      setRepairs(newRepairs);

      // Update positions in the backend
      const positions = newRepairs.map((repair, index) => ({
        id: repair._id,
        position: index,
      }));

      try {
        const response = await fetch("/api/admin/repairs", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ positions }),
        });

        if (!response.ok) {
          throw new Error("Failed to update positions");
        }

        toast.success("Repair order updated successfully");
        // Refetch data to ensure UI reflects the changes immediately
        await fetchRepairs();
      } catch (error) {
        console.error("Error updating repair positions:", error);
        toast.error("Failed to update repair order");
        // Revert the change
        fetchRepairs();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let iconUrl = formData.icon;
      let iconPublicId = editingRepair?.iconPublicId || "";

      // Upload new icon if selected
      if (iconFile) {
        const uploadResult = await uploadIcon();
        if (uploadResult) {
          iconUrl = uploadResult.url;
          iconPublicId = uploadResult.publicId;
        } else {
          toast.error("Failed to upload icon");
          setIsSubmitting(false);
          return;
        }
      } else if (editingRepair && !iconFile) {
        // Keep existing icon if editing and no new file selected
        iconUrl = editingRepair.iconUrl || editingRepair.icon;
        iconPublicId = editingRepair.iconPublicId || "";
      }

      const url = `/api/admin/repairs`;

      const body = editingRepair
        ? JSON.stringify({ 
            ...formData, 
            id: editingRepair._id,
            iconUrl,
            iconPublicId
          })
        : JSON.stringify({
            ...formData,
            iconUrl,
            iconPublicId
          });

      const response = await fetch(url, {
        method: editingRepair ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        credentials: "include",
      });

      const responseData = await response.json();
      console.log('Repair save response:', responseData);

      if (response.ok) {
        toast.success(
          editingRepair
            ? "Repair updated successfully"
            : "Repair created successfully"
        );
        setIsDialogOpen(false);
        resetForm();
        fetchRepairs();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save repair");
      }
    } catch (error) {
      console.error("Error saving repair:", error);
      toast.error("Failed to save repair");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (repair: RepairItem) => {
    if (!confirm(`Are you sure you want to delete ${repair.name}?`)) return;

    try {
      const response = await fetch(`/api/admin/repairs?id=${repair._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Repair deleted successfully");
        fetchRepairs();
      } else {
        toast.error("Failed to delete repair");
      }
    } catch (error) {
      console.error("Error deleting repair:", error);
      toast.error("Failed to delete repair");
    }
  };

  const handleEdit = (repair: RepairItem) => {
    setEditingRepair(repair);
    setFormData({
      name: repair.name,
      icon: repair.icon,
      deviceTypes: repair.deviceTypes,
      duration: repair.duration,
      description: repair.description,
      subdescription: repair.subdescription || "",
      hasQualityOptions: repair.hasQualityOptions,
      qualityOptions: (repair.qualityOptions || []).map(q => ({
        id: q.id,
        name: q.name,
        description: q.description,
      })),
      active: repair.active,
    });
    setIconFile(null);
    setIconPreview(repair.iconUrl || "");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "",
      deviceTypes: [],
      duration: "",
      description: "",
      subdescription: "",
      hasQualityOptions: false,
      qualityOptions: [],
      active: true,
    });
    setEditingRepair(null);
    setIconFile(null);
    setIconPreview("");
  };

  const handleDeviceTypeToggle = (typeId: string) => {
    setFormData((prev) => ({
      ...prev,
      deviceTypes: prev.deviceTypes.includes(typeId)
        ? prev.deviceTypes.filter((id) => id !== typeId)
        : [...prev.deviceTypes, typeId],
    }));
  };

  const addQualityOption = () => {
    setFormData({
      ...formData,
      qualityOptions: [
        ...formData.qualityOptions,
        {
          id: "",
          name: "",
          description: "",
        },
      ],
    });
  };

  const removeQualityOption = (index: number) => {
    setFormData({
      ...formData,
      qualityOptions: formData.qualityOptions.filter((_, i) => i !== index),
    });
  };

  const updateQualityOption = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newOptions = [...formData.qualityOptions];
    (newOptions[index] as any)[field] = value;
    setFormData({ ...formData, qualityOptions: newOptions });
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
        <h2 className="text-2xl font-bold">Repair Services Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRepairs()}
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
                Add Repair Service
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRepair ? "Edit Repair Service" : "Add New Repair Service"}
              </DialogTitle>
              <DialogDescription>
                {editingRepair
                  ? "Update repair service information"
                  : "Create a new repair service"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Screen Repair, Battery Replacement"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Icon Upload */}
                <div className="space-y-2">
                  <Label>Repair Icon</Label>
                  <div className="flex items-center gap-4">
                    {iconPreview && (
                      <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
                        <Image
                          src={iconPreview}
                          alt="Icon preview"
                          fill
                          className="object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIconPreview("");
                            setIconFile(null);
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
                        onChange={handleIconChange}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload repair icon (PNG, JPG, SVG recommended)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 15 minutes, 1 hour"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the repair service..."
                  rows={3}
                  required
                />
              </div>

              {/* Subdescription */}
              <div className="space-y-2">
                <Label htmlFor="subdescription">Subdescription (Optional)</Label>
                <Textarea
                  id="subdescription"
                  value={formData.subdescription}
                  onChange={(e) =>
                    setFormData({ ...formData, subdescription: e.target.value })
                  }
                  placeholder="Additional details or notes..."
                  rows={2}
                />
              </div>

              {/* Device Types */}
              <div className="space-y-2">
                <Label>Device Types *</Label>
                <div className="grid grid-cols-3 gap-4">
                  {DEVICE_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`device-${type.id}`}
                        checked={formData.deviceTypes.includes(type.id)}
                        onCheckedChange={() => handleDeviceTypeToggle(type.id)}
                      />
                      <label
                        htmlFor={`device-${type.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Options */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasQualityOptions"
                    checked={formData.hasQualityOptions}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        hasQualityOptions: checked as boolean,
                      })
                    }
                  />
                  <label
                    htmlFor="hasQualityOptions"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Has Part Quality Options (OEM vs Aftermarket)
                  </label>
                </div>

                {formData.hasQualityOptions && (
                  <div className="space-y-4 mt-4 p-4 border rounded-lg">
                    <Label>Quality Options</Label>
                    {formData.qualityOptions.map((option, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Option {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQualityOption(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">ID</Label>
                              <Input
                                value={option.id}
                                onChange={(e) =>
                                  updateQualityOption(index, "id", e.target.value)
                                }
                                placeholder="oem, aftermarket"
                                className="text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Name</Label>
                              <Input
                                value={option.name}
                                onChange={(e) =>
                                  updateQualityOption(index, "name", e.target.value)
                                }
                                placeholder="Original (OEM)"
                                className="text-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={option.description}
                              onChange={(e) =>
                                updateQualityOption(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Describe this quality option..."
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQualityOption}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Quality Option
                    </Button>
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
                  className="text-sm font-medium cursor-pointer"
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
                  disabled={isSubmitting || formData.deviceTypes.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingRepair ? (
                    "Update Repair"
                  ) : (
                    "Create Repair"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Repairs Table */}
      <Card>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Device Types</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Quality Options</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No repair services yet. Add your first service!
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={repairs.map((repair) => repair._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {repairs.map((repair) => (
                    <SortableRow
                      key={repair._id}
                      repair={repair}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </Card>
    </div>
  );
}
