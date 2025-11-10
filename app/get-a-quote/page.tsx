"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Smartphone, Tablet, Laptop, X, HelpCircle } from "lucide-react";
import { LpNavbar1 } from "@/components/pro-blocks/landing-page/lp-navbars/lp-navbar-1";
import { Footer1 } from "@/components/pro-blocks/landing-page/footers/footer-1";
import Image from "next/image";

interface Device {
  brand: string;
  phone_name: string;
  image: string;
  slug: string;
  detail: string;
}

interface RepairType {
  id: string;
  name: string;
  price: number;
}

const DEVICE_TYPES = [
  { id: "smartphone", label: "SMARTPHONE", icon: Smartphone },
  { id: "tablet", label: "TABLET", icon: Tablet },
  { id: "laptop", label: "LAPTOP", icon: Laptop },
];

const REPAIR_TYPES: RepairType[] = [
  { id: "screen", name: "Screen", price: 0 },
  { id: "battery", name: "Battery", price: 0 },
  { id: "back-glass", name: "Back Glass", price: 0 },
  { id: "charging-port", name: "Charging Port", price: 0 },
  { id: "camera", name: "Camera", price: 0 },
  { id: "speaker", name: "Speaker", price: 0 },
];

const SERVICE_METHODS = [
  {
    id: "location",
    title: "Service at your location",
    subtitle: "Mobile Repair (Tampa Bay Only)",
    badge: "FREE",
  },
  {
    id: "ship",
    title: "Ship device",
    subtitle: "Repaired within 24 hours",
    badge: "FREE",
  },
];

export default function GetAQuotePage() {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([]);
  const [serviceMethod, setServiceMethod] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    houseNumber: "",
    streetName: "",
    city: "",
    zipCode: "",
    country: "United States (US)",
    email: "",
    phone: "",
  });

  // Fetch devices from free API
  useEffect(() => {
    if (searchQuery.length > 2) {
      setLoading(true);
      setShowResults(true);
      
      // Using free public API: https://phone-specs-api-iota.vercel.app
      fetch(`https://phone-specs-api-iota.vercel.app/search?query=${encodeURIComponent(searchQuery)}`)
        .then((res) => {
          if (!res.ok) throw new Error('API request failed');
          return res.json();
        })
        .then((data) => {
          console.log('API Response:', data); // Debug log
          if (data.status && data.data && data.data.phones) {
            const phones = data.data.phones.slice(0, 10);
            console.log('Filtered phones:', phones); // Debug log
            setFilteredDevices(phones);
          } else {
            setFilteredDevices([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('API Error:', error); // Debug log
          setLoading(false);
          setFilteredDevices([]);
        });
    } else {
      setFilteredDevices([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setShowResults(false);
    setSearchQuery(device.phone_name);
  };

  const handleRepairToggle = (repairId: string) => {
    setSelectedRepairs((prev) =>
      prev.includes(repairId)
        ? prev.filter((id) => id !== repairId)
        : [...prev, repairId]
    );
  };

  const calculateTotal = () => {
    return selectedRepairs.length * 50; // Base price, can be customized
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", {
      device: selectedDevice,
      repairs: selectedRepairs,
      serviceMethod,
      formData,
    });
  };

  return (
    <>
      <LpNavbar1 />
      <div className="min-h-screen bg-background">
        {/* Progress Steps */}
        <div className="bg-secondary border-b">
          <div className="container-padding-x container mx-auto py-6">
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 ${
                  step === 1 ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step === 1 ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  1
                </span>
                Select device
              </button>
              <button
                onClick={() => selectedDevice && setStep(2)}
                disabled={!selectedDevice}
                className={`flex items-center gap-2 ${
                  step === 2 ? "text-primary font-semibold" : "text-muted-foreground"
                } disabled:opacity-50`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step === 2 ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  2
                </span>
                Select repair
              </button>
              <button
                onClick={() => selectedRepairs.length > 0 && setStep(3)}
                disabled={selectedRepairs.length === 0}
                className={`flex items-center gap-2 ${
                  step === 3 ? "text-primary font-semibold" : "text-muted-foreground"
                } disabled:opacity-50`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step === 3 ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  3
                </span>
                Finalize order
              </button>
            </div>
          </div>
        </div>

        <div className="container-padding-x container mx-auto py-12">
          {/* Step 1: Select Device */}
          {step === 1 && (
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="text-center">
                <h1 className="heading-lg mb-4">
                  Which <span className="text-primary">model</span> do you have?
                </h1>
              </div>

              {/* Search Input */}
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Label className="mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Type in your <strong>brand, model</strong> or{" "}
                      <strong>model code</strong>
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="iPhone 12 Pro Max"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                        }}
                        onFocus={() => setShowResults(true)}
                        className="pr-20"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedDevice(null);
                            setFilteredDevices([]);
                            setShowResults(false);
                          }}
                          className="absolute right-10 top-1/2 -translate-y-1/2 hover:bg-secondary rounded p-1"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                      {!loading ? (
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
                      ) : (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && searchQuery.length > 2 && (
                      <div className="relative">
                        {loading ? (
                          <Card className="absolute z-10 mt-2 w-full">
                            <CardContent className="p-8 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                <p className="text-sm text-muted-foreground">Searching devices...</p>
                              </div>
                            </CardContent>
                          </Card>
                        ) : filteredDevices.length > 0 ? (
                          <Card className="absolute z-10 mt-2 w-full max-h-96 overflow-y-auto shadow-lg">
                            <CardContent className="p-0">
                              {filteredDevices.map((device, index) => (
                                <button
                                  key={`${device.slug}-${index}`}
                                  onClick={() => handleDeviceSelect(device)}
                                  className="flex w-full items-center gap-4 border-b p-4 hover:bg-secondary transition-colors last:border-0 text-left"
                                >
                                  {device.image ? (
                                    <div className="relative h-16 w-16 flex-shrink-0">
                                      <Image
                                        src={device.image}
                                        alt={device.phone_name}
                                        fill
                                        className="object-contain"
                                        sizes="64px"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-16 w-16 flex-shrink-0 rounded bg-muted flex items-center justify-center">
                                      <Smartphone className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">
                                      <span className="text-primary">{device.brand}</span>{" "}
                                      {device.phone_name}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {REPAIR_TYPES.slice(0, 3).map((repair) => (
                                        <Badge key={repair.id} variant="secondary" className="text-xs">
                                          {repair.name}
                                        </Badge>
                                      ))}
                                      <Badge variant="outline" className="text-xs">+{REPAIR_TYPES.length - 3}</Badge>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </CardContent>
                          </Card>
                        ) : searchQuery.length > 2 && !loading ? (
                          <Card className="absolute z-10 mt-2 w-full">
                            <CardContent className="p-8 text-center">
                              <p className="text-muted-foreground">No devices found. Try a different search term.</p>
                            </CardContent>
                          </Card>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <button className="flex flex-col items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    Find my model
                  </button>
                </div>
              </div>

              {/* Device Type Selection */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Or select your <strong>type</strong>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DEVICE_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all hover:border-primary ${
                          selectedDeviceType === type.id ? "border-primary" : ""
                        }`}
                        onClick={() => setSelectedDeviceType(type.id)}
                      >
                        <CardContent className="flex flex-col items-center justify-center p-8">
                          <Icon className="h-12 w-12 mb-4 text-muted-foreground" />
                          <p className="font-semibold">{type.label}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {selectedDevice && (
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} size="lg">
                    Continue to Repairs
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Repairs */}
          {step === 2 && selectedDevice && (
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="flex items-center justify-between">
                <h1 className="heading-lg">
                  Select <span className="text-primary">repairs</span>
                </h1>
                <div className="flex items-center gap-4 bg-secondary p-3 rounded-lg">
                  {selectedDevice.image ? (
                    <div className="relative h-12 w-12">
                      <Image
                        src={selectedDevice.image}
                        alt={selectedDevice.phone_name}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">
                      {selectedDevice.brand} {selectedDevice.phone_name}
                    </p>
                    <p className="text-sm text-muted-foreground">Smartphone</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {REPAIR_TYPES.map((repair) => (
                  <Card
                    key={repair.id}
                    className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                      selectedRepairs.includes(repair.id) ? "border-primary bg-primary/5 shadow-md" : ""
                    }`}
                    onClick={() => handleRepairToggle(repair.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="mb-2">
                        {selectedRepairs.includes(repair.id) && (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mb-2">
                            ✓
                          </div>
                        )}
                      </div>
                      <p className="font-semibold mb-2">{repair.name}</p>
                      <p className="text-2xl font-bold text-primary">
                        ${(repair.price || 50).toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Starting from</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedRepairs.length > 0 && (
                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-semibold">Total Estimate</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRepairs.length} repair(s) selected
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${calculateTotal()}
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedRepairs.length === 0}
                  size="lg"
                >
                  Continue to Checkout
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Finalize Order */}
          {step === 3 && (
            <div className="mx-auto max-w-4xl">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="heading-lg">
                    Receive your quote <span className="text-primary">by email</span>
                  </h2>
                  <p className="text-primary">Please fill in all necessary information</p>

                  {/* Service Method */}
                  <div className="space-y-4">
                    <Label className="font-semibold">Select Service Method</Label>
                    <RadioGroup value={serviceMethod} onValueChange={setServiceMethod}>
                      {SERVICE_METHODS.map((method) => (
                        <Card
                          key={method.id}
                          className={`cursor-pointer transition-all hover:border-primary ${
                            serviceMethod === method.id ? "border-primary" : ""
                          }`}
                          onClick={() => setServiceMethod(method.id)}
                        >
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <RadioGroupItem value={method.id} id={method.id} />
                              <div>
                                <p className="font-semibold flex items-center gap-2">
                                  {method.title}
                                  <Badge variant="destructive">{method.badge}</Badge>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {method.subtitle}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="houseNumber">House Number</Label>
                      <Input
                        id="houseNumber"
                        value={formData.houseNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, houseNumber: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="streetName">Street Name</Label>
                      <Input
                        id="streetName"
                        value={formData.streetName}
                        onChange={(e) =>
                          setFormData({ ...formData, streetName: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
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

                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-destructive">*</span>
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

                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" size="lg">
                        Get Quote
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Order Summary */}
                <div>
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {selectedDevice && (
                        <div className="flex items-center gap-4 pb-4 border-b">
                          {selectedDevice.image ? (
                            <div className="relative h-16 w-16">
                              <Image
                                src={selectedDevice.image}
                                alt={selectedDevice.phone_name}
                                fill
                                className="object-contain"
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                              <Smartphone className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-lg">
                              {selectedDevice.brand} {selectedDevice.phone_name}
                            </p>
                            <p className="text-sm text-muted-foreground">Smartphone</p>
                            <p className="text-sm font-semibold">
                              $ {calculateTotal()}{" "}
                              <span className="text-muted-foreground">incl. Tax (0%)</span>
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="font-semibold">Selected Repairs:</p>
                        {selectedRepairs.map((repairId) => {
                          const repair = REPAIR_TYPES.find((r) => r.id === repairId);
                          return (
                            <div
                              key={repairId}
                              className="flex justify-between text-sm"
                            >
                              <span>{repair?.name}</span>
                              <span className="font-semibold">
                                ${(repair?.price || 50).toFixed(0)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-3xl font-bold text-primary">
                            ${calculateTotal()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
