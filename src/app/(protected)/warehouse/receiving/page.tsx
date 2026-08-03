"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertTriangle, Printer } from "lucide-react";
import { z } from "zod";

import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  useReceivingScan,
  useResendCode,
} from "@/lib/hooks/useWarehouse";
import {
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

  const [result, setResult] = useState<WHReceivingScanRes | null>(null);

  const form = useForm<ReceivingScanFormInput, unknown, ReceivingScanData>({
    resolver: zodResolver(receivingScanSchema),
    defaultValues: buildDefaultValues(),
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = form;

  // Autofocus the barcode field on load and after every reset so a clerk can
  // start scanning the next parcel without touching the mouse.
  useEffect(() => {
    setFocus("barcode");
  }, [setFocus]);

  function handleBarcodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      // A scanner "types" the barcode then sends Enter — advance to the next
      // field instead of attempting a submit with the rest of the form empty.
      e.preventDefault();
      setFocus("recipient_name");
    }
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
    setFocus("barcode");
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
              <CardTitle>{t("warehouseReceiving.fields.barcode")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseReceiving.fields.barcode")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoFocus
                        autoComplete="off"
                        placeholder={t("warehouseReceiving.fields.barcodePlaceholder")}
                        className="text-lg font-mono"
                        onKeyDown={handleBarcodeKeyDown}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="tracking_ref"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseReceiving.fields.trackingRef")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("forms.sections.receiverInfo")}</CardTitle>
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
