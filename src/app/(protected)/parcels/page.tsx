"use client";

import { columns } from "@/components/tables/columns/parcels-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetParcels } from "@/lib/hooks/useParcel";
import { ParcelTable } from "@/lib/schema/parcel.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: parcels } = useGetParcels();

  const filterConfigs = [
    { key: "date", label: "Date", placeholder: "Date" },
    { key: "client_name", label: "Client", placeholder: "All Clients" },
    { key: "city_name", label: "City", placeholder: "All Cities" },
    { key: "zone_name", label: "Zone", placeholder: "All Zones" },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<ParcelTable>) => {
    const parcelId = row.getValue("tn") as string;
    router.replace(`/parcels/4`);
  };

  return (
    <div className="py-10 px-6">
      <DataTable
        columns={columns}
        data={parcels?.parcels || []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search parcels..."
        onRowClick={handleRowClick}
      />
    </div>
  );
}
