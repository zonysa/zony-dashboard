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
import { mockBranches as data } from "@/lib/data/mocks/branches.mock";
import { MapPin } from "lucide-react";

interface BranchDetailsProps {
  branchData?: {
    partnerName: string;
    responsiblePerson: string;
    phoneNumber: string;
    representativeName: string;
    representativePhone: string;
    branchLocation: string;
    rating: number;
    photos: string[];
    mapUrl?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

function BranchDetails() {
  const initialData = {
    zone: "RUH-5",
    city: "Cairo",
    districts: "Maadi, Helwan",
    statue: "Active",
    supervisor: "Naif Elmtary",
    createdOn: "10/09/2025",
    totalParcels: 310,
    photos: [
      "/api/placeholder/240/180", // Mall corridor
      "/api/placeholder/240/180", // Clothing store
      "/api/placeholder/240/180", // Store interior
    ],
    mapUrl: "/api/placeholder/800/300", // Map placeholder
    coordinates: {
      lat: 38.2527,
      lng: -85.7585,
    },
  };

  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "zone", label: "Zone", placeholder: "All Zones" },
    { key: "district", label: "District", placeholder: "All Districts" },
    { key: "status", label: "Status", placeholder: "All Statuses" },
  ];

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
      <Tabs defaultValue="zone-details" className="w-full gap-6">
        <TabsList className="px-6 bg-transparent">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="zone-details">Zone Info</TabsTrigger>
            <TabsTrigger value="branchs">Assigned Branchs</TabsTrigger>
          </div>
        </TabsList>

        <TabsContent className="w-full px-8" value="branchs">
          <DataTable
            columns={branchColumns}
            data={data}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder="Search Branch Name..."
          />
        </TabsContent>

        <TabsContent className="flex flex-col gap-6 px-6" value="zone-details">
          {/* Branch Info Card */}
          <Card className="flex flex-row border-0 border-b rounded-0 shadow-transparent">
            <CardHeader className="w-1/4 flex flex-col items-start justify-start">
              <CardTitle>Zone Details</CardTitle>
              <CardDescription>
                Branch Info Branch Info Branch Info Branch Info
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {/* Info Items */}
              <div className="grid grid-cols-2 gap-3">
                <div className=" flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">Zone ID</span>
                  <span className="text-gray-900 text-sm font-semibold">
                    {initialData.zone}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">
                    Responsible Personal
                  </span>
                  <span className="text-gray-900 text-sm font-semibold">
                    {initialData.city}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">Phone Number</span>
                  <span className="text-gray-900 text-sm font-semibold">
                    {initialData.districts}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">
                    Representative Name
                  </span>
                  <span className="text-gray-900 text-sm font-semibold">
                    {initialData.statue}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-sm">Phone Number</span>
                <span className="text-gray-900 text-sm font-semibold">
                  {initialData.supervisor}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Branch Photo Card */}
          <Card className="flex flex-row border-0 border-b rounded-0 shadow-transparent">
            <CardHeader className="w-1/4 flex flex-col items-start justify-start">
              <CardTitle>Branch Photo</CardTitle>
              <CardDescription>
                Branch Info Branch Info Branch Info Branch Info
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                {initialData.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo}
                      alt={`Branch photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
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
                    <span className="text-gray-900 text-sm font-semibold flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                      {data.branchLocation}
                    </span>
                  </div>

                  {/* Map */}
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    {data.mapUrl ? (
                      <img
                        src={data.mapUrl}
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
      </Tabs>
    </div>
  );
}

export default BranchDetails;
