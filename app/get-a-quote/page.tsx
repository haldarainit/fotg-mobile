"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
  Check
} from "lucide-react";
import { LpNavbar1 } from "@/components/pro-blocks/landing-page/lp-navbars/lp-navbar-1";
import { Footer1 } from "@/components/pro-blocks/landing-page/footers/footer-1";
import Image from "next/image";
import {
  BRANDS,
  DEVICE_MODELS,
  REPAIR_ITEMS,
  SERVICE_METHODS,
  Brand,
  DeviceModel,
} from "@/lib/repairData";

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

export default function GetAQuotePage() {
  const [step, setStep] = useState<"device-type" | "brand" | "model" | "color" | "repair" | "finalize">("device-type");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([]);
  const [serviceMethod, setServiceMethod] = useState("");
  const [customerType, setCustomerType] = useState<"private" | "business">("private");
  const [showAllRepairs, setShowAllRepairs] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
  });

  const getFilteredBrands = () => {
    let brands = BRANDS;
    
    // Filter brands based on device type
    if (selectedDeviceType) {
      brands = brands.filter(brand => 
        brand.deviceTypes.includes(selectedDeviceType as "smartphone" | "tablet" | "laptop")
      );
    }
    
    // Apply search filter
    if (!searchQuery) return brands;
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredModels = () => {
    if (!selectedBrand) return [];
    let models = DEVICE_MODELS.filter((model) => model.brandId === selectedBrand.id);
    
    // Filter by device type if selected
    if (selectedDeviceType) {
      models = models.filter(model => model.deviceType === selectedDeviceType);
    }
    
    return models;
  };

  const getFilteredRepairs = () => {
    if (!selectedDeviceType) return REPAIR_ITEMS;
    return REPAIR_ITEMS.filter((repair) =>
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
    setSelectedRepairs((prev) =>
      prev.includes(repairId)
        ? prev.filter((id) => id !== repairId)
        : [...prev, repairId]
    );
  };

  const calculateTotal = () => {
    return selectedRepairs.reduce((total, repairId) => {
      const repair = REPAIR_ITEMS.find((r) => r.id === repairId);
      return total + (repair?.price || 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", {
      deviceType: selectedDeviceType,
      brand: selectedBrand,
      model: selectedModel,
      color: selectedColor,
      repairs: selectedRepairs,
      serviceMethod,
      customerType,
      formData,
      total: calculateTotal(),
    });
    alert("Quote submitted successfully!");
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
                  step === "device-type" || step === "brand" || step === "model" || step === "color"
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step === "device-type" || step === "brand" || step === "model" || step === "color"
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
                  step === "repair" ? "text-primary font-semibold" : "text-muted-foreground"
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
                  step === "finalize" ? "text-primary font-semibold" : "text-muted-foreground"
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
          {/* Step 1: Select Device Type */}
          {step === "device-type" && (
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="text-center">
                <h1 className="heading-lg mb-4">Which <span className="text-primary">model</span> do you have?</h1>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Type in your <strong>brand, model</strong> or <strong>model code</strong>
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="iPhone 12 Pro Max"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 h-12 text-lg"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>

                {searchQuery && (
                  <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {getFilteredBrands().length > 0 ? (
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-3">Select a brand:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {getFilteredBrands().map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => handleBrandSelect(brand)}
                              className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
                            >
                              <p className="font-semibold">{brand.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="p-4 text-muted-foreground">No brands found</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors">
                    <span className="text-lg">🔍</span>
                    Find my model
                  </button>
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
          {step === "brand" && (
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBackClick}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="heading-lg">Select your <span className="text-primary">brand</span></h1>
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

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {getFilteredBrands().map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand)}
                    className="p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
                  >
                    {brand.logo ? (
                      <div className="h-12 w-12 mx-auto mb-3 flex items-center justify-center">
                        <Image 
                          src={brand.logo} 
                          alt={brand.name}
                          width={48}
                          height={48}
                          className="object-contain filter grayscale group-hover:grayscale-0 transition-all"
                        />
                      </div>
                    ) : (
                      <div className="text-4xl mb-2">{brand.name.charAt(0)}</div>
                    )}
                    <p className="font-semibold text-sm">{brand.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Model */}
          {step === "model" && selectedBrand && (
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBackClick}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="heading-lg">{selectedBrand.name} - <span className="text-primary">Select Model</span></h1>
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
                            {model.deviceType === "smartphone" ? "📱" : 
                             model.deviceType === "tablet" ? "📱" : 
                             "💻"}
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-center">{model.name}</p>
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
          {step === "color" && selectedModel && (
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
                          {selectedModel.deviceType === "smartphone" ? "📱" : 
                           selectedModel.deviceType === "tablet" ? "📱" : 
                           "💻"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedModel.name}</h2>
                      <p className="text-muted-foreground">{selectedBrand?.name}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected: {selectedModel.colors.find(c => c.id === selectedColor)?.name || selectedColor}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side - Color selection */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleBackClick}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <h1 className="heading-lg">Select Color</h1>
                      <p className="text-sm text-muted-foreground">Choose your preferred color</p>
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
                              <Check className="h-6 w-6 text-white drop-shadow-lg" style={{
                                filter: color.hex === "#FFFFFF" || color.hex === "#F5F5F7" || color.hex === "#F5F5DC" || color.hex === "#E5E5EA" ? "invert(1)" : "none"
                              }} />
                            </div>
                          )}
                          <p className="text-xs text-center mt-2 font-medium">{color.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setStep("repair")} size="lg" className="w-full lg:w-auto">
                      Continue to Repairs
                      <span className="ml-2">→</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Select Repairs */}
          {step === "repair" && selectedModel && (
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBackClick}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="heading-lg">{selectedModel.name}</h1>
                  <p className="text-sm text-muted-foreground">{selectedBrand?.name}</p>
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
                    return (
                      <Card
                        key={repair.id}
                        className={`cursor-pointer transition-all ${
                          selectedRepairs.includes(repair.id)
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
                                <h3 className="font-bold text-lg">{repair.name}</h3>
                                <p className="text-sm text-muted-foreground">{repair.duration}</p>
                              </div>
                            </div>
                            <Checkbox checked={selectedRepairs.includes(repair.id)} />
                          </div>
                          {repair.badge && (
                            <Badge variant="destructive" className="mb-2">{repair.badge}</Badge>
                          )}
                          <p className="text-sm text-muted-foreground mb-3">{repair.description}</p>
                          <p className="text-2xl font-bold text-primary">
                            {repair.price === 0 ? (
                              <span className="text-base">Price on request</span>
                            ) : (
                              `$${repair.price}`
                            )}
                          </p>
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
                      <h3 className="font-bold text-lg">{selectedModel?.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedBrand?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Color: {selectedModel?.colors.find(c => c.id === selectedColor)?.name || selectedColor}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Selected Services ({selectedRepairs.length})</h4>
                    {selectedRepairs.map((repairId) => {
                      const repair = REPAIR_ITEMS.find((r) => r.id === repairId);
                      if (!repair) return null;
                      const RepairIcon = getRepairIcon(repair.id);
                      return (
                        <div key={repairId} className="flex items-center justify-between py-2 border-b">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <RepairIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{repair.name}</p>
                              <p className="text-xs text-muted-foreground">{repair.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">${repair.price}</p>
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
                      <p className="text-3xl font-bold text-primary">${calculateTotal()}</p>
                    </div>
                  </div>

                  <Button onClick={() => setStep("finalize")} className="w-full" size="lg">
                    Continue to Final Step
                    <span className="ml-2">→</span>
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Step 6: Finalize Order */}
          {step === "finalize" && (
            <div className="mx-auto max-w-6xl">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={handleBackClick}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="heading-lg">Finalize <span className="text-primary">booking</span></h1>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Select Service Method</Label>
                    <RadioGroup value={serviceMethod} onValueChange={setServiceMethod} className="space-y-3">
                      {SERVICE_METHODS.map((method) => {
                        const ServiceIcon = method.id === "location" ? Home : Package;
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              serviceMethod === method.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem value={method.id} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <ServiceIcon className="h-5 w-5 text-primary" />
                                <p className="font-semibold">{method.title}</p>
                                <Badge variant="destructive" className="ml-auto">{method.badge}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{method.subtitle}</p>
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
                          customerType === "private" ? "border-primary bg-primary text-white" : "hover:border-primary"
                        }`}
                      >
                        Private
                      </button>
                      <button
                        onClick={() => setCustomerType("business")}
                        className={`flex-1 p-3 border-2 rounded-lg font-semibold transition-all ${
                          customerType === "business" ? "border-primary bg-primary text-white" : "hover:border-primary"
                        }`}
                      >
                        Business
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">FIRST NAME <span className="text-red-500">*</span></Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">LAST NAME <span className="text-red-500">*</span></Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">PHONE <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">EMAIL <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">NOTES</Label>
                      <Textarea
                        id="notes"
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={!serviceMethod}>
                      Confirm Booking
                      <br />
                      <span className="text-xs">You can cancel anytime</span>
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
                          {selectedModel?.deviceType === "smartphone" ? "📱" : 
                           selectedModel?.deviceType === "tablet" ? "📱" : 
                           "💻"}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold">{selectedModel?.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedBrand?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Color: {selectedModel?.colors.find(c => c.id === selectedColor)?.name || selectedColor}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <p className="font-semibold text-sm">Services ({selectedRepairs.length})</p>
                      {selectedRepairs.map((repairId) => {
                        const repair = REPAIR_ITEMS.find((r) => r.id === repairId);
                        if (!repair) return null;
                        const RepairIcon = getRepairIcon(repair.id);
                        return (
                          <div key={repairId} className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2 flex-1">
                              <RepairIcon className="h-4 w-4 text-primary shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{repair.name}</p>
                                <p className="text-xs text-muted-foreground">{repair.duration}</p>
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
                          <p className="text-3xl font-bold text-primary">${calculateTotal()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Incl. 0% tax</p>
                      </div>
                    </div>
                  </Card>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p className="text-xs">
                      total: <span className="font-bold">${calculateTotal().toFixed(2)}</span> incl. 0% tax
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer1 />
    </>
  );
}
