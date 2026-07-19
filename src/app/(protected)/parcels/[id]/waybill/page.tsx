"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetParcel } from "@/lib/hooks/useParcel";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { WaybillTemplate } from "@/components/parcels/waybill";

export default function WaybillPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-10 h-[148mm] w-[105mm]" />}>
      <WaybillPageContent />
    </Suspense>
  );
}

function WaybillPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const parcelId = (params.id as string) || "";
  const autoprint = searchParams.get("autoprint") === "1";

  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetParcel(parcelId);
  const hasAutoPrinted = useRef(false);

  const parcel = data?.parcel;

  useEffect(() => {
    if (autoprint && parcel && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true;
      window.print();
    }
  }, [autoprint, parcel]);

  if (!parcelId) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 py-10">
      <div className="flex w-full max-w-[105mm] items-center justify-between print:hidden">
        <Button variant="ghost" asChild>
          <Link href={`/parcels/${parcelId}`}>
            <ArrowLeft className="h-4 w-4" />
            {t("waybill.backToParcel")}
          </Link>
        </Button>
        <Button onClick={() => window.print()} disabled={!parcel}>
          <Printer className="h-4 w-4" />
          {t("waybill.print")}
        </Button>
      </div>

      {isLoading && <Skeleton className="h-[148mm] w-[105mm]" />}

      {isError && (
        <div className="text-sm text-muted-foreground">
          {t("waybill.notFound")}
        </div>
      )}

      {parcel && <WaybillTemplate parcel={parcel} />}
    </div>
  );
}
