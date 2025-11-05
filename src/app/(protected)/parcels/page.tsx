"use client";

import { columns } from "@/components/tables/columns/parcels-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetParcels } from "@/lib/hooks/useParcel";
import { getParcelsRes, ParcelDetails } from "@/lib/schema/parcel.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data, isLoading, error } = useGetParcels();

  const filterConfigs = [
    { key: "date", label: "Date", placeholder: "Date" },
    { key: "client_name", label: "Client", placeholder: "All Clients" },
    { key: "city_name", label: "City", placeholder: "All Cities" },
    { key: "zone_name", label: "Zone", placeholder: "All Zones" },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<ParcelDetails>) => {
    const parcelId = row.getValue("id") as string;
    router.replace(`/parcels/${parcelId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading parcels</div>;

  const parcelsData = data as getParcelsRes;

  return (
    <div className="py-10 px-6">
      <DataTable
        columns={columns()}
        data={parcelsData.parcels || []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search parcels..."
        onRowClick={handleRowClick}
      />
    </div>
  );
}
