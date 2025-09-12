import { branchColumns } from "@/components/tables/columns/branches-columns";
import { DataTable } from "@/components/tables/data-table";
import { mockBranches as data } from "@/lib/data/mocks/branches.mock";

export default function page() {
  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "zone", label: "Zone", placeholder: "All Zones" },
    { key: "district", label: "District", placeholder: "All Districts" },
    { key: "status", label: "Status", placeholder: "All Statuses" },
  ];

  return (
    <div className="container mx-auto py-10 px-6">
      <DataTable
        columns={branchColumns}
        data={data}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search PUDO name..."
      />
    </div>
  );
}
