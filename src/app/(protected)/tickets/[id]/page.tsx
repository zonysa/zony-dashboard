"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetTicket } from "@/lib/hooks/useTicket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Clock, User, Package, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/hooks/useTranslation";

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
      case "cancelled":
        return "destructive";
      case "pending":
        return "outline";
      case "in_progress":
        return "default";
      case "escalated":
        return "destructive";
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
            Loading ticket...
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
              Failed to load ticket details
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => router.push("/tickets")}
            >
              Back to Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ticket = data.ticket;
  const rating = parseFloat(ticket.rating);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/tickets")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Ticket #{ticket.id}</h1>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(ticket.created_at)}
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
          <CardTitle>Ticket Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tracking Number */}
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tracking Number
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
                    Parcel ID
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
                  Zone
                </p>
                <p className="text-sm">{ticket.zone_name}</p>
              </div>
            </div>

            {/* PUDO */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  PUDO Point
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
                    Type
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
                  Rating
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
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="text-sm">
                  {ticket.customer_data.first_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone Number
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
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {ticket.description}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Comment */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Comment</h3>
            <p className="text-sm text-muted-foreground">{ticket.comment}</p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-sm">{formatDate(ticket.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-sm">{formatDate(ticket.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket History/Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket History</CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.logs && ticket.logs.length > 0 ? (
            <div className="space-y-4">
              {ticket.logs.map((log, index) => (
                <div
                  key={log.id}
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
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm capitalize">
                          {log.action}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(log.created_at)}
                        </p>
                        {log.created_by && (
                          <p className="text-xs text-muted-foreground">
                            by {log.created_by}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No history logs available for this ticket
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
