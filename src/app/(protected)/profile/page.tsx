"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DataItem from "@/components/ui/DataItem";
import { User, Mail, MapPin, Calendar, Shield } from "lucide-react";
import { useGetProfile, useUpdateProfile } from "@/lib/hooks/useProfile";
import { ProfileFormData } from "@/lib/schema/profile.schema";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

type EditSection = "personalInfo" | "contactInfo" | "locationInfo";

type EditStates = {
  [key in EditSection]: boolean;
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const { data: profileData, isLoading, error } = useGetProfile();
  const updateProfileMutation = useUpdateProfile();

  const [editStates, setEditStates] = useState<EditStates>({
    personalInfo: false,
    contactInfo: false,
    locationInfo: false,
  });

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    city: "",
    country: "",
    birth_date: "",
    gender: null,
    identity: "",
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>({});

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profileData?.profile) {
      const profile = profileData.profile;
      const data: ProfileFormData = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        username: profile.username,
        email: profile.email,
        phone_number: profile.phone_number,
        city: profile.city || "",
        country: profile.country || "",
        birth_date: profile.birth_date || "",
        gender: profile.gender as "male" | "female" | "other" | null,
        identity: profile.identity || "",
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [profileData]);

  const toggleEdit = (section: EditSection) => {
    setEditStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (section: EditSection) => {
    try {
      let dataToUpdate: Partial<ProfileFormData> = {};

      // Only send changed fields based on section
      if (section === "personalInfo") {
        dataToUpdate = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          birth_date: formData.birth_date,
          gender: formData.gender,
          identity: formData.identity,
        };
      } else if (section === "contactInfo") {
        dataToUpdate = {
          email: formData.email,
          phone_number: formData.phone_number,
        };
      } else if (section === "locationInfo") {
        dataToUpdate = {
          city: formData.city,
          country: formData.country,
        };
      }

      await updateProfileMutation.mutateAsync(dataToUpdate, {
        onSuccess: () => {
          toast.success(t("profile.messages.updateSuccess"));
          setOriginalData(formData);
          toggleEdit(section);
        },
        onError: (error: Error) => {
          toast.error(t("profile.messages.updateError", { error: error.message }));
        },
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(t("profile.messages.updateFailed"));
    }
  };

  const handleCancel = (section: EditSection) => {
    setFormData(originalData);
    toggleEdit(section);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{t("profile.messages.loadingError")}</p>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const profile = profileData?.profile;

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">{t("profile.messages.noData")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Personal Information Card */}
      <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label={t("profile.sections.personalInfo.title")}
          value={t("profile.sections.personalInfo.description")}
          icon={User}
          iconClassName="text-black"
        />
        <CardContent className="w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label={t("profile.fields.firstName")}
              value={formData.first_name || ""}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("first_name", value)}
            />
            <DataItem
              label={t("profile.fields.lastName")}
              value={formData.last_name || ""}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("last_name", value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label={t("profile.fields.username")}
              value={formData.username || ""}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("username", value)}
            />
            <DataItem
              label={t("profile.fields.birthDate")}
              value={formData.birth_date || t("profile.values.notSet")}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("birth_date", value)}
              placeholder={t("profile.placeholders.birthDate")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label={t("profile.fields.gender")}
              value={formData.gender || t("profile.values.notSet")}
              type="select"
              isEditable={editStates.personalInfo}
              selectOptions={[
                { value: "male", label: t("profile.gender.male") },
                { value: "female", label: t("profile.gender.female") },
                { value: "other", label: t("profile.gender.other") },
              ]}
              onChange={(value) => updateFormData("gender", value)}
            />
            <DataItem
              label={t("profile.fields.identity")}
              value={formData.identity || t("profile.values.notSet")}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("identity", value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <DataItem
              label={t("profile.fields.accountStatus")}
              value={profile.is_active ? t("profile.status.active") : t("profile.status.inactive")}
              valueClassName={profile.is_active ? "text-green-600" : "text-red-600"}
            />
            <DataItem
              label={t("profile.fields.lastLogin")}
              value={new Date(profile.last_login).toLocaleString()}
              icon={Calendar}
            />
          </div>
        </CardContent>
        <div className="flex gap-2">
          {editStates.personalInfo ? (
            <>
              <Button
                onClick={() => handleSave("personalInfo")}
                variant="default"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? t("profile.buttons.saving") : t("profile.buttons.saveChanges")}
              </Button>
              <Button
                onClick={() => handleCancel("personalInfo")}
                variant="outline"
                disabled={updateProfileMutation.isPending}
              >
                {t("profile.buttons.cancel")}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => toggleEdit("personalInfo")}
              variant="outline"
            >
              {t("profile.buttons.edit")}
            </Button>
          )}
        </div>
      </Card>

      {/* Contact Information Card */}
      <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label={t("profile.sections.contactInfo.title")}
          value={t("profile.sections.contactInfo.description")}
          icon={Mail}
          iconClassName="text-black"
        />
        <CardContent className="w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label={t("profile.fields.emailAddress")}
              value={formData.email || ""}
              type="email"
              isEditable={editStates.contactInfo}
              onChange={(value) => updateFormData("email", value)}
            />
            <DataItem
              label={t("profile.fields.phoneNumber")}
              value={formData.phone_number || ""}
              type="tel"
              isEditable={editStates.contactInfo}
              onChange={(value) => updateFormData("phone_number", value)}
            />
          </div>
        </CardContent>
        <div className="flex gap-2">
          {editStates.contactInfo ? (
            <>
              <Button
                onClick={() => handleSave("contactInfo")}
                variant="default"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? t("profile.buttons.saving") : t("profile.buttons.saveChanges")}
              </Button>
              <Button
                onClick={() => handleCancel("contactInfo")}
                variant="outline"
                disabled={updateProfileMutation.isPending}
              >
                {t("profile.buttons.cancel")}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => toggleEdit("contactInfo")}
              variant="outline"
            >
              {t("profile.buttons.edit")}
            </Button>
          )}
        </div>
      </Card>

      {/* Location Information Card */}
      <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label={t("profile.sections.locationInfo.title")}
          value={t("profile.sections.locationInfo.description")}
          icon={MapPin}
          iconClassName="text-black"
        />
        <CardContent className="w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label={t("profile.fields.city")}
              value={formData.city || t("profile.values.notSet")}
              isEditable={editStates.locationInfo}
              onChange={(value) => updateFormData("city", value)}
            />
            <DataItem
              label={t("profile.fields.country")}
              value={formData.country || t("profile.values.notSet")}
              isEditable={editStates.locationInfo}
              onChange={(value) => updateFormData("country", value)}
            />
          </div>
        </CardContent>
        <div className="flex gap-2">
          {editStates.locationInfo ? (
            <>
              <Button
                onClick={() => handleSave("locationInfo")}
                variant="default"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? t("profile.buttons.saving") : t("profile.buttons.saveChanges")}
              </Button>
              <Button
                onClick={() => handleCancel("locationInfo")}
                variant="outline"
                disabled={updateProfileMutation.isPending}
              >
                {t("profile.buttons.cancel")}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => toggleEdit("locationInfo")}
              variant="outline"
            >
              {t("profile.buttons.edit")}
            </Button>
          )}
        </div>
      </Card>

      {/* Account Information (Read-only) */}
      <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label={t("profile.sections.accountInfo.title")}
          value={t("profile.sections.accountInfo.description")}
          icon={Shield}
          iconClassName="text-black"
        />
        <CardContent className="w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label={t("profile.fields.userId")}
              value={profile.id}
            />
            <DataItem
              label={t("profile.fields.avatar")}
              value={profile.avatar || t("profile.values.noAvatar")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
