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

// Part quality options for repairs that support it
const PART_QUALITY_OPTIONS = {
  screen: [
    {
      id: "oem",
      name: "Original (OEM)",
      duration: "15 minutes",
      description: "Official authentic part made by the brand's manufacturer.",
      priceMultiplier: 1.4, // 40% more expensive
    },
    {
      id: "aftermarket",
      name: "Premium Aftermarket",
      duration: "15 minutes",
      description: "Best available alternative to original. Almost identical to original quality.",
      priceMultiplier: 1.0, // Base price
    },
  ],
  battery: [
    {
      id: "oem",
      name: "Original (OEM)",
      duration: "15 minutes",
      description: "Official authentic part made by the brand's manufacturer.",
      priceMultiplier: 1.4,
    },
    {
      id: "aftermarket",
      name: "Premium Aftermarket",
      duration: "15 minutes",
      description: "Best available alternative to original. Almost identical to original quality.",
      priceMultiplier: 1.0,
    },
  ],
};

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
  const [repairPartQuality, setRepairPartQuality] = useState<Record<string, "oem" | "aftermarket">>({});
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
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch brands, models, and repairs from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch brands
        const brandsRes = await fetch("/api/admin/brands?activeOnly=true");
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          console.log("Fetched brands for quote:", brandsData);
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

        // Fetch models (with populated repairs and pricing)
        const modelsRes = await fetch("/api/admin/models?activeOnly=true");
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          console.log("Fetched models for quote:", modelsData);
          const rawModels = modelsData.data || modelsData.models || [];
          const normalizedModels: DeviceModel[] = rawModels.map((m: any) => {
            // Handle brandId - it can be an ObjectId string or a populated object
            let extractedBrandId = "";
            if (typeof m.brandId === "string") {
              extractedBrandId = m.brandId;
            } else if (m.brandId && typeof m.brandId === "object") {
              // brandId is populated with brand object
              extractedBrandId = m.brandId._id ?? m.brandId.id ?? String(m.brandId._id);
            }

            return {
              id: m._id ?? m.id ?? String(m._id ?? m.id ?? ""),
              name: m.name || m.title || "",
              image: m.image || m.images?.[0] || "",
              variants: m.variants || m.modelCodes || [],
              brandId: extractedBrandId,
              deviceType: m.deviceType || m.type || "smartphone",
              colors: m.colors || m.colorOptions || [],
              // Pass through the raw repairs data for pricing
              repairs: m.repairs || [],
            } as any;
          });
          setModels(normalizedModels);
        }

        // Fetch repairs
        const repairsRes = await fetch("/api/admin/repairs?activeOnly=true");
        if (repairsRes.ok) {
          const repairsData = await repairsRes.json();
          console.log("Fetched repairs for quote:", repairsData);
          const rawRepairs = repairsData.data || repairsData.repairs || [];
          const normalizedRepairs: RepairItem[] = rawRepairs.map((r: any) => ({
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
          } as any));
          setRepairs(normalizedRepairs);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data", {
          description: "Some data couldn't be loaded. Please refresh the page.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

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
      setSelectedModel(model);
      if (model.colors && model.colors.length > 0) {
        setSelectedColor(model.colors[0].id);
      }
      setSearchQuery("");
      setSearchResults({ brands: [], models: [] });
      setStep("color");
    }
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
    if (!selectedDeviceType) return repairs;
    return repairs.filter((repair) =>
      repair.deviceTypes.includes(selectedDeviceType)
    );
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
    const hasQualityOptions = PART_QUALITY_OPTIONS[repairId as keyof typeof PART_QUALITY_OPTIONS];

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

  const handlePartQualitySelect = (quality: "oem" | "aftermarket") => {
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
        return rId === repairId || r.repairId === repairId;
      }
    );

    if (!modelRepair) {
      console.warn(`No pricing found for repair ${repairId} on model ${selectedModel.name}`);
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

  const calculateTotal = () => {
    return selectedRepairs.reduce((total, repairId) => {
      return total + getRepairPrice(repairId);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare repairs data with full details
      const repairsData = selectedRepairs.map((repairId) => {
        const repair = repairs.find((r) => r.id === repairId);
        const quality = repairPartQuality[repairId];
        const qualityOptions = PART_QUALITY_OPTIONS[repairId as keyof typeof PART_QUALITY_OPTIONS];
        const selectedQualityOption = quality && qualityOptions 
          ? qualityOptions.find((q) => q.id === quality)
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
        total: calculateTotal(),
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
      console.error("Error submitting quote:", error);
      toast.error("Failed to submit quote request", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <p className="text-muted-foreground">Loading devices and repairs...</p>
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
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors text-sm">
                        <Info className="h-4 w-4" />
                        Find my model
                      </button>
                    </DialogTrigger>
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
                {getFilteredBrands().map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand)}
                    className="p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
                  >
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
                ))}
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
                  {selectedBrand.name} -{" "}
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
                    const hasQualityOptions = PART_QUALITY_OPTIONS[repair.id as keyof typeof PART_QUALITY_OPTIONS];
                    const selectedQuality = repairPartQuality[repair.id];
                    
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
                                  {repair.duration}
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
                          {isSelected && selectedQuality && hasQualityOptions && (
                            <Badge variant="secondary" className="mb-2">
                              {selectedQuality === "oem" ? "Original (OEM)" : "Premium Aftermarket"}
                            </Badge>
                          )}
                          <p className="text-sm text-muted-foreground mb-3">
                            {repair.description}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-primary">
                              {repair.price === 0 ? (
                                <span className="text-base">Price on request</span>
                              ) : (
                                `$${isSelected ? getRepairPrice(repair.id) : repair.price}`
                              )}
                            </p>
                            {hasQualityOptions && repair.price > 0 && (
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

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">
                      Selected Services ({selectedRepairs.length})
                    </h4>
                    {selectedRepairs.map((repairId) => {
                      const repair = REPAIR_ITEMS.find(
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
                              {quality && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {quality === "oem" ? "Original (OEM)" : "Premium Aftermarket"}
                                </Badge>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {repair.duration}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">${getRepairPrice(repairId)}</p>
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
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-muted-foreground">Sub-total</p>
                      <p className="font-semibold">${calculateTotal()}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-muted-foreground">Combo discount</p>
                      <p className="text-primary font-semibold">$0</p>
                    </div>
                    <div className="flex items-center justify-between text-sm pb-2 border-b">
                      <p className="text-muted-foreground">Tax (0%)</p>
                      <p className="font-semibold">$0</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-lg font-bold">Total</p>
                      <p className="text-3xl font-bold text-primary">
                        ${calculateTotal()}
                      </p>
                    </div>
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
                      disabled={!serviceMethod || isSubmitting}
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
                        const repair = REPAIR_ITEMS.find(
                          (r) => r.id === repairId
                        );
                        if (!repair) return null;
                        const RepairIcon = getRepairIcon(repair.id);
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
                                <p className="text-xs text-muted-foreground">
                                  {repair.duration}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold">${repair.price}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">Sub-total</p>
                        <p className="font-semibold">${calculateTotal()}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">Tax (0%)</p>
                        <p className="font-semibold">$0</p>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg mt-3">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-lg">Total</p>
                          <p className="text-3xl font-bold text-primary">
                            ${calculateTotal()}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Incl. 0% tax
                        </p>
                      </div>
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
              (r: any) => r.repairId?._id === selectedRepairForQuality || r.repairId === selectedRepairForQuality
            );

            if (!modelRepair || !modelRepair.qualityPrices || modelRepair.qualityPrices.length === 0) {
              return (
                <div className="py-4 text-center text-muted-foreground">
                  No quality options available for this repair.
                </div>
              );
            }

            // Get quality option details from the repair
            const repairData = repairs.find((r) => r.id === selectedRepairForQuality);
            const qualityOptions = repairData?.qualityOptions || [];

            return (
              <div className="grid gap-4 py-4">
                {modelRepair.qualityPrices.map((qualityPrice: any) => {
                  // Find matching quality option details
                  const qualityDetails = qualityOptions.find((q: any) => q.id === qualityPrice.id);
                  
                  return (
                    <Card
                      key={qualityPrice.id}
                      className="cursor-pointer transition-all hover:border-primary"
                      onClick={() => handlePartQualitySelect(qualityPrice.id as "oem" | "aftermarket")}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-xl mb-2">{qualityPrice.name}</h3>
                            {qualityDetails?.description && (
                              <p className="text-sm text-muted-foreground">
                                {qualityDetails.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-3xl font-bold text-primary">
                              ${qualityPrice.price}
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
