"use client";

import { useEffect, useState } from "react";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import {
  FeedColumns,
  parcelStatusLabel,
} from "@/components/tables/columns/parcel-feed-columns";
import { DataTable } from "@/components/tables/data-table";
import { PageContainer } from "@/components/PageContainer";
import { FeedAssignDialog } from "@/components/parcels/FeedAssignDialog";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGetParcelFeed } from "@/lib/hooks/useParcel";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Permission } from "@/lib/rbac/permissions";
import {
  ParcelFeedFacets,
  ParcelFeedRow,
  parcelFeedFilterOptions,
  ParcelFlow,
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
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const canAssign = hasPermission(Permission.MANAGE_WAREHOUSE);
  // Rendered outside the table: a portalled dialog still bubbles React click
  // events up its component tree, so inside a row it would trigger row-click.
  const [assignRow, setAssignRow] = useState<ParcelFeedRow | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const query: parcelFeedFilterOptions = {
    page,
    limit: 50,
    flow: "all",
    // Barcode is the one identifier both flows carry, so it is what a single
    // search box can honestly match on.
    barcode: debouncedSearch || undefined,
    route: (filters.route as ParcelRoute) || undefined,
    status: filters.status || undefined,
    city: filters.city || undefined,
    source: (filters.source as ParcelFlow) || undefined,
    // DataTable's dateRange filters emit `${key}_from` / `${key}_to`.
    start_date: filters.created_from || undefined,
    end_date: filters.created_to || undefined,
    received_start_date: filters.received_from || undefined,
    received_end_date: filters.received_to || undefined,
  };

  const { data: parcels, isLoading } = useGetParcelFeed(query);

  // Status and city options come from the feed itself: the two flows have
  // different status vocabularies, and a warehouse row's city can be a
  // free-text address snapshot, so no fixed list would match the rows. The
  // server computes these before filtering, so they don't shrink as filters
  // apply — held here so the dropdowns don't empty while a new page loads.
  const [facets, setFacets] = useState<ParcelFeedFacets>();
  useEffect(() => {
    if (parcels?.facets) setFacets(parcels.facets);
  }, [parcels?.facets]);

  // Every filter here matches a value both flows carry. Client/zone stay out:
  // they are PUDO-only fields and would silently drop every warehouse row.
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
        {
          label: t("parcelFeed.routes.warehouse_pudo_customer"),
          value: "warehouse_pudo_customer",
        },
        { label: t("parcelFeed.routes.unknown"), value: "unknown" },
      ],
    },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
      options: (facets?.statuses ?? []).map((status) => ({
        // Same label the Status column shows for it.
        label: parcelStatusLabel(t, status),
        value: status,
      })),
    },
    {
      key: "city",
      label: t("table.city"),
      placeholder: t("table.allCities"),
      options: (facets?.cities ?? []).map((city) => ({
        label: city,
        value: city,
      })),
    },
    {
      key: "source",
      label: t("parcelFeed.flow"),
      placeholder: t("parcelFeed.allSources"),
      options: (["pudo", "warehouse"] as const).map((flow) => ({
        label: t(`parcelFeed.flows.${flow}`),
        value: flow,
      })),
    },
    {
      key: "created",
      type: "dateRange" as const,
      label: t("parcelFeed.createdDate"),
      placeholder: t("parcelFeed.anyDate"),
    },
    {
      key: "received",
      type: "dateRange" as const,
      label: t("parcelFeed.receiptDate"),
      placeholder: t("parcelFeed.anyDate"),
    },
  ];

  // Any change to what is being queried has to send us back to page 1 —
  // staying on page 4 of the old result set would show an empty table.
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

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
        columns={FeedColumns({
          t,
          language: currentLanguage,
          onAssign: canAssign ? setAssignRow : undefined,
        })}
        data={parcels?.parcels || []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("parcelFeed.searchPlaceholder")}
        onRowClick={handleRowClick}
        serverSide={true}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        pageCount={parcels?.total_pages ?? 0}
        pageIndex={page - 1}
        onPageChange={(pageIndex) => setPage(pageIndex + 1)}
        totalResults={parcels?.total_parcels}
        isLoading={isLoading}
      />

      {assignRow && (
        <FeedAssignDialog
          row={assignRow}
          onClose={() => setAssignRow(null)}
        />
      )}
    </PageContainer>
  );
}
