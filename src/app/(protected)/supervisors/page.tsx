import { DataTable } from "@/components/tables/data-table";
import { mockSupervisors as data } from "@/lib/data/mocks/supervisors.mock";
import { columns } from "@/components/tables/columns/supervisors-columns";

export default function page() {
  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "zone", label: "Zone", placeholder: "All Zones" },
    { key: "district", label: "District", placeholder: "All Districts" },
  ];

  return (
    <div className="w-full mx-auto py-10 px-6">
      <DataTable
        columns={columns}
        data={data}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search PUDO name..."
      />
    </div>
  );
}
