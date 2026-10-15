"use client";

import { useEffect, useRef, useState } from "react";

import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useResolvedWarehouseId,
  WarehouseSelect,
} from "@/components/warehouse/WarehouseSelect";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useDispatchScan,
  useGetCarriers,
  useGetMerchants,
} from "@/lib/hooks/useWarehouse";

type Scanned = { barcode: string; merchant: string; carrier: string };

// 3PL intake. Keyboard-first: merchant and carrier stay set between scans, the
// barcode field clears and refocuses after each one. The idempotency key is
// minted once per scan attempt and only rotated on success, so a retry after a
// timeout replays the same event instead of creating a second parcel.
export default function DispatchIntakePage() {
  const { t } = useTranslation();
  const { warehouseId } = useResolvedWarehouseId();
  const { data: merchantsData } = useGetMerchants();
  const { data: carriersData } = useGetCarriers();
  const scan = useDispatchScan();

  const merchants = (merchantsData?.merchants ?? []).filter((m) => m.is_active);
  const carriers = (carriersData?.carriers ?? []).filter((c) => c.is_active);

  const [merchantId, setMerchantId] = useState("");
  const [carrierId, setCarrierId] = useState("");
  const [barcode, setBarcode] = useState("");
  const [clientEventId, setClientEventId] = useState(() => mintClientEventId());
  const [recent, setRecent] = useState<Scanned[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const ready =
    !!warehouseId && !!merchantId && !!carrierId && !!barcode.trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || scan.isPending) return;
    try {
      await scan.mutateAsync({
        warehouse_id: warehouseId!,
        client_event_id: clientEventId,
        barcode: barcode.trim(),
        merchant_id: Number(merchantId),
        carrier_id: Number(carrierId),
      });
      setRecent((prev) =>
        [
          {
            barcode: barcode.trim(),
            merchant:
              merchants.find((m) => String(m.id) === merchantId)?.name ?? "",
            carrier:
              carriers.find((c) => String(c.id) === carrierId)?.code ?? "",
          },
          ...prev,
        ].slice(0, 20),
      );
      setBarcode("");
      setClientEventId(mintClientEventId());
      inputRef.current?.focus();
    } catch (err) {
      // useDispatchScan's onError already toasts the server message. Keep the
      // barcode and event id so the clerk can retry the same scan.
      console.error("Dispatch scan failed:", err);
    }
  }

  return (
    <PageContainer size="lg" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseDispatch.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseDispatch.subtitle")}
          </p>
        </div>
        <WarehouseSelect />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("warehouseDispatch.merchant")}
                </label>
                <Select
                  value={merchantId || undefined}
                  onValueChange={setMerchantId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t("warehouseDispatch.merchantPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("warehouseDispatch.carrier")}
                </label>
                <Select
                  value={carrierId || undefined}
                  onValueChange={setCarrierId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t("warehouseDispatch.carrierPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.code} · {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                ref={inputRef}
                dir="ltr"
                value={barcode}
                maxLength={64}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder={t("warehouseDispatch.barcodePlaceholder")}
                autoComplete="off"
                className="font-mono"
              />
              <Button type="submit" disabled={!ready || scan.isPending}>
                {scan.isPending
                  ? t("warehouseDispatch.receiving")
                  : t("warehouseDispatch.receive")}
              </Button>
            </div>
            {(!merchantId || !carrierId) && (
              <p className="text-xs text-muted-foreground">
                {t("warehouseDispatch.pickFirst")}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("warehouseDispatch.recent")}</CardTitle>
          <Badge variant="secondary">{recent.length}</Badge>
        </CardHeader>
        <CardContent>
          {!recent.length ? (
            <p className="text-sm text-muted-foreground">
              {t("warehouseDispatch.recentEmpty")}
            </p>
          ) : (
            <ul className="divide-y text-sm">
              {recent.map((r, i) => (
                <li
                  key={`${r.barcode}-${i}`}
                  className="flex justify-between py-2"
                >
                  <span className="font-mono">{r.barcode}</span>
                  <span className="text-muted-foreground">
                    {r.merchant} → {r.carrier}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
