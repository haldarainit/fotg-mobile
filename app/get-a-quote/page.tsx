"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  ChevronLeft,
  Smartphone,
  Tablet,
  Laptop,
  Package,
  Home,
  Monitor,
  Battery,
  Cpu,
  Camera,
  Volume2,
  Mic,
  Power,
  Wrench,
  Droplets,
  Shield,
  Check,
  X,
  Info,
  Calendar,
  Truck,
} from "lucide-react";
import { LpNavbar1 } from "@/components/pro-blocks/landing-page/lp-navbars/lp-navbar-1";
import { Footer1 } from "@/components/pro-blocks/landing-page/footers/footer-1";
import Image from "next/image";
import { Brand, DeviceModel, RepairItem } from "@/lib/repairData";
import { Tabs,TabsTrigger , TabsList,TabsContent} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const DEVICE_TYPES = [
  { id: "smartphone", label: "SMARTPHONE", icon: Smartphone },
  { id: "tablet", label: "TABLET", icon: Tablet },
  { id: "laptop", label: "LAPTOP", icon: Laptop },
];

// Helper function to get icon for repair type
const getRepairIcon = (repairId: string) => {
  const iconMap: Record<string, any> = {
    screen: Monitor,
    battery: Battery,
    "charging-port": Power,
    "back-glass": Shield,
    camera: Camera,
    speaker: Volume2,
    microphone: Mic,
    motherboard: Cpu,
    "water-damage": Droplets,
    investigation: Search,
    default: Wrench,
  };
  return iconMap[repairId] || iconMap.default;
};

// Helper function to format duration
const formatDuration = (duration: string) => {
  if (!duration) return "";
  // If it already contains "minutes", return as is
  if (duration.toLowerCase().includes("minute")) return duration;
  // If it's just a number, add "minutes"
  if (/^\d+$/.test(duration)) return `${duration} minutes`;
  // Otherwise, return as is
  return duration;
};

// Part quality options for repairs that support it
// Removed hardcoded PART_QUALITY_OPTIONS - now using backend data

// Service method options
const SERVICE_METHODS = [
  {
    id: "location",
    title: "At Our Location",
    subtitle: "Visit our repair center for instant service",
    badge: "INSTANT",
  },
  {
    id: "pickup",
    title: "Pick-up & Delivery",
    subtitle: "We'll collect and return your device",
    badge: "CONVENIENT",
  },
];

export default function GetAQuotePage() {
  const [step, setStep] = useState<
    "device-type" | "brand" | "model" | "color" | "repair" | "finalize"
  >("device-type");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([]);
  const [repairPartQuality, setRepairPartQuality] = useState<Record<string, string>>({});
  const [serviceMethod, setServiceMethod] = useState("");
  const [customerType, setCustomerType] = useState<"private" | "business">(
    "private"
  );
  const [showAllRepairs, setShowAllRepairs] = useState(false);
  const [showFindModelDialog, setShowFindModelDialog] = useState(false);
  const [showPartQualityDialog, setShowPartQualityDialog] = useState(false);
  const [selectedRepairForQuality, setSelectedRepairForQuality] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{
    brands: Brand[];
    models: DeviceModel[];
  }>({ brands: [], models: [] });

  // Booking state for location service
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingTimeSlot, setBookingTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Array<{id: string, label: string, startTime: string, endTime: string, active: boolean, isAvailable: boolean, isBooked: boolean}>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Helper function to check if a time slot is in the past
  const isTimeSlotPast = (date: Date, timeString: string): boolean => {
    const now = new Date();
    const slotDate = new Date(date);
    
    // Parse time string (format: "HH:MM AM/PM")
    const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return false;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    slotDate.setHours(hours, minutes, 0, 0);
    
    return slotDate < now;
  };

  // Shipping address for pickup service
  const [shippingAddress, setShippingAddress] = useState({
    houseNumber: "",
    streetName: "",
    city: "",
    zipcode: "",
    country: "United States (US)",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Backend data state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [repairs, setRepairs] = useState<RepairItem[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isLoadingRepairs, setIsLoadingRepairs] = useState(true);

  // Combined loading state for backward compatibility
  const isLoadingData = isLoadingBrands || isLoadingModels || isLoadingRepairs;

  // Fetch brands, models, and repairs from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings (tax and discounts)
        setIsLoadingSettings(true);
        const settingsRes = await fetch("/api/admin/settings");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData.data);
        }
        setIsLoadingSettings(false);

        // Fetch brands
        setIsLoadingBrands(true);
        const brandsRes = await fetch("/api/admin/brands?activeOnly=true");
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          // console.log("Fetched brands for quote:", brandsData);
          // Normalize backend brand shape to frontend Brand type
          const rawBrands = brandsData.data || brandsData.brands || [];
          const normalizedBrands: Brand[] = rawBrands.map((b: any) => ({
            id: b._id ?? b.id ?? String(b._id ?? b.id ?? ""),
            name: b.name || b.title || "",
            logo: b.logo || b.logoUrl || b.logoPublicId || "",
            deviceTypes: b.deviceTypes || b.deviceTypes || [],
          }));
          setBrands(normalizedBrands);
        }
        setIsLoadingBrands(false);

        // Fetch models (with populated repairs and pricing)
        setIsLoadingModels(true);
        const modelsRes = await fetch("/api/admin/models?activeOnly=true&limit=1000");
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          // console.log("Fetched models for quote:", modelsData);
          const rawModels = modelsData.data || modelsData.models || [];
          const normalizedModels: DeviceModel[] = rawModels.map((m: any) => {
            // Debug logging for repairs data
            // console.log("Model repairs data:", m.repairs);
            if (m.repairs && m.repairs.length > 0) {
              m.repairs.forEach((repair: any) => {
                // console.log("Repair quality prices:", repair.qualityPrices);
                if (repair.qualityPrices) {
                  repair.qualityPrices.forEach((qp: any) => {
                    // console.log("Quality Price object:", qp);
                    // console.log("Quality ID:", qp.id);
                    // console.log("Quality Name:", qp.name);
                    // console.log("Quality Description:", qp.description);
                    // console.log("Quality Duration:", qp.duration);
                    // console.log("Quality Price:", qp.price);
                  });
                }
              });
            }
            
            // Handle brandId - it can be an ObjectId string or a populated object
            let extractedBrandId = "";
            let extractedBrandName = "";
            if (typeof m.brandId === "string") {
              extractedBrandId = m.brandId;
            } else if (m.brandId && typeof m.brandId === "object") {
              // brandId is populated with brand object
              extractedBrandId = m.brandId._id ?? m.brandId.id ?? String(m.brandId._id);
              extractedBrandName = m.brandId.name || m.brandId.title || "";
            }
            // Fallbacks if API uses different fields
            extractedBrandName = extractedBrandName || m.brandName || m.brand?.name || "";

            return {
              id: m._id ?? m.id ?? String(m._id ?? m.id ?? ""),
              name: m.name || m.title || "",
              image: m.image || m.images?.[0] || "",
              variants: m.variants || m.modelCodes || [],
              brandId: extractedBrandId,
              brandName: extractedBrandName,
              deviceType: m.deviceType || m.type || "smartphone",
              colors: m.colors || m.colorOptions || [],
              // Pass through the raw repairs data for pricing
              repairs: m.repairs || [],
            } as any;
          });
          setModels(normalizedModels);
        }
        setIsLoadingModels(false);

        // Fetch repairs
        setIsLoadingRepairs(true);
        const repairsRes = await fetch("/api/admin/repairs?activeOnly=true");
        if (repairsRes.ok) {
          const repairsData = await repairsRes.json();
          // console.log("Fetched repairs for quote:", repairsData);
          const rawRepairs = repairsData.data || repairsData.repairs || [];
          // console.log("Raw repairs data:", rawRepairs);
          const normalizedRepairs: RepairItem[] = rawRepairs.map((r: any) => {
            console.log("Processing repair:", r.name, "Description:", r.description, "Full object:", r);
            return {
              id: r._id ?? r.id ?? String(r._id ?? r.id ?? ""),
              name: r.name || r.title || "",
              price: r.price ?? r.basePrice ?? 0,
              duration: r.duration || r.estimatedTime || "",
              description: r.description || r.desc || "",
              badge: r.badge || r.label,
              icon: r.icon || r.iconName || "",
              deviceTypes: r.deviceTypes || r.applicableDeviceTypes || [],
              // Pass through quality options from backend
              hasQualityOptions: r.hasQualityOptions || false,
              qualityOptions: r.qualityOptions || [],
            } as any;
          });
          console.log("Final normalized repairs:", normalizedRepairs);
          setRepairs(normalizedRepairs);
        }
        setIsLoadingRepairs(false);
      } catch (error) {
        // console.error("Error fetching data:", error);
        toast.error("Failed to load data", {
          description: "Some data couldn't be loaded. Please refresh the page.",
        });
        // Reset loading states on error
        setIsLoadingSettings(false);
        setIsLoadingBrands(false);
        setIsLoadingModels(false);
        setIsLoadingRepairs(false);
      }
    };

    fetchData();
  }, []);

  // Fetch available time slots when date is selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!bookingDate || serviceMethod !== "location") {
        setAvailableSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const dateStr = bookingDate.toISOString().split("T")[0];
        const response = await fetch(`/api/bookings?date=${dateStr}`);
        if (response.ok) {
          const data = await response.json();
          // Use allSlots which includes availability status for each slot
          setAvailableSlots(data.data.allSlots || []);
        }
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [bookingDate, serviceMethod]);

  const getFilteredBrands = () => {
    let filteredBrands = brands;

    // Filter brands based on device type
    if (selectedDeviceType) {
      filteredBrands = filteredBrands.filter((brand) =>
        brand.deviceTypes.includes(
          selectedDeviceType as "smartphone" | "tablet" | "laptop"
        )
      );
    }

    // Apply search filter
    if (!searchQuery) return filteredBrands;
    return filteredBrands.filter((brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Enhanced search that searches across brands, models, and variants
  const performSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults({ brands: [], models: [] });
      return;
    }

    const lowerQuery = query.toLowerCase();

    // Search brands
    let matchedBrands = brands.filter((brand) =>
      brand.name.toLowerCase().includes(lowerQuery)
    );

    // Filter by device type if selected
    if (selectedDeviceType) {
      matchedBrands = matchedBrands.filter((brand) =>
        brand.deviceTypes.includes(
          selectedDeviceType as "smartphone" | "tablet" | "laptop"
        )
      );
    }

    // Search models (by name and variants)
    let matchedModels = models.filter((model) => {
      const nameMatch = model.name.toLowerCase().includes(lowerQuery);
      const variantMatch = model.variants.some((variant) =>
        variant.toLowerCase().includes(lowerQuery)
      );
      return nameMatch || variantMatch;
    });

    // Filter by device type if selected
    if (selectedDeviceType) {
      matchedModels = matchedModels.filter(
        (model) => model.deviceType === selectedDeviceType
      );
    }

    setSearchResults({ brands: matchedBrands, models: matchedModels });
  };

  const handleSearchModelSelect = (model: DeviceModel) => {
    const brand = brands.find((b) => b.id === model.brandId);
    if (brand) {
      setSelectedBrand(brand);
    } else {
      // Fallback: use brandName from the model if available
      const fallbackBrand = {
        id: (model as any).brandId || "",
        name: (model as any).brandName || (model as any).brand?.name || "",
        logo: "",
        deviceTypes: [],
      } as Brand;
      setSelectedBrand(fallbackBrand);
    }

    setSelectedModel(model);
    if (model.colors && model.colors.length > 0) {
      setSelectedColor(model.colors[0].id);
    }
    setSearchQuery("");
    setSearchResults({ brands: [], models: [] });
    setStep("color");
  };

  const getFilteredModels = () => {
    if (!selectedBrand) return [];
    let filteredModels = models.filter(
      (model) => model.brandId === selectedBrand.id
    );

    // Filter by device type if selected
    if (selectedDeviceType) {
      filteredModels = filteredModels.filter(
        (model) => model.deviceType === selectedDeviceType
      );
    }

    return filteredModels;
  };

  const getFilteredRepairs = () => {
    if (!selectedModel) return [];
    
    // Only show repairs that are specifically added to this model
    const modelRepairIds = (selectedModel as any).repairs?.map((r: any) => {
      // Handle both populated repairId object and direct repairId string
      const rId = typeof r.repairId === "object" 
        ? (r.repairId?._id ?? r.repairId?.id) 
        : r.repairId;
      return String(rId);
    }) || [];
    
    // Filter repairs to only include those added to the model
    return repairs.filter((repair) => modelRepairIds.includes(String(repair.id)));
  };

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setStep("model");
    setSearchQuery("");
  };

  const handleModelSelect = (model: DeviceModel) => {
    setSelectedModel(model);
    // Set the first available color for this model
    if (model.colors && model.colors.length > 0) {
      setSelectedColor(model.colors[0].id);
    }
    setStep("color");
  };

  const handleBackClick = () => {
    if (step === "brand") {
      setStep("device-type");
      setSelectedBrand(null);
    } else if (step === "model") {
      setStep("brand");
      setSelectedModel(null);
    } else if (step === "color") {
      setStep("model");
    } else if (step === "repair") {
      setStep("color");
      setSelectedRepairs([]);
    } else if (step === "finalize") {
      setStep("repair");
    }
  };

  const handleRepairToggle = (repairId: string) => {
    const isSelected = selectedRepairs.includes(repairId);
    
    // Check if this repair has quality options from the model's repair data
    const modelRepair = (selectedModel as any)?.repairs?.find(
      (r: any) => {
        const rId = typeof r.repairId === "object" 
          ? (r.repairId?._id ?? r.repairId?.id) 
          : r.repairId;
        return String(rId) === String(repairId);
      }
    );
    
    // Check if repair has quality options - show dialog regardless of price
    // Some models may not include per-quality prices (empty qualityPrices) but the
    // repair definition itself can declare qualityOptions. Treat either as valid.
    const repairDef = repairs.find((r) => String(r.id) === String(repairId));
    const hasQualityOptions =
      (modelRepair?.qualityPrices && modelRepair.qualityPrices.length > 0) ||
      Boolean((repairDef as any)?.qualityOptions?.length) ||
      Boolean((repairDef as any)?.hasQualityOptions);
    
    if (!isSelected && hasQualityOptions) {
      // Show quality selection dialog when selecting a repair that has quality options
      setSelectedRepairForQuality(repairId);
      setShowPartQualityDialog(true);
    } else if (isSelected) {
      // Deselect repair
      setSelectedRepairs((prev) => prev.filter((id) => id !== repairId));
      // Remove quality selection
      setRepairPartQuality((prev) => {
        const newQuality = { ...prev };
        delete newQuality[repairId];
        return newQuality;
      });
    } else {
      // No quality options, just toggle
      setSelectedRepairs((prev) => [...prev, repairId]);
    }
  };

  const handlePartQualitySelect = (quality: string) => {
    if (selectedRepairForQuality) {
      setRepairPartQuality((prev) => ({
        ...prev,
        [selectedRepairForQuality]: quality,
      }));
      setSelectedRepairs((prev) => [...prev, selectedRepairForQuality]);
      setShowPartQualityDialog(false);
      setSelectedRepairForQuality(null);
    }
  };

  const getRepairPrice = (repairId: string): number => {
    if (!selectedModel) return 0;

    // Find the model-specific repair pricing
    const modelRepair = (selectedModel as any).repairs?.find(
      (r: any) => {
        // Handle both populated repairId object and direct repairId string
        const rId = typeof r.repairId === "object" 
          ? (r.repairId?._id ?? r.repairId?.id) 
          : r.repairId;
        return String(rId) === String(repairId) || String(r.repairId) === String(repairId);
      }
    );

    if (!modelRepair) {
      // console.warn(`No pricing found for repair ${repairId} on model ${selectedModel.name}`);
      return 0;
    }

    const quality = repairPartQuality[repairId];
    
    // If quality is selected and quality prices are available
    if (quality && modelRepair.qualityPrices && modelRepair.qualityPrices.length > 0) {
      const qualityPrice = modelRepair.qualityPrices.find((qp: any) => qp.id === quality);
      if (qualityPrice) {
        return qualityPrice.price || 0;
      }
    }
    
    // Return base price for this model
    return modelRepair.basePrice || 0;
  };

  const calculatePricing = () => {
    const subtotal = selectedRepairs.reduce((total, repairId) => {
      return total + getRepairPrice(repairId);
    }, 0);

    // Stackable discount logic with categories (repairs/subtotal/specific)
    let appliedDiscountRules: Array<{
      id?: string;
      name?: string;
      type: "percentage" | "fixed";
      value: number;
      amount: number; // computed amount in $ for display
      category: "repairs" | "subtotal" | "generic" | "specific";
      minRepairs?: number;
      minSubtotal?: number;
    }> = [];

    if (settings && Array.isArray(settings.discountRules)) {
      const candidateRepairs: typeof appliedDiscountRules = [];
      const candidateSubtotal: typeof appliedDiscountRules = [];
      const candidateSpecific: typeof appliedDiscountRules = [];
      const candidateGeneric: typeof appliedDiscountRules = [];

      for (const rule of settings.discountRules) {
        if (!rule?.active) continue;

        let ruleApplies = true;

        // Check minimum repairs requirement
        if (rule.minRepairs && selectedRepairs.length < rule.minRepairs) {
          ruleApplies = false;
        }

        // Check minimum subtotal requirement (new)
        if (rule.minSubtotal && subtotal < rule.minSubtotal) {
          ruleApplies = false;
        }

        // Check specific repairs requirement
        if (rule.specificRepairs && rule.specificRepairs.length > 0) {
          const hasAllRequired = rule.specificRepairs.every((reqRepairId: string) =>
            selectedRepairs.some((selRepairId) => {
              // Get the actual repair ID from the model's repair data
              const modelRepair = (selectedModel as any)?.repairs?.find((r: any) => {
                const rId = typeof r.repairId === "object"
                  ? (r.repairId?._id ?? r.repairId?.id)
                  : r.repairId;
                return rId === selRepairId;
              });
              const actualRepairId = typeof modelRepair?.repairId === "object"
                ? (modelRepair.repairId?._id ?? modelRepair.repairId?.id)
                : modelRepair?.repairId;
              return actualRepairId === reqRepairId || selRepairId === reqRepairId;
            })
          );
          if (!hasAllRequired) ruleApplies = false;
        }

        if (!ruleApplies) continue;

        const amount = rule.type === "percentage"
          ? (subtotal * (Number(rule.value) || 0)) / 100
          : (Number(rule.value) || 0);

        const base = {
          id: (rule as any)._id ?? (rule as any).id,
          name: rule.name,
          type: rule.type as "percentage" | "fixed",
          value: Number(rule.value) || 0,
          amount,
          minRepairs: rule.minRepairs,
          minSubtotal: (rule as any).minSubtotal,
        };

        if ((rule as any).minSubtotal) {
          candidateSubtotal.push({ ...base, category: "subtotal" });
        } else if (rule.specificRepairs && rule.specificRepairs.length > 0) {
          candidateSpecific.push({ ...base, category: "specific" });
        } else if (rule.minRepairs) {
          candidateRepairs.push({ ...base, category: "repairs" });
        } else {
          candidateGeneric.push({ ...base, category: "generic" });
        }
      }

      // From each category, pick the best single rule (highest $ amount)
      const pickBest = (arr: typeof appliedDiscountRules) =>
        arr.sort((a, b) => b.amount - a.amount)[0];

      const bestRepairs = pickBest(candidateRepairs);
      const bestSubtotal = pickBest(candidateSubtotal);
      const bestSpecific = pickBest(candidateSpecific);
      const bestGeneric = pickBest(candidateGeneric);

      appliedDiscountRules = [bestRepairs, bestSubtotal, bestSpecific, bestGeneric].filter(Boolean) as typeof appliedDiscountRules;
    }

    // Combine discounts: sum of percentages + sum of fixed amounts
    const percentTotal = appliedDiscountRules
      .filter((r) => r.type === "percentage")
      .reduce((sum, r) => sum + (r.value || 0), 0);
    const fixedTotal = appliedDiscountRules
      .filter((r) => r.type === "fixed")
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const discount = (subtotal * percentTotal) / 100 + fixedTotal;

    // Calculate tax
    const taxPercentage = settings?.taxPercentage || 0;
    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = (afterDiscount * taxPercentage) / 100;
    const total = afterDiscount + tax;

    return {
      subtotal,
      discount,
      discountRule: appliedDiscountRules.length === 1 ? appliedDiscountRules[0] : null,
      appliedDiscountRules,
      combinedDiscountPercent: percentTotal,
      tax,
      taxPercentage,
      total,
    };
  };

  const calculateTotal = () => {
    return calculatePricing().total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare repairs data with full details
      const repairsData = selectedRepairs.map((repairId) => {
        const repair = repairs.find((r) => r.id === repairId);
        const quality = repairPartQuality[repairId];
        
        // Get quality options from backend data
        const modelRepair = (selectedModel as any)?.repairs?.find(
          (r: any) => {
            const rId = typeof r.repairId === "object" 
              ? (r.repairId?._id ?? r.repairId?.id) 
              : r.repairId;
            return rId === repairId;
          }
        );
        const qualityOptions = modelRepair?.qualityPrices || [];
        const selectedQualityOption = quality && qualityOptions.length > 0
          ? qualityOptions.find((q: any) => q.id === quality)
          : null;

        return {
          id: repair?.id,
          name: repair?.name,
          price: getRepairPrice(repairId),
          duration: repair?.duration,
          partQuality: selectedQualityOption ? {
            type: quality,
            name: selectedQualityOption.name,
          } : undefined,
        };
      });

      // Get color details
      const colorDetails = selectedModel?.colors.find(
        (c) => c.id === selectedColor
      );

      // Get pricing breakdown
      const pricing = calculatePricing();

      const quoteData = {
        deviceType: selectedDeviceType,
        brand: {
          id: selectedBrand?.id,
          name: selectedBrand?.name,
        },
        model: {
          id: selectedModel?.id,
          name: selectedModel?.name,
        },
        color: {
          id: selectedColor,
          name: colorDetails?.name || selectedColor,
        },
        repairs: repairsData,
        serviceMethod,
        customerType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        // Add booking data for location service
        bookingDate: serviceMethod === "location" ? bookingDate?.toISOString() : undefined,
        bookingTimeSlot: serviceMethod === "location" ? bookingTimeSlot : undefined,
        // Add shipping address for pickup service
        shippingAddress: serviceMethod === "pickup" ? shippingAddress : undefined,
        pricing: {
          subtotal: pricing.subtotal,
          discount: pricing.discount,
          discountRuleName: pricing.appliedDiscountRules?.length
            ? pricing.appliedDiscountRules.map((r: any) => r.name).filter(Boolean).join(" + ")
            : pricing.discountRule?.name,
          discountRules: pricing.appliedDiscountRules || [],
          discountPercentTotal: pricing.combinedDiscountPercent || 0,
          tax: pricing.tax,
          taxPercentage: pricing.taxPercentage,
          total: pricing.total,
        },
        total: pricing.total,
      };

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Quote request submitted successfully!", {
          description:
            "We'll contact you shortly to confirm your booking. Check your email for confirmation.",
          duration: 6000,
        });

        // Reset form and go back to start
        setTimeout(() => {
          setStep("device-type");
          setSelectedDeviceType("");
          setSelectedBrand(null);
          setSelectedModel(null);
          setSelectedColor("black");
          setSelectedRepairs([]);
          setServiceMethod("");
          setCustomerType("private");
          setFormData({
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            notes: "",
          });
        }, 2000);
      } else {
        toast.error("Failed to submit quote request", {
          description: data.error || "Please try again later.",
        });
      }
    } catch (error) {
      // console.error("Error submitting quote:", error);
      toast.error("Failed to submit quote request", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModelCountForBrand = (brandId: string) => {
    return models.filter(model => model.brandId === brandId && (!selectedDeviceType || model.deviceType === selectedDeviceType)).length;
  };

  const displayedRepairs = showAllRepairs
    ? getFilteredRepairs()
    : getFilteredRepairs().slice(0, 6);

  return (
    <>
      <LpNavbar1 />
      <div className="min-h-screen bg-background">
        {/* Progress Steps */}
        <div className="bg-secondary border-b">
          <div className="container-padding-x container mx-auto py-6">
            <div className="flex items-center justify-center gap-8">
              <div
                className={`flex items-center gap-2 ${
                  step === "device-type" ||
                  step === "brand" ||
                  step === "model" ||
                  step === "color"
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step === "device-type" ||
                    step === "brand" ||
                    step === "model" ||
                    step === "color"
                      ? "bg-primary text-white"
                      : "bg-muted"
                  }`}
                >
                  1
                </span>
                <span className="hidden sm:inline">Select device</span>
              </div>
              <div className="h-px w-16 bg-border"></div>
              <div
                className={`flex items-center gap-2 ${
                  step === "repair"
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step === "repair" ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  2
                </span>
                <span className="hidden sm:inline">Select repair</span>
              </div>
              <div className="h-px w-16 bg-border"></div>
              <div
                className={`flex items-center gap-2 ${
                  step === "finalize"
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step === "finalize" ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  3
                </span>
                <span className="hidden sm:inline">Finalize order</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container-padding-x container mx-auto py-12">
          {/* Loading State */}
          {isLoadingData && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">
                {isLoadingBrands && isLoadingModels && isLoadingRepairs
                  ? "Loading devices and repairs..."
                  : isLoadingBrands
                  ? "Loading device brands..."
                  : isLoadingModels
                  ? "Loading device models..."
                  : "Loading repair services..."}
              </p>
            </div>
          )}

          {/* Step 1: Select Device Type */}
          {!isLoadingData && step === "device-type" && (
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="text-center">
                <h1 className="heading-lg mb-4">
                  Which <span className="text-primary">model</span> do you have?
                </h1>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Type in your <strong>brand, model</strong> or{" "}
                  <strong>model code</strong>
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search: iPhone 12 Pro Max, Galaxy S24, A2783..."
                    value={searchQuery}
                    onChange={(e) => performSearch(e.target.value)}
                    className="pr-10 h-12 text-lg"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults({ brands: [], models: [] });
                      }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Find My Model Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowFindModelDialog(true)}
                    className="gap-2"
                  >
                    <Info className="h-4 w-4" />
                    How to find my model?
                  </Button>
                </div>

                {searchQuery &&
                  (searchResults.brands.length > 0 ||
                    searchResults.models.length > 0) && (
                    <div className="mt-2 bg-white dark:bg-gray-900 border rounded-lg shadow-lg max-h-[500px] overflow-y-auto">
                      <div className="p-4">
                        {/* Direct Model Results */}
                        {searchResults.models.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold text-primary">
                                Direct Matches ({searchResults.models.length})
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                Models
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {searchResults.models.slice(0, 6).map((model) => {
                                const brand = brands.find(
                                  (b) => b.id === model.brandId
                                );
                                return (
                                  <button
                                    key={model.id}
                                    onClick={() =>
                                      handleSearchModelSelect(model)
                                    }
                                    className="flex items-center gap-3 p-3 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                                  >
                                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                                      {model.deviceType === "smartphone" && (
                                        <Smartphone className="h-6 w-6 text-primary" />
                                      )}
                                      {model.deviceType === "tablet" && (
                                        <Tablet className="h-6 w-6 text-primary" />
                                      )}
                                      {model.deviceType === "laptop" && (
                                        <Laptop className="h-6 w-6 text-primary" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm truncate">
                                        {model.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {brand?.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {model.variants.join(", ")}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {searchResults.models.length > 6 && (
                              <p className="text-xs text-muted-foreground mt-2 text-center">
                                +{searchResults.models.length - 6} more results
                              </p>
                            )}
                          </div>
                        )}

                        {/* Brand Results */}
                        {searchResults.brands.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold">
                                Brands ({searchResults.brands.length})
                              </p>
                              <Badge variant="outline" className="text-xs">
                                Browse by brand
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {searchResults.brands.map((brand) => (
                                <button
                                  key={brand.id}
                                  onClick={() => handleBrandSelect(brand)}
                                  className="p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
                                >
                                  {brand.logo && (
                                    <div className="h-8 w-8 mx-auto mb-2">
                                      <Image
                                        src={brand.logo}
                                        alt={brand.name}
                                        width={32}
                                        height={32}
                                        className="object-contain filter grayscale hover:grayscale-0"
                                      />
                                    </div>
                                  )}
                                  <p className="font-semibold text-sm">
                                    {brand.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {brand.deviceTypes.join(", ")}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {searchQuery &&
                  searchResults.brands.length === 0 &&
                  searchResults.models.length === 0 && (
                    <div className="mt-2 bg-white dark:bg-gray-900 border rounded-lg shadow-lg p-6 text-center">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="font-semibold mb-2">No results found</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try searching for brand name, model name, or model code
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFindModelDialog(true)}
                      >
                        <Info className="h-4 w-4 mr-2" />
                        How to find my model
                      </Button>
                    </div>
                  )}

                <div className="flex items-center gap-4">
                  <Dialog
                    open={showFindModelDialog}
                    onOpenChange={setShowFindModelDialog}
                  >
                    {/* <DialogTrigger asChild>
                      <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors text-sm">
                        <Info className="h-4 w-4" />
                        Find my model
                      </button>
                    </DialogTrigger> */}
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">
                          How to Find Your Device Model
                        </DialogTitle>
                        <DialogDescription>
                          Follow these simple steps to locate your device model
                          information
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 mt-4">
                        {/* iOS Devices */}
                        <div className="border rounded-lg p-4 bg-secondary/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Smartphone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">
                                iOS (iPhone/iPad)
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Apple devices
                              </p>
                            </div>
                          </div>
                          <ol className="space-y-3 text-sm">
                            <li className="flex gap-3">
                              <span className="font-bold text-primary shrink-0">
                                1.
                              </span>
                              <span>
                                Go to <strong>Settings</strong> app on your
                                device
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="font-bold text-primary shrink-0">
                                2.
                              </span>
                              <span>
                                Tap <strong>General</strong> →{" "}
                                <strong>About</strong>
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="font-bold text-primary shrink-0">
                                3.
                              </span>
                              <span>
                                Look for <strong>Model Name</strong> (e.g.,
                                iPhone 15 Pro) and <strong>Model Number</strong>{" "}
                                (e.g., A2848)
                              </span>
                            </li>
                          </ol>
                        </div>

                        {/* Android Devices */}
                        <div className="border rounded-lg p-4 bg-secondary/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Smartphone className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">
                                Android Devices
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Samsung, Google, etc.
                              </p>
                            </div>
                          </div>
                          <ol className="space-y-3 text-sm">
                            <li className="flex gap-3">
                              <span className="font-bold text-green-600 shrink-0">
                                1.
                              </span>
                              <span>
                                Open <strong>Settings</strong> app
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="font-bold text-green-600 shrink-0">
                                2.
                              </span>
                              <span>
                                Scroll down to <strong>About Phone</strong> or{" "}
                                <strong>About Device</strong>
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="font-bold text-green-600 shrink-0">
                                3.
                              </span>
                              <span>
                                Find <strong>Model Name</strong> and{" "}
                                <strong>Model Number</strong> (e.g., SM-S928 for
                                Galaxy S24 Ultra)
                              </span>
                            </li>
                          </ol>
                        </div>

                        {/* Laptops */}
                        <div className="border rounded-lg p-4 bg-secondary/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <Laptop className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">Laptops</h3>
                              <p className="text-xs text-muted-foreground">
                                Windows & Mac
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4 text-sm">
                            <div>
                              <p className="font-semibold mb-2">Windows:</p>
                              <ol className="space-y-2 ml-4">
                                <li>
                                  • Press{" "}
                                  <kbd className="px-2 py-1 bg-secondary rounded text-xs">
                                    Win
                                  </kbd>{" "}
                                  +{" "}
                                  <kbd className="px-2 py-1 bg-secondary rounded text-xs">
                                    R
                                  </kbd>
                                </li>
                                <li>
                                  • Type{" "}
                                  <code className="bg-secondary px-2 py-1 rounded">
                                    msinfo32
                                  </code>{" "}
                                  and press Enter
                                </li>
                                <li>• Check System Model</li>
                              </ol>
                            </div>
                            <div>
                              <p className="font-semibold mb-2">Mac:</p>
                              <ol className="space-y-2 ml-4">
                                <li>
                                  • Click Apple menu →{" "}
                                  <strong>About This Mac</strong>
                                </li>
                                <li>
                                  • View model information (e.g., MacBook Pro
                                  14" M4)
                                </li>
                              </ol>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex gap-3">
                            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Pro Tip
                              </p>
                              <p className="text-blue-800 dark:text-blue-200">
                                The model number is usually more accurate for
                                searching. You can also check the original box
                                or receipt for this information.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Or select your <strong>type</strong>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DEVICE_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          setSelectedDeviceType(type.id);
                          setStep("brand");
                        }}
                        className="p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <Icon className="h-12 w-12 mx-auto mb-3 text-primary" />
                        <p className="font-semibold text-lg">{type.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Brand */}
          {!isLoadingData && step === "brand" && (
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBackClick}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="heading-lg">
                  Select your <span className="text-primary">brand</span>
                </h1>
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 h-12 text-lg"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>

              {/* Find My Model Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFindModelDialog(true)}
                  className="gap-2"
                >
                  <Info className="h-4 w-4" />
                  How to find my model?
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {getFilteredBrands().map((brand) => {
                  const modelCount = getModelCountForBrand(brand.id);
                  return (
                    <button
                      key={brand.id}
                      onClick={() => handleBrandSelect(brand)}
                      className="p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group relative"
                    >
                      {modelCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-10">
                          {modelCount}
                        </div>
                      )}
                      {brand.logo ? (
                        <div className="h-18 w-18 mx-auto flex items-center justify-center">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={58}
                            height={58}
                            className="object-contain  transition-all"
                          />
                        </div>
                      ) : (
                        <div className="text-4xl mb-2">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                      {/* <p className="font-semibold text-sm">{brand.name}</p> */}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Select Model */}
          {!isLoadingData && step === "model" && selectedBrand && (
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBackClick}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="heading-lg">
                  {(selectedBrand && selectedBrand.name) || selectedModel?.brandName || ""} -{" "}
                  <span className="text-primary">Select Model</span>
                </h1>
              </div>

              {/* Find My Model Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFindModelDialog(true)}
                  className="gap-2"
                >
                  <Info className="h-4 w-4" />
                  How to find my model?
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {getFilteredModels().map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className="group"
                  >
                    <div className="border-2 rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-all">
                      <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {model.image ? (
                          <Image
                            src={model.image}
                            alt={model.name}
                            width={150}
                            height={150}
                            className="object-contain w-full h-full p-2"
                          />
                        ) : (
                          <div className="text-6xl">
                            {model.deviceType === "smartphone"
                              ? "📱"
                              : model.deviceType === "tablet"
                              ? "📱"
                              : "💻"}
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-center">
                        {model.name}
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {model.variants.join(", ")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Select Color */}
          {!isLoadingData && step === "color" && selectedModel && (
            <div className="mx-auto max-w-6xl">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left side - Device preview */}
                <div className="flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="bg-secondary/30 rounded-2xl p-8 inline-block">
                      {selectedModel.image ? (
                        <Image
                          src={selectedModel.image}
                          alt={selectedModel.name}
                          width={300}
                          height={300}
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-72 h-72 flex items-center justify-center text-9xl">
                          {selectedModel.deviceType === "smartphone"
                            ? "📱"
                            : selectedModel.deviceType === "tablet"
                            ? "📱"
                            : "💻"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedModel.name}
                      </h2>
                      <p className="text-muted-foreground">
                        {selectedBrand?.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected:{" "}
                        {selectedModel.colors.find(
                          (c) => c.id === selectedColor
                        )?.name || selectedColor}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side - Color selection */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleBackClick}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <h1 className="heading-lg">Select Color</h1>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred color
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Available <strong>colors</strong>
                    </Label>
                    <div className="flex flex-wrap gap-4">
                      {selectedModel.colors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color.id)}
                          className={`group relative`}
                          title={color.name}
                        >
                          <div
                            className={`h-16 w-16 rounded-full border-4 transition-all shadow-md hover:scale-110 ${
                              selectedColor === color.id
                                ? "border-primary ring-4 ring-primary ring-offset-2 scale-110"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={{ backgroundColor: color.hex }}
                          />
                          {selectedColor === color.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check
                                className="h-6 w-6 text-white drop-shadow-lg"
                                style={{
                                  filter:
                                    color.hex === "#FFFFFF" ||
                                    color.hex === "#F5F5F7" ||
                                    color.hex === "#F5F5DC" ||
                                    color.hex === "#E5E5EA"
                                      ? "invert(1)"
                                      : "none",
                                }}
                              />
                            </div>
                          )}
                          <p className="text-xs text-center mt-2 font-medium">
                            {color.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep("repair")}
                      size="lg"
                      className="w-full lg:w-auto"
                    >
                      Continue to Repairs
                      <span className="ml-2">→</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Select Repairs */}
          {!isLoadingData && step === "repair" && selectedModel && (
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBackClick}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="heading-lg">{selectedModel.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedBrand?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Select <strong>repair</strong>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedRepairs.map((repair) => {
                    const RepairIcon = getRepairIcon(repair.id);
                    const isSelected = selectedRepairs.includes(repair.id);
                    
                    // Get the model-specific pricing for this repair
                    const modelRepair = (selectedModel as any).repairs?.find(
                      (r: any) => {
                        const rId = typeof r.repairId === "object" 
                          ? (r.repairId?._id ?? r.repairId?.id) 
                          : r.repairId;
                        return String(rId) === String(repair.id);
                      }
                    );
                    
                    // Check if repair has quality options from backend
                    const hasQualityOptions = modelRepair?.qualityPrices && modelRepair.qualityPrices.length > 0;
                    const selectedQuality = repairPartQuality[repair.id];
                    
                    // Debug logging for quality options
                    // console.log(`Repair ${repair.id} has quality options:`, hasQualityOptions);
                    // console.log(`Selected quality for ${repair.id}:`, selectedQuality);
                    // console.log(`Quality prices for ${repair.id}:`, modelRepair?.qualityPrices);
                    
                    // Use model-specific base price
                    const displayPrice = modelRepair?.basePrice ?? 0;
                    
                    return (
                      <Card
                        key={repair.id}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleRepairToggle(repair.id)}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <RepairIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">
                                  {repair.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(repair.duration)}
                                </p>
                              </div>
                            </div>
                            <Checkbox checked={isSelected} />
                          </div>
                          {repair.badge && (
                            <Badge variant="destructive" className="mb-2">
                              {repair.badge}
                            </Badge>
                          )}
                          {isSelected && selectedQuality && hasQualityOptions && (() => {
                            const selectedQualityData = modelRepair?.qualityPrices?.find(
                              (qp: any) => qp.id === selectedQuality
                            );
                            // Find quality details from repair data
                            const repairData = repairs.find((r) => r.id === repair.id);
                            const qualityDetails = (repairData as any)?.qualityOptions?.find((q: any) => q.id === selectedQuality);
                            
                            return selectedQualityData ? (
                              <Badge variant="secondary" className="mb-2">
                                {qualityDetails?.name || selectedQualityData.name || selectedQuality}
                              </Badge>
                            ) : null;
                          })()}
                          <p className="text-sm text-muted-foreground mb-3">
                            {(() => {
                              console.log(`Repair ${repair.id} description:`, repair?.description);
                              return repair?.description || "Professional repair service for your device";
                            })()}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-primary">
                              {(() => {
                                const actualPrice = isSelected ? getRepairPrice(repair.id) : displayPrice;
                                return actualPrice === 0 ? (
                                  <span className="text-base">Price on request</span>
                                ) : (
                                  `$${actualPrice}`
                                );
                              })()}
                            </p>
                            {hasQualityOptions && displayPrice > 0 && (
                              <span className="text-xs text-muted-foreground">
                                starting at
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {getFilteredRepairs().length > 6 && !showAllRepairs && (
                  <div className="text-center">
                    <Button
                      variant="destructive"
                      onClick={() => setShowAllRepairs(true)}
                      className="mt-4"
                    >
                      show all {getFilteredRepairs().length} repairs ↓
                    </Button>
                  </div>
                )}
              </div>

              {selectedRepairs.length > 0 && (
                <Card className="p-6 space-y-4 sticky top-4">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    {selectedModel?.image ? (
                      <Image
                        src={selectedModel.image}
                        alt={selectedModel.name}
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center text-3xl">
                        📱
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {selectedModel?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedBrand?.name || selectedModel?.brandName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Color:{" "}
                        {selectedModel?.colors.find(
                          (c) => c.id === selectedColor
                        )?.name || selectedColor}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">
                      Selected Services ({selectedRepairs.length})
                    </h4>
                    {selectedRepairs.map((repairId) => {
                      const repair = repairs.find(
                        (r) => r.id === repairId
                      );
                      if (!repair) return null;
                      const RepairIcon = getRepairIcon(repair.id);
                      const quality = repairPartQuality[repairId];
                      
                      return (
                        <div
                          key={repairId}
                          className="flex items-center justify-between py-2 border-b"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <RepairIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {repair.name}
                              </p>
                              {quality && (() => {
                                const modelRepair = (selectedModel as any)?.repairs?.find(
                                  (r: any) => {
                                    const rId = typeof r.repairId === "object" 
                                      ? (r.repairId?._id ?? r.repairId?.id) 
                                      : r.repairId;
                                    return rId === repairId;
                                  }
                                );
                                const qualityData = modelRepair?.qualityPrices?.find(
                                  (qp: any) => qp.id === quality
                                );
                                // Find quality details from repair data
                                const repairData = repairs.find((r) => r.id === repairId);
                                const qualityDetails = (repairData as any)?.qualityOptions?.find((q: any) => q.id === quality);
                                
                                return qualityData ? (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {qualityDetails?.name || qualityData.name || quality}
                                  </Badge>
                                ) : null;
                              })()}
                              <p className="text-xs text-muted-foreground">
                                {formatDuration(repair.duration)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {getRepairPrice(repairId) === 0 ? "Price on request" : `$${getRepairPrice(repairId)}`}
                            </p>
                            <button
                              onClick={() => handleRepairToggle(repairId)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 space-y-2">
                    {(() => {
                      const pricing = calculatePricing();
                      return (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <p className="text-muted-foreground">Subtotal</p>
                            <p className="font-semibold">${pricing.subtotal.toFixed(2)}</p>
                          </div>

                          {pricing.appliedDiscountRules && pricing.appliedDiscountRules.length > 0 && (
                            <div className="rounded-md border bg-primary/5 p-3 text-sm">
                              <p className="font-semibold mb-2">Applied Offers</p>
                              <ul className="space-y-1">
                                {pricing.appliedDiscountRules.map((r, idx) => (
                                  <li key={idx} className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                      {r.name || (r.minRepairs ? `${r.minRepairs}+ repairs` : r.minSubtotal ? `Subtotal ≥ $${r.minSubtotal}` : "Offer")} — {r.type === "percentage" ? `${r.value}% off` : `$${r.value} off`}
                                    </span>
                                    <span className="text-green-600">-${r.amount.toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {pricing.discount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <p className="text-muted-foreground">
                                Discount
                                <span className="ml-1 text-xs">
                                  {pricing.combinedDiscountPercent > 0 ? `(${pricing.combinedDiscountPercent}%` : "("}
                                  {pricing.appliedDiscountRules?.some(r => r.type === "fixed") ? `${pricing.combinedDiscountPercent > 0 ? " + " : ""}$${pricing.appliedDiscountRules.filter((r:any)=>r.type==="fixed").reduce((s:number,r:any)=>s+r.amount,0).toFixed(2)}` : ""}
                                  )
                                </span>
                              </p>
                              <p className="text-green-600 font-semibold">
                                -${pricing.discount.toFixed(2)}
                              </p>
                            </div>
                          )}

                          {pricing.taxPercentage > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <p className="text-muted-foreground">Tax ({pricing.taxPercentage}%)</p>
                              <p className="font-semibold">${pricing.tax.toFixed(2)}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <p className="text-lg font-bold">Total</p>
                            <p className="text-3xl font-bold text-primary">${pricing.total.toFixed(2)}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <Button
                    onClick={() => setStep("finalize")}
                    className="w-full"
                    size="lg"
                  >
                    Continue to Final Step
                    <span className="ml-2">→</span>
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Step 6: Finalize Order */}
          {!isLoadingData && step === "finalize" && (
            <div className="mx-auto max-w-6xl">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={handleBackClick}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="heading-lg">
                  Finalize <span className="text-primary">booking</span>
                </h1>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">
                      Select Service Method
                    </Label>
                    <RadioGroup
                      value={serviceMethod}
                      onValueChange={setServiceMethod}
                      className="space-y-3"
                    >
                      {SERVICE_METHODS.map((method) => {
                        const ServiceIcon =
                          method.id === "location" ? Home : Package;
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              serviceMethod === method.id
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem value={method.id} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <ServiceIcon className="h-5 w-5 text-primary" />
                                <p className="font-semibold">{method.title}</p>
                                <Badge
                                  variant="destructive"
                                  className="ml-auto"
                                >
                                  {method.badge}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {method.subtitle}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  {/* Booking Date/Time for Location Service */}
                  {serviceMethod === "location" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Select Your Appointment
                      </h3>
                      
                      <div className="space-y-2">
                        <Label>
                          Select Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={bookingDate ? bookingDate.toISOString().split("T")[0] : ""}
                          onChange={(e) => {
                            setBookingDate(e.target.value ? new Date(e.target.value) : null);
                            setBookingTimeSlot(""); // Reset time slot when date changes
                          }}
                          required
                        />
                      </div>

                      {bookingDate && (
                        <div className="space-y-2">
                          <Label>
                            Select Time Slot <span className="text-red-500">*</span>
                          </Label>
                          {isLoadingSlots ? (
                            <div className="text-sm text-muted-foreground">Loading available slots...</div>
                          ) : availableSlots.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No time slots configured for this date</div>
                          ) : availableSlots.filter(slot => slot.isAvailable).length === 0 ? (
                            <div className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200">
                              All time slots are booked for this date. Please select a different date.
                            </div>
                          ) : (
                            <RadioGroup
                              value={bookingTimeSlot}
                              onValueChange={setBookingTimeSlot}
                              className="grid grid-cols-2 gap-2"
                            >
                              {availableSlots.map((slot) => {
                                const isPast = isTimeSlotPast(bookingDate, slot.label);
                                const isDisabled = slot.isBooked || isPast;
                                
                                return (
                                  <label
                                    key={slot.id}
                                    className={`flex items-center gap-2 p-3 border-2 rounded-lg text-sm transition-all ${
                                      isDisabled
                                        ? "border-red-300 bg-red-50 cursor-not-allowed opacity-60"
                                        : bookingTimeSlot === slot.label
                                        ? "border-primary bg-primary/5 cursor-pointer"
                                        : "hover:border-primary/50 cursor-pointer"
                                    }`}
                                  >
                                    <RadioGroupItem
                                      value={slot.label}
                                      disabled={isDisabled}
                                    />
                                    <span className="flex-1">{slot.label}</span>
                                    {slot.isBooked && (
                                      <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded">
                                        BOOKED
                                      </span>
                                    )}
                                    {isPast && !slot.isBooked && (
                                      <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded">
                                        PAST
                                      </span>
                                    )}
                                  </label>
                                );
                              })}
                            </RadioGroup>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shipping Address for Pickup Service */}
                  {serviceMethod === "pickup" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Your Pickup Address
                      </h3>

                      {/* Shipping Terms Note */}
                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          SEND YOUR DEVICE TO
                        </h4>
                        <div className="font-mono text-sm bg-white dark:bg-gray-800 p-3 rounded border">
                          PO Box 530133<br />
                          Saint Petersburg, FL 33747
                        </div>
                        <p className="text-xs text-blue-800 dark:text-blue-200 italic">
                          *Use this address exactly as shown, company name is not required.
                        </p>

                        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                          <h5 className="font-semibold">TERMS FOR SENDING DEVICE</h5>
                          <ul className="space-y-1 list-disc list-inside">
                            <li>You'll be responsible for shipping costs each way.</li>
                            <li>We aim to repair each device and ship it back out the same day it arrives!</li>
                            <li>Pack your device as securely as possible to prevent further damage.</li>
                            <li>If the frame (metal bezel between the screen and back glass) is bent, curved, or cracked, please text us a video of the condition for accurate pricing <strong>727.657.8390</strong></li>
                            <li>Please be sure to send a tracking number for the shipment so that we can plan for its arrival.</li>
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>
                            HOUSE NUMBER <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            required
                            value={shippingAddress.houseNumber}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                houseNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            STREETNAME <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            required
                            value={shippingAddress.streetName}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                streetName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>
                            CITY <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            required
                            value={shippingAddress.city}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                city: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            ZIPCODE <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            required
                            value={shippingAddress.zipcode}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                zipcode: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          COUNTRY <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          required
                          value={shippingAddress.country}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              country: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCustomerType("private")}
                        className={`flex-1 p-3 border-2 rounded-lg font-semibold transition-all ${
                          customerType === "private"
                            ? "border-primary bg-primary text-white"
                            : "hover:border-primary"
                        }`}
                      >
                        Private
                      </button>
                      <button
                        onClick={() => setCustomerType("business")}
                        className={`flex-1 p-3 border-2 rounded-lg font-semibold transition-all ${
                          customerType === "business"
                            ? "border-primary bg-primary text-white"
                            : "hover:border-primary"
                        }`}
                      >
                        Business
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          FIRST NAME <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          LAST NAME <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        PHONE <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        EMAIL <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">NOTES</Label>
                      <Textarea
                        id="notes"
                        rows={4}
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={
                        !serviceMethod || 
                        isSubmitting ||
                        (serviceMethod === "location" && (!bookingDate || !bookingTimeSlot)) ||
                        (serviceMethod === "pickup" && (!shippingAddress.houseNumber || !shippingAddress.streetName || !shippingAddress.city || !shippingAddress.zipcode))
                      }
                    >
                      {isSubmitting ? (
                        <>
                          Sending...
                          <br />
                          <span className="text-xs">Please wait</span>
                        </>
                      ) : (
                        <>
                          Confirm Booking
                          <br />
                          <span className="text-xs">
                            You can cancel anytime
                          </span>
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">Order Summary</h3>

                    <div className="flex items-center gap-4 pb-4 border-b mb-4">
                      {selectedModel?.image ? (
                        <Image
                          src={selectedModel.image}
                          alt={selectedModel.name}
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center text-3xl">
                          {selectedModel?.deviceType === "smartphone"
                            ? "📱"
                            : selectedModel?.deviceType === "tablet"
                            ? "📱"
                            : "💻"}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold">{selectedModel?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedBrand?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Color:{" "}
                          {selectedModel?.colors.find(
                            (c) => c.id === selectedColor
                          )?.name || selectedColor}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <p className="font-semibold text-sm">
                        Services ({selectedRepairs.length})
                      </p>
                      {selectedRepairs.map((repairId) => {
                        const repair = repairs.find(
                          (r) => r.id === repairId
                        );
                        if (!repair) return null;
                        const RepairIcon = getRepairIcon(repair.id);
                        const quality = repairPartQuality[repairId];
                        
                        return (
                          <div
                            key={repairId}
                            className="flex items-center justify-between py-2 border-b"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <RepairIcon className="h-4 w-4 text-primary shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {repair.name}
                                </p>
                                {quality && (() => {
                                  const modelRepair = (selectedModel as any)?.repairs?.find(
                                    (r: any) => {
                                      const rId = typeof r.repairId === "object" 
                                        ? (r.repairId?._id ?? r.repairId?.id) 
                                        : r.repairId;
                                      return rId === repairId;
                                    }
                                  );
                                  const qualityData = modelRepair?.qualityPrices?.find(
                                    (qp: any) => qp.id === quality
                                  );
                                  // Find quality details from repair data
                                  const repairData = repairs.find((r) => r.id === repairId);
                                  const qualityDetails = (repairData as any)?.qualityOptions?.find((q: any) => q.id === quality);
                                  
                                  return qualityData ? (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {qualityDetails?.name || qualityData.name || quality}
                                    </Badge>
                                  ) : null;
                                })()}
                                <p className="text-xs text-muted-foreground">
                                  {formatDuration(repair.duration)}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold">
                              {getRepairPrice(repairId) === 0 ? "Price on request" : `$${getRepairPrice(repairId)}`}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      {(() => {
                        const pricing = calculatePricing();
                        return (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <p className="text-muted-foreground">Subtotal</p>
                              <p className="font-semibold">${pricing.subtotal.toFixed(2)}</p>
                            </div>

                            {pricing.appliedDiscountRules && pricing.appliedDiscountRules.length > 0 && (
                              <div className="rounded-md border bg-primary/5 p-3 text-sm">
                                <p className="font-semibold mb-2">Applied Offers</p>
                                <ul className="space-y-1">
                                  {pricing.appliedDiscountRules.map((r, idx) => (
                                    <li key={idx} className="flex items-center justify-between">
                                      <span className="text-muted-foreground">
                                        {r.name || (r.minRepairs ? `${r.minRepairs}+ repairs` : r.minSubtotal ? `Subtotal ≥ $${r.minSubtotal}` : "Offer")} — {r.type === "percentage" ? `${r.value}% off` : `$${r.value} off`}
                                      </span>
                                      <span className="text-green-600">-${r.amount.toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {pricing.discount > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <p className="text-muted-foreground">
                                  Discount
                                  <span className="ml-1 text-xs">
                                    {pricing.combinedDiscountPercent > 0 ? `(${pricing.combinedDiscountPercent}%` : "("}
                                    {pricing.appliedDiscountRules?.some(r => r.type === "fixed") ? `${pricing.combinedDiscountPercent > 0 ? " + " : ""}$${pricing.appliedDiscountRules.filter((r:any)=>r.type==="fixed").reduce((s:number,r:any)=>s+r.amount,0).toFixed(2)}` : ""}
                                    )
                                  </span>
                                </p>
                                <p className="text-green-600 font-semibold">-${pricing.discount.toFixed(2)}</p>
                              </div>
                            )}

                            {pricing.taxPercentage > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <p className="text-muted-foreground">Tax ({pricing.taxPercentage}%)</p>
                                <p className="font-semibold">${pricing.tax.toFixed(2)}</p>
                              </div>
                            )}
                            <div className="bg-primary/10 p-4 rounded-lg mt-3">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-lg">Total</p>
                                <p className="text-3xl font-bold text-primary">${pricing.total.toFixed(2)}</p>
                              </div>
                              {pricing.taxPercentage > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">Incl. {pricing.taxPercentage}% tax</p>
                              )}
                              {pricing.discount > 0 && (
                                <p className="text-xs text-green-600 mt-1">You saved ${pricing.discount.toFixed(2)}!</p>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </Card>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p className="text-xs">
                      total:{" "}
                      <span className="font-bold">
                        ${calculateTotal().toFixed(2)}
                      </span>{" "}
                      incl. 0% tax
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Part Quality Selection Dialog */}
      <Dialog open={showPartQualityDialog} onOpenChange={setShowPartQualityDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Part Quality</DialogTitle>
            <DialogDescription>
              Choose the quality of the part for your repair. Both options come with warranty.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRepairForQuality && selectedModel && (() => {
            // Find the model-specific repair pricing
            const modelRepair = (selectedModel as any).repairs?.find(
              (r: any) => {
                const rId = typeof r.repairId === "object" 
                  ? (r.repairId?._id ?? r.repairId?.id) 
                  : r.repairId;
                return String(rId) === String(selectedRepairForQuality);
              }
            );

            if (!modelRepair || !modelRepair.qualityPrices || modelRepair.qualityPrices.length === 0) {
              // Fallback: show default quality options
              const defaultOptions = [
                { id: "official", name: "Official", description: "Made by the brand's Manufacturer", price: 0 },
                { id: "compatible", name: "Compatible", description: "Best available alternative from an Independent Manufacturer", price: 0 }
              ];
              
              return (
                <div className="grid gap-4 py-4">
                  {defaultOptions.map((option) => (
                    <Card
                      key={option.id}
                      className="cursor-pointer transition-all hover:border-primary"
                      onClick={() => handlePartQualitySelect(option.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-xl mb-2">
                              {option.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-3xl font-bold text-primary">
                              <span className="text-base">Price on request</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            }

            // Get quality option details from the repair
            const repairData = repairs.find((r) => r.id === selectedRepairForQuality);
            const qualityOptions = (repairData as any)?.qualityOptions || [];
            
            // console.log("Selected Repair ID:", selectedRepairForQuality);
            // console.log("Repair Data:", repairData);
            // console.log("Quality Options from repair:", qualityOptions);
            // console.log("All repairs array:", repairs.map(r => ({ id: r.id, name: (r as any).name })));

            return (
              <div className="grid gap-4 py-4">
                {modelRepair.qualityPrices.map((qualityPrice: any) => {
                  // Debug logging
                  // console.log("Quality Price Data:", qualityPrice);
                  // console.log("Quality Name:", qualityPrice.name);
                  // console.log("Quality Description:", qualityPrice.description);
                  // console.log("Quality Duration:", qualityPrice.duration);
                  // console.log("Quality Price:", qualityPrice.price);
                  
                  // Find matching quality option details from repair data
                  const qualityDetails = qualityOptions.find((q: any) => q.id === qualityPrice.id);
                  // console.log("Matching quality details for id", qualityPrice.id, ":", qualityDetails);
                  
                  return (
                    <Card
                      key={qualityPrice.id}
                      className="cursor-pointer transition-all hover:border-primary"
                      onClick={() => handlePartQualitySelect(qualityPrice.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-xl mb-2">
                              {qualityDetails?.name || qualityPrice.name || qualityPrice.id}
                            </h3>
                            {qualityDetails?.description && (
                              <p className="text-sm text-muted-foreground">
                                {qualityDetails.description}
                              </p>
                            )}
                            {!qualityDetails?.description && qualityPrice.description && (
                              <p className="text-sm text-muted-foreground">
                                {qualityPrice.description}
                              </p>
                            )}
                            {qualityPrice.duration && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDuration(qualityPrice.duration)}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-3xl font-bold text-primary">
                              {qualityPrice.price === 0 ? (
                                <span className="text-base">Price on request</span>
                              ) : (
                                `$${qualityPrice.price}`
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Find My Model Dialog */}
      <Dialog open={showFindModelDialog} onOpenChange={setShowFindModelDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Find model or model code</DialogTitle>
            <DialogDescription>
              Follow the instructions below to find your device model number
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="ios" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ios">Apple iOS</TabsTrigger>
              <TabsTrigger value="android">Android</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ios" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-1">STEP 1</Badge>
                    <p className="text-sm flex-1">
                      Go to the <strong>'Settings'</strong> app on your iOS device.
                    </p>
                  </div>
                  <div className="relative w-full aspect-[9/16] max-w-xs mx-auto rounded-lg overflow-hidden border">
                    <Image
                      src="/ios/ios-step-1-min.jpg"
                      alt="iOS Step 1"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-1">STEP 2</Badge>
                    <p className="text-sm flex-1">
                      Tap on <strong>'General'</strong> in Settings and then on <strong>'About'</strong>.
                    </p>
                  </div>
                  <div className="relative w-full aspect-[9/16] max-w-xs mx-auto rounded-lg overflow-hidden border">
                    <Image
                      src="/ios/ios-step-2-min.jpg"
                      alt="iOS Step 2"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-1">STEP 3</Badge>
                    <p className="text-sm flex-1">
                      At <strong>'Model Name'</strong>, you will see the name. If you search by model code, you need in 2-code. Tap on <strong>'Model Number'</strong> to search by a 2-code.
                    </p>
                  </div>
                  <div className="relative w-full aspect-[9/16] max-w-xs mx-auto rounded-lg overflow-hidden border">
                    <Image
                      src="/ios/ios-step-3-min.jpg"
                      alt="iOS Step 3"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="android" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-1">STEP 1</Badge>
                    <p className="text-sm flex-1">
                      Go to the home screen of your device and tap on the <strong>'Settings'</strong> icon.
                    </p>
                  </div>
                  <div className="relative w-full aspect-[9/16] max-w-xs mx-auto rounded-lg overflow-hidden border">
                    <Image
                      src="/android/android-step-1-min.jpg"
                      alt="Android Step 1"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-1">STEP 2</Badge>
                    <p className="text-sm flex-1">
                      Look in the <strong>'Settings'</strong> menu for an option such as <strong>'About Phone'</strong>, <strong>'About Tablet'</strong>, <strong>'Device Information'</strong>, or something similar.
                    </p>
                  </div>
                  <div className="relative w-full aspect-[9/16] max-w-xs mx-auto rounded-lg overflow-hidden border">
                    <Image
                      src="/android/android-step-2-min.jpg"
                      alt="Android Step 2"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-1">STEP 3</Badge>
                    <p className="text-sm flex-1">
                      In the 'About Phone' menu, you will find information about your device, including the <strong>model name</strong> and <strong>model number</strong>.
                    </p>
                  </div>
                  <div className="relative w-full aspect-[9/16] max-w-xs mx-auto rounded-lg overflow-hidden border">
                    <Image
                      src="/android/android-step-3-min-m.jpg"
                      alt="Android Step 3"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Footer1 />
    </>
  );
}
