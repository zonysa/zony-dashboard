"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

import Link from "next/link";
import TicketActionsCell from "@/components/TicketSheet";
import { CustomerData, TicketDetails } from "@/lib/schema/tickets.schema";

export const columns: ColumnDef<TicketDetails>[] = [
  {
    accessorKey: "tracking_number",
    header: "TN",
    cell: ({ row }) => {
      const trackingNumber = row.getValue("tracking_number") as string;
      return (
        <Link
          href={`/parcels/${trackingNumber}`}
          className="font-mono text-sm text-primary"
        >
          {trackingNumber}
        </Link>
      );
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "pudo_name",
    header: "PUDO",
    cell: ({ row }) => {
      const pudo = row.getValue("pudo_name") as string;
      return <div className="font-medium">{pudo}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "zone_name",
    header: "Zone Name",
    cell: ({ row }) => {
      const zone = row.getValue("zone_name") as string;
      return <div className="font-medium">{zone}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "action_taken",
    header: "Action Taken",
    cell: ({ row }) => {
      const actionTaken = row.getValue("action_taken") as string;
      const getStatusVariant = (actionTaken: string) => {
        switch (actionTaken) {
          case "resolved":
            return "success";
          case "cancelled":
            return "destructive";
          case "pending":
            return "outline";
          case "investigating":
            return "secondary";
          default:
            return "secondary";
        }
      };
      return (
        <Badge variant={getStatusVariant(actionTaken)}>{actionTaken}</Badge>
      );
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getActionVariant = (status: string) => {
        switch (status) {
          case "Resolved":
            return "success";
          case "In Progress":
            return "outline";
          case "Unresolved":
            return "destructive";
          case "Pending":
            return "secondary";
          default:
            return "secondary";
        }
      };
      return <Badge variant={getActionVariant(status)}>{status}</Badge>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "customer_data",
    header: "Phone number",
    cell: ({ row }) => {
      const customer = row.getValue("customer_data") as CustomerData;
      return (
        <div className="font-mono text-sm">
          {customer?.phone_number ?? "NA"}
        </div>
      );
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "customer_data",
    header: "Customer Name",
    cell: ({ row }) => {
      const customer = row.getValue("customer_data") as CustomerData;
      return <div className="font-mono text-sm">{customer?.first_name}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "comment",
    header: "Comments",
    cell: ({ row }) => {
      const comment = row.getValue("comment") as string;
      return (
        <div className="max-w-32 truncate text-sm" title={comment}>
          {comment}
        </div>
      );
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <TicketActionsCell row={row} />,
  },
];
