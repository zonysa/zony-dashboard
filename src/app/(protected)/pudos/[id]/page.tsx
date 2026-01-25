"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Store, FileStack, MapPin } from "lucide-react";
import DataItem from "@/components/ui/DataItem";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  useGetBranch,
  useGetBranchParcels,
  useGetBranchKPIs,
} from "@/lib/hooks/useBranch";
import { useParams, useRouter } from "next/navigation";
import { SectionCards } from "@/components/ui/section-cards";
import { Columns } from "@/components/tables/columns/parcels-columns";
import { Row } from "@tanstack/react-table";
import { ParcelDetails } from "@/lib/schema/parcel.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { StaticMap } from "@/components/ui/StaticMap";
import { useGetCities } from "@/lib/hooks/useCity";
import { useGetZones, useGetZoneDistricts } from "@/lib/hooks/useZone";

function BranchDetails() {
  const { t } = useTranslation();
  const params = useParams();
  const branchId = params.id as string;
  const [locationExist, setLocationExist] = useState<boolean>(true);

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    popup?: string;
  }>({ lng: 0, lat: 0, popup: "" });

  const { data: branch } = useGetBranch(branchId);
  const {
    data: parcels,
    isLoading,
    isError,
    error,
  } = useGetBranchParcels(branchId);
  const { data: kpiData, isLoading: kpiLoading } = useGetBranchKPIs(branchId);

  useEffect(() => {
    const coor = branch?.pudo?.coordinates;
    if (!branch || !coor) {
      setLocationExist(false);
    } else {
      setLocation({
        lat: coor?.latitude,
        lng: coor?.longitude,
        popup: "test",
      });
    }
  }, [branch]);

  // Edit states
  const [editStates, setEditStates] = useState({
    branchInfo: false,
    location: false,
    responsiblePerson: false,
    operatingHours: false,
  });

  // Form data states
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    name: "",
    phoneNum: "",
    responsibleName: "",
    responsiblePhone: "",
    cityId: "",
    zoneId: "",
    districtId: "",
  });

  // Conditional data fetching - only when edit mode is enabled
  const { data: citiesData } = useGetCities();
  const { data: zonesData } = useGetZones(
    formData.cityId ? { cityId: parseInt(formData.cityId) } : undefined,
  );
  const { data: districtsData } = useGetZoneDistricts(formData.zoneId);

  // Update form data when branch data is loaded
  useEffect(() => {
    if (branch?.pudo) {
      setFormData({
        title: branch.pudo.name || "",
        location: branch.pudo.address || "",
        name: branch.pudo.name || "",
        phoneNum: "",
        responsibleName: branch.pudo.responsible.name || "",
        responsiblePhone: branch.pudo.responsible.phone_number || "",
        cityId: branch.pudo.city_name?.toString() || "",
        zoneId: branch.pudo.zone_id?.toString() || "",
        districtId: branch.pudo.district_name?.toString() || "",
      });
    }
  }, [branch]);

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
    if (branch?.pudo) {
      setFormData({
        title: branch.pudo.name || "",
        location: branch.pudo.address || "",
        name: branch.pudo.name || "",
        phoneNum: "",
        responsibleName: branch.pudo.responsible.name || "",
        responsiblePhone: branch.pudo.responsible.phone_number || "",
        cityId: branch.pudo.city_name?.toString() || "",
        zoneId: branch.pudo.zone_id?.toString() || "",
        districtId: branch.pudo.district_name?.toString() || "",
      });
    }
    setEditStates((prev) => ({
      ...prev,
      [section]: false,
    }));
  };

  // Convert API data to select options
  const cityOptions =
    citiesData?.cities?.map((city) => ({
      value: city.id?.toString() || "",
      label: city.name,
    })) || [];

  const zoneOptions =
    zonesData?.zones?.map((zone) => ({
      value: zone.id.toString(),
      label: zone.name,
    })) || [];

  const districtOptions =
    districtsData?.districts?.map((district) => ({
      value: district.id?.toString() || "",
      label: district.name,
    })) || [];

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset dependent fields when city or zone changes
      if (field === "cityId") {
        newData.zoneId = "";
        newData.districtId = "";
      } else if (field === "zoneId") {
        newData.districtId = "";
      }

      return newData;
    });
  };

  const filterConfigs = [
    {
      key: "city_name",
      label: t("table.city"),
      placeholder: t("table.allCities"),
    },
    { key: "zone_name", label: t("table.zone"), placeholder: "All Zones" },
    {
      key: "client_name",
      label: t("table.client"),
      placeholder: t("table.allClients") || "All Clients",
    },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];

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
                  value={String(branch?.pudo?.name || "N/A")}
                  isEditable={editStates.branchInfo}
                  onChange={(value) => updateFormData("name", value)}
                />
                <DataItem
                  label={t("detailPages.labels.currentStatus")}
                  value={String(branch?.pudo?.status || "N/A")}
                />
              </div>

              {/* PUDO Photos Gallery */}
              {branch?.pudo?.gallery && branch.pudo.gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {branch.pudo.gallery.map((photo, index) => (
                    <div key={index} className="relative aspect-video">
                      <Image
                        src={photo}
                        alt={`PUDO photo ${index + 1}`}
                        fill
                        className="object-cover rounded"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
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

          {/* Location */}
          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label={t("detailPages.sections.location") || "Location"}
              value={
                t("detailPages.sections.locationDescription") ||
                "Location and address details"
              }
              icon={MapPin}
              iconClassName="text-black"
            />
            <CardContent className="w-2/4 flex-1 space-y-3">
              {/* City, Zone, and District */}
              <div className="grid grid-cols-3 gap-3">
                <DataItem
                  label={t("table.city")}
                  value={
                    editStates.location
                      ? formData.cityId
                      : branch?.pudo?.city_name ||
                        branch?.pudo?.city_name ||
                        "N/A"
                  }
                  type="select"
                  isEditable={editStates.location}
                  selectOptions={cityOptions}
                  placeholder={"Select City"}
                  onChange={(value) => updateFormData("cityId", value)}
                />
                <DataItem
                  label={t("table.zone")}
                  value={
                    editStates.location
                      ? formData.zoneId
                      : String(branch?.pudo?.zone_id || "N/A")
                  }
                  type="select"
                  isEditable={editStates.location}
                  selectOptions={zoneOptions}
                  placeholder="Select Zone"
                  onChange={(value) => updateFormData("zoneId", value)}
                  disabled={!formData.cityId}
                />
                <DataItem
                  label={t("table.district")}
                  value={
                    editStates.location
                      ? formData.districtId
                      : branch?.pudo?.district_name ||
                        branch?.pudo?.district_name ||
                        "N/A"
                  }
                  type="select"
                  isEditable={editStates.location}
                  selectOptions={districtOptions}
                  placeholder={"Select District"}
                  onChange={(value) => updateFormData("districtId", value)}
                  disabled={!formData.zoneId}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <DataItem
                  label={t("detailPages.labels.location")}
                  value={String(branch?.pudo?.address || "N/A")}
                  isEditable={editStates.location}
                  onChange={(value) => updateFormData("location", value)}
                />
              </div>

              <div className="w-full">
                {locationExist ? (
                  <StaticMap width="100" coordinates={[location]} />
                ) : (
                  <div className="w-full h-100 bg-gray-100 flex justify-center items-center rounded">
                    <span className="text-gray-500">
                      There is no location for this branch
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <div className="flex gap-2">
              {editStates.location ? (
                <>
                  <Button
                    onClick={() => handleSave("location")}
                    variant="default"
                  >
                    {t("detailPages.buttons.saveChanges")}
                  </Button>
                  <Button
                    onClick={() => handleCancel("location")}
                    variant="outline"
                  >
                    {t("detailPages.buttons.cancel")}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => toggleEdit("location")}
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
            <CardContent className="flex flex-1 justify-start gap-4 flex-wrap">
              {/* Municipal License */}
              {branch?.pudo?.municipal_license && (
                <Card
                  className="flex-1 min-w-50 border rounded-lg px-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() =>
                    window.open(branch.pudo.municipal_license, "_blank")
                  }
                >
                  <DataItem
                    label={t("detailPages.labels.municipalLicense")}
                    value={t("detailPages.labels.clickToView")}
                  />
                </Card>
              )}

              {/* Gallery Documents */}
              {branch?.pudo?.gallery && branch.pudo.gallery.length > 0 && (
                <>
                  {branch.pudo.gallery.map((doc, index) => (
                    <Card
                      key={index}
                      className="flex-1 min-w-50 border rounded-lg px-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => window.open(doc, "_blank")}
                    >
                      <DataItem
                        label={`${t("detailPages.labels.document")} ${index + 1}`}
                        value={t("detailPages.labels.clickToView")}
                      />
                    </Card>
                  ))}
                </>
              )}

              {/* No documents message */}
              {!branch?.pudo?.municipal_license &&
                (!branch?.pudo?.gallery ||
                  branch.pudo.gallery.length === 0) && (
                  <div className="text-sm text-muted-foreground py-4">
                    {t("detailPages.messages.noDocuments")}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="w-full px-6" value="parcels">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-sm text-muted-foreground">
                Loading parcels...
              </div>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-sm text-destructive">
                {error?.message || "Failed to load parcels"}
              </div>
            </div>
          ) : (
            <DataTable
              columns={Columns({ t })}
              data={parcels?.parcels || []}
              enableFiltering={true}
              filterConfigs={filterConfigs}
              enableGlobalSearch={true}
              searchPlaceholder={t("table.search")}
              onRowClick={handleRowClick}
            />
          )}
        </TabsContent>

        <TabsContent className="w-full px-6" value="operating-hours">
          <Card className="w-full flex flex-col pt-0 overflow-hidden">
            <div className="px-4 border-b py-3 bg-gray-50 font-semibold flex justify-between items-center">
              <h1>{t("detailPages.tabs.operatingHours")}</h1>
              {editStates.operatingHours ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave("operatingHours")}
                    variant="default"
                    size="sm"
                  >
                    {t("detailPages.buttons.saveChanges")}
                  </Button>
                  <Button
                    onClick={() => handleCancel("operatingHours")}
                    variant="outline"
                    size="sm"
                  >
                    {t("detailPages.buttons.cancel")}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => toggleEdit("operatingHours")}
                  variant="outline"
                  size="sm"
                >
                  {t("detailPages.buttons.edit")}
                </Button>
              )}
            </div>
            <div className="px-4 py-4">
              {branch?.pudo?.oprating_hours ? (
                <div className="space-y-3">
                  {Object.entries(branch.pudo.oprating_hours).map(
                    ([day, hours]) => (
                      <div
                        key={day}
                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                      >
                        <div className="font-medium capitalize w-32">{day}</div>
                        <div className="flex-1">
                          {hours.enabled ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {hours.from} - {hours.to}
                              </span>
                              {hours.breakHour && (
                                <span className="text-xs text-muted-foreground">
                                  (Break: {hours.breakHour})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t("detailPages.labels.closed")}
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  {t("detailPages.messages.operatingHoursPlaceholder")}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent className="w-full px-6" value="kpis">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                kpis={Array.isArray(kpiData) ? kpiData : []}
                isLoading={kpiLoading}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BranchDetails;
