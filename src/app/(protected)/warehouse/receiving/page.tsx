"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertTriangle, Loader2, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useGetZones,
  useReceivingLookup,
  useReceivingScan,
  useResendCode,
} from "@/lib/hooks/useWarehouse";
import {
  ReceivingLookupMode,
  ReceivingPrefill,
  ReceivingScanData,
  receivingScanSchema,
  WHReceivingScanRes,
} from "@/lib/schema/warehouse.schema";
import { toE164SaudiPhone } from "@/lib/validators/phone";

// The schema's `experiment_arm` has a zod `.default()`, which makes it
// optional on input but required on output — so the form's live field
// values (input) and the resolver's validated submit payload (output,
// `ReceivingScanData`) are two different types. RHF's 3-generic `useForm`
// signature is what lets `onSubmit` receive the fully-defaulted output type.
type ReceivingScanFormInput = z.input<typeof receivingScanSchema>;

function buildDefaultValues(): ReceivingScanFormInput {
  return {
    barcode: "",
    tracking_ref: "",
    recipient_name: "",
    recipient_phone: "",
    address: { line1: "", district: "", city: "", notes: "" },
    zone_id: undefined,
    experiment_arm: "treatment",
    client_event_id: mintClientEventId(),
  };
}

export default function ReceivingPage() {
  const { t } = useTranslation();
  const { data: zonesData } = useGetZones();
  const receivingScan = useReceivingScan();
  const resendCode = useResendCode();
  const lookup = useReceivingLookup();

  const [result, setResult] = useState<WHReceivingScanRes | null>(null);

  // Which identifier the clerk is typing. One visible field, not two: the box
  // in their hand carries one or the other, and asking for both up front is
  // what made this screen feel like data entry rather than a scan.
  const [lookupMode, setLookupMode] = useState<ReceivingLookupMode>("barcode");
  const [lookupTried, setLookupTried] = useState(false);
  const [prefillSource, setPrefillSource] = useState<ReceivingLookupMode | null>(
    null,
  );

  const form = useForm<ReceivingScanFormInput, unknown, ReceivingScanData>({
    resolver: zodResolver(receivingScanSchema),
    defaultValues: buildDefaultValues(),
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const resolvedBarcode = watch("barcode");
  const resolvedTrackingRef = watch("tracking_ref");

  // Autofocus the identifier field on load and after every reset so a clerk can
  // start scanning the next parcel without touching the mouse.
  useEffect(() => {
    setFocus(lookupMode);
  }, [setFocus, lookupMode]);

  function applyPrefill(prefill: ReceivingPrefill) {
    const options = { shouldValidate: true, shouldDirty: true } as const;

    if (prefill.barcode) form.setValue("barcode", prefill.barcode, options);
    if (prefill.tracking_ref)
      form.setValue("tracking_ref", prefill.tracking_ref, options);

    // The receiver block is replaced wholesale — a half-applied lookup mixing
    // one customer's name with another's address is worse than an empty form.
    // `address.notes` is the clerk's own observation about the box, so it stays.
    form.setValue("recipient_name", prefill.recipient_name, options);
    form.setValue("recipient_phone", prefill.recipient_phone, options);
    form.setValue("address.line1", prefill.address.line1 ?? "", options);
    form.setValue("address.district", prefill.address.district ?? "", options);
    form.setValue("address.city", prefill.address.city ?? "", options);

    setPrefillSource(prefill.source);
  }

  function handleLookup() {
    const value = (form.getValues(lookupMode) ?? "").trim();
    if (!value || lookup.isPending) {
      setFocus(lookupMode);
      return;
    }

    lookup.mutate(
      { mode: lookupMode, value },
      {
        onSuccess: (prefill) => {
          setLookupTried(true);
          if (!prefill) {
            // Not an error: at receiving, most boxes are genuinely new.
            toast.info(
              lookupMode === "barcode"
                ? t("warehouseReceiving.lookup.notFoundBarcode")
                : t("warehouseReceiving.lookup.notFoundTracking"),
            );
            setFocus("recipient_name");
            return;
          }
          applyPrefill(prefill);
          toast.success(t("warehouseReceiving.lookup.filled"));
          setFocus("recipient_name");
        },
        onError: (error) => {
          setLookupTried(true);
          toast.error(error?.message || t("warehouseReceiving.lookup.failed"));
        },
      },
    );
  }

  function handleIdentifierKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      // A scanner "types" the value then sends Enter. Run the lookup rather
      // than submitting a form whose recipient fields are still empty — on a
      // miss the handler focuses the recipient field anyway, so the keyboard
      // path is the same either way.
      e.preventDefault();
      handleLookup();
    }
  }

  function handleModeChange(mode: ReceivingLookupMode) {
    // Values already typed/resolved are kept — only the visible field swaps.
    // Focus follows in the effect above, once the new field has mounted.
    setLookupMode(mode);
    setLookupTried(false);
  }

  async function onSubmit(data: ReceivingScanData) {
    const payload: ReceivingScanData = {
      ...data,
      recipient_phone: toE164SaudiPhone(data.recipient_phone),
    };

    try {
      await receivingScan.mutateAsync(payload, {
        onSuccess: (data) => {
          setResult(data);
        },
      });
    } catch (err) {
      // useReceivingScan's onError already toasts the server message; this
      // only guards against an unhandled rejection reaching the console.
      console.error("Receiving scan failed:", err);
    }
  }

  function handleDismissResult() {
    setResult(null);
    form.reset(buildDefaultValues());
    setLookupTried(false);
    setPrefillSource(null);
    lookup.reset();
    setFocus(lookupMode);
  }

  function handleResendCode() {
    if (!result) return;
    resendCode.mutate({ id: result.parcel.id, clientEventId: mintClientEventId() });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <PageContainer size="md" className="px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          {t("warehouseReceiving.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("warehouseReceiving.subtitle")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("warehouseReceiving.lookup.cardTitle")}</CardTitle>
              {/* CardAction is the header's trailing-edge slot — it flips the
                  header to a two-column grid and pins this to the far side of
                  the title, mirroring correctly under RTL. */}
              <CardAction>
                <div
                  role="group"
                  aria-label={t("warehouseReceiving.lookup.modeLabel")}
                  className="bg-muted flex items-center gap-1 rounded-lg p-1"
                >
                  <Button
                    type="button"
                    size="sm"
                    variant={lookupMode === "barcode" ? "default" : "ghost"}
                    aria-pressed={lookupMode === "barcode"}
                    className="h-7"
                    onClick={() => handleModeChange("barcode")}
                  >
                    {t("warehouseReceiving.lookup.barcode")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={lookupMode === "tracking_ref" ? "default" : "ghost"}
                    aria-pressed={lookupMode === "tracking_ref"}
                    className="h-7"
                    onClick={() => handleModeChange("tracking_ref")}
                  >
                    {t("warehouseReceiving.lookup.trackingRef")}
                  </Button>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                key={lookupMode}
                name={lookupMode}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {lookupMode === "barcode"
                        ? t("warehouseReceiving.lookup.barcode")
                        : t("warehouseReceiving.lookup.trackingRef")}
                    </FormLabel>
                    {/* Input flexes, Fetch stays flush to the trailing edge. */}
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          autoFocus
                          autoComplete="off"
                          placeholder={
                            lookupMode === "barcode"
                              ? t("warehouseReceiving.lookup.barcodePlaceholder")
                              : t("warehouseReceiving.lookup.trackingPlaceholder")
                          }
                          className="min-w-0 flex-1 font-mono text-lg"
                          onKeyDown={handleIdentifierKeyDown}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0"
                        disabled={lookup.isPending || !field.value?.trim()}
                        onClick={handleLookup}
                      >
                        {lookup.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        {lookup.isPending
                          ? t("warehouseReceiving.lookup.fetching")
                          : t("warehouseReceiving.lookup.fetch")}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {lookupMode === "barcode"
                        ? t("warehouseReceiving.lookup.barcodeHint")
                        : t("warehouseReceiving.lookup.trackingHint")}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* The other identifier, once something has resolved it. Shown
                  read-only rather than as a second input: it came from the
                  lookup, so editing it here would only desync the two. */}
              {lookupMode === "barcode" && !!resolvedTrackingRef && (
                <p className="text-muted-foreground text-xs">
                  {t("warehouseReceiving.lookup.trackingRef")}:{" "}
                  <span className="text-foreground font-mono">
                    {resolvedTrackingRef}
                  </span>
                </p>
              )}

              {/* E01 requires a barcode, but in tracking mode it's not what the
                  clerk typed — it normally arrives with the lookup. Only ask
                  for it once a lookup has run without producing one, so the
                  common path stays a single field. `errors.barcode` is in the
                  condition because submitting without ever fetching fails
                  validation on a field that would otherwise be invisible. */}
              {lookupMode === "tracking_ref" &&
                (resolvedBarcode ? (
                  <p className="text-muted-foreground text-xs">
                    {t("warehouseReceiving.fields.barcode")}:{" "}
                    <span className="text-foreground font-mono">
                      {resolvedBarcode}
                    </span>
                  </p>
                ) : (
                  (lookupTried || !!errors.barcode) && (
                    <FormField
                      control={control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("warehouseReceiving.fields.barcode")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              autoComplete="off"
                              placeholder={t(
                                "warehouseReceiving.lookup.barcodePlaceholder",
                              )}
                              className="font-mono"
                            />
                          </FormControl>
                          <p className="text-muted-foreground text-xs">
                            {t("warehouseReceiving.lookup.barcodeStillNeeded")}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("forms.sections.receiverInfo")}</CardTitle>
              {prefillSource && (
                <p className="text-muted-foreground text-xs">
                  {prefillSource === "barcode"
                    ? t("warehouseReceiving.lookup.sourceWarehouse")
                    : t("warehouseReceiving.lookup.sourceParcels")}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="recipient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseReceiving.fields.recipientName")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="recipient_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseReceiving.fields.recipientPhone")}</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="address.line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseReceiving.fields.addressLine1")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="address.district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("warehouseReceiving.fields.district")}</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("warehouseReceiving.fields.city")}</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="address.notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseReceiving.fields.notes")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <FormField
                control={control}
                name="zone_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseReceiving.fields.zone")}</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : Number(value))
                      }
                      value={field.value !== undefined ? String(field.value) : "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {t("warehouseReceiving.fields.noZone")}
                        </SelectItem>
                        {zonesData?.zones?.map((zone) => (
                          <SelectItem key={zone.id} value={String(zone.id)}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="experiment_arm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseReceiving.fields.experimentArm")}</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={field.value === "treatment" ? "default" : "outline"}
                        onClick={() => field.onChange("treatment")}
                      >
                        {t("warehouseReceiving.fields.treatment")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={field.value === "control" ? "default" : "outline"}
                        onClick={() => field.onChange("control")}
                      >
                        {t("warehouseReceiving.fields.control")}
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full py-6" disabled={isSubmitting}>
            {isSubmitting
              ? t("warehouseReceiving.actions.submitting")
              : t("warehouseReceiving.actions.submit")}
          </Button>
        </form>
      </Form>

      <Dialog open={!!result}>
        <DialogContent
          showCloseButton={false}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>{t("warehouseReceiving.codeDialog.title")}</DialogTitle>
            <DialogDescription className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t("warehouseReceiving.codeDialog.warning")}</span>
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div>
                  {t("warehouseReceiving.codeDialog.recipient")}:{" "}
                  <span className="text-foreground">{result.parcel.recipient_name}</span>
                </div>
                <div>
                  {t("warehouseReceiving.codeDialog.barcode")}:{" "}
                  <span className="text-foreground font-mono">
                    {result.parcel.barcode}
                  </span>
                </div>
              </div>

              {result.delivery_code ? (
                <div className="rounded-lg border-2 border-amber-500 bg-amber-50 py-6 text-center dark:bg-amber-950/30">
                  <div className="font-mono text-5xl font-bold tracking-[0.3em] text-amber-700 dark:text-amber-400">
                    {result.delivery_code}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm">
                  <p>{t("warehouseReceiving.codeDialog.codeUnavailable")}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={resendCode.isPending}
                    onClick={handleResendCode}
                  >
                    {t("warehouseReceiving.codeDialog.rotateAndResend")}
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("warehouseReceiving.codeDialog.customerMessage")}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="muted">{result.message_channel}</Badge>
                  <Badge variant={result.message_sent ? "success" : "destructive"}>
                    {result.message_sent
                      ? t("warehouseReceiving.codeDialog.sent")
                      : t("warehouseReceiving.codeDialog.notSent")}
                  </Badge>
                  <span className="text-muted-foreground">{result.message_status}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {result?.delivery_code && (
              <Button type="button" variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                {t("warehouseReceiving.actions.print")}
              </Button>
            )}
            <Button type="button" onClick={handleDismissResult} className="flex-1">
              {t("warehouseReceiving.actions.dismiss")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {result?.delivery_code && (
        <div className="wh-code-print-area hidden flex-col items-center justify-center gap-4 p-6 text-center print:flex">
          <div className="text-lg font-semibold">
            {t("warehouseReceiving.printSlip.title")}
          </div>
          <div className="font-mono text-4xl font-bold tracking-[0.3em]">
            {result.delivery_code}
          </div>
          <div className="text-sm">{result.parcel.recipient_name}</div>
          <div className="font-mono text-sm">{result.parcel.barcode}</div>
          <div className="text-xs text-muted-foreground">
            {t("warehouseReceiving.printSlip.receivedAt")}: {result.parcel.created_at}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
