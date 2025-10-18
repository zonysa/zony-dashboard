import { columns } from "@/components/tables/columns/customer-service-columns";
import { DataTable } from "@/components/tables/data-table";
import { mockCustomerService as data } from "@/lib/data/mocks/customer-service.mock";

export default async function Page() {
  const filterConfigs = [
    { key: "status", label: "Status", placeholder: "Choose Status" },
  ];
  return (
    <div className="w-full py-10 px-6">
      <DataTable
        columns={columns}
        data={data}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search Cusomter Service..."
      />
    </div>
  );
}
