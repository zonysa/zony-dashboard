"use client";

import { branchColumns } from "@/components/tables/columns/branches-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetBranches } from "@/lib/hooks/useBranch";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { BranchDetails } from "@/lib/schema/branch.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: branches } = useGetBranches();
  const columns = branchColumns();
  const { t } = useTranslation();

  const filterConfigs = [
    { key: "city", label: t("table.city"), placeholder: t("table.allCities") },
    { key: "zone", label: t("table.zone"), placeholder: t("table.allZones") },
    {
      key: "district",
      label: t("table.district"),
      placeholder: t("table.allDistricts"),
    },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<BranchDetails>) => {
    const pudoId = row.getValue("id") as string;
    router.replace(`/pudos/${pudoId}`);
  };

  return (
    <div className="py-10 px-6">
      <DataTable
        columns={columns}
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
