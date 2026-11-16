import { ParcelFeedRow, ParcelStatus } from "@/lib/schema/parcel.schema";
import { canEmit, WHParcelStatus } from "@/lib/schema/warehouse.schema";

/**
 * When a parcel can be given a courier, and why not when it can't — one rule
 * shared by the Parcels feed and the parcel detail screen, so the button
 * means the same thing in both places.
 *
 * The two flows assign differently:
 * - Warehouse: the E03 event, legal from the statuses the warehouse
 *   transition table allows (ready_for_delivery/assigned + RTO equivalents).
 * - PUDO: PATCH courier_id, for a `pending` or `expired` parcel. Couriers
 *   normally claim a `pending` parcel themselves (their scope shows it only
 *   while courier_id is empty), so assigning one overrides that claim — the
 *   named courier gets it and others stop seeing it. That override is
 *   admin-only (supervisors hold ASSIGN_PARCELS too, so the permission alone
 *   is too broad). Everyone else sees the button disabled with the reason.
 *
 * The server still enforces all of this; these only drive the UI.
 */
export type AssignUnavailableReason =
  | "notReadyYet"
  | "pudoClaimsPending"
  | "notAtThisStage";

export type AssignAvailability =
  | { kind: "assign" | "reassign" }
  | { kind: "unavailable"; reason: AssignUnavailableReason };

/** i18n key for each reason, shown as the disabled button's tooltip. */
// `as const` keeps each value a literal, which the typed t() requires.
export const ASSIGN_UNAVAILABLE_KEY = {
  notReadyYet: "parcelFeed.actions.unavailable.notReadyYet",
  pudoClaimsPending: "parcelFeed.actions.unavailable.pudoClaimsPending",
  notAtThisStage: "parcelFeed.actions.unavailable.notAtThisStage",
} as const satisfies Record<AssignUnavailableReason, string>;

// Warehouse statuses that come before ready_for_delivery: assignment will
// become possible once the box is binned. Everything else that can't take an
// E03 is past that point (out, delivered, at a shop) or on the 3PL path.
const WH_BEFORE_READY: readonly string[] = [
  "not_received",
  "awaiting_scheduling",
  "scheduled",
  "needs_rebin",
  "retry_scheduled",
  "attempt_failed",
] satisfies readonly WHParcelStatus[];

export function warehouseAssignAvailability(
  status: string | null,
): AssignAvailability {
  if (status && canEmit(status as WHParcelStatus, "E03")) {
    return {
      kind:
        status === "assigned" || status === "rto_assigned"
          ? "reassign"
          : "assign",
    };
  }
  if (status && WH_BEFORE_READY.includes(status)) {
    return { kind: "unavailable", reason: "notReadyYet" };
  }
  return { kind: "unavailable", reason: "notAtThisStage" };
}

/** Who is looking: what decides whether a PUDO parcel's button is live. */
export interface PudoAssignViewer {
  /** Admin role — the only one that may override courier self-claiming. */
  isAdmin: boolean;
  /** ASSIGN_PARCELS — may assign an expired parcel. */
  canAssign: boolean;
}

export function pudoAssignAvailability(
  status: ParcelStatus | string | null,
  courierId: string | null,
  viewer: PudoAssignViewer,
): AssignAvailability {
  const mine = { kind: courierId ? "reassign" : "assign" } as const;
  if (status === "pending") {
    return viewer.isAdmin
      ? mine
      : { kind: "unavailable", reason: "pudoClaimsPending" };
  }
  if (status === "expired" && viewer.canAssign) return mine;
  return { kind: "unavailable", reason: "notAtThisStage" };
}

/**
 * Which flow — and which id — a feed row's assignment goes through. A
 * bridged warehouse row (a shop accepted the box) stays `flow: "warehouse"`
 * but shows the PUDO parcel's live status, so from then on it is assigned as
 * that PUDO parcel.
 */
export type FeedAssignTarget =
  | { flow: "warehouse"; parcelId: string }
  | { flow: "pudo"; parcelId: string };

export function feedRowAssignTarget(row: ParcelFeedRow): FeedAssignTarget {
  if (row.flow === "warehouse" && row.pudo_parcel_id == null) {
    return { flow: "warehouse", parcelId: row.id };
  }
  return {
    flow: "pudo",
    parcelId:
      row.flow === "warehouse" ? String(row.pudo_parcel_id) : row.id,
  };
}

export function feedRowAssignAvailability(
  row: ParcelFeedRow,
  viewer: PudoAssignViewer,
): AssignAvailability {
  return feedRowAssignTarget(row).flow === "warehouse"
    ? warehouseAssignAvailability(row.status)
    : pudoAssignAvailability(row.status, row.courier_id, viewer);
}
