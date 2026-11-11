"use client";

import { Clock, Lock, MessageSquare, Reply } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { CustomerMessage } from "@/lib/schema/parcel.schema";

// Both flows' status vocabularies. Unknown values fall back to "secondary".
const STATUS_VARIANT: Record<
  string,
  "success" | "outline" | "secondary" | "destructive"
> = {
  delivered: "success",
  sent: "outline",
  queued: "secondary",
  undelivered: "destructive",
  rejected: "destructive",
  failed: "destructive",
};

interface CustomerMessagesProps {
  messages: CustomerMessage[];
  isLoading?: boolean;
  isError?: boolean;
}

/**
 * The texts a parcel's customer was sent, oldest first, as the customer read
 * them — except that delivery/receiving codes arrive from the backend already
 * replaced by "••••". Shared by the PUDO and warehouse parcel pages.
 */
export function CustomerMessages({
  messages,
  isLoading,
  isError,
}: CustomerMessagesProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {t("customerMessages.loadError")}
      </p>
    );
  }

  if (messages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("customerMessages.empty")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-4">
        {messages.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}
      </ol>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        {t("customerMessages.maskedNote")}
      </p>
    </div>
  );
}

function MessageRow({ message }: { message: CustomerMessage }) {
  const { t } = useTranslation();
  const humanize = (value: string) => value.replace(/_/g, " ");

  return (
    <li className="space-y-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">
          {t(`customerMessages.purposes.${message.purpose}`, {
            defaultValue: humanize(message.purpose),
          })}
        </span>
        <Badge variant="secondary" className="uppercase">
          {t(`customerMessages.channels.${message.channel}`, {
            defaultValue: message.channel,
          })}
        </Badge>
        <Badge variant={STATUS_VARIANT[message.status] ?? "secondary"}>
          {t(`customerMessages.statuses.${message.status}`, {
            defaultValue: humanize(message.status),
          })}
        </Badge>
        {message.attempt_no !== undefined && message.attempt_no > 1 && (
          <span className="text-xs text-muted-foreground">
            {t("customerMessages.attempt", { n: message.attempt_no })}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {message.sent_at && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {message.sent_at}
          </span>
        )}
        {message.responded_at && (
          <span className="flex items-center gap-1">
            <Reply className="h-3 w-3" />
            {t("customerMessages.respondedAt", { time: message.responded_at })}
          </span>
        )}
      </div>

      {message.body ? (
        // dir="auto": warehouse templates are Arabic, PUDO texts English,
        // whatever the dashboard's own language is.
        <p
          dir="auto"
          className="whitespace-pre-wrap break-words rounded-md bg-muted px-3 py-2 text-sm"
        >
          {message.body}
        </p>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          {t("customerMessages.noCopy")}
        </p>
      )}

      {message.error && (
        <p className="text-xs text-destructive">
          {t("customerMessages.error", { error: message.error })}
        </p>
      )}
    </li>
  );
}
