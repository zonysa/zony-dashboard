"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComingSoon } from "@/components/ui/coming-soon";
import DataItem from "@/components/ui/DataItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetParcel } from "@/lib/hooks/useParcel";
import { ArrowRight, Box, Clock, Package, Store, Truck, User } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to format datetime
const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Page() {
  const params = useParams();
  const parcelId = (params.id as string) || "";

  const { t } = useTranslation();
  const { data: parcel } = useGetParcel(parcelId);

  // Handle missing ID after all hooks are called
  if (!parcelId) {
    notFound();
  }

  const parcelData = parcel?.parcel;

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="flex justify-start bg-transparent px-6 gap-2">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="info">{t("detailPages.tabs.parcelInfo")}</TabsTrigger>
            <TabsTrigger value="pudos">{t("detailPages.tabs.parcelTracking")}</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="info" className=" py-10">
          <div className="flex flex-col gap-6">
            {/* Tracking Information Card */}
            <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label={t("detailPages.sections.trackingInformation")}
                value={t("detailPages.sections.trackingInformationDescription")}
                icon={Package}
              />
              <CardContent className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label={t("detailPages.labels.trackingNumber")}
                    value={parcelData?.tracking_number || "N/A"}
                  />
                  <DataItem
                    label={t("detailPages.labels.barcode")}
                    value={parcelData?.barcode || "N/A"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label={t("detailPages.labels.client")}
                    value={parcelData?.client_name || "N/A"}
                  />
                  <DataItem
                    label={t("detailPages.labels.deliveryMethod")}
                    value={parcelData?.delivery_method?.replace(/_/g, " ") || "N/A"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label={t("detailPages.labels.shipmentDate")}
                    value={formatDate(parcelData?.created_at || null)}
                  />
                  <DataItem
                    label={t("detailPages.labels.receivingCode")}
                    value={parcelData?.receiving_code || "N/A"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Timeline Card */}
            <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label={t("detailPages.sections.deliveryTimeline")}
                value={t("detailPages.sections.deliveryTimelineDescription")}
                icon={Clock}
              />
              <CardContent className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label={t("detailPages.labels.currentStatus")}
                    value={parcelData?.status?.replace(/_/g, " ") || "N/A"}
                  />
                  <DataItem
                    label={t("detailPages.labels.pickupPeriod")}
                    value={parcelData?.pickup_period ? `${parcelData.pickup_period} days` : "N/A"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label={t("detailPages.labels.receivingDate")}
                    value={formatDateTime(parcelData?.receiving_date || null)}
                  />
                  <DataItem
                    label={t("detailPages.labels.deliveringDate")}
                    value={formatDateTime(parcelData?.delivering_date || null)}
                  />
                </div>

                {parcelData?.delivery_address && (
                  <>
                    <DataItem
                      label={t("detailPages.labels.deliveryAddress")}
                      value={parcelData.delivery_address.short_address || "N/A"}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <DataItem
                        label={t("detailPages.labels.deliveryDate")}
                        value={formatDate(parcelData.delivery_address.date)}
                      />
                      <DataItem
                        label={t("detailPages.labels.deliveryTime")}
                        value={`${parcelData.delivery_address.from_time} - ${parcelData.delivery_address.to_time}`}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Parcel Content Card */}
            {parcelData?.content && (
              <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
                <DataItem
                  isHeading={true}
                  label={t("detailPages.sections.parcelContent")}
                  value={t("detailPages.sections.parcelContentDescription")}
                  icon={Box}
                />
                <CardContent className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <DataItem
                      label={t("detailPages.labels.description")}
                      value={parcelData.content.description || "N/A"}
                    />
                    <DataItem
                      label={t("detailPages.labels.size")}
                      value={
                        parcelData.content.size
                          ? t(`forms.options.parcelSize.${parcelData.content.size}`)
                          : "N/A"
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <DataItem
                      label={t("detailPages.labels.quantity")}
                      value={
                        parcelData.content.quantity != null
                          ? String(parcelData.content.quantity)
                          : "N/A"
                      }
                    />
                    <DataItem
                      label={t("detailPages.labels.weight")}
                      value={
                        parcelData.content.weight != null
                          ? `${parcelData.content.weight} kg`
                          : "N/A"
                      }
                    />
                  </div>
                  {parcelData.content.dimensions && (
                    <DataItem
                      label={t("detailPages.labels.dimensions")}
                      value={`${parcelData.content.dimensions.length} x ${parcelData.content.dimensions.width} x ${parcelData.content.dimensions.height} ${parcelData.content.dimensions.unit || "cm"}`}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sender Card */}
            <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label={t("detailPages.sections.sender")}
                value={t("detailPages.sections.senderDescription")}
                icon={Store}
              />
              <CardContent className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label={t("detailPages.labels.senderName")}
                    value={parcelData?.client_name || "N/A"}
                    valueClassName="text-primary"
                  />
                  <DataItem
                    label={t("detailPages.labels.senderPhoneNumber")}
                    value={parcelData?.sender?.personal.phone_number || "N/A"}
                  />
                </div>
                {parcelData?.sender?.location && (
                  <div className="grid grid-cols-2 gap-3">
                    <DataItem
                      label={t("detailPages.labels.address")}
                      value={parcelData.sender.location.address || "N/A"}
                    />
                    <DataItem
                      label={t("detailPages.labels.city")}
                      value={parcelData.sender.location.city || "N/A"}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Receiver Card */}
            <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label={t("detailPages.sections.receiver")}
                value={t("detailPages.sections.receiverDescription")}
                icon={User}
              />
              <CardContent className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DataItem
                    label={t("detailPages.labels.receiverName")}
                    value={parcelData?.customer_name || "N/A"}
                    valueClassName="text-primary"
                  />
                  <DataItem
                    label={t("detailPages.labels.receiverPhoneNumber")}
                    value={parcelData?.customer_phone_number || "N/A"}
                  />
                </div>
                {parcelData?.receiver?.location && (
                  <div className="grid grid-cols-2 gap-3">
                    <DataItem
                      label={t("detailPages.labels.address")}
                      value={parcelData.receiver.location.address || "N/A"}
                    />
                    <DataItem
                      label={t("detailPages.labels.city")}
                      value={parcelData.receiver.location.city || "N/A"}
                    />
                  </div>
                )}
                {parcelData?.customer_id && (
                  <DataItem
                    label={t("detailPages.labels.customerId")}
                    value={parcelData.customer_id}
                  />
                )}
              </CardContent>
            </Card>

            {/* Courier Card */}
            <Card className="flex flex-row border-0 border-b px-6 rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label={t("detailPages.sections.courier")}
                value={t("detailPages.sections.courierDescription")}
                icon={Truck}
              />
              <CardContent className="flex-1 space-y-3">
                {parcelData?.courier_name || parcelData?.courier_phone_number ? (
                  <div className="grid grid-cols-2 gap-3">
                    <DataItem
                      label={t("detailPages.labels.courierName")}
                      value={parcelData?.courier_name || "N/A"}
                    />
                    <DataItem
                      label={t("detailPages.labels.courierPhoneNumber")}
                      value={parcelData?.courier_phone_number || "N/A"}
                    />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-4">
                    {t("detailPages.messages.noCourierAssigned")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PUDO Card */}
            {parcelData?.pudo_id && (
              <Card className="flex flex-row items-center px-6 border-0 border-b rounded-none shadow-none">
                <DataItem
                  isHeading={true}
                  label={t("detailPages.sections.pickupPoint")}
                  value={t("detailPages.sections.pickupPointDescription")}
                  icon={Store}
                  iconClassName="text-primary"
                />
                <CardContent className="flex-1">
                  <div className="px-4 py-4">
                    <div className="flex flex-col gap-4">
                      <div className="text-center text-gray-600 text-sm">
                        {t("detailPages.messages.needMoreTime")}
                      </div>
                      <div className="text-center text-gray-500 text-xs">
                        {t("detailPages.messages.extendReceiptTime")}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <Link
                  href={`/pudos/${parcelData.pudo_id}`}
                  className="w-1/4 bg-primary hover:bg-primary/80 py-2 text-center text-white rounded-md text-sm font-medium transition-colors"
                >
                  {t("detailPages.buttons.viewPickupPoint")}
                </Link>
              </Card>
            )}
            {/* Extension Request Card */}
            <Card className="flex flex-row items-center px-6 border-0 border-b rounded-none shadow-none">
              <DataItem
                isHeading={true}
                label={t("detailPages.sections.extensionRequest")}
                value={t("detailPages.sections.extensionRequestDescription")}
                icon={ArrowRight}
                iconClassName="text-primary"
              />
              <CardContent className="flex-1">
                <div className="px-4 py-4">
                  <div className="flex flex-col gap-4">
                    <div className="text-center text-gray-600 text-sm">
                      {t("detailPages.messages.needMoreTime")}
                    </div>
                    <div className="text-center text-gray-500 text-xs">
                      {t("detailPages.messages.extendReceiptTime")}
                    </div>
                  </div>
                </div>
              </CardContent>
              <Button className="w-1/4 bg-primary hover:bg-primary/80 py-2 text-white rounded-md text-sm font-medium transition-colors">
                {t("detailPages.buttons.extensionRequest")}
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
