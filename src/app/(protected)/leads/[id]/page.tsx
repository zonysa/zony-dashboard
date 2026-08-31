"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataItem from "@/components/ui/DataItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer } from "@/components/PageContainer";
import { useGetLead, useUpdateLead } from "@/lib/hooks/useLead";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Permission } from "@/lib/rbac/permissions";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Lead } from "@/lib/schema/lead.schema";

const STATUS_VARIANT: Record<Lead["status"], "outline" | "secondary" | "success" | "destructive"> = {
  new: "outline",
  contacted: "secondary",
  converted: "success",
  rejected: "destructive",
};

export default function LeadDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const { data, isLoading } = useGetLead(leadId);
  const updateLead = useUpdateLead();
  const { hasPermission } = usePermissions();
  // Mirrors the backend: PATCH /leads/<id> is admin/supervisor only, so
  // customer_service gets a read-only view instead of controls that 403.
  const canEditLead = hasPermission(Permission.EDIT_LEADS);

  const lead = data?.lead;

  if (isLoading || !lead) {
    return (
      <PageContainer size="md" className="px-6 py-10">
        <p className="text-muted-foreground">{t("common.loading", { defaultValue: "Loading..." })}</p>
      </PageContainer>
    );
  }

  const handleStatusChange = (status: string) => {
    updateLead.mutate({ id: leadId, data: { status: status as Lead["status"] } });
  };

  const convertHref =
    lead.source_tab === "store"
      ? `/partners/create?leadId=${lead.id}&name=${encodeURIComponent(
          lead.store_name || lead.name
        )}`
      : `/clients/create?leadId=${lead.id}&name=${encodeURIComponent(
          lead.company || lead.name
        )}&contact_person=${encodeURIComponent(lead.name)}&email=${encodeURIComponent(
          lead.email || ""
        )}&phone_number=${encodeURIComponent(lead.phone_number)}`;

  return (
    <PageContainer size="md" className="px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{lead.name}</h1>
          <p className="text-muted-foreground text-sm">
            {t(`leads.tabs.${lead.source_tab}`, { defaultValue: lead.source_tab })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[lead.status]}>
          {t(`leads.statuses.${lead.status}`, { defaultValue: lead.status })}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("leads.details", { defaultValue: "Lead details" })}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DataItem label={t("table.name")} value={lead.name} />
          <DataItem label={t("leads.phone")} value={lead.phone_number} />
          <DataItem label={t("table.email", { defaultValue: "Email" })} value={lead.email || "-"} />
          <DataItem label={t("table.city")} value={lead.city || "-"} />
          <DataItem
            label={t("leads.storeName", { defaultValue: "Store" })}
            value={lead.store_name || "-"}
          />
          <DataItem
            label={t("leads.company", { defaultValue: "Company" })}
            value={lead.company || "-"}
          />
          <DataItem
            label={t("leads.parcelsVolume", { defaultValue: "Monthly parcels" })}
            value={lead.parcels_volume || "-"}
          />
          <DataItem
            label={t("leads.submittedAt")}
            value={new Date(lead.created_at).toLocaleString()}
          />
          <div className="sm:col-span-2">
            <DataItem
              label={t("leads.message", { defaultValue: "Message" })}
              value={lead.message || "-"}
            />
          </div>
        </CardContent>
      </Card>

      {(canEditLead || lead.status === "converted") && (
        <Card>
          <CardHeader>
            <CardTitle>{t("leads.actions", { defaultValue: "Actions" })}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {canEditLead && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("table.status")}</span>
                <Select value={lead.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t("leads.statuses.new", { defaultValue: "New" })}</SelectItem>
                    <SelectItem value="contacted">
                      {t("leads.statuses.contacted", { defaultValue: "Contacted" })}
                    </SelectItem>
                    <SelectItem value="converted">
                      {t("leads.statuses.converted", { defaultValue: "Converted" })}
                    </SelectItem>
                    <SelectItem value="rejected">
                      {t("leads.statuses.rejected", { defaultValue: "Rejected" })}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex-1" />

            {lead.status === "converted" ? (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    lead.converted_partner_id
                      ? `/partners/${lead.converted_partner_id}`
                      : `/clients/${lead.converted_client_id}`
                  )
                }
              >
                {t("leads.viewConverted", {
                  defaultValue:
                    lead.source_tab === "store" ? "View Partner" : "View Client",
                })}
              </Button>
            ) : (
              canEditLead && (
                <Button onClick={() => router.push(convertHref)}>
                  {lead.source_tab === "store"
                    ? t("leads.convertToPartner", { defaultValue: "Convert to Partner" })
                    : t("leads.convertToClient", { defaultValue: "Convert to Client" })}
                </Button>
              )
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
