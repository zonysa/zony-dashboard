"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { branchColumns } from "@/components/tables/columns/branches-columns";
import { DataTable } from "@/components/tables/data-table";
import { DollarSign, User } from "lucide-react";
import DataItem from "@/components/ui/DataItem";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useGetPartner, useGetPartnerBranches } from "@/lib/hooks/usePartner";

interface PartnerDataProps {
  partnerData?: {
    title: string;
    rating: number;
    name: string;
    phoneNumber: string;
    bankName: string;
    accountNumber: string;
    iban: string;
    payoutPerParcel: string;
  };
}

function PartnerDetails({ partnerData }: PartnerDataProps) {
  const params = useParams();
  const partnerId = params.id as string;

  const { data: partner } = useGetPartner(partnerId);
  const { data: branches } = useGetPartnerBranches(partnerId);

  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "zone", label: "Zone", placeholder: "All Zones" },
    { key: "district", label: "District", placeholder: "All Districts" },
    { key: "status", label: "Status", placeholder: "All Statuses" },
  ];

  // Edit states
  const [editStates, setEditStates] = useState({
    partnerInfo: false,
    representative: false,
    paymentInfo: false,
  });

  const defaultData = {
    title: "Wafa Pharmacy",
    rating: 4.6,
    name: "Ahmed Salem",
    phoneNumber: "252525252",
    bankName: "National Bank of Egypt",
    accountNumber: "****1234",
    iban: "EG00 0000 0000 ****",
    payoutPerParcel: "5.00 EGP",
  };

  const data = partnerData || defaultData;

  // Form data states
  const [formData, setFormData] = useState({
    title: data.title,
    name: data.name,
    phoneNumber: data.phoneNumber,
    bankName: data.bankName || "National Bank of Egypt",
    accountNumber: data.accountNumber || "****1234",
    iban: data.iban || "EG00 0000 0000 ****",
    payoutPerParcel: data.payoutPerParcel || "5.00 EGP",
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
      name: data.name,
      phoneNumber: data.phoneNumber,
      bankName: data.bankName || "National Bank of Egypt",
      accountNumber: data.accountNumber || "****1234",
      iban: data.iban || "EG00 0000 0000 ****",
      payoutPerParcel: data.payoutPerParcel || "5.00 EGP",
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

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
      <Tabs defaultValue="info" className="w-full gap-6">
        <TabsList className="px-6 bg-transparent">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="info">Partner Info</TabsTrigger>
            <TabsTrigger value="pudos">PUDOs</TabsTrigger>
          </div>
        </TabsList>

        <TabsContent className="w-full" value="info">
          {/* Partner Info */}
          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label="Partner Info"
              value="Primary contact person for this branch"
              icon={User}
              iconClassName="text-black"
            />
            <CardContent className="w-2/4 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem
                  label="Name"
                  value={partner?.partner?.name}
                  isEditable={editStates.representative}
                  onChange={(value) => updateFormData("name", value)}
                />
                <DataItem
                  label="Phone Number"
                  value={data.phoneNumber}
                  type="tel"
                  isEditable={editStates.representative}
                  onChange={(value) => updateFormData("phoneNumber", value)}
                />
              </div>
            </CardContent>
            <div className="flex gap-2">
              {editStates.representative ? (
                <>
                  <Button
                    onClick={() => handleSave("representative")}
                    variant="default"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => handleCancel("representative")}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => toggleEdit("representative")}
                  variant="outline"
                >
                  Edit
                </Button>
              )}
            </div>
          </Card>

          {/* Responsible Person */}
          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label="Representative Person"
              value="Primary contact person for this branch"
              icon={User}
              iconClassName="text-black"
            />
            <CardContent className="w-2/4 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem
                  label="Name"
                  value={data.name}
                  isEditable={editStates.representative}
                  onChange={(value) => updateFormData("name", value)}
                />
                <DataItem
                  label="Phone Number"
                  value={data.phoneNumber}
                  type="tel"
                  isEditable={editStates.representative}
                  onChange={(value) => updateFormData("phoneNumber", value)}
                />
              </div>
            </CardContent>
            <div className="flex gap-2">
              {editStates.representative ? (
                <>
                  <Button
                    onClick={() => handleSave("representative")}
                    variant="default"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => handleCancel("representative")}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => toggleEdit("representative")}
                  variant="outline"
                >
                  Edit
                </Button>
              )}
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label="Payment Information"
              value="Banking and payout details for this branch"
              icon={DollarSign}
              iconClassName="text-black"
            />
            <CardContent className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem
                  label="Bank Name"
                  value={formData.bankName}
                  type="select"
                  selectOptions={[
                    {
                      value: "National Bank of Egypt",
                      label: "National Bank of Egypt",
                    },
                    { value: "Banque Misr", label: "Banque Misr" },
                    { value: "CIB", label: "Commercial International Bank" },
                    { value: "ADCB", label: "Abu Dhabi Commercial Bank" },
                  ]}
                  isEditable={editStates.paymentInfo}
                  onChange={(value) => updateFormData("bankName", value)}
                />
                <DataItem
                  label="Account Number"
                  value={formData.accountNumber}
                  isEditable={editStates.paymentInfo}
                  onChange={(value) => updateFormData("accountNumber", value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DataItem
                  label="IBAN"
                  value={formData.iban}
                  isEditable={editStates.paymentInfo}
                  onChange={(value) => updateFormData("iban", value)}
                />
                <DataItem
                  label="Payout per Parcel"
                  value={formData.payoutPerParcel}
                  isEditable={editStates.paymentInfo}
                  onChange={(value) => updateFormData("payoutPerParcel", value)}
                />
              </div>
            </CardContent>
            <div className="flex gap-2">
              {editStates.paymentInfo ? (
                <>
                  <Button
                    onClick={() => handleSave("paymentInfo")}
                    variant="default"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => handleCancel("paymentInfo")}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => toggleEdit("paymentInfo")}
                  variant="outline"
                >
                  Edit
                </Button>
              )}
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
            <DataItem
              isHeading={true}
              label="Financial Overview"
              value="Banking and payout details for this branch"
              icon={DollarSign}
              iconClassName="text-black"
            />
            <CardContent className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DataItem
                  label="Payout Per Parcel"
                  value={formData.bankName}
                  isEditable={editStates.paymentInfo}
                  onChange={(value) => updateFormData("bankName", value)}
                />
                <DataItem
                  label="Total Payout"
                  value={formData.accountNumber}
                  isEditable={editStates.paymentInfo}
                  onChange={(value) => updateFormData("accountNumber", value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="w-full px-6" value="pudos">
          <div className="w-full">
            <DataTable
              columns={branchColumns}
              data={branches?.pudos || []}
              enableFiltering={true}
              filterConfigs={filterConfigs}
              enableGlobalSearch={true}
              searchPlaceholder="Search PUDO name..."
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PartnerDetails;
