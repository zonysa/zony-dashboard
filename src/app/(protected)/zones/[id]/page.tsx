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

  // Zone data
  const { data: zone } = useGetZone(String(zoneId));
  const { data: districts } = useGetZoneDistricts(zoneId);
  const { data: supervisors } = useGetZoneSupervisors(zoneId);
  const { data: couriers } = useGetZoneCouriers(zoneId);
  const { data: branches } = useGetBranches({ zone: zoneId });
  const { data: customerServices } = useGetZoneCustomerServices(zoneId);

  // Available data for assignment (fetch all users by role)
  const { data: allSupervisors } = useGetUsers({ role_id: 3 });
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
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "district", label: "District", placeholder: "All Districts" },
    { key: "status", label: "Status", placeholder: "All Statuses" },
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
      header: "First Name",
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
    },
  ];

  const districtAssignmentColumns: ColumnDef<DistrictDetails>[] = [
    {
      accessorKey: "name",
      header: "District Name",
    },
    {
      accessorKey: "city_name",
      header: "City",
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

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
      <Tabs defaultValue="zone-details" className="w-full gap-6">
        <TabsList className="px-6 bg-transparent">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="zone-details">Zone Info</TabsTrigger>
            <TabsTrigger value="districts">Districts</TabsTrigger>
            <TabsTrigger value="supervisors">Supervisors</TabsTrigger>
            <TabsTrigger value="branchs">Assigned Branchs</TabsTrigger>
            <TabsTrigger value="couriers">Couriers</TabsTrigger>
            <TabsTrigger value="customerServices">
              Customer Services
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent className="flex flex-col gap-6" value="zone-details">
          {/* Branch Info Card */}

          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label="Zone Details"
              value="Branch information and location details"
              icon={Map}
              iconClassName="text-black"
            />
            <CardContent className="w-2/4 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem label="Zone Id" value={String(zone?.zone?.id)} />
                <DataItem label="Zone Name" value={String(zone?.zone?.name)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DataItem label="City" value={String(zone?.zone?.city_name)} />
                <DataItem
                  label="District"
                  value={String(zone?.zone?.district_names)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label="Zone Supervisor"
              value="Branch information and location details"
              icon={User}
              iconClassName="text-black"
            />
            <CardContent className="w-2/4 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem
                  label="Name"
                  value={
                    supervisors
                      ? String(supervisors?.supervisors[0]?.first_name)
                      : "NA"
                  }
                />
                <DataItem
                  label="Phone Number"
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
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Branch Info Branch Info Branch Info Branch Info
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="px-4 py-4">
                <div className="flex flex-col gap-4">
                  {/* Branch Location Text */}
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-sm">
                      Branch Location
                    </span>
                  </div>

                  {/* Map */}
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    {data.mapUrl ? (
                      <img
                        src="/"
                        alt="Branch location map"
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
            <h3 className="text-lg font-semibold">Assigned Districts</h3>
            <Button
              onClick={() => setDistrictDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Assign Districts
            </Button>
          </div>
          <DataTable
            columns={zoneDistrictsColumns}
            data={districts?.districts ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder="Search District Name..."
          />
        </TabsContent>

        <TabsContent className="w-full px-8 space-y-4" value="supervisors">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assigned Supervisors</h3>
            <Button
              onClick={() => setSupervisorDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Assign Supervisors
            </Button>
          </div>
          <DataTable
            columns={zoneSupervisorsColumns}
            data={supervisors?.supervisors ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder="Search Supervisor Name..."
          />
        </TabsContent>

        <TabsContent className="w-full px-8" value="branchs">
          <DataTable
            columns={branchColumns}
            data={branches?.pudos ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder="Search Branch Name..."
          />
        </TabsContent>

        <TabsContent className="w-full px-8 space-y-4" value="couriers">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assigned Couriers</h3>
            <Button
              onClick={() => setCourierDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Assign Couriers
            </Button>
          </div>
          <DataTable
            columns={zoneCouriersColumns}
            data={couriers?.couriers ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder="Search Courier Name..."
          />
        </TabsContent>

        <TabsContent className="w-full px-8 space-y-4" value="customerServices">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Assigned Customer Services
            </h3>
            <Button
              onClick={() => setCustomerServiceDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Assign Customer Services
            </Button>
          </div>
          <DataTable
            columns={zoneCustomerServiceColumns}
            data={customerServices?.customer_service ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder="Search Customer Service Name..."
          />
        </TabsContent>
      </Tabs>

      {/* Assignment Dialogs */}
      <ZoneAssignmentDialog
        open={districtDialogOpen}
        onOpenChange={setDistrictDialogOpen}
        title="Assign Districts to Zone"
        description="Select districts to assign to this zone"
        data={allDistricts?.districts ?? []}
        columns={districtAssignmentColumns}
        onAssign={handleAssignDistricts}
        getItemId={(item) => item.id ?? 0}
        searchPlaceholder="Search districts..."
      />

      <ZoneAssignmentDialog
        open={supervisorDialogOpen}
        onOpenChange={setSupervisorDialogOpen}
        title="Assign Supervisors to Zone"
        description="Select supervisors to assign to this zone"
        data={allSupervisors?.users ?? []}
        columns={userAssignmentColumns}
        onAssign={handleAssignSupervisors}
        getItemId={(item) => item.id}
        searchPlaceholder="Search supervisors..."
      />

      <ZoneAssignmentDialog
        open={courierDialogOpen}
        onOpenChange={setCourierDialogOpen}
        title="Assign Couriers to Zone"
        description="Select couriers to assign to this zone"
        data={allCouriers?.users ?? []}
        columns={userAssignmentColumns}
        onAssign={handleAssignCouriers}
        getItemId={(item) => item.id}
        searchPlaceholder="Search couriers..."
      />

      <ZoneAssignmentDialog
        open={customerServiceDialogOpen}
        onOpenChange={setCustomerServiceDialogOpen}
        title="Assign Customer Services to Zone"
        description="Select customer service staff to assign to this zone"
        data={allCustomerServices?.users ?? []}
        columns={userAssignmentColumns}
        onAssign={handleAssignCustomerServices}
        getItemId={(item) => item.id}
        searchPlaceholder="Search customer services..."
      />

      {/* Delete Confirmation Dialog */}
      <ZoneUnassignDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Remove from Zone"
        description={`Are you sure you want to remove this ${
          deleteDialogConfig?.type === "customerService"
            ? "customer service"
            : deleteDialogConfig?.type
        } from the zone? This action cannot be undone.`}
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
