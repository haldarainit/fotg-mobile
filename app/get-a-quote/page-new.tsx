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
import { Search, ChevronLeft } from "lucide-react";
import { LpNavbar1 } from "@/components/pro-blocks/landing-page/lp-navbars/lp-navbar-1";
import { Footer1 } from "@/components/pro-blocks/landing-page/footers/footer-1";
import {
  BRANDS,
  DEVICE_MODELS,
  REPAIR_ITEMS,
  SERVICE_METHODS,
  Brand,
  DeviceModel,
} from "@/lib/repairData";

import { Smartphone, Tablet, Laptop } from "lucide-react";

const DEVICE_TYPES = [
  { id: "smartphone", label: "SMARTPHONE", icon: Smartphone },
  { id: "tablet", label: "TABLET", icon: Tablet },
  { id: "laptop", label: "LAPTOP", icon: Laptop },
];

const COLORS = [
  { id: "black", name: "Black", hex: "#000000" },
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "blue", name: "Blue", hex: "#0066CC" },
  { id: "pink", name: "Pink", hex: "#FF69B4" },
];

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
    if (!searchQuery) return BRANDS;
    return BRANDS.filter((brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredModels = () => {
    if (!selectedBrand) return [];
    return DEVICE_MODELS.filter((model) => model.brandId === selectedBrand.id);
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
                    className="p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                  >
                    <div className="text-4xl mb-2">{brand.name.charAt(0)}</div>
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
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <div className="text-6xl">📱</div>
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
            <div className="mx-auto max-w-4xl space-y-8">
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
                  Select <strong>color</strong>
                </Label>
                <div className="flex gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`h-12 w-12 rounded-full border-2 transition-all ${
                        selectedColor === color.id ? "border-primary ring-2 ring-primary ring-offset-2" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep("repair")} size="lg">
                  Continue to Repairs
                </Button>
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
                  {displayedRepairs.map((repair) => (
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
                            <div className="text-3xl">{repair.icon}</div>
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
                  ))}
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
                <div className="bg-secondary p-6 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sub-total</p>
                      <p className="text-sm text-muted-foreground">Combo discount</p>
                      <p className="text-lg font-bold mt-2">
                        Total <span className="text-sm text-muted-foreground font-normal">Incl. 0% tax</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">${calculateTotal()}</p>
                      <p className="text-sm text-primary">-</p>
                      <p className="text-3xl font-bold text-primary mt-2">${calculateTotal()}</p>
                    </div>
                  </div>
                  <Button onClick={() => setStep("finalize")} className="w-full" size="lg">
                    Final Step
                    <br />
                    <span className="text-xs">Complete your appointment</span>
                  </Button>
                </div>
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
                      {SERVICE_METHODS.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            serviceMethod === method.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value={method.id} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{method.icon}</span>
                              <p className="font-semibold">{method.title}</p>
                              <Badge variant="destructive" className="ml-auto">{method.badge}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{method.subtitle}</p>
                          </div>
                        </label>
                      ))}
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
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-5xl">📱</div>
                      <div>
                        <h3 className="font-bold text-lg">{selectedModel?.name}</h3>
                        <p className="text-sm text-muted-foreground">repair</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">{selectedModel?.name} {selectedColor}</p>
                        <button className="text-sm text-primary">--</button>
                      </div>

                      <div className="bg-secondary p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">Total</p>
                          <p className="text-3xl font-bold text-primary">${calculateTotal().toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Incl. 0% tax</p>
                      </div>

                      <button className="w-full text-sm text-primary underline">view details</button>
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
