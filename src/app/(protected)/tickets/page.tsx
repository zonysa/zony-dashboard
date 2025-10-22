import { columns } from "@/components/tables/columns/tickets-columns";
import { DataTable } from "@/components/tables/data-table";
import { mockTickets as data } from "@/lib/data/mock/tickets.mock";

export default async function Page() {
  const filterConfigs = [
    { key: "pudo", label: "PUDO", placeholder: "All PUDOs" },
    { key: "action-taken", label: "Action Taken", placeholder: "All Actions" },
    { key: "rating", label: "Rating", placeholder: "All Ratings" },
  ];
  return (
    <div className="w-full py-10 px-6">
      <DataTable
        columns={columns}
        data={data}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search Tickets..."
      />
    </div>
  );
}
