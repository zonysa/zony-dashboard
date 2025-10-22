"use client";

import { DataTable } from "@/components/tables/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { branchColumns } from "@/components/tables/columns/branches-columns";
import { ArrowUpRight, Map, MapPin, User } from "lucide-react";
import { useParams } from "next/navigation";
import {
  useGetZone,
  useGetZoneCouriers,
  useGetZoneCustomerServices,
  useGetZoneDistricts,
  useGetZoneSupervisors,
} from "@/lib/hooks/useZone";
import { columns } from "@/components/tables/columns/courier-columns";
import { useGetBranches } from "@/lib/hooks/useBranch";
import { customerServiceColumns } from "@/components/tables/columns/customer-service-columns";
import Link from "next/link";
import DataItem from "@/components/ui/DataItem";

function BranchDetails() {
  const param = useParams();
  const zoneId = String(param.id);

  const { data: zone } = useGetZone(String(zoneId));
  const { data: districts } = useGetZoneDistricts(zoneId);
  const { data: supervisors } = useGetZoneSupervisors(zoneId);
  const { data: couriers } = useGetZoneCouriers(zoneId);
  const { data: branches } = useGetBranches({ zone: zoneId });
  const { data: customerServices } = useGetZoneCustomerServices(zoneId);

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

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
      <Tabs defaultValue="zone-details" className="w-full gap-6">
        <TabsList className="px-6 bg-transparent">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="zone-details">Zone Info</TabsTrigger>
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
                  value={String(supervisors?.supervisors[0].first_name)}
                />
                <DataItem
                  label="Phone Number"
                  value={String(supervisors?.supervisors[0].phone_number)}
                />
              </div>
            </CardContent>
            <div className="flex gap-2">
              <Link href={`users/${supervisors?.supervisors[0].id}`}>
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

        <TabsContent className="w-full px-8" value="couriers">
          <DataTable
            columns={columns}
            data={couriers?.couriers ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder="Search Courier Name..."
          />
        </TabsContent>

        <TabsContent className="w-full px-8" value="customerServices">
          <DataTable
            columns={customerServiceColumns}
            data={customerServices?.customer_service ?? []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder="Search Courier Name..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BranchDetails;
