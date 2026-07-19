import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { ParcelDetails } from "@/lib/schema/parcel.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Code128Barcode } from "./Code128Barcode";

interface WaybillTemplateProps {
  parcel: ParcelDetails;
}

const EMPTY = "—";

function formatDate(dateString: string | null) {
  if (!dateString) return EMPTY;
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Printable A6 (105 x 148mm) bill of lading. Rendered both as the on-screen
// preview and, via the .waybill-print-area rule in globals.css, as the sole
// visible element when the page is sent to print.
export function WaybillTemplate({ parcel }: WaybillTemplateProps) {
  const { t, isRTL } = useTranslation();

  const senderLocation = parcel.sender?.location;
  const receiverLocation = parcel.receiver?.location;

  const deliveryMethodLabel = parcel.delivery_method
    ? t(`waybill.deliveryMethods.${parcel.delivery_method}` as never)
    : EMPTY;

  const sizeLabel = parcel.content?.size
    ? t(`forms.options.parcelSize.${parcel.content.size}`)
    : EMPTY;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="waybill-print-area mx-auto flex w-[105mm] min-h-[148mm] flex-col gap-2 border p-3 text-[8pt] shadow-sm print:border-0 print:shadow-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <Image src="/logo.png" alt="Zony" width={60} height={20} />
        <div className="text-center">
          <div className="text-[10pt] font-bold">{t("waybill.title")}</div>
          <div className="text-muted-foreground">
            {t("waybill.createdAt")}: {formatDate(parcel.created_at)}
          </div>
        </div>
        <QRCodeSVG value={parcel.tracking_number || ""} size={44} />
      </div>

      <hr />

      {/* Barcode */}
      <div className="flex flex-col items-center gap-0.5">
        <Code128Barcode value={parcel.barcode} className="w-full" />
        <div dir="ltr" className="font-mono text-[8pt]">
          {parcel.tracking_number || EMPTY}
        </div>
      </div>

      <hr />

      {/* Receiver — most prominent block, this is what the courier reads */}
      <div>
        <div className="text-[9pt] font-bold uppercase text-primary">
          {t("waybill.receiver")}
        </div>
        <div className="text-[10pt] font-bold">
          {parcel.receiver?.personal.name || EMPTY}
        </div>
        <div dir="ltr" className="text-start">
          {parcel.receiver?.personal.phone_number || EMPTY}
        </div>
        <div>
          {receiverLocation?.short_address || receiverLocation?.address || EMPTY}
        </div>
        <div className="text-muted-foreground">
          {[receiverLocation?.city, receiverLocation?.zone]
            .filter(Boolean)
            .join(" - ") || EMPTY}
        </div>
      </div>

      <hr />

      {/* Sender — compact */}
      <div>
        <div className="text-[8pt] font-semibold uppercase text-muted-foreground">
          {t("waybill.sender")}
        </div>
        <div className="grid grid-cols-2 gap-x-2">
          <div className="font-medium">{parcel.sender?.personal.name || EMPTY}</div>
          <div dir="ltr" className="text-end">
            {parcel.sender?.personal.phone_number || EMPTY}
          </div>
        </div>
        <div className="text-muted-foreground">
          {senderLocation?.city || EMPTY}
        </div>
      </div>

      <hr />

      {/* Content + logistics */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <div className="col-span-2">
          <span className="text-muted-foreground">
            {t("waybill.description")}:
          </span>{" "}
          {parcel.content?.description || EMPTY}
        </div>
        <div>
          <span className="text-muted-foreground">{t("waybill.size")}:</span>{" "}
          {sizeLabel}
        </div>
        <div>
          <span className="text-muted-foreground">
            {t("waybill.quantity")}:
          </span>{" "}
          {parcel.content?.quantity ?? EMPTY}
        </div>
        <div>
          <span className="text-muted-foreground">
            {t("waybill.weightKg")}:
          </span>{" "}
          {parcel.content?.weight ?? EMPTY}
        </div>
        <div>
          <span className="text-muted-foreground">
            {t("waybill.pickupPeriod")}:
          </span>{" "}
          {parcel.pickup_period ?? EMPTY}
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">
            {t("waybill.deliveryMethod")}:
          </span>{" "}
          {deliveryMethodLabel}
        </div>
      </div>

      <hr />

      {/* Footer */}
      <div className="mt-auto text-center text-[6pt] text-muted-foreground">
        <div>{t("waybill.scanToTrack")}</div>
        <div>Zony</div>
      </div>
    </div>
  );
}
