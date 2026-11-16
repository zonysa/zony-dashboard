"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { FeedColumns } from "@/components/tables/columns/parcel-feed-columns";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetParcelFeed } from "@/lib/hooks/useParcel";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ParcelFeedRow } from "@/lib/schema/parcel.schema";

const PER_PAGE = 10;

/**
 * The parcels a courier carries, from the Parcels feed narrowed to them —
 * PUDO parcels assigned to them and warehouse parcels checked out to them.
 * Same row and columns as the Parcels page, minus the assign action.
 */
export function CourierParcelsCard({ courierId }: { courierId: string }) {
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetParcelFeed({
    courier_id: courierId,
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
    <Card>
      <CardHeader>
        <CardTitle>{t("users.sections.courierParcels")}</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
