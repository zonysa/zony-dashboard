"use client";

import { Columns } from "@/components/tables/columns/parcels-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetParcels } from "@/lib/hooks/useParcel";
import { ParcelDetails } from "@/lib/schema/parcel.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Can } from "@/components/auth/Can";
import { Permission } from "@/lib/rbac/permissions";

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("parcels.title")}</h1>
        <Can do={Permission.CREATE_PARCELS}>
          <Button onClick={() => router.push("/parcels/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Parcel
          </Button>
        </Can>
      </div>
      <DataTable
        columns={Columns({ t })}
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
