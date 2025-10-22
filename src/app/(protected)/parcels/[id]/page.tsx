"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComingSoon } from "@/components/ui/coming-soon";
import DataItem from "@/components/ui/DataItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetParcel } from "@/lib/hooks/useParcel";
import { ArrowRight, Clock, Package, Store, Truck, User } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const parcelId = params.id as string;

  const { data: parcel } = useGetParcel(parcelId || "");

  if (!parcelId) {
    notFound();
  }

  const trackingData = {
    trackingNumber: "#1234AS54SQ",
    pickupEndsAt: "41:34:17",
    fromLocation: "Buraidah, Saudi Arabia",
    toLocation: "Riyadh, Saudi Arabia",
    date: "Mar 21, 2025",
    expirationTime: "00:11, March 26, 2025",
    status: "In Transit",
    extensionAvailable: "Yes",
    customerName: "Amir Yousry",
    customerPhoneNumber: "0120213012",
    courierName: "Amir Yousry",
    courierPhoneNumber: "0120213012",
  };

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="flex justify-start bg-transparent px-6 gap-2">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="info">Parcel Info</TabsTrigger>
            <TabsTrigger value="pudos">Parcel Tracking</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="info" className=" py-10">
          <div className="flex flex-col gap-6">
            {/* Tracking Information Card */}
            <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label="Tracking Information"
                value="Complete tracking details and shipment information for your package"
                icon={Package}
              />
              <CardContent className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label="Tracking Number"
                    value={String(parcel?.parcel?.id ?? "")}
                  />
                  <DataItem
                    label="Pickup Ends At"
                    value={trackingData.pickupEndsAt}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DataItem label="From" value={trackingData.fromLocation} />
                  <DataItem label="To" value={trackingData.toLocation} />
                </div>

                <DataItem label="Shipment Date" value={trackingData.date} />
              </CardContent>
            </Card>

            {/* Delivery Timeline Card */}
            <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label="Delivery Timeline"
                value="Important delivery dates and receipt expiration information"
                icon={Clock}
              />
              <CardContent className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label="Expiration Time"
                    value={trackingData.expirationTime}
                  />
                  <DataItem
                    label="Current Status"
                    value={trackingData.status}
                  />
                </div>

                <DataItem
                  label="Extension Available"
                  value={trackingData.extensionAvailable}
                  valueClassName="text-green-600"
                />
              </CardContent>
            </Card>

            {/* Customer Card */}
            <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label="Customer"
                value="Customer information and contact details"
                icon={User}
              />
              <CardContent className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label="Customer Name"
                    value={trackingData.customerName}
                    valueClassName="text-primary"
                  />
                  <DataItem
                    label="Customer Phone Number"
                    value={trackingData.customerPhoneNumber}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Courier Card */}
            <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label="Courier"
                value="Assigned courier information and contact details"
                icon={Truck}
              />
              <CardContent className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label="Courier Name"
                    value={trackingData.courierName}
                  />
                  <DataItem
                    label="Courier Phone Number"
                    value={trackingData.courierPhoneNumber}
                  />
                </div>
              </CardContent>
            </Card>

            {/* PUDO Card */}
            <Card className="flex flex-row items-center px-6 border-0 border-b rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label="Pickup Point"
                value="Need more time to receive your package? Request an extension here"
                icon={Store}
                iconClassName="text-primary"
              />
              <CardContent className="flex-1">
                <div className="px-4 py-4">
                  <div className="flex flex-col gap-4">
                    <div className="text-center text-gray-600 text-sm">
                      Do you need more time to receive your package?
                    </div>
                    <div className="text-center text-gray-500 text-xs">
                      To extend the receipt time, click below:
                    </div>
                  </div>
                </div>
              </CardContent>
              <Link
                href={`/pudos/${parcelId}`}
                className="w-1/4 bg-primary hover:bg-primary/80 py-2 text-center text-white rounded-md text-sm font-medium transition-colors"
              >
                View Pickup Point
              </Link>
            </Card>
            {/* Extension Request Card */}
            <Card className="flex flex-row items-center px-6 border-0 border-b rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label="Extension Request"
                value="Need more time to receive your package? Request an extension here"
                icon={ArrowRight}
                iconClassName="text-primary"
              />
              <CardContent className="flex-1">
                <div className="px-4 py-4">
                  <div className="flex flex-col gap-4">
                    <div className="text-center text-gray-600 text-sm">
                      Do you need more time to receive your package?
                    </div>
                    <div className="text-center text-gray-500 text-xs">
                      To extend the receipt time, click below:
                    </div>
                  </div>
                </div>
              </CardContent>
              <Button className="w-1/4 bg-primary hover:bg-primary/80 py-2 text-white rounded-md text-sm font-medium transition-colors">
                Extension Request
              </Button>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="pudos" className="py-10 px-6">
          <ComingSoon
            variant="card"
            title="Prcel Tracking"
            description="Secure payment processing will be available soon"
            icon="clock"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
