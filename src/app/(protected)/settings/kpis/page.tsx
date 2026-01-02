"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useGetKPIs, useUpdateKPI } from "@/lib/hooks/useKpi";
import { KPIDetails, ThresholdZone, Thresholds } from "@/lib/schema/kpi.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Zone colors for visual indicator
const zoneColors: Record<string, { bg: string; border: string; text: string }> =
  {
    red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700" },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      text: "text-yellow-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-300",
      text: "text-green-700",
    },
  };

interface KPIFormState {
  [kpiId: number]: {
    thresholds: Thresholds;
    isDirty: boolean;
  };
}

export default function KPISettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetKPIs({ limit: 100 });
  const updateKPIMutation = useUpdateKPI();

  const [formState, setFormState] = useState<KPIFormState>({});
  const [savingKpiId, setSavingKpiId] = useState<number | null>(null);

  // Initialize form state when data loads
  useEffect(() => {
    if (data?.kpis) {
      const initialState: KPIFormState = {};
      data.kpis.forEach((kpi) => {
        initialState[kpi.id] = {
          thresholds: { ...kpi.thresholds },
          isDirty: false,
        };
      });
      setFormState(initialState);
    }
  }, [data?.kpis]);

  // Update zone max value
  const updateZoneMax = (
    kpiId: number,
    zoneName: string,
    maxValue: number | undefined
  ) => {
    setFormState((prev) => {
      const kpiState = prev[kpiId];
      if (!kpiState) return prev;

      const updatedZones = kpiState.thresholds.zones.map((zone) =>
        zone.name === zoneName ? { ...zone, max: maxValue } : zone
      );

      return {
        ...prev,
        [kpiId]: {
          thresholds: { ...kpiState.thresholds, zones: updatedZones },
          isDirty: true,
        },
      };
    });
  };

  // Update comparison type
  const updateComparison = (kpiId: number, comparison: "gte" | "lte") => {
    setFormState((prev) => {
      const kpiState = prev[kpiId];
      if (!kpiState) return prev;

      return {
        ...prev,
        [kpiId]: {
          thresholds: { ...kpiState.thresholds, comparison },
          isDirty: true,
        },
      };
    });
  };

  // Save KPI thresholds
  const handleSaveKPI = async (kpi: KPIDetails) => {
    const kpiState = formState[kpi.id];
    if (!kpiState || !kpiState.isDirty) return;

    setSavingKpiId(kpi.id);

    try {
      await updateKPIMutation.mutateAsync({
        id: kpi.id.toString(),
        data: { thresholds: kpiState.thresholds },
      });

      setFormState((prev) => ({
        ...prev,
        [kpi.id]: { ...prev[kpi.id], isDirty: false },
      }));

      toast.success(
        t("settings.kpi.updateSuccess", {
          defaultValue: `KPI "${kpi.name}" updated successfully`,
        })
      );
    } catch (err) {
      toast.error(
        t("settings.kpi.updateError", {
          defaultValue: "Failed to update KPI settings",
        })
      );
    } finally {
      setSavingKpiId(null);
    }
  };

  // Reset KPI to original values
  const handleResetKPI = (kpi: KPIDetails) => {
    setFormState((prev) => ({
      ...prev,
      [kpi.id]: {
        thresholds: { ...kpi.thresholds },
        isDirty: false,
      },
    }));
  };

  // Sort zones by order
  const getSortedZones = (zones: ThresholdZone[]) => {
    return [...zones].sort((a, b) => a.order - b.order);
  };

  // Get the highest order zone (the one without max)
  const getHighestOrderZone = (zones: ThresholdZone[]) => {
    return zones.reduce(
      (highest, zone) => (zone.order > highest.order ? zone : highest),
      zones[0]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">
                {t("common.error", { defaultValue: "Error loading KPIs" })}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="mt-4"
              >
                {t("common.retry", { defaultValue: "Retry" })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("settings.kpi.title", { defaultValue: "KPI Settings" })}
            </h1>
            <p className="text-gray-500 text-sm">
              {t("settings.kpi.description", {
                defaultValue: "Configure threshold zones for each KPI metric",
              })}
            </p>
          </div>
        </div>

        {/* Color Legend */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-8 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-sm text-gray-600">
                  {t("settings.kpi.redZone", {
                    defaultValue: "Red Zone (Critical)",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                <span className="text-sm text-gray-600">
                  {t("settings.kpi.yellowZone", {
                    defaultValue: "Yellow Zone (Warning)",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-sm text-gray-600">
                  {t("settings.kpi.greenZone", {
                    defaultValue: "Green Zone (Good)",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI List */}
        {kpis.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              {t("settings.kpi.noKpis", { defaultValue: "No KPIs found" })}
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {kpis.map((kpi) => {
              const kpiState = formState[kpi.id];
              const zones = kpiState
                ? getSortedZones(kpiState.thresholds.zones)
                : getSortedZones(kpi.thresholds.zones);
              const comparison =
                kpiState?.thresholds.comparison || kpi.thresholds.comparison;
              const highestOrderZone = getHighestOrderZone(zones);
              const isDirty = kpiState?.isDirty || false;

              return (
                <AccordionItem
                  key={kpi.id}
                  value={kpi.id.toString()}
                  className="bg-white rounded-lg border shadow-sm"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div>
                        <h3 className="font-medium">{kpi.name}</h3>
                        {kpi.description && (
                          <p className="text-sm text-gray-500">
                            {kpi.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {kpi.unit}
                      </span>
                      {isDirty && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          {t("common.unsaved", { defaultValue: "Unsaved" })}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      {/* Comparison Type */}
                      <div className="flex items-center gap-4">
                        <Label className="min-w-30">
                          {t("settings.kpi.comparison", {
                            defaultValue: "Comparison",
                          })}
                        </Label>
                        <Select
                          value={comparison}
                          onValueChange={(value: "gte" | "lte") =>
                            updateComparison(kpi.id, value)
                          }
                        >
                          <SelectTrigger className="w-70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gte">
                              {t("settings.kpi.gte", {
                                defaultValue:
                                  "Greater than or equal (≥) - Higher is better",
                              })}
                            </SelectItem>
                            <SelectItem value="lte">
                              {t("settings.kpi.lte", {
                                defaultValue:
                                  "Less than or equal (≤) - Lower is better",
                              })}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Zone Thresholds */}
                      <div className="space-y-4">
                        <Label>
                          {t("settings.kpi.thresholds", {
                            defaultValue: "Zone Thresholds",
                          })}
                        </Label>
                        <div className="grid gap-4">
                          {zones.map((zone) => {
                            const colors =
                              zoneColors[zone.name] || zoneColors.green;
                            const isHighestOrder =
                              zone.name === highestOrderZone.name;

                            return (
                              <div
                                key={zone.name}
                                className={`flex items-center gap-4 p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                              >
                                <div
                                  className={`font-medium capitalize min-w-20 ${colors.text}`}
                                >
                                  {zone.name}
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                  {isHighestOrder ? (
                                    <span className="text-sm text-gray-600">
                                      {comparison === "gte"
                                        ? t("settings.kpi.aboveThreshold", {
                                            defaultValue:
                                              "Above previous threshold",
                                          })
                                        : t("settings.kpi.belowThreshold", {
                                            defaultValue:
                                              "Below previous threshold",
                                          })}
                                    </span>
                                  ) : (
                                    <>
                                      <Label className="text-sm text-gray-600">
                                        {t("settings.kpi.maxValue", {
                                          defaultValue: "Max Value:",
                                        })}
                                      </Label>
                                      <Input
                                        type="number"
                                        value={zone.max ?? ""}
                                        onChange={(e) => {
                                          const value =
                                            e.target.value === ""
                                              ? undefined
                                              : parseFloat(e.target.value);
                                          updateZoneMax(
                                            kpi.id,
                                            zone.name,
                                            value
                                          );
                                        }}
                                        className="w-32 bg-white"
                                        placeholder="0"
                                      />
                                      <span className="text-sm text-gray-500">
                                        {kpi.unit}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {t("settings.kpi.order", {
                                    defaultValue: "Order:",
                                  })}{" "}
                                  {zone.order}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleResetKPI(kpi)}
                          disabled={!isDirty || savingKpiId === kpi.id}
                        >
                          {t("common.reset", { defaultValue: "Reset" })}
                        </Button>
                        <Button
                          onClick={() => handleSaveKPI(kpi)}
                          disabled={!isDirty || savingKpiId === kpi.id}
                        >
                          {savingKpiId === kpi.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("common.saving", {
                                defaultValue: "Saving...",
                              })}
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              {t("common.save", { defaultValue: "Save" })}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
}
