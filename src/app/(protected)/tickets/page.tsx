"use client";

import { columns } from "@/components/tables/columns/tickets-columns";
import { DataTable } from "@/components/tables/data-table";
import { mockTickets as data } from "@/lib/data/mock/tickets.mock";
import { useGetTickets } from "@/lib/hooks/useTicket";

export default function Page() {
  const { data: tickets } = useGetTickets();

  const filterConfigs = [
    { key: "pudo_name", label: "PUDO", placeholder: "All PUDOs" },
    { key: "zone_name", label: "Zone Name", placeholder: "All Zones" },
    { key: "action_taken", label: "Action Taken", placeholder: "All Actions" },
    { key: "status", label: "Ticket Status", placeholder: "All Status" },
    { key: "rating", label: "Rating", placeholder: "All Ratings" },
  ];
  return (
    <div className="w-full py-10 px-6">
      <DataTable
        columns={columns}
        data={tickets?.tickets ?? []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search Tickets..."
      />
    </div>
  );
}
