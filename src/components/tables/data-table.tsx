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
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  placeholder: string;
  options?: FilterOption[];
  type?: "select" | "date"; // Add type field
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableFiltering?: boolean;
  filterConfigs?: FilterConfig[];
  enableGlobalSearch?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: Row<TData>) => void;

  // Server-side mode (optional - backward compatible)
  serverSide?: boolean;
  onFilterChange?: (filters: Record<string, string>) => void;
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  enableFiltering = false,
  filterConfigs = [],
  enableGlobalSearch = false,
  searchPlaceholder = "Search...",
  serverSide = false,
  onFilterChange,
  onSearchChange,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { t } = useTranslation();
  const { language } = useUserPreferencesStore();

  // Local filter states for the UI
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
  const [localDateFilters, setLocalDateFilters] = useState<Record<string, Date | undefined>>({});
  const [localSearch, setLocalSearch] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(!serverSide && {
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
    }),
    globalFilterFn: "includesString",
    state: {
      ...(!serverSide && { columnFilters, globalFilter }),
    },
  });

  // Extract unique values for filter options if not provided
  const getUniqueValues = (key: string): FilterOption[] => {
    if (!data || data.length === 0) return [];

    const values = Array.from(
      new Set(data.map((item) => (item as Record<string, unknown>)[key]))
    )
      .filter(Boolean)
      .sort();
    return values.map((value) => ({
      value: String(value),
      label: String(value),
    }));
  };

  const applyFilters = () => {
    if (serverSide) {
      // Server-side mode: emit changes to parent component
      onSearchChange?.(localSearch);

      // Merge regular filters and date filters
      const allFilters: Record<string, string> = { ...localFilters };
      Object.entries(localDateFilters).forEach(([key, date]) => {
        if (date) {
          allFilters[key] = date.toISOString();
        }
      });

      onFilterChange?.(allFilters);
    } else {
      // Client-side mode: apply to table state (existing behavior)
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
      console.log(t("table.appliedFilters"), {
        search: localSearch,
        filters: localFilters,
        appliedAt: new Date().toISOString(),
      });
    }
  };

  const clearFilters = () => {
    setLocalFilters({});
    setLocalDateFilters({});
    setLocalSearch("");
    if (serverSide) {
      // Server-side mode: emit empty filters
      onSearchChange?.("");
      onFilterChange?.({});
    } else {
      // Client-side mode: clear table state
      setColumnFilters([]);
      setGlobalFilter("");
    }
  };

  const updateLocalFilter = (key: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateLocalDateFilter = (key: string, date: Date | undefined) => {
    setLocalDateFilters((prev) => ({
      ...prev,
      [key]: date,
    }));
  };

  const hasActiveFilters =
    Object.values(localFilters).some(Boolean) ||
    Object.values(localDateFilters).some(Boolean) ||
    localSearch;

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      {(enableFiltering || enableGlobalSearch) && (
        <div>
          <div className="flex flex-col lg:flex-row lg:flex-nowrap justify-between items-stretch lg:items-end gap-4">
            <div className="w-full lg:w-5/6 flex flex-wrap gap-4">
              {/* Global Search */}
              {enableGlobalSearch && (
                <div className="flex flex-1 min-w-[200px] flex-col gap-2 items-start space-x-2">
                  <span className="text-sm font-medium whitespace-nowrap">
                    {t("table.search")}
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
                    className="flex flex-1 min-w-[160px] sm:flex-none flex-col gap-2 justify-between space-x-2"
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
                      <SelectTrigger className="w-full sm:w-40">
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
            <div className="flex w-full lg:w-1/6 items-center justify-end gap-2 lg:ml-auto">
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
                {t("table.applyFilter")}
                <Filter className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">
                {t("table.activeFilter")}
              </span>
              {localSearch && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                  Search: {localSearch}
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
      <div className="overflow-hidden rounded-md border relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Spinner />
          </div>
        )}
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className={language === "ar" ? "text-right" : "text-left"}
                      key={header.id}
                    >
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
                  className="cursor-pointer"
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
                  {t("table.noResultsFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Results Info */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          {t("table.showing")} {table.getRowModel().rows.length} {t("table.of")}{" "}
          {data.length} {t("table.results")}
          {hasActiveFilters && " (filtered)"}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {language == "en" ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <span className="text-sm font-medium">
            {t("table.page")} {table.getState().pagination.pageIndex + 1}{" "}
            {t("table.of")} {table.getPageCount()}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {language == "en" ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
