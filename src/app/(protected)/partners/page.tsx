import { columns } from "@/components/tables/columns/partners-columns";
import { DataTable } from "@/components/tables/data-table";
import { mockPartners as data } from "@/lib/data/mocks/partner.mock";

export default async function Page() {
  const filterConfigs = [
    { key: "type", label: "Type", placeholder: "All Types" },
  ];
  return (
    <div className="container mx-auto py-10 px-6">
      <DataTable
        columns={columns}
        data={data}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search partners..."
      />
    </div>
  );
}
