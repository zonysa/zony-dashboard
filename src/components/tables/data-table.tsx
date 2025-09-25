"use client";
import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  placeholder: string;
  options?: FilterOption[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableFiltering?: boolean;
  filterConfigs?: FilterConfig[];
  enableGlobalSearch?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: Row<TData>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  enableFiltering = false,
  filterConfigs = [],
  enableGlobalSearch = false,
  searchPlaceholder = "Search...",
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Local filter states for the UI
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
  const [localSearch, setLocalSearch] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      columnFilters,
      globalFilter,
    },
  });

  // Extract unique values for filter options if not provided
  const getUniqueValues = (key: string): FilterOption[] => {
    const values = Array.from(new Set(data.map((item: any) => item[key])))
      .filter(Boolean)
      .sort();
    return values.map((value) => ({
      value: String(value),
      label: String(value),
    }));
  };

  const applyFilters = () => {
    // Apply global search
    setGlobalFilter(localSearch);

    // Apply column filters
    const filters: ColumnFiltersState = [];
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value) {
        filters.push({ id: key, value });
      }
    });
    setColumnFilters(filters);

    // Console log the selected options
    console.log("Applied Filters:", {
      search: localSearch,
      filters: localFilters,
      appliedAt: new Date().toISOString(),
    });
  };

  const clearFilters = () => {
    setLocalFilters({});
    setLocalSearch("");
    setColumnFilters([]);
    setGlobalFilter("");

    console.log("Filters Cleared");
  };

  const updateLocalFilter = (key: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const hasActiveFilters =
    Object.values(localFilters).some(Boolean) || localSearch;

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      {(enableFiltering || enableGlobalSearch) && (
        <div>
          <div className="flex flex-nowrap justify-between items-end gap-4">
            <div className="w-5/6 flex gap-4">
              {/* Global Search */}
              {enableGlobalSearch && (
                <div className="flex flex-1 flex-col gap-2 items-start space-x-2">
                  <span className="text-sm font-medium whitespace-nowrap">
                    Search
                  </span>
                  <div className="w-full relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={searchPlaceholder}
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Filters */}
              {enableFiltering &&
                filterConfigs.map((config) => (
                  <div
                    key={config.key}
                    className="flex flex-col gap-2 items-start space-x-2"
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      {config.label}
                    </span>
                    <Select
                      value={localFilters[config.key] || ""}
                      onValueChange={(value) =>
                        updateLocalFilter(config.key, value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={config.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {(config.options || getUniqueValues(config.key)).map(
                          (option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="capitalize">{option.label}</span>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
            </div>
            {/* Action Buttons */}
            <div className="flex items-end space-x-2 ml-auto">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <X />
                </Button>
              )}
              <Button
                className="py-4.5"
                onClick={applyFilters}
                variant="outline"
                size="sm"
              >
                Apply Filter
                <Filter className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {localSearch && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                  Search: "{localSearch}"
                </span>
              )}
              {Object.entries(localFilters).map(([key, value]) =>
                value ? (
                  <span
                    key={key}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs"
                  >
                    {filterConfigs.find((c) => c.key === key)?.label || key}:{" "}
                    {value}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {table.getRowModel().rows.length} of {data.length} results
          {hasActiveFilters && " (filtered)"}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
