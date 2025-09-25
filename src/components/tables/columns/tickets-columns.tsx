"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Ticket } from "@/lib/schema/tickets.schema";

import Link from "next/link";
import TicketActionsCell from "@/components/TicketSheet";

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "trackingNumber",
    header: "TN",
    cell: ({ row }) => {
      const trackingNumber = row.getValue("trackingNumber") as string;
      return (
        <Link
          href={`/parcels/${trackingNumber}`}
          className="font-mono text-sm text-blue-600"
        >
          {trackingNumber}
        </Link>
      );
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "pudo",
    header: "PUDO",
    cell: ({ row }) => {
      const pudo = row.getValue("pudo") as string;
      return <div className="font-medium">{pudo}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusVariant = (status: string) => {
        switch (status) {
          case "Delivered":
            return "success";
          case "Failed To Deliver":
            return "destructive";
          case "Undelivered":
            return "outline";
          case "In Transit":
            return "secondary";
          default:
            return "secondary";
        }
      };
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "actionTaken",
    header: "Action Taken",
    cell: ({ row }) => {
      const actionTaken = row.getValue("actionTaken") as string;
      const getActionVariant = (action: string) => {
        switch (action) {
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
      return (
        <Badge variant={getActionVariant(actionTaken)}>{actionTaken}</Badge>
      );
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "issuesNo",
    header: "Issues No.",
    cell: ({ row }) => {
      const issuesNo = row.getValue("issuesNo") as string;
      return <div className="text-sm">{issuesNo}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone number",
    cell: ({ row }) => {
      const phoneNumber = row.getValue("phoneNumber") as string;
      return <div className="font-mono text-sm">{phoneNumber}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "comments",
    header: "Comments",
    cell: ({ row }) => {
      const comments = row.getValue("comments") as string;
      return (
        <div className="max-w-32 truncate text-sm" title={comments}>
          {comments}
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
