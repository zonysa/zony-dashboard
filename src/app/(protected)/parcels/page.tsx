"use client";

import { columns } from "@/components/tables/columns/parcels-columns";
import { DataTable } from "@/components/tables/data-table";
import { mockParcels as data } from "@/lib/data/mocks/parcels.mock";
import { Parcel } from "@/lib/schema/parcels.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const filterConfigs = [
    { key: "date", label: "Date", placeholder: "Date" },
    { key: "client", label: "Client", placeholder: "All Clients" },
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "zone", label: "Zone", placeholder: "All Zones" },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<Parcel>) => {
    const zoneId = row.getValue("TN") as string;
    router.replace(`/parcels/${zoneId}`);
  };

  return (
    <div className="container mx-auto py-10 px-6">
      <DataTable
        columns={columns}
        data={data}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search partners..."
        onRowClick={handleRowClick}
      />
    </div>
  );
}
