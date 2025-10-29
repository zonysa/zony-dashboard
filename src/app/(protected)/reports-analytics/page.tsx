"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import { SectionCards } from "@/components/ui/section-cards";

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
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "zone", label: "Zone", placeholder: "All Zones" },
    { key: "district", label: "District", placeholder: "All Districts" },
    { key: "status", label: "Status", placeholder: "All Statuses" },
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

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
        <Tabs defaultValue="core-financial" className="w-full gap-6">
        <TabsList className="px-6 bg-transparent">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="core-financial">Core Financial</TabsTrigger>
            <TabsTrigger value="operational-performance">
              Operational Performance
            </TabsTrigger>
            <TabsTrigger value="customer-market">Customer & Market</TabsTrigger>
            <TabsTrigger value="quality-satisfaction">
              Quality & Satisfaction
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent className="w-full" value="core-financial">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
            </div>
          </div>
        </TabsContent>

        <TabsContent className="w-full" value="operational-performance">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
            </div>
          </div>
        </TabsContent>

        <TabsContent className="w-full" value="customer-market">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
            </div>
          </div>
        </TabsContent>

        <TabsContent className="w-full" value="quality-satisfaction">
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
