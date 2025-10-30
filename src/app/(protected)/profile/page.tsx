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

type EditSection = "personalInfo" | "contactInfo" | "locationInfo";

type EditStates = {
  [key in EditSection]: boolean;
};

const ProfilePage = () => {
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
          toast.success("Profile updated successfully");
          setOriginalData(formData);
          toggleEdit(section);
        },
        onError: (error: Error) => {
          toast.error(`Error updating profile: ${error.message}`);
        },
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
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
          <p className="text-red-500 text-lg">Error loading profile</p>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const profile = profileData?.profile;

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Personal Information Card */}
      <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label="Personal Information"
          value="Your basic personal details"
          icon={User}
          iconClassName="text-black"
        />
        <CardContent className="w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label="First Name"
              value={formData.first_name || ""}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("first_name", value)}
            />
            <DataItem
              label="Last Name"
              value={formData.last_name || ""}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("last_name", value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label="Username"
              value={formData.username || ""}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("username", value)}
            />
            <DataItem
              label="Birth Date"
              value={formData.birth_date || "Not set"}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("birth_date", value)}
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label="Gender"
              value={formData.gender || "Not set"}
              type="select"
              isEditable={editStates.personalInfo}
              selectOptions={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              onChange={(value) => updateFormData("gender", value)}
            />
            <DataItem
              label="Identity/ID"
              value={formData.identity || "Not set"}
              isEditable={editStates.personalInfo}
              onChange={(value) => updateFormData("identity", value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <DataItem
              label="Account Status"
              value={profile.is_active ? "Active" : "Inactive"}
              valueClassName={profile.is_active ? "text-green-600" : "text-red-600"}
            />
            <DataItem
              label="Last Login"
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
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => handleCancel("personalInfo")}
                variant="outline"
                disabled={updateProfileMutation.isPending}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => toggleEdit("personalInfo")}
              variant="outline"
            >
              Edit
            </Button>
          )}
        </div>
      </Card>

      {/* Contact Information Card */}
      <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label="Contact Information"
          value="Email and phone contact details"
          icon={Mail}
          iconClassName="text-black"
        />
        <CardContent className="w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label="Email Address"
              value={formData.email || ""}
              type="email"
              isEditable={editStates.contactInfo}
              onChange={(value) => updateFormData("email", value)}
            />
            <DataItem
              label="Phone Number"
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
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => handleCancel("contactInfo")}
                variant="outline"
                disabled={updateProfileMutation.isPending}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => toggleEdit("contactInfo")}
              variant="outline"
            >
              Edit
            </Button>
          )}
        </div>
      </Card>

      {/* Location Information Card */}
      <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label="Location Information"
          value="Your address and location details"
          icon={MapPin}
          iconClassName="text-black"
        />
        <CardContent className="w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label="City"
              value={formData.city || "Not set"}
              isEditable={editStates.locationInfo}
              onChange={(value) => updateFormData("city", value)}
            />
            <DataItem
              label="Country"
              value={formData.country || "Not set"}
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
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => handleCancel("locationInfo")}
                variant="outline"
                disabled={updateProfileMutation.isPending}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => toggleEdit("locationInfo")}
              variant="outline"
            >
              Edit
            </Button>
          )}
        </div>
      </Card>

      {/* Account Information (Read-only) */}
      <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label="Account Information"
          value="Account details and identifiers"
          icon={Shield}
          iconClassName="text-black"
        />
        <CardContent className="w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label="User ID"
              value={profile.id}
            />
            <DataItem
              label="Avatar"
              value={profile.avatar || "No avatar set"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
