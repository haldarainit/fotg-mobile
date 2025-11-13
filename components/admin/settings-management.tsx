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
import { Plus, Trash2, Loader2, Save, Percent, DollarSign } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface DiscountRule {
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minRepairs?: number;
  specificRepairs?: string[];
  active: boolean;
}

interface Settings {
  _id?: string;
  taxPercentage: number;
  discountRules: DiscountRule[];
}

interface Repair {
  _id: string;
  name: string;
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<Settings>({
    taxPercentage: 0,
    discountRules: [],
  });
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        setSettings(data.data || { taxPercentage: 0, discountRules: [] });
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
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Settings saved successfully");
        setSettings(data.data);
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
    const newRules = [...settings.discountRules];
    (newRules[index] as any)[field] = value;
    setSettings({ ...settings, discountRules: newRules });
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

      {/* Discount Rules */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Discount Rules</h2>
              <p className="text-sm text-muted-foreground">
                Create discount rules based on repair combinations or minimum repairs
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`value-${index}`}>
                        Discount Value *{" "}
                        {rule.type === "percentage" ? "(%)" : "($)"}
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          id={`value-${index}`}
                          type="number"
                          min="0"
                          step={rule.type === "percentage" ? "0.01" : "1"}
                          value={rule.value}
                          onChange={(e) =>
                            updateDiscountRule(
                              index,
                              "value",
                              parseFloat(e.target.value) || 0
                            )
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

                    <div>
                      <Label htmlFor={`minRepairs-${index}`}>
                        Minimum Repairs
                      </Label>
                      <Input
                        id={`minRepairs-${index}`}
                        type="number"
                        min="1"
                        value={rule.minRepairs || ""}
                        onChange={(e) =>
                          updateDiscountRule(
                            index,
                            "minRepairs",
                            parseInt(e.target.value) || undefined
                          )
                        }
                        placeholder="Optional"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty for no minimum
                      </p>
                    </div>
                  </div>

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
