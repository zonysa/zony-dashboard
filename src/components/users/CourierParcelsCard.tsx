"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import {
  Period,
  PeriodFilter,
  periodRange,
} from "@/components/PeriodFilter";
import { FeedColumns } from "@/components/tables/columns/parcel-feed-columns";
import { DataTable } from "@/components/tables/data-table";
import { DateRange } from "@/components/ui/date-range-picker";
import { useGetParcelFeed } from "@/lib/hooks/useParcel";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ParcelFeedRow } from "@/lib/schema/parcel.schema";

const PER_PAGE = 10;

/**
 * The parcels a courier carries, from the Parcels feed narrowed to them —
 * PUDO parcels assigned to them and warehouse parcels checked out to them —
 * within a created-date period. Same row and columns as the Parcels page,
 * minus the assign action.
 */
export function CourierParcelsCard({ courierId }: { courierId: string }) {
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  // A courier's history, not today's queue: start from everything.
  const [period, setPeriod] = useState<Period>("all");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const range = periodRange(period, customRange);

  const { data, isLoading } = useGetParcelFeed({
    courier_id: courierId,
    start_date: range.start,
    end_date: range.end,
    page,
    limit: PER_PAGE,
  });

  // The two flows have separate detail screens keyed differently (see the
  // Parcels page), so this is the same routing rather than a shared path.
  const handleRowClick = (row: Row<ParcelFeedRow>) => {
    const parcel = row.original;
    if (parcel.flow === "warehouse") {
      router.push(`/warehouse/parcels/${parcel.id}`);
    } else if (parcel.tracking_number) {
      router.push(`/parcels/${parcel.tracking_number}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PeriodFilter
        period={period}
        onPeriodChange={(p) => {
          setPeriod(p);
          setPage(1);
        }}
        customRange={customRange}
        onCustomRangeChange={(r) => {
          setCustomRange(r);
          setPage(1);
        }}
      />
      {!isLoading && !data?.parcels.length ? (
        <p className="text-sm text-muted-foreground">
          {t("users.sections.courierParcelsEmpty")}
        </p>
      ) : (
        <DataTable
          columns={FeedColumns({ t, language: currentLanguage })}
          data={data?.parcels ?? []}
          onRowClick={handleRowClick}
          serverSide={true}
          pageCount={data?.total_pages ?? 0}
          pageIndex={page - 1}
          onPageChange={(pageIndex) => setPage(pageIndex + 1)}
          totalResults={data?.total_parcels}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
