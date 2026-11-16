"use client";

import { DataTable } from "@/components/tables/data-table";
import React, { useState } from "react";
import { columns } from "@/components/tables/columns/courier-columns";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useGetUsers } from "@/lib/hooks/useUsers";
import { useGetCities } from "@/lib/hooks/useCity";
import { useGetDistricts } from "@/lib/hooks/useDistrict";
import { UserDetails, userFilterOptions } from "@/lib/schema/user.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { PageContainer } from "@/components/PageContainer";
import { StatsCards, percentOf, statusCount } from "@/components/StatsCards";
import { Truck, UserCheck, UserX } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { EditCourierSheet } from "@/components/users/EditCourierSheet";
import { DeleteCourierDialog } from "@/components/users/DeleteCourierDialog";

function Page() {
  const router = useRouter();
  const { t } = useTranslation();
  // PATCH/DELETE /users are admin-only on the backend, so only they get the
  // buttons (supervisors hold MANAGE_COURIER but would only get a 403).
  const { hasRole } = usePermissions();
  const isAdmin = hasRole("admin");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [filters, setFilters] = useState<userFilterOptions>({
    role_id: 6,
    page: 1,
    limit: 50,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: couriers, isLoading } = useGetUsers({
    ...filters,
    search: debouncedSearch,
  });

  const { data: cities } = useGetCities();
  const { data: districts } = useGetDistricts();

  // Map cities and districts to filter options
  const cityOptions = cities?.cities
    .filter((city) => city.id !== undefined)
    .map((city) => ({
      label: city.name,
      value: city.name,
    })) || [];

  const districtOptions = districts?.districts
    .filter((district) => district.id !== undefined)
    .map((district) => ({
      label: district.name,
      value: district.name,
    })) || [];

  const filterConfigs = [
    {
      key: "city",
      label: t("table.city") || "City",
      placeholder: t("table.allCities") || "All Cities",
      options: cityOptions,
    },
    {
      key: "district",
      label: t("table.district") || "District",
      placeholder: t("table.allDistricts") || "All Districts",
      options: districtOptions,
    },
    {
      key: "status",
      label: t("table.status") || "Status",
      placeholder: t("table.allStatus") || "All Status",
    },
  ];

  // const handleRowClick = (row: Row<UserDetails>) => {
  //   const courierId = row.getValue("ID") as string;
  //   router.replace(`/courier/${courierId}`);
  // };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      city: newFilters.city || undefined,
      district: newFilters.district || undefined,
      status: newFilters.status || undefined,
    }));
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  return (
    <PageContainer size="xl" className="py-10 px-6">
      <StatsCards
        stats={couriers?.stats}
        isLoading={isLoading}
        items={(s) => [
          {
            label: t("stats.totalOf", { name: t("couriers.title") }),
            value: s.total,
            description: t("stats.newThisMonth", { count: s.new_this_month }),
            icon: Truck,
          },
          {
            label: t("stats.active"),
            value: statusCount(s, "active"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "active"), s.total),
            }),
            icon: UserCheck,
            tone: "success",
          },
          {
            label: t("stats.inactive"),
            value: statusCount(s, "inactive"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "inactive"), s.total),
            }),
            icon: UserX,
            tone: "warning",
          },
        ]}
      />
      <DataTable
        columns={columns({
          onEdit: isAdmin ? (c) => setEditId(c.id) : undefined,
          onDelete: isAdmin
            ? (c) =>
                setDeleteTarget({
                  id: c.id,
                  name:
                    [c.first_name, c.last_name].filter(Boolean).join(" ") ||
                    c.username,
                })
            : undefined,
        })}
        data={couriers?.users ?? []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        // onRowClick={handleRowClick}
        searchPlaceholder={t("table.search", "table.couriers")}
        serverSide={true}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
      />
      <EditCourierSheet
        userId={editId}
        onOpenChange={(open) => !open && setEditId(null)}
      />
      <DeleteCourierDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}

export default Page;
