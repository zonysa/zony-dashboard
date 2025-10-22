"use client";

import { branchColumns } from "@/components/tables/columns/branches-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetBranches } from "@/lib/hooks/useBranch";
import { BranchDetails } from "@/lib/schema/branch.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: branches } = useGetBranches();

  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "zone", label: "Zone", placeholder: "All Zones" },
    { key: "district", label: "District", placeholder: "All Districts" },
    { key: "status", label: "Status", placeholder: "All Statuses" },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<BranchDetails>) => {
    const pudoId = row.getValue("id") as string;
    router.replace(`/pudos/${pudoId}`);
  };

  return (
    <div className="py-10 px-6">
      <DataTable
        columns={branchColumns}
        data={branches?.pudos || []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search PUDO name..."
        onRowClick={handleRowClick}
      />
    </div>
  );
}
