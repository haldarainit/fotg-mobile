"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, Percent, DollarSign, CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface DiscountRule {
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minRepairs?: number;
  minSubtotal?: number;
  specificRepairs?: string[];
  active: boolean;
  condition?: "minRepairs" | "minSubtotal";
}

interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

interface Settings {
  _id?: string;
  taxPercentage: number;
  discountRules: DiscountRule[];
  timeSlots: TimeSlot[];
  operatingDays: number[];
  closedDates: string[];
}

interface Repair {
  _id: string;
  name: string;
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<Settings>({
    taxPercentage: 0,
    discountRules: [],
    timeSlots: [],
    operatingDays: [1, 2, 3, 4, 5], // Monday to Friday
    closedDates: [],
  });
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, repairsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/repairs"),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        console.log("=== FETCH: Raw data from API ===");
        console.log("Raw settings:", JSON.stringify(data.data, null, 2));
        
        const raw = data.data || { taxPercentage: 0, discountRules: [], timeSlots: [], operatingDays: [1,2,3,4,5], closedDates: [] };
        // Ensure numeric types and set proper defaults only if fields are missing
        const normalizedRules = (raw.discountRules || []).map((r: any, idx: number) => {
          console.log(`Fetch Rule #${idx + 1}:`, r);
          
          return {
            ...r,
            // Only set defaults if condition is missing
            condition: r.condition || (r.minSubtotal != null ? "minSubtotal" : "minRepairs"),
            // Preserve existing values, convert to numbers if present
            minSubtotal: r.minSubtotal != null ? Number(r.minSubtotal) : undefined,
            minRepairs: r.minRepairs != null ? Number(r.minRepairs) : undefined,
          };
        });
        
        console.log("=== FETCH: Final state ===");
        console.log("Normalized rules:", normalizedRules);
        
        setSettings({ 
          ...(raw as any), 
          discountRules: normalizedRules,
          timeSlots: raw.timeSlots || [],
          operatingDays: raw.operatingDays || [1,2,3,4,5],
          closedDates: raw.closedDates || [],
        });
      }

      if (repairsRes.ok) {
        const data = await repairsRes.json();
        setRepairs(data.data || data.repairs || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("=== SAVE: Before cleaning ===");
      console.log("Original settings:", JSON.stringify(settings, null, 2));
      
      // Ensure each rule has condition and appropriate min field set before saving
      const cleanedSettings = {
        ...settings,
        discountRules: settings.discountRules.map((rule, idx) => {
          let condition: "minRepairs" | "minSubtotal" =
            rule.condition || (rule.minSubtotal != null ? "minSubtotal" : "minRepairs");

          let minRepairs =
            rule.minRepairs !== undefined && rule.minRepairs !== null
              ? Number(rule.minRepairs)
              : undefined;
          let minSubtotal =
            rule.minSubtotal !== undefined && rule.minSubtotal !== null
              ? Number(rule.minSubtotal)
              : undefined;

          // Normalise based on chosen condition and provide sensible defaults
          if (condition === "minRepairs") {
            if (minRepairs == null || Number.isNaN(minRepairs)) {
              minRepairs = 1; // default minimum repairs
            }
            minSubtotal = undefined;
          } else if (condition === "minSubtotal") {
            if (minSubtotal == null || Number.isNaN(minSubtotal)) {
              minSubtotal = 0; // default minimum subtotal
            }
            minRepairs = undefined;
          }

          const cleaned = {
            ...rule,
            condition,
            ...(minSubtotal != null ? { minSubtotal } : {}),
            ...(minRepairs != null ? { minRepairs } : {}),
          };

          console.log(`Rule #${idx + 1} cleaned:`, cleaned);
          return cleaned;
        }),
      };

      console.log("=== SAVE: Sending to API ===");
      console.log("Cleaned settings:", JSON.stringify(cleanedSettings, null, 2));

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedSettings),
      });

      const data = await response.json();
      
      console.log("=== SAVE: Response from API ===");
      console.log("Response data:", JSON.stringify(data, null, 2));

      if (response.ok) {
        toast.success("Settings saved successfully");
        // Use the response data, but merge with current state to preserve fields that might be missing
        const responseData = data.data;
        const mergedSettings = {
          ...settings,
          ...responseData,
          discountRules: responseData.discountRules?.map((rule: any, idx: number) => ({
            ...settings.discountRules[idx], // Preserve current state
            ...rule, // Override with response data
          })) || settings.discountRules,
          timeSlots: responseData.timeSlots || settings.timeSlots,
          operatingDays: responseData.operatingDays || settings.operatingDays,
          closedDates: responseData.closedDates || settings.closedDates,
        };

        console.log("=== SAVE: Final state ===");
        console.log("Merged settings:", mergedSettings);

        setSettings(mergedSettings);
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const addDiscountRule = () => {
    setSettings({
      ...settings,
      discountRules: [
        ...settings.discountRules,
        {
          name: "",
          description: "",
          type: "percentage",
          value: 0,
          minRepairs: 1,
          specificRepairs: [],
          active: true,
          condition: "minRepairs",
        },
      ],
    });
  };

  const removeDiscountRule = (index: number) => {
    const newRules = [...settings.discountRules];
    newRules.splice(index, 1);
    setSettings({ ...settings, discountRules: newRules });
  };

  const updateDiscountRule = (index: number, field: string, value: any) => {
    console.log(`=== UPDATE RULE #${index + 1} ===`);
    console.log(`Field: ${field}, Value:`, value);
    
    const newRules = [...settings.discountRules];
    if (field === "condition") {
      console.log(`Switching condition to: ${value}`);
      (newRules[index] as any)[field] = value;
      if (value === "minRepairs") {
        // Clear subtotal if switching to minRepairs
        console.log("Clearing minSubtotal");
        (newRules[index] as any).minSubtotal = undefined;
        // Set default minRepairs if not present
        if (!newRules[index].minRepairs) {
          (newRules[index] as any).minRepairs = 1;
        }
      } else if (value === "minSubtotal") {
        // Clear repairs if switching to minSubtotal
        console.log("Clearing minRepairs");
        (newRules[index] as any).minRepairs = undefined;
        // Set default minSubtotal if not present
        if (!newRules[index].minSubtotal) {
          (newRules[index] as any).minSubtotal = 0;
        }
      }
    } else {
      (newRules[index] as any)[field] = value;
    }
    
    console.log(`Rule #${index + 1} after update:`, newRules[index]);
    setSettings({ ...settings, discountRules: newRules });
  };

  const updateTimeSlot = (slotId: string, field: string, value: any) => {
    const newSlots = [...settings.timeSlots];
    const slotIndex = newSlots.findIndex(s => s.id === slotId);
    if (slotIndex !== -1) {
      (newSlots[slotIndex] as any)[field] = value;
      setSettings({ ...settings, timeSlots: newSlots });
    }
  };

  const toggleRepairInRule = (ruleIndex: number, repairId: string) => {
    const newRules = [...settings.discountRules];
    const specificRepairs = newRules[ruleIndex].specificRepairs || [];
    
    if (specificRepairs.includes(repairId)) {
      newRules[ruleIndex].specificRepairs = specificRepairs.filter(id => id !== repairId);
    } else {
      newRules[ruleIndex].specificRepairs = [...specificRepairs, repairId];
    }
    
    setSettings({ ...settings, discountRules: newRules });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tax Settings */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Tax Settings</h2>
            <p className="text-sm text-muted-foreground">
              Set the tax percentage to apply to all quotes
            </p>
          </div>

          <div className="max-w-md">
            <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="taxPercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.taxPercentage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    taxPercentage: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
              <Percent className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Example: 8.5 for 8.5% tax
            </p>
          </div>
        </div>
      </Card>

      {/* Time Slot Settings */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Time Slot Settings</h2>
              <p className="text-sm text-muted-foreground">
                Configure available booking time slots for in-store service
              </p>
            </div>
            <Button onClick={() => {
              // Find the latest end time from existing slots
              const sortedSlots = [...settings.timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
              const lastSlot = sortedSlots[sortedSlots.length - 1];
              
              // Use last slot's end time as start time, or default to 09:00
              const newStartTime = lastSlot ? lastSlot.endTime : "09:00";
              
              // Calculate end time as 1 hour after start time
              const [startHour, startMinute] = newStartTime.split(':').map(Number);
              const endHour = startHour + 1;
              const newEndTime = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
              
              // Generate label
              const formatTime = (time: string) => {
                const [h, m] = time.split(':').map(Number);
                const period = h >= 12 ? 'PM' : 'AM';
                const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
              };
              
              const newLabel = `${formatTime(newStartTime)} - ${formatTime(newEndTime)}`;
              
              const newSlot = {
                id: `slot-${Date.now()}`,
                label: newLabel,
                startTime: newStartTime,
                endTime: newEndTime,
                active: true,
              };
              setSettings({
                ...settings,
                timeSlots: [...settings.timeSlots, newSlot],
              });
            }} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Time Slot
            </Button>
          </div>

          {settings.timeSlots.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No time slots configured. Click "Add Time Slot" to create one.
            </div>
          )}

          <div className="space-y-4">
            {settings.timeSlots.map((slot, index) => (
              <Card key={slot.id} className="p-4 border-2">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">
                      Time Slot #{index + 1}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${slot.id}`}>Active</Label>
                        <Switch
                          id={`active-${slot.id}`}
                          checked={slot.active}
                          onCheckedChange={(checked) =>
                            updateTimeSlot(slot.id, "active", checked)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSettings({
                            ...settings,
                            timeSlots: settings.timeSlots.filter(s => s.id !== slot.id),
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`label-${slot.id}`}>Display Label *</Label>
                      <Input
                        id={`label-${slot.id}`}
                        value={slot.label}
                        onChange={(e) => updateTimeSlot(slot.id, "label", e.target.value)}
                        placeholder="e.g., 9:00 AM - 10:00 AM"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`start-${slot.id}`}>Start Time *</Label>
                      <Input
                        id={`start-${slot.id}`}
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(slot.id, "startTime", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`end-${slot.id}`}>End Time *</Label>
                      <Input
                        id={`end-${slot.id}`}
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(slot.id, "endTime", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <Label>Operating Days</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select which days of the week bookings are available
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { day: 0, label: "Sun" },
                { day: 1, label: "Mon" },
                { day: 2, label: "Tue" },
                { day: 3, label: "Wed" },
                { day: 4, label: "Thu" },
                { day: 5, label: "Fri" },
                { day: 6, label: "Sat" },
              ].map(({ day, label }) => (
                <div key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`day-${day}`}
                    checked={settings.operatingDays.includes(day)}
                    onChange={(e) => {
                      const newDays = e.target.checked
                        ? [...settings.operatingDays, day]
                        : settings.operatingDays.filter(d => d !== day);
                      setSettings({
                        ...settings,
                        operatingDays: newDays.sort(),
                      });
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`day-${day}`} className="text-sm cursor-pointer">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Closed Dates</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select specific dates when the store is closed
            </p>
            
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {calendarDate ? format(calendarDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={(date) => {
                      setCalendarDate(date);
                      if (date) {
                        const dateStr = format(date, "yyyy-MM-dd");
                        if (!settings.closedDates.includes(dateStr)) {
                          setSettings({
                            ...settings,
                            closedDates: [...settings.closedDates, dateStr].sort(),
                          });
                        }
                        setCalendarDate(undefined); // Reset for next selection
                      }
                    }}
                    disabled={(date) => {
                      // Disable past dates and already selected dates
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dateStr = format(date, "yyyy-MM-dd");
                      return date < today || settings.closedDates.includes(dateStr);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {settings.closedDates.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selected Closed Dates:</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.closedDates.map((date, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
                      >
                        <span>{date}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              closedDates: settings.closedDates.filter((_, i) => i !== index),
                            });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Discount Rules */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Discount Rules</h2>
              <p className="text-sm text-muted-foreground">
                Create discount rules based on minimum repairs, specific repair combos, or minimum subtotal thresholds
              </p>
            </div>
            <Button onClick={addDiscountRule} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Discount Rule
            </Button>
          </div>

          {settings.discountRules.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No discount rules yet. Click "Add Discount Rule" to create one.
            </div>
          )}

          <div className="space-y-6">
            {settings.discountRules.map((rule, index) => (
              <Card key={index} className="p-6 border-2">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">
                      Discount Rule #{index + 1}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${index}`}>Active</Label>
                        <Switch
                          id={`active-${index}`}
                          checked={rule.active}
                          onCheckedChange={(checked) =>
                            updateDiscountRule(index, "active", checked)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDiscountRule(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>Rule Name *</Label>
                      <Input
                        id={`name-${index}`}
                        value={rule.name}
                        onChange={(e) =>
                          updateDiscountRule(index, "name", e.target.value)
                        }
                        placeholder="e.g., Screen + Battery Combo"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`type-${index}`}>Discount Type *</Label>
                      <Select
                        value={rule.type}
                        onValueChange={(value) =>
                          updateDiscountRule(index, "type", value)
                        }
                      >
                        <SelectTrigger id={`type-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage Off
                          </SelectItem>
                          <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={rule.description || ""}
                      onChange={(e) =>
                        updateDiscountRule(index, "description", e.target.value)
                      }
                      placeholder="Describe this discount rule..."
                      rows={2}
                    />
                  </div>

                  {/* Rule condition selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`condition-${index}`}>Applies When *</Label>
                      <Select
                        value={rule.condition || (rule.minSubtotal !== undefined ? "minSubtotal" : "minRepairs")}
                        onValueChange={(value) => updateDiscountRule(index, "condition", value)}
                      >
                        <SelectTrigger id={`condition-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minRepairs">Minimum repairs</SelectItem>
                          <SelectItem value="minSubtotal">Minimum subtotal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`value-${index}`}>
                        Discount Value * {rule.type === "percentage" ? "(%)" : "($)"}
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          id={`value-${index}`}
                          type="number"
                          min="0"
                          step={rule.type === "percentage" ? "0.01" : "1"}
                          value={rule.value}
                          onChange={(e) =>
                            updateDiscountRule(index, "value", parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                        />
                        {rule.type === "percentage" ? (
                          <Percent className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conditional inputs: show only the chosen condition field */}
                  {(rule.condition || (rule.minSubtotal !== undefined ? "minSubtotal" : "minRepairs")) === "minRepairs" && (
                    <div>
                      <Label htmlFor={`minRepairs-${index}`}>Minimum Repairs</Label>
                      <Input
                        id={`minRepairs-${index}`}
                        type="number"
                        min="1"
                        value={rule.minRepairs || ""}
                        onChange={(e) =>
                          updateDiscountRule(
                            index,
                            "minRepairs",
                            e.target.value === "" ? undefined : parseInt(e.target.value)
                          )
                        }
                        placeholder="Required when condition is Minimum repairs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Example: 2 means 2 or more repairs</p>
                    </div>
                  )}

                  {(rule.condition || (rule.minSubtotal !== undefined ? "minSubtotal" : "minRepairs")) === "minSubtotal" && (
                    <div>
                      <Label htmlFor={`minSubtotal-${index}`}>Minimum Subtotal ($)</Label>
                      <Input
                        id={`minSubtotal-${index}`}
                        type="number"
                        min="0"
                        step="1"
                        value={rule.minSubtotal ?? ""}
                        onChange={(e) =>
                          updateDiscountRule(
                            index,
                            "minSubtotal",
                            e.target.value === "" ? undefined : parseFloat(e.target.value)
                          )
                        }
                        placeholder="Required when condition is Minimum subtotal"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Example: 300 means subtotal ≥ $300</p>
                    </div>
                  )}

                  <div>
                    <Label>Specific Repairs (Optional)</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select specific repairs that must be included for this
                      discount to apply. Leave empty to apply to any repairs.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {repairs.map((repair) => (
                        <div
                          key={repair._id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`repair-${index}-${repair._id}`}
                            checked={
                              rule.specificRepairs?.includes(repair._id) || false
                            }
                            onChange={() =>
                              toggleRepairInRule(index, repair._id)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label
                            htmlFor={`repair-${index}-${repair._id}`}
                            className="text-sm cursor-pointer"
                          >
                            {repair.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
