"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DistrictDetails } from "@/lib/schema/district.schema";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ZoneDistrictsColumnsProps {
  onDelete: (id: number, name: string) => void;
}

export const createZoneDistrictsColumns = ({
  onDelete,
}: ZoneDistrictsColumnsProps): ColumnDef<DistrictDetails>[] => [
  {
    accessorKey: "name",
    header: "District Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "city_name",
    header: "City",
    cell: ({ row }) => {
      const cityName = row.getValue("city_name") as string;
      return <div className="text-sm">{cityName}</div>;
    },
    filterFn: "includesString",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const district = row.original;

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(Number(district.id), district.name)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      );
    },
  },
];
