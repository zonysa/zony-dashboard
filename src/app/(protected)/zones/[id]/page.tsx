"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { branchColumns } from "@/components/tables/columns/branches-columns";
import { ArrowUpRight, Map, MapPin, User, UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import {
  useGetZone,
  useGetZoneCouriers,
  useGetZoneCustomerServices,
  useGetZoneDistricts,
  useGetZoneSupervisors,
  useAssignCouriersToZone,
  useAssignCustomerServicesToZone,
  useAssignSupervisorsToZone,
  useAssignDistrictsToZone,
  useUnassignDistrictFromZone,
  useUnassignSupervisorFromZone,
  useUnassignCourierFromZone,
  useUnassignCustomerServiceFromZone,
} from "@/lib/hooks/useZone";
import { useGetBranches } from "@/lib/hooks/useBranch";
import Link from "next/link";
import DataItem from "@/components/ui/DataItem";
import { ZoneAssignmentDialog } from "@/components/zone/ZoneAssignmentDialog";
import { ZoneUnassignDialog } from "@/components/zone/ZoneUnassignDialog";
import { useGetUsers } from "@/lib/hooks/useUsers";
import { useGetDistricts } from "@/lib/hooks/useDistrict";
import { ColumnDef } from "@tanstack/react-table";
import { UserDetails } from "@/lib/schema/user.schema";
import { DistrictDetails } from "@/lib/schema/district.schema";
import { createZoneSupervisorsColumns } from "@/components/tables/columns/zone-supervisors-columns";
import { createZoneCouriersColumns } from "@/components/tables/columns/zone-couriers-columns";
import { createZoneCustomerServiceColumns } from "@/components/tables/columns/zone-customer-service-columns";
import { createZoneDistrictsColumns } from "@/components/tables/columns/zone-districts-columns";
import { useTranslation } from "@/lib/hooks/useTranslation";

function BranchDetails() {
  const param = useParams();
  const zoneId = String(param.id);

  // State for assignment dialogs
  const [districtDialogOpen, setDistrictDialogOpen] = useState(false);
  const [supervisorDialogOpen, setSupervisorDialogOpen] = useState(false);
  const [courierDialogOpen, setCourierDialogOpen] = useState(false);
  const [customerServiceDialogOpen, setCustomerServiceDialogOpen] =
    useState(false);

  // State for delete dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogConfig, setDeleteDialogConfig] = useState<{
    type: "district" | "supervisor" | "courier" | "customerService";
    id: string | number;
    name: string;
  } | null>(null);

  const { t } = useTranslation();

  // Zone data
  const { data: zone } = useGetZone(String(zoneId));
  const { data: districts } = useGetZoneDistricts(zoneId);
  const { data: supervisors } = useGetZoneSupervisors(zoneId);
  const { data: couriers } = useGetZoneCouriers(zoneId);
  const { data: branches } = useGetBranches({ zone: zoneId });
  const { data: customerServices } = useGetZoneCustomerServices(zoneId);

  // Available data for assignment (fetch all users by role)
  const { data: allSupervisors } = useGetUsers({ role_id: 4 });
  const { data: allCouriers } = useGetUsers({ role_id: 6 });
  const { data: allCustomerServices } = useGetUsers({ role_id: 5 });
  const { data: allDistricts } = useGetDistricts();

  // Assignment mutations
  const assignDistrictsMutation = useAssignDistrictsToZone(zoneId);
  const assignSupervisorsMutation = useAssignSupervisorsToZone(zoneId);
  const assignCouriersMutation = useAssignCouriersToZone(zoneId);
  const assignCustomerServicesMutation =
    useAssignCustomerServicesToZone(zoneId);

  // Unassignment mutations
  const unassignDistrictMutation = useUnassignDistrictFromZone(zoneId);
  const unassignSupervisorMutation = useUnassignSupervisorFromZone(zoneId);
  const unassignCourierMutation = useUnassignCourierFromZone(zoneId);
  const unassignCustomerServiceMutation =
    useUnassignCustomerServiceFromZone(zoneId);

  const filterConfigs = [
    { key: "city", label: t("table.city"), placeholder: t("table.allCities") },
    {
      key: "district",
      label: t("table.district"),
      placeholder: t("table.allDistricts"),
    },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];

  const data = {
    mapUrl: "https://placehold.co/600x400",
    coordinates: {
      lat: 38.2527,
      lng: -85.7585,
    },
  };

  // Simplified columns for assignment dialogs
  const userAssignmentColumns: ColumnDef<UserDetails>[] = [
    {
      accessorKey: "first_name",
      header: t("zones.firstName"),
    },
    {
      accessorKey: "last_name",
      header: t("zones.lastName"),
    },
    {
      accessorKey: "email",
      header: t("zones.email"),
    },
    {
      accessorKey: "phone_number",
      header: t("zones.phone"),
    },
  ];

  const districtAssignmentColumns: ColumnDef<DistrictDetails>[] = [
    {
      accessorKey: "name",
      header: t("table.district"),
    },
    {
      accessorKey: "city_name",
      header: t("table.city"),
    },
  ];

  // Assignment handlers
  const handleAssignDistricts = async (districtIds: string[] | number[]) => {
    await assignDistrictsMutation.mutateAsync(districtIds as number[]);
  };

  const handleAssignSupervisors = async (
    supervisorIds: string[] | number[]
  ) => {
    await assignSupervisorsMutation.mutateAsync(supervisorIds as string[]);
  };

  const handleAssignCouriers = async (courierIds: string[] | number[]) => {
    await assignCouriersMutation.mutateAsync(courierIds as string[]);
  };

  const handleAssignCustomerServices = async (
    customerServiceIds: string[] | number[]
  ) => {
    await assignCustomerServicesMutation.mutateAsync(
      customerServiceIds as string[]
    );
  };

  // Delete handlers
  const handleOpenDeleteDialog = (
    type: "district" | "supervisor" | "courier" | "customerService",
    id: string | number,
    name: string
  ) => {
    setDeleteDialogConfig({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialogConfig) return;

    try {
      switch (deleteDialogConfig.type) {
        case "district":
          await unassignDistrictMutation.mutateAsync(
            deleteDialogConfig.id as number
          );
          break;
        case "supervisor":
          await unassignSupervisorMutation.mutateAsync(
            deleteDialogConfig.id as string
          );
          break;
        case "courier":
          await unassignCourierMutation.mutateAsync(
            deleteDialogConfig.id as string
          );
          break;
        case "customerService":
          await unassignCustomerServiceMutation.mutateAsync(
            deleteDialogConfig.id as string
          );
          break;
      }
      setDeleteDialogOpen(false);
      setDeleteDialogConfig(null);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Create columns with delete handlers
  const zoneSupervisorsColumns = createZoneSupervisorsColumns({
    onDelete: (id, name) => handleOpenDeleteDialog("supervisor", id, name),
  });

  const zoneCouriersColumns = createZoneCouriersColumns({
    onDelete: (id, name) => handleOpenDeleteDialog("courier", id, name),
  });

  const zoneCustomerServiceColumns = createZoneCustomerServiceColumns({
    onDelete: (id, name) => handleOpenDeleteDialog("customerService", id, name),
  });

  const zoneDistrictsColumns = createZoneDistrictsColumns({
    onDelete: (id, name) => handleOpenDeleteDialog("district", id, name),
  });

  const pudoColumns = branchColumns();

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
      <Tabs defaultValue="zone-details" className="w-full gap-6">
        <TabsList className="px-6 bg-transparent">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="zone-details">{t("zones.zoneInfo")}</TabsTrigger>
            <TabsTrigger value="districts">{t("zones.districts")}</TabsTrigger>
            <TabsTrigger value="supervisors">{t("zones.supervisors")}</TabsTrigger>
            <TabsTrigger value="branchs">{t("zones.assignedBranches")}</TabsTrigger>
            <TabsTrigger value="couriers">{t("zones.couriers")}</TabsTrigger>
            <TabsTrigger value="customerServices">
              {t("zones.customerServices")}
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent className="flex flex-col gap-6" value="zone-details">
          {/* Branch Info Card */}

          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label={t("zones.zoneDetails")}
              value={t("zones.zoneDetailsDescription")}
              icon={Map}
              iconClassName="text-black"
            />
            <CardContent className="w-2/4 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem label={t("zones.zoneId")} value={String(zone?.zone?.id)} />
                <DataItem label={t("zones.zoneName")} value={String(zone?.zone?.name)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DataItem label={t("table.city")} value={String(zone?.zone?.city_name)} />
                <DataItem
                  label={t("table.district")}
                  value={String(zone?.zone?.district_names)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label={t("zones.zoneSupervisor")}
              value={t("zones.zoneDetailsDescription")}
              icon={User}
              iconClassName="text-black"
            />
            <CardContent className="w-2/4 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem
                  label={t("table.name")}
                  value={
                    supervisors
                      ? String(supervisors?.supervisors[0]?.first_name)
                      : "NA"
                  }
                />
                <DataItem
                  label={t("table.phoneNumber")}
                  value={
                    supervisors
                      ? String(supervisors?.supervisors[0]?.phone_number)
                      : "NA"
                  }
                />
              </div>
            </CardContent>
            <div className="flex gap-2">
              <Link href={`users/${supervisors?.supervisors[0]?.id}`}>
                <ArrowUpRight />
              </Link>
            </div>
          </Card>

          {/* Location Card */}
          <Card className="flex flex-row border-0 border-b rounded-0 shadow-transparent">
            <CardHeader className="w-1/4 flex flex-col items-start justify-start">
              <CardTitle>{t("zones.location")}</CardTitle>
              <CardDescription>
                {t("zones.zoneDetailsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="px-4 py-4">
                <div className="flex flex-col gap-4">
                  {/* Branch Location Text */}
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-sm">
                      {t("zones.branchLocation")}
                    </span>
                  </div>

                  {/* Map */}
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    {data.mapUrl ? (
                      <img
                        src="/"
                        alt={t("zones.branchLocation")}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="w-full px-8 space-y-4" value="districts">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {t("zones.assignedDistricts")}
            </h3>
            <Button
              onClick={() => setDistrictDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t("zones.assignDistricts")}
            </Button>
          </div>
          <DataTable
            columns={zoneDistrictsColumns}
            data={districts?.districts ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder={t("zones.searchDistrictName")}
          />
        </TabsContent>

        <TabsContent className="w-full px-8 space-y-4" value="supervisors">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t("zones.assignedSupervisors")}</h3>
            <Button
              onClick={() => setSupervisorDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t("zones.assignSupervisors")}
            </Button>
          </div>
          <DataTable
            columns={zoneSupervisorsColumns}
            data={supervisors?.supervisors ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder={t("zones.searchSupervisorName")}
          />
        </TabsContent>

        <TabsContent className="w-full px-8" value="branchs">
          <DataTable
            columns={pudoColumns}
            data={branches?.pudos ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder={t("zones.searchBranchName")}
          />
        </TabsContent>

        <TabsContent className="w-full px-8 space-y-4" value="couriers">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t("zones.assignedCouriers")}</h3>
            <Button
              onClick={() => setCourierDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t("zones.assignCouriers")}
            </Button>
          </div>
          <DataTable
            columns={zoneCouriersColumns}
            data={couriers?.couriers ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder={t("zones.searchCourierName")}
          />
        </TabsContent>

        <TabsContent className="w-full px-8 space-y-4" value="customerServices">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {t("zones.assignedCustomerServices")}
            </h3>
            <Button
              onClick={() => setCustomerServiceDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t("zones.assignCustomerServices")}
            </Button>
          </div>
          <DataTable
            columns={zoneCustomerServiceColumns}
            data={customerServices?.customer_service ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder={t("zones.searchCustomerServiceName")}
          />
        </TabsContent>
      </Tabs>

      {/* Assignment Dialogs */}
      <ZoneAssignmentDialog
        open={districtDialogOpen}
        onOpenChange={setDistrictDialogOpen}
        title={t("zones.assignDistrictsToZone")}
        description={t("zones.assignDistrictsDescription")}
        data={allDistricts?.districts ?? []}
        columns={districtAssignmentColumns}
        onAssign={handleAssignDistricts}
        getItemId={(item) => item.id ?? 0}
        searchPlaceholder={t("zones.searchDistricts")}
      />

      <ZoneAssignmentDialog
        open={supervisorDialogOpen}
        onOpenChange={setSupervisorDialogOpen}
        title={t("zones.assignSupervisorsToZone")}
        description={t("zones.assignSupervisorsDescription")}
        data={allSupervisors?.users ?? []}
        columns={userAssignmentColumns}
        onAssign={handleAssignSupervisors}
        getItemId={(item) => item.id}
        searchPlaceholder={t("zones.searchSupervisors")}
      />

      <ZoneAssignmentDialog
        open={courierDialogOpen}
        onOpenChange={setCourierDialogOpen}
        title={t("zones.assignCouriersToZone")}
        description={t("zones.assignCouriersDescription")}
        data={allCouriers?.users ?? []}
        columns={userAssignmentColumns}
        onAssign={handleAssignCouriers}
        getItemId={(item) => item.id}
        searchPlaceholder={t("zones.searchCouriers")}
      />

      <ZoneAssignmentDialog
        open={customerServiceDialogOpen}
        onOpenChange={setCustomerServiceDialogOpen}
        title={t("zones.assignCustomerServicesToZone")}
        description={t("zones.assignCustomerServicesDescription")}
        data={allCustomerServices?.users ?? []}
        columns={userAssignmentColumns}
        onAssign={handleAssignCustomerServices}
        getItemId={(item) => item.id}
        searchPlaceholder={t("zones.searchCustomerServices")}
      />

      {/* Delete Confirmation Dialog */}
      <ZoneUnassignDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("zones.removeFromZone")}
        description={t("zones.removeFromZoneDescription")}
        itemName={deleteDialogConfig?.name}
        isLoading={
          unassignDistrictMutation.isPending ||
          unassignSupervisorMutation.isPending ||
          unassignCourierMutation.isPending ||
          unassignCustomerServiceMutation.isPending
        }
      />
    </div>
  );
}

export default BranchDetails;
