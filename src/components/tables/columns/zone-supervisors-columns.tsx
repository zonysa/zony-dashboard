"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserDetails } from "@/lib/schema/user.schema";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ZoneSupervisorsColumnsProps {
  onDelete: (id: string, name: string) => void;
}

export const createZoneSupervisorsColumns = ({
  onDelete,
}: ZoneSupervisorsColumnsProps): ColumnDef<UserDetails>[] => [
  {
    accessorKey: "first_name",
    header: "First Name",
    cell: ({ row }) => {
      const firstName = row.getValue("first_name") as string;
      return <div className="font-medium">{firstName}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    cell: ({ row }) => {
      const lastName = row.getValue("last_name") as string;
      return <div className="font-medium">{lastName}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <div className="text-sm">{email}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone_number") as string;
      return <div className="text-sm">{phone}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const supervisor = row.original;
      const fullName = `${supervisor.first_name} ${supervisor.last_name}`;

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(supervisor.id, fullName)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      );
    },
  },
];
