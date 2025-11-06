"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, User, Store, FileStack } from "lucide-react";
import DataItem from "@/components/ui/DataItem";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useGetBranch, useGetBranchParcels } from "@/lib/hooks/useBranch";
import { useParams, useRouter } from "next/navigation";
import { SectionCards } from "@/components/ui/section-cards";
import { columns } from "@/components/tables/columns/parcels-columns";
import { Row } from "@tanstack/react-table";
import { ParcelDetails } from "@/lib/schema/parcel.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface BranchDetailsProps {
  branchData?: {
    title: string;
    location: string;
    rating: number;
    mapUrl?: string;
    photos: string[];
    coordinates?: {
      lat: number;
      lng: number;
    };
    name: string;
    phoneNum: string;
  };
}

function BranchDetails({ branchData }: BranchDetailsProps) {
  const { t } = useTranslation();
  const params = useParams();
  const branchId = params.id as string;

  const { data: branch } = useGetBranch(branchId);
  const {
    data: parcels,
    isLoading,
    isError,
    error,
  } = useGetBranchParcels(branchId);

  useEffect(() => {
    if (isError) {
      console.log(error);
    }
    console.log(parcels);
  }, [parcels, isLoading, isError, error]);

  const defaultData = {
    title: "Wafa Pharmacy",
    rating: 4.6,
    location: "4517 Washington Ave. Manchester, Kentucky 39495",
    mapUrl: "https://placehold.co/600x400",
    coordinates: {
      lat: 38.2527,
      lng: -85.7585,
    },
    photos: [
      "/api/placeholder/240/180",
      "/api/placeholder/240/180",
      "/api/placeholder/240/180",
    ],
    name: "Adel Shakal",
    phoneNum: "0321321981120",
  };

  const data = branchData || defaultData;

  // Edit states
  const [editStates, setEditStates] = useState({
    branchInfo: false,
    responsiblePerson: false,
  });

  // Form data states
  const [formData, setFormData] = useState({
    title: data.title,
    location: data.location,
    name: data.name,
    phoneNum: data.phoneNum,
    responsibleName: data.name,
    responsiblePhone: data.phoneNum,
  });

  const toggleEdit = (section: keyof typeof editStates) => {
    setEditStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = (section: keyof typeof editStates) => {
    // Here you would typically make an API call to save the data
    console.log(`Saving ${section}:`, formData);
    setEditStates((prev) => ({
      ...prev,
      [section]: false,
    }));
  };

  const handleCancel = (section: keyof typeof editStates) => {
    // Reset form data to original values
    setFormData({
      title: data.title,
      location: data.location,
      name: data.name,
      phoneNum: data.phoneNum,
      responsibleName: data.name,
      responsiblePhone: data.phoneNum,
    });
    setEditStates((prev) => ({
      ...prev,
      [section]: false,
    }));
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filterConfigs = [
    { key: "city", label: t("table.city"), placeholder: t("table.allCities") },
    { key: "zone", label: t("table.zone"), placeholder: "All Zones" },
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

  // Render rating stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  const router = useRouter();
  const handleRowClick = (row: Row<ParcelDetails>) => {
    const id = row.getValue("id");
    router.replace(`/parcels/${id}`);
  };

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
      <Tabs defaultValue="info" className="w-full gap-6">
        <TabsList className="px-6 bg-transparent">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="info">{t("detailPages.tabs.info")}</TabsTrigger>
            <TabsTrigger value="parcels">
              {t("detailPages.tabs.parcels")}
            </TabsTrigger>
            <TabsTrigger value="operating-hours">
              {t("detailPages.tabs.operatingHours")}
            </TabsTrigger>
            <TabsTrigger value="kpis">{t("detailPages.tabs.kpis")}</TabsTrigger>
          </div>
        </TabsList>

        <TabsContent className="flex flex-col gap-6" value="info">
          {/* Branch Info Card */}
          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label={t("detailPages.sections.branchInfo")}
              value={t("detailPages.sections.branchInfoDescription")}
              icon={Store}
              iconClassName="text-black"
            />
            <CardContent className="w-2/4 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem
                  label={t("detailPages.labels.name")}
                  value={String(branch?.pudo?.branch_name)}
                  isEditable={editStates.branchInfo}
                  onChange={(value) => updateFormData("name", value)}
                />
                {/* Rating */}
                <div className="mb-4">{renderStars(data.rating)}</div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <DataItem
                  label={t("detailPages.labels.location")}
                  value={String(branch?.pudo?.short_address)}
                  isEditable={editStates.branchInfo}
                  onChange={(value) => updateFormData("location", value)}
                />
              </div>

              {data.mapUrl && (
                <Image
                  width={100}
                  height={20}
                  src={data.mapUrl}
                  alt="Branch location map"
                  className="w-full h-50 object-cover rounded"
                  unoptimized
                />
              )}

              <div className="grid grid-cols-3 gap-2">
                {data.photos.map((photo, index) => (
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
            <div className="flex gap-2">
              {editStates.branchInfo ? (
                <>
                  <Button
                    onClick={() => handleSave("branchInfo")}
                    variant="default"
                  >
                    {t("detailPages.buttons.saveChanges")}
                  </Button>
                  <Button
                    onClick={() => handleCancel("branchInfo")}
                    variant="outline"
                  >
                    {t("detailPages.buttons.cancel")}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => toggleEdit("branchInfo")}
                  variant="outline"
                >
                  {t("detailPages.buttons.edit")}
                </Button>
              )}
            </div>
          </Card>

          {/* Responsible Person */}
          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label={t("detailPages.sections.responsiblePerson")}
              value={t("detailPages.sections.responsiblePersonDescription")}
              icon={User}
              iconClassName="text-black"
            />
            <CardContent className="w-2/4 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem
                  label={t("detailPages.labels.name")}
                  value={formData.responsibleName}
                  isEditable={editStates.responsiblePerson}
                  onChange={(value) => updateFormData("responsibleName", value)}
                />
                <DataItem
                  label={t("detailPages.labels.phoneNumber")}
                  value={formData.responsiblePhone}
                  type="tel"
                  isEditable={editStates.responsiblePerson}
                  onChange={(value) =>
                    updateFormData("responsiblePhone", value)
                  }
                />
              </div>
            </CardContent>
            <div className="flex gap-2">
              {editStates.responsiblePerson ? (
                <>
                  <Button
                    onClick={() => handleSave("responsiblePerson")}
                    variant="default"
                  >
                    {t("detailPages.buttons.saveChanges")}
                  </Button>
                  <Button
                    onClick={() => handleCancel("responsiblePerson")}
                    variant="outline"
                  >
                    {t("detailPages.buttons.cancel")}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => toggleEdit("responsiblePerson")}
                  variant="outline"
                >
                  {t("detailPages.buttons.edit")}
                </Button>
              )}
            </div>
          </Card>

          {/* Documents */}
          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label={t("detailPages.sections.documents")}
              value={t("detailPages.sections.documentsDescription")}
              icon={FileStack}
              iconClassName="text-black"
            />
            <CardContent className="flex flex-1 justify-start gap-4">
              <Card className="flex-1 border rounded-lg px-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <DataItem
                  label="ID Document"
                  value="ID Document Verfification"
                />
              </Card>
              <Card className="flex-1 border rounded-lg px-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <DataItem label="Bank Statment" value="Uploaded: 2024-01-10" />
              </Card>
              <Card className="flex-1 border rounded-lg px-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <DataItem label="Bank Statment" value="Uploaded: 2024-01-10" />
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="w-full px-6" value="parcels">
          <DataTable
            columns={columns()}
            data={parcels?.parcels || []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            searchPlaceholder={t("table.search")}
            onRowClick={handleRowClick}
          />
        </TabsContent>

        <TabsContent className="w-full px-6" value="operating-hours">
          <Card className="w-full flex flex-col pt-0 overflow-hidden">
            <h1 className="px-4 border-b py-3 bg-gray-50 font-semibold">
              {t("detailPages.tabs.operatingHours")}
            </h1>
            <div className="px-4 py-4">
              <div className="text-gray-500 text-sm">
                {t("detailPages.messages.operatingHoursPlaceholder")}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent className="w-full px-6" value="kpis">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BranchDetails;
