"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { FeedColumns } from "@/components/tables/columns/parcel-feed-columns";
import { DataTable } from "@/components/tables/data-table";
import { PageContainer } from "@/components/PageContainer";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGetParcelFeed } from "@/lib/hooks/useParcel";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  ParcelFeedRow,
  parcelFeedFilterOptions,
  ParcelRoute,
} from "@/lib/schema/parcel.schema";

/**
 * Every parcel Zony handles, across both flows.
 *
 * The PUDO flow (`parcels`) and the warehouse module (`wh_parcels`) share no
 * tables, so this page reads the cross-flow feed rather than either one — see
 * `app/core/services/parcel_feed.py`. A row therefore has to be routed to the
 * right detail screen by its `flow`, and several columns are legitimately empty
 * for one flow or the other.
 */
export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const query: parcelFeedFilterOptions = {
    page: 1,
    limit: 50,
    flow: "all",
    // Barcode is the one identifier both flows carry, so it is what a single
    // search box can honestly match on.
    barcode: debouncedSearch || undefined,
    route: (filters.route as ParcelRoute) || undefined,
  };

  const { data: parcels, isLoading } = useGetParcelFeed(query);

  // Only route is offered. The old client/city/zone filters were PUDO-only
  // fields, so on a merged list they would silently drop every warehouse row —
  // worse than not offering them. They come back if the backend learns to map
  // them onto both flows.
  const filterConfigs = [
    {
      key: "route",
      label: t("parcelFeed.type"),
      placeholder: t("parcelFeed.allTypes"),
      options: [
        {
          label: t("parcelFeed.routes.customer_direct"),
          value: "customer_direct",
        },
        { label: t("parcelFeed.routes.pudo_customer"), value: "pudo_customer" },
        {
          label: t("parcelFeed.routes.warehouse_customer"),
          value: "warehouse_customer",
        },
        { label: t("parcelFeed.routes.unknown"), value: "unknown" },
      ],
    },
  ];

  const handleRowClick = (row: Row<ParcelFeedRow>) => {
    const parcel = row.original;
    // The two flows have separate detail screens keyed differently: the PUDO
    // one by tracking number, the warehouse one by id. A warehouse parcel has
    // no tracking number at all, so this cannot be one shared path.
    if (parcel.flow === "warehouse") {
      router.push(`/warehouse/parcels/${parcel.id}`);
      return;
    }
    if (parcel.tracking_number) {
      router.push(`/parcels/${parcel.tracking_number}`);
    }
  };

  return (
    <PageContainer size="xl" className="py-10 px-6">
      <DataTable
        columns={FeedColumns({ t })}
        data={parcels?.parcels || []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("parcelFeed.searchPlaceholder")}
        onRowClick={handleRowClick}
        serverSide={true}
        onFilterChange={setFilters}
        onSearchChange={setSearch}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
