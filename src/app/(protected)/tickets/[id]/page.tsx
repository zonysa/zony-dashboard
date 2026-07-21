"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetTicket } from "@/lib/hooks/useTicket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Clock, User, Package, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PageContainer } from "@/components/PageContainer";

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TicketHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const ticketId = params.id as string;

  const { data, isLoading, error } = useGetTicket(ticketId);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "outline";
      case "closed":
        return "secondary";
      case "in_progress":
        return "default";
      case "resolved":
        return "success";
      default:
        return "secondary";
    }
  };

  const getActionVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case "resolved":
        return "success";
      case "escalated":
        return "destructive";
      case "pending":
        return "outline";
      case "investigating":
        return "default";
      case "no_action":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("tickets.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.ticket) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              {t("tickets.loadingError")}
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => router.push("/tickets")}
            >
              {t("tickets.backToTickets")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ticket = data.ticket;
  const rating = parseFloat(ticket.rating);

  return (
    <PageContainer className="px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/tickets")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("tickets.ticketNumber")}{ticket.id}</h1>
            <p className="text-sm text-muted-foreground">
              {t("tickets.created")} {formatDate(ticket.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={getStatusVariant(ticket.status)}>
            {ticket.status}
          </Badge>
          <Badge variant={getActionVariant(ticket.action_taken)}>
            {ticket.action_taken}
          </Badge>
        </div>
      </div>

      {/* Main Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("tickets.sections.details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tracking Number */}
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tickets.labels.trackingNumber")}
                </p>
                <p className="font-mono text-sm">{ticket.tracking_number}</p>
              </div>
            </div>

            {/* Parcel ID */}
            {ticket.parcel_id && (
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("tickets.labels.parcelId")}
                  </p>
                  <p className="font-mono text-sm">{ticket.parcel_id}</p>
                </div>
              </div>
            )}

            {/* Zone */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tickets.labels.zone")}
                </p>
                <p className="text-sm">{ticket.zone_name}</p>
              </div>
            </div>

            {/* PUDO */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tickets.labels.pudoPoint")}
                </p>
                <p className="text-sm">{ticket.pudo_name}</p>
              </div>
            </div>

            {/* Type */}
            {ticket.type && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("tickets.labels.type")}
                  </p>
                  <p className="text-sm capitalize">{ticket.type}</p>
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tickets.labels.rating")}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-sm ml-2">({rating.toFixed(1)})</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("tickets.sections.customerInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tickets.labels.name")}
                </p>
                <p className="text-sm">
                  {ticket.customer_data.first_name || t("tickets.labels.notAvailable")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tickets.labels.phoneNumber")}
                </p>
                <p className="font-mono text-sm">
                  {ticket.customer_data.phone_number}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {ticket.description && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-2">{t("tickets.sections.description")}</h3>
                <p className="text-sm text-muted-foreground">
                  {ticket.description}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Comment */}
          <div>
            <h3 className="text-sm font-semibold mb-2">{t("tickets.sections.comment")}</h3>
            <p className="text-sm text-muted-foreground">{ticket.comment}</p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("tickets.labels.createdAt")}
              </p>
              <p className="text-sm">{formatDate(ticket.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("tickets.labels.lastUpdated")}
              </p>
              <p className="text-sm">{formatDate(ticket.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket History/Logs */}
      <Card>
        <CardHeader>
          <CardTitle>{t("tickets.history.title", { defaultValue: "Ticket History" })}</CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.logs && ticket.logs.length > 0 ? (
            <div className="space-y-4">
              {ticket.logs.map((log, index) => {
                const changes = Object.entries(log.changes).filter(([_, value]) => value);

                return (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      {index < ticket.logs!.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {t(`tickets.roles.${log.performed_by.role}`, {
                                defaultValue: log.performed_by.role
                              })}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {t("tickets.history.madeChanges", { defaultValue: "made changes" })}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {changes.map(([field, change]) => (
                              <div key={field} className="text-sm">
                                <span className="font-medium capitalize">
                                  {t(`tickets.fields.${field}`, {
                                    defaultValue: field.replace(/_/g, ' ')
                                  })}:
                                </span>
                                <div className="ml-4 mt-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {t("tickets.history.from", { defaultValue: "From" })}:
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      {change?.old || t("common.empty", { defaultValue: "Empty" })}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {t("tickets.history.to", { defaultValue: "To" })}:
                                    </span>
                                    <Badge variant="default" className="text-xs">
                                      {change?.new || t("common.empty", { defaultValue: "Empty" })}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:ml-4">
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("tickets.history.noLogs", {
                  defaultValue: "No history logs available for this ticket"
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
