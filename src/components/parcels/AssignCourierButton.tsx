"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  ASSIGN_UNAVAILABLE_KEY,
  AssignAvailability,
} from "@/lib/parcels/courierAssignment";

/**
 * Assign / Reassign courier, or the same button disabled with the reason as
 * a tooltip — so the action is discoverable even before it's possible.
 *
 * Clicks never propagate: in the Parcels feed the row itself navigates.
 */
export function AssignCourierButton({
  availability,
  onClick,
}: {
  availability: AssignAvailability;
  onClick: () => void;
}) {
  const { t } = useTranslation();

  if (availability.kind === "unavailable") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* A disabled button fires no pointer events, so the tooltip hangs
              off a focusable wrapper instead. */}
          <span
            tabIndex={0}
            className="inline-flex cursor-not-allowed"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled
              className="pointer-events-none"
            >
              {t("parcelFeed.actions.assignCourier")}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{t(ASSIGN_UNAVAILABLE_KEY[availability.reason])}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {availability.kind === "reassign"
        ? t("parcelFeed.actions.reassignCourier")
        : t("parcelFeed.actions.assignCourier")}
    </Button>
  );
}
