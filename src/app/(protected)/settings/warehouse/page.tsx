"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetSettings, useUpdateSetting } from "@/lib/hooks/useWarehouse";

// docs/warehouse-api.md §5. Order matches the table there. `key` is a
// literal union (not `string`) so the template-literal translation keys
// built from it below resolve against the typed locale dictionary.
type NumberSettingKey =
  | "slot_capacity"
  | "prebooking_ratio"
  | "zone_count"
  | "scheduling_horizon_days"
  | "slot_token_max_age_hours"
  | "reminder_timeout_minutes"
  | "max_reminders"
  | "fallback_grace_minutes"
  | "daily_message_cap";

type NumberFieldMeta = {
  key: NumberSettingKey;
  step?: number;
  min?: number;
  safetyRail?: boolean;
};

const SCHEDULING_FIELDS: NumberFieldMeta[] = [
  { key: "slot_capacity", min: 0 },
  { key: "prebooking_ratio", step: 0.05, min: 0 },
  { key: "zone_count", min: 0 },
  { key: "scheduling_horizon_days", min: 1 },
  { key: "slot_token_max_age_hours", min: 1 },
];

const REMINDER_FIELDS: NumberFieldMeta[] = [
  { key: "reminder_timeout_minutes", min: 0 },
  { key: "max_reminders", min: 0 },
];

// docs/warehouse-api.md §5: "safety rails, not preferences." Lowering these
// toward zero while the WhatsApp provider is stubbed is what would loop SMS
// against a customer's phone — a regulatory problem in KSA, not just a cost
// one. Kept as their own section, visually distinct, with a confirm step on
// any decrease.
const SAFETY_RAIL_FIELDS: NumberFieldMeta[] = [
  { key: "fallback_grace_minutes", min: 0, safetyRail: true },
  { key: "daily_message_cap", min: 0, safetyRail: true },
];

export default function WarehouseSettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, isError } = useGetSettings();
  const settings = data?.settings;

  return (
    <PageContainer size="lg" className="px-6 py-10">
      {/* Back to the settings hub, same as the other /settings sub-pages.
          The arrow is mirrored under RTL so it still points "back". */}
      <div className="mb-6 flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          aria-label={t("settings.title")}
          onClick={() => router.push("/settings")}
        >
          <ArrowLeft className="h-5 w-5 rtl:-scale-x-100" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseSettings.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseSettings.subtitle")}
          </p>
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseSettings.loadError")}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-amber-500/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                <ShieldAlert className="h-4 w-4" />
                {t("warehouseSettings.sections.safetyRails.title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("warehouseSettings.sections.safetyRails.description")}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {SAFETY_RAIL_FIELDS.map((meta) => (
                <NumberSettingField
                  key={meta.key}
                  meta={meta}
                  value={settings?.[meta.key]}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("warehouseSettings.sections.scheduling.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {SCHEDULING_FIELDS.map((meta) => (
                <NumberSettingField
                  key={meta.key}
                  meta={meta}
                  value={settings?.[meta.key]}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("warehouseSettings.sections.reminders.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {REMINDER_FIELDS.map((meta) => (
                <NumberSettingField
                  key={meta.key}
                  meta={meta}
                  value={settings?.[meta.key]}
                />
              ))}
            </CardContent>
          </Card>

          <MessageTemplatesCard value={settings?.["message_templates"]} />
        </div>
      )}
    </PageContainer>
  );
}

function NumberSettingField({
  meta,
  value: settingValue,
}: {
  meta: NumberFieldMeta;
  value: unknown;
}) {
  const { t } = useTranslation();
  const update = useUpdateSetting();

  const [value, setValue] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!initialized && settingValue !== undefined) {
      setValue(String(settingValue ?? ""));
      setInitialized(true);
    }
  }, [initialized, settingValue]);

  if (!initialized) {
    return <Skeleton className="h-16 w-full" />;
  }

  const original = settingValue !== undefined ? Number(settingValue) : undefined;
  const numeric = Number(value);
  const isValid = value.trim() !== "" && !Number.isNaN(numeric);
  const isDirty =
    settingValue !== undefined ? String(settingValue) !== value : false;
  const isLowering =
    meta.safetyRail && isValid && original !== undefined && numeric < original;

  function commit() {
    if (!isValid) return;
    update.mutate({ key: meta.key, value: numeric });
  }

  function handleSaveClick() {
    if (isLowering) {
      setConfirmOpen(true);
      return;
    }
    commit();
  }

  function handleConfirmLower() {
    setConfirmOpen(false);
    commit();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{t(`warehouseSettings.fields.${meta.key}.label`)}</Label>
        {meta.safetyRail && (
          <Badge
            variant="outline"
            className="border-amber-500 text-amber-700 dark:text-amber-500"
          >
            {t("warehouseSettings.safetyRailBadge")}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {t(`warehouseSettings.fields.${meta.key}.description`)}
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step={meta.step}
          min={meta.min}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="max-w-40"
        />
        <Button
          type="button"
          size="sm"
          variant={isLowering ? "destructive" : "outline"}
          disabled={!isDirty || !isValid || update.isPending}
          onClick={handleSaveClick}
        >
          {update.isPending
            ? t("warehouseSettings.actions.saving")
            : t("warehouseSettings.actions.save")}
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("warehouseSettings.lowerConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("warehouseSettings.lowerConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("warehouseSettings.lowerConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmLower}
            >
              {t("warehouseSettings.lowerConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const TEMPLATE_PLACEHOLDERS = ["name", "slot", "date", "code", "link"] as const;

function MessageTemplatesCard({ value: settingValue }: { value: unknown }) {
  const { t } = useTranslation();
  const update = useUpdateSetting();

  const [value, setValue] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized && settingValue !== undefined) {
      setValue(JSON.stringify(settingValue ?? {}, null, 2));
      setInitialized(true);
    }
  }, [initialized, settingValue]);

  const isDirty =
    settingValue !== undefined
      ? value !== JSON.stringify(settingValue ?? {}, null, 2)
      : false;

  function handleSave() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      setError(t("warehouseSettings.fields.message_templates.invalidJson"));
      return;
    }
    setError(null);
    update.mutate({ key: "message_templates", value: parsed });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("warehouseSettings.sections.messageTemplates.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("warehouseSettings.sections.messageTemplates.description")}
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          {!initialized ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={16}
              className="font-mono text-xs"
              spellCheck={false}
            />
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!isDirty || update.isPending}
            onClick={handleSave}
          >
            {update.isPending
              ? t("warehouseSettings.actions.saving")
              : t("warehouseSettings.actions.save")}
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">
            {t("warehouseSettings.placeholders.title")}
          </p>
          <ul className="space-y-2">
            {TEMPLATE_PLACEHOLDERS.map((ph) => (
              <li key={ph}>
                <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">
                  {`{${ph}}`}
                </code>
                <span className="ms-2 text-muted-foreground">
                  {t(`warehouseSettings.placeholders.${ph}`)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-700 dark:text-amber-500">
            {t("warehouseSettings.placeholders.codeNote")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
