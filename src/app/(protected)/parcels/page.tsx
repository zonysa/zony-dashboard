"use client";

import { columns } from "@/components/tables/columns/parcels-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetParcels } from "@/lib/hooks/useParcel";
import { ParcelDetails } from "@/lib/schema/parcel.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  const { data: parcels } = useGetParcels();
  const router = useRouter();

  const filterConfigs = [
    { key: "date", label: t("table.date"), placeholder: t("table.date") },
    {
      key: "client_name",
      label: t("table.client"),
      placeholder: t("table.allClients"),
    },
    {
      key: "city_name",
      label: t("table.city"),
      placeholder: t("table.allCities"),
    },
    {
      key: "zone_name",
      label: t("table.zone"),
      placeholder: t("table.allZones"),
    },
  ];

  const handleRowClick = (row: Row<ParcelDetails>) => {
    const parcelId = row.getValue("id") as string;
    router.replace(`/parcels/${parcelId}`);
  };

  return (
    <div className="py-10 px-6">
      <DataTable
        columns={columns()}
        data={parcels?.parcels || []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("parcels.searchPlaceholder")}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
