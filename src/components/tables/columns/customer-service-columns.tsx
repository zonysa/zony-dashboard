"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserDetails } from "@/lib/schema/user.schema";

export const customerServiceColumns: ColumnDef<UserDetails>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium text-blue-600">{name}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return <div className="font-mono text-sm">{id}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        <div className="font-mono text-sm max-w-48 truncate" title={email}>
          {email}
        </div>
      );
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusVariant = (status: string) => {
        switch (status) {
          case "Active":
            return "success";
          case "Inactive":
            return "destructive";
          case "On Break":
            return "outline";
          case "Training":
            return "secondary";
          case "Suspended":
            return "destructive";
          default:
            return "secondary";
        }
      };
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
    filterFn: "equalsString",
  },
];
