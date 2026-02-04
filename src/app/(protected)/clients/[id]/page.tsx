"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetClient } from "@/lib/hooks/useClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  DollarSign,
  Building2,
  Package,
} from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Client } from "@/lib/schema/client.schema";

// Helper function to get status variant
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "success";
    case "inactive":
      return "secondary";
    case "pending":
      return "outline";
    case "suspended":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const clientId = params.id as string;

  const { data, isLoading, error } = useGetClient(clientId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("clients.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.client) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              {t("clients.loadingError")}
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => router.push("/clients")}
            >
              {t("clients.backToClients")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const client = data.client as Client;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/clients")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {client.type} {t("clients.labels.client")}
            </p>
          </div>
        </div>
        <Badge variant={getStatusVariant(client.status)} className="capitalize">
          {t(`status.${client.status.toLowerCase()}`, {
            defaultValue: client.status,
          })}
        </Badge>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("clients.sections.clientInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client ID */}
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("clients.labels.clientId")}
                </p>
                <p className="font-mono text-sm">{client.id}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("clients.labels.email")}
                </p>
                <p className="font-mono text-sm">{client.email}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("clients.labels.phoneNumber")}
                </p>
                <p className="font-mono text-sm">{client.phone_number}</p>
              </div>
            </div>

            {/* Contact Person */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("clients.labels.contactPerson")}
                </p>
                <p className="text-sm">{client.contact_person}</p>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("clients.labels.type")}
                </p>
                <p className="text-sm capitalize">{client.type}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("clients.labels.status")}
                </p>
                <Badge
                  variant={getStatusVariant(client.status)}
                  className="capitalize"
                >
                  {t(`status.${client.status.toLowerCase()}`, {
                    defaultValue: client.status,
                  })}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("clients.sections.financialInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Currency */}
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("clients.labels.currency")}
                </p>
                <p className="text-sm font-mono">{client.currency}</p>
              </div>
            </div>

            {/* Payout Per Parcel */}
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("clients.labels.payoutPerParcel")}
                </p>
                <p className="text-sm font-mono">
                  {client.payout_per_parcel} {client.currency}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {(client.total_parcels ||
        client.delivery_rate ||
        client.pudo_points_used) && (
        <Card>
          <CardHeader>
            <CardTitle>{t("clients.sections.statistics")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Parcels */}
              {client.total_parcels !== undefined && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("clients.labels.totalParcels")}
                    </p>
                    <p className="text-2xl font-bold">{client.total_parcels}</p>
                  </div>
                </div>
              )}

              {/* Delivery Rate */}
              {client.delivery_rate !== undefined && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("clients.labels.deliveryRate")}
                    </p>
                    <p className="text-2xl font-bold">
                      {client.delivery_rate}%
                    </p>
                  </div>
                </div>
              )}

              {/* PUDO Points Used */}
              {client.pudo_points_used !== undefined && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("clients.labels.pudoPointsUsed")}
                    </p>
                    <p className="text-2xl font-bold">
                      {client.pudo_points_used}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
