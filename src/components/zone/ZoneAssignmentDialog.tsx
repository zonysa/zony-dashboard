"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

interface ZoneAssignmentDialogProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  onAssign: (selectedIds: string[] | number[]) => Promise<void>;
  getItemId: (item: TData) => string | number;
  isLoading?: boolean;
  searchPlaceholder?: string;
}

export function ZoneAssignmentDialog<TData>({
  open,
  onOpenChange,
  title,
  description,
  data,
  columns,
  onAssign,
  getItemId,
  isLoading = false,
  searchPlaceholder = "Search...",
}: ZoneAssignmentDialogProps<TData>) {
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set()
  );
  const [isAssigning, setIsAssigning] = useState(false);

  const handleSelectItem = useMemo(
    () => (itemId: string | number, checked: boolean) => {
      const newSelected = new Set(selectedItems);
      if (checked) {
        newSelected.add(itemId);
      } else {
        newSelected.delete(itemId);
      }
      setSelectedItems(newSelected);
    },
    [selectedItems]
  );

  const handleSelectAll = useMemo(
    () => (checked: boolean) => {
      if (checked) {
        const allIds = data.map((item) => getItemId(item));
        setSelectedItems(new Set(allIds));
      } else {
        setSelectedItems(new Set());
      }
    },
    [data, getItemId]
  );

  const handleAssign = async () => {
    try {
      setIsAssigning(true);
      const idsArray = Array.from(selectedItems);
      const firstItem = idsArray[0];
      const convertedArray =
        typeof firstItem === "string"
          ? idsArray.map((id) => String(id))
          : idsArray.map((id) => Number(id));
      await onAssign(convertedArray);
      setSelectedItems(new Set());
      onOpenChange(false);
    } catch (error) {
      console.error("Assignment error:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCancel = () => {
    setSelectedItems(new Set());
    onOpenChange(false);
  };

  // Add selection column to the columns
  const columnsWithSelection: ColumnDef<TData, unknown>[] = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={data.length > 0 && selectedItems.size === data.length}
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => {
          const itemId = getItemId(row.original);
          return (
            <Checkbox
              checked={selectedItems.has(itemId)}
              onCheckedChange={(checked) => handleSelectItem(itemId, !!checked)}
              aria-label="Select row"
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ],
    [columns, data.length, selectedItems, getItemId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <DataTable
              columns={columnsWithSelection}
              data={data}
              enableGlobalSearch={true}
              searchPlaceholder={searchPlaceholder}
              enableFiltering={false}
            />
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-gray-500">
              {selectedItems.size} item(s) selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={selectedItems.size === 0 || isAssigning}
              >
                {isAssigning ? "Assigning..." : "Assign Selected"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
