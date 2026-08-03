# Warehouse pilot — implementation summary & API contract

Everything built for the warehouse dashboard + courier interface MVP, in one place. This is the
document a frontend engineer (or a Claude Code session in `zony-dashboard`) should read before
wiring any screen.

- **This file** → what exists, and the exact HTTP contract. Authoritative for work in this repo.
- **Design rationale** → backend repo, `CLAUDE.md`, section "The warehouse pilot module"
- **Deploy / verify / tune** → backend repo, `docs/warehouse-pilot-runbook.md`

> Snapshot copied from `zony-backend/docs/warehouse-pilot-implementation.md`. If the backend
> contract changes, re-copy it — don't edit this file, or the two will silently diverge.

---

## 1. What this module is

A 4–6 week field pilot at a **single local transit warehouse**, measuring two things:

1. how customers respond to a proposed delivery time slot, and
2. the first-attempt delivery success rate.

It is a **parallel module**. It shares no tables with the PUDO/points flow, holds no FK into
`parcels`, and writes to nothing that already existed. The existing admin dashboard, PUDO points
dashboard, points app, and PUDO flow are untouched — the pilot can be dropped or graduated cleanly
when it ends.

### The one constraint that drives the whole design

**Parcel status is derived, never stored.** There is no `status` column on `wh_parcels`. Status is
computed by folding the append-only `wh_events` log.

This matters to the frontend in one concrete way: **never cache a status and never compute one
client-side.** Every parcel-bearing response carries a server-derived `status`, and every scan
endpoint returns the recomputed `parcel_status` in its response — use that, don't re-derive.

---

## 2. Event codes

| code | meaning | who raises it | custody-bearing |
|---|---|---|---|
| `E01` | received at warehouse | staff (receiving scan) | ✅ resets epoch |
| `T01` | customer confirms/modifies slot | customer (public link) | ❌ |
| `E02` | placed into the slot's bin | staff | ✅ |
| `E04` | checked out with courier | staff or courier | ✅ |
| `E05` | delivered | courier (or staff at counter) | ✅ terminal |
| `E06` | failed attempt | courier | ✅ |
| `E07` | returned to warehouse | courier or staff | ✅ resets epoch |
| `X01` | void a prior event | admin/supervisor only | meta |

`E01` and `E07` reset the epoch, clearing `confirmed_slot_id`, `binned_slot_id`, `bin_code` and
`courier_id`. That is what makes re-delivery work with no sequence arithmetic anywhere: a `T01`
from attempt 1 cannot authorise an `E04` in attempt 2.

`T01` is *not* custody-bearing — a customer who moves their slot after the box is binned produces
status `needs_rebin`, which the Wall must surface as its own bucket.

### The eight derived statuses

`not_received` · `awaiting_scheduling` · `scheduled` · `needs_rebin` · `ready_for_dispatch` ·
`out_for_delivery` · `attempt_failed` · `delivered`

`delivered` is absorbing — correctable only by an `X01` void.

### Legal transitions (the server returns 409 on anything else)

| current status | E01 | T01 | E02 | E04 | E05 | E06 | E07 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| not_received | ✓ | | | | | | |
| awaiting_scheduling | | ✓ | | | | | |
| scheduled | | ✓ | ✓ | | | | |
| needs_rebin | | ✓ | ✓ | | | | |
| ready_for_dispatch | | ✓ | | ✓ | | | |
| out_for_delivery | | | | | ✓ | ✓ | |
| attempt_failed | | | | | | | ✓ |
| delivered | | | | | | | |

**Frontend consequence:** disable an action button rather than letting it 409. The transition table
above is the authority for what to enable; it is stable and safe to hardcode as a client-side
`ALLOWED_ACTIONS[status]` map, as long as the server remains the enforcer.

### The three non-negotiable server rules

Enforced in `WarehouseEventService.append_event()`, never in a schema or a route:

1. **No `E04` without a confirmed slot** — and `binned_slot_id` must equal `confirmed_slot_id`.
2. **No `E05` without a delivery-code match** — bcrypt-checked, throttled at 5 attempts / 15 min.
3. **No `E06` without an active reason code** — from the seeded `wh_failure_reasons` list.

---

## 3. What was built

### Models (10 new `wh_*` tables)

`wh_parcels` · `wh_events` · `wh_parcel_state` · `wh_slots` · `wh_zones` · `wh_bins` ·
`wh_failure_reasons` · `wh_messages` · `wh_settings` · `wh_code_attempts`

`wh_events` deliberately does **not** inherit `BaseModel`: `BaseModel` carries an `updated_at` with
`onupdate=`, a column whose entire purpose is recording mutations, and its UUID string `id` is
unordered while the fold requires a monotonic integer.

**Append-only in four layers:** no `updated_at` column · SQLAlchemy mapper listeners · a
session-level `do_orm_execute` guard (mapper listeners do *not* catch bulk DML) · MySQL
`BEFORE UPDATE` / `BEFORE DELETE` triggers installed by the migration. Corrections are made by
appending `X01`, never by mutating. Deleting a `wh_parcel` is impossible by design — soft-archive
via `archived_at`.

A MySQL generated column `delivered_key = CASE WHEN code='E05' THEN parcel_id END` with a unique
index gives a hard database guarantee of at most one `E05` per parcel.

### Services (`app/core/services/warehouse/`, a package)

| file | responsibility |
|---|---|
| `status.py` | **The fold.** Pure module — no `db`, no `flask`. The single most important file. |
| `transitions.py` | `LEGAL_PREDECESSORS` guard table. Pure. |
| `status_repo.py` | `derive_one()` / `derive_many()` — batched, avoids the N+1 on the Wall |
| `events.py` | `append_event()` — the single write choke point for every state change |
| `parcels.py` | intake, barcode resolution, Wall, manifest, return reconciliation |
| `slots.py` | slot catalog, advisory capacity, signed token mint/verify, confirm → T01 |
| `messaging.py` | provider selection + `wh_messages` persistence |
| `providers/` | `MessageProvider` ABC, WhatsApp stub, Taqnyat SMS adapter |
| `reminders.py` | cron body: advisory lock, find due, dispatch |
| `reports.py` | the five queries + streaming CSV row iterators |
| `projector.py` | `refresh()` / `rebuild_all()` / `diff_all()` |
| `settings.py` | DB-backed runtime config with defaults |
| `clock.py` | `now_local()` — naive UTC+3, the module's only time source |

**Four gates run in fixed order on every append:** role (`@role_required`, 403) → policy
(403) → transition guard (409) → precondition (400/403/409).

### Routes

Three blueprints split by auth posture:

- `app/api/v1/warehouse/routes.py` — `/warehouse`, staff JWT (`admin`, `supervisor`, `responsible`)
- `app/api/v1/warehouse/courier_routes.py` — `/courier`, JWT `courier`
- `app/api/v1/warehouse/public_routes.py` — `/slots`, **no JWT**, signed token, rate-limited

### Tests

`tests/test_warehouse_status.py` (41 tests, the pure fold) and `tests/test_warehouse_flow.py`
(34 tests, full lifecycle on SQLite). **75 passing.**

```bash
.venv/bin/python -m pytest tests/ -q
```

### CLI

```bash
flask seed-warehouse-lookups              # zones, 6 slots, 10 reason codes, default settings
flask warehouse-run-reminders             # cron, once a minute
flask warehouse-rebuild-state [--check]   # re-fold from the log; --check reports drift
```

---

## 4. API contract

All responses follow the repo envelope: `{"status": "success", "message": ..., <data>}` on success,
`{"status": "error: ...", "message": ...}` on failure.

### Auth

`@jwt_required()` with the `role` claim, exactly as the rest of the API. `/slots/*` is the only
unauthenticated path.

### `client_event_id` is REQUIRED on every write

Every scan/write endpoint requires a `client_event_id` (8–64 chars, unique-indexed server-side).

> **Mint it once per _user action_, not per HTTP attempt.** Generate a UUID when the user taps the
> button and reuse it across retries. This is the only mechanism that survives a network timeout
> followed by a user-initiated retry — by far the most common real cause of a duplicate scan.

A repeat with the same `client_event_id` returns **200** with the original event and
`"created": false`, not a 409. Treat 200-with-`created:false` as success, not as an error.

---

### 4.1 Staff — `/warehouse` (roles: admin, supervisor, responsible)

| method | path | purpose |
|---|---|---|
| POST | `/warehouse/receiving/scan` | **E01** — create parcel, message customer |
| GET | `/warehouse/scan/<barcode>` | resolve a barcode → parcel (409 if ambiguous) |
| GET | `/warehouse/wall?date=YYYY-MM-DD` | zone × slot grid + awaiting bucket |
| GET | `/warehouse/loading/<slot_id>?date=` | staged manifest for one slot |
| POST | `/warehouse/parcels/<id>/bin` | **E02** |
| POST | `/warehouse/parcels/<id>/checkout` | **E04** |
| GET | `/warehouse/return/<slot_id>?date=` | count-out vs count-back |
| POST | `/warehouse/parcels/<id>/fail` | **E06** |
| POST | `/warehouse/parcels/<id>/return` | **E07** |
| POST | `/warehouse/parcels/<id>/deliver` | **E05** (counter hand-off) |
| GET | `/warehouse/parcels/<id>` | one parcel + derived status |
| GET | `/warehouse/parcels/<id>/events` | full audit log + derived status |
| POST | `/warehouse/parcels/<id>/void` | **X01** — admin/supervisor only |
| POST | `/warehouse/parcels/<id>/resend-code` | rotate + re-send the delivery code |
| GET | `/warehouse/slots?include_inactive=` | slot catalog |
| GET | `/warehouse/zones` | zone list |
| GET | `/warehouse/failure-reasons` | approved reason list (staff + courier) |
| GET | `/warehouse/settings` | runtime config — admin/supervisor |
| PUT | `/warehouse/settings/<key>` | edit one setting — admin/supervisor |
| GET | `/warehouse/report?start=&end=` | the whole reporting screen, one call |
| GET | `/warehouse/report/export/events.csv?start=&end=` | streaming CSV |
| GET | `/warehouse/report/export/parcels.csv?start=&end=` | streaming CSV |
| GET | `/warehouse/state/diff` | projector integrity alarm |

#### `POST /warehouse/receiving/scan`

```jsonc
// request
{
  "barcode": "SP123456789",
  "tracking_ref": "optional",
  "recipient_name": "محمد العتيبي",
  "recipient_phone": "0512345678",       // SaudiPhoneField, same as the rest of the API
  "address": { "line1": "…", "district": "…", "city": "…", "notes": "…" },
  "zone_id": 1,                           // optional; assignment is manual by design
  "experiment_arm": "treatment",          // or "control" — default "treatment"
  "client_event_id": "uuid-v4"            // REQUIRED
}
```

```jsonc
// 201 (or 200 when created:false)
{
  "status": "success",
  "message": "Parcel received",
  "created": true,
  "parcel": { /* see WHParcel shape below */ },
  "delivery_code": "4821",        // ⚠️ ONLY readable moment — stored as bcrypt hash
  "message_sent": true,
  "message_channel": "sms",
  "message_status": "sent"
}
```

> **`delivery_code` is returned exactly once, here.** It cannot be read back. If it is lost, the
> only recovery is `POST /warehouse/parcels/<id>/resend-code`, which *rotates* it. Show it clearly
> on the receiving screen; consider a print/label action.

#### WHParcel shape (returned by every parcel-bearing endpoint)

```jsonc
{
  "id": "uuid", "barcode": "…", "tracking_ref": null,
  "recipient_name": "…", "recipient_phone": "…",
  "address": { … }, "zone_id": 1, "experiment_arm": "treatment",
  "created_at": "2026-08-03 10:14:22 AM",

  // derived — computed from the log, never stored
  "status": "awaiting_scheduling",
  "epoch": 1,
  "attempt_number": 0,
  "confirmed_slot_id": null,
  "binned_slot_id": null,
  "bin_code": null,
  "customer_interacted": false
}
```

#### `GET /warehouse/wall`

```jsonc
{
  "date": "2026-08-03",
  "slots": [
    { "slot_id": 1, "code": "S1", "label_ar": "…", "label_en": "10:00 – 12:00",
      "starts_at": "10:00", "ends_at": "12:00", "capacity": 20 }
  ],
  "cells": [
    { "zone_id": 1, "slot_id": 3, "count": 7, "parcels": [ /* entries */ ] }
  ],
  "awaiting_scheduling": [ /* entries, each with "stale_slot": bool */ ],
  "awaiting_count": 12
}
```

Each entry: `parcel_id`, `barcode`, `recipient_name`, `zone_id`, `status`, `attempt_number`,
`customer_interacted`, `bin_code`.

> `stale_slot: true` means a confirmed slot whose window closed with no checkout. Those parcels sit
> in the awaiting bucket and want visual distinction — they are the operator's daily cleanup list.

#### Scan endpoint bodies

```jsonc
// E02 bin
{ "client_event_id": "uuid", "slot_id": 3, "bin_code": "A-12", "notes": "" }
// E04 checkout
{ "client_event_id": "uuid", "courier_id": "user-uuid" }
// E05 deliver
{ "client_event_id": "uuid", "delivery_code": "4821" }
// E06 fail
{ "client_event_id": "uuid", "reason_code": "R03" }
// E07 return
{ "client_event_id": "uuid" }
// X01 void  (admin/supervisor)
{ "client_event_id": "uuid", "voids_event_id": 4412, "void_reason": "mis-scan at receiving" }
```

All five return the same envelope:

```jsonc
{
  "status": "success", "message": "…",
  "created": true,
  "event": { "id": 4413, "code": "E02", "occurred_at": "…", "slot_id": 3, … },
  "parcel_status": "ready_for_dispatch"   // ← the newly derived status; use this
}
```

Optional on every write: `occurred_at` (device-claimed, ISO 8601) and `notes` (≤500 chars).

#### `GET /warehouse/report?start=&end=`

`start` and `end` are **mandatory** and the span is capped at **92 days** — an unbounded query
full-scans `wh_events`. A missing or over-long range returns 400.

```jsonc
{
  "range": { "start": "…", "end": "…" },
  "volume_and_success": {
    "parcels_received": 812,
    "parcels_attempted": 640,           // ← the denominator; note it is ATTEMPTED, not received
    "first_attempt_success": 486,
    "first_attempt_success_rate": 75.94
  },
  "by_customer_interaction": [
    { "customer_interacted": 1, "parcels_attempted": 402, "first_attempt_success_rate": 84.1 },
    { "customer_interacted": 0, "parcels_attempted": 238, "first_attempt_success_rate": 62.2 }
  ],
  "failure_reasons": [ { "reason_code": "R03", "name_ar": "…", "name_en": "…", "count": 41 } ],
  "dwell_time": {
    "parcels": 486, "avg_minutes": 1840.2,
    "median_minutes": 1210, "p90_minutes": 4102,
    "histogram": { "0-6h": 12, "6-24h": 190, "1-2d": 201, "2-7d": 74, "7d+": 9 }
  },
  "messages": {
    "by_channel": [ { "channel": "sms", "total": 900, "failed": 12, "fallbacks": 812, "responded": 402 } ],
    "overall": { … }
  },
  "caveat": "The interacted/not-interacted split is correlation, not causation…"
}
```

> **Render `caveat` in the UI, next to the split.** Customers who click a link are systematically
> more reachable. The `experiment_arm` control group is what gives a causal read; the split alone
> does not. Also: report `median_minutes` and `p90_minutes`, not just the mean — dwell is heavily
> right-skewed and the mean describes no actual parcel.
>
> And expect the message failure rate to look alarming. The WhatsApp provider is a **stub that
> always reports undelivered**, so the `fallbacks` figure will be near 100%. Show `fallbacks`
> beside `failed` or the metric reads as total failure and people stop looking at it.

---

### 4.2 Courier — `/courier` (role: courier)

Deliberately three actions. A courier sees only parcels in their own van (enforced in the policy).

| method | path | purpose |
|---|---|---|
| GET | `/courier/manifest/<slot_id>?date=YYYY-MM-DD` | **Action 1** — load manifest |
| POST | `/courier/parcels/<id>/checkout` | E04 — take custody |
| POST | `/courier/parcels/<id>/deliver` | **Action 2** — E05, requires the code |
| POST | `/courier/parcels/<id>/fail` | **Action 3** — E06, requires a reason |
| POST | `/courier/parcels/<id>/return` | E07 |
| GET | `/courier/failure-reasons` | the approved list — never free-text |

Manifest response:

```jsonc
{
  "slot_id": 3, "date": "2026-08-03", "count": 14,
  "parcels": [
    { "parcel_id": "…", "barcode": "…", "recipient_name": "…", "recipient_phone": "…",
      "address": { … }, "zone_id": 1, "status": "ready_for_dispatch",
      "bin_code": "A-12", "attempt_number": 0 }
  ]
}
```

> The courier interface is **responsive web, not a native app**, and there is **no offline mode** —
> both explicitly out of scope. Design for one-handed use on a phone in sunlight: large tap targets,
> a numeric keypad for the delivery code, reason codes as a single tap from a list.

---

### 4.3 Public customer link — `/slots` (no JWT)

| method | path | purpose |
|---|---|---|
| GET | `/slots/?token=…` | read-only view of the parcel + selectable slots |
| POST | `/slots/confirm?token=…` | confirm or modify → **T01** |

Two properties of this endpoint are load-bearing:

> **GET is strictly read-only.** WhatsApp, iMessage and corporate mail scanners fetch every URL in a
> message within seconds. If GET had side effects, a link preview would confirm the customer's slot
> for them. Confirm must always be a POST — do not "helpfully" confirm on page load.

> **The token is bound to `(parcel_id, epoch)`.** A link from attempt 1 stops verifying the moment
> an `E07` bumps the epoch, so an old message can never reschedule a new attempt. Default lifetime
> 48h (`slot_token_max_age_hours`).

```jsonc
// GET /slots/?token=…
{
  "parcel": { "recipient_name": "…", "barcode": "…", "status": "awaiting_scheduling",
              "confirmed_slot_id": null, "attempt_number": 0 },
  "can_modify": true,
  "available_slots": [ /* today + next two days, per scheduling_horizon_days */ ]
}
```

```jsonc
// POST /slots/confirm?token=…
{ "slot_id": 3, "date": "2026-08-04", "client_event_id": "uuid" }
// slot_id: null is meaningful — it CLEARS the choice
```

`can_modify: false` means the box is already on a van. Render the explanation, not a form that
would 409 on submit. The 409 message is customer-facing and already worded for that case.

Only the fields above are returned — an unauthenticated endpoint keyed by a forwardable link must
not become an information leak.

---

## 5. Runtime settings (no redeploy)

`GET /warehouse/settings` · `PUT /warehouse/settings/<key>` with `{"value": …}`

| key | default | notes |
|---|---|---|
| `slot_capacity` | 20 | **advisory** — reported, never blocks a customer |
| `prebooking_ratio` | 0.7 | |
| `zone_count` | 4 | actual zones are rows in `wh_zones` |
| `reminder_timeout_minutes` | 10 | silence before a non-responder is chased |
| `fallback_grace_minutes` | 30 | hard floor before *any* fallback fires |
| `max_reminders` | 1 | per parcel per delivery attempt |
| `daily_message_cap` | 3 | hard stop per parcel per day |
| `slot_token_max_age_hours` | 48 | customer link lifetime |
| `scheduling_horizon_days` | 3 | today + next two days |
| `message_templates` | — | nested per channel and purpose |

The six slot windows are rows in `wh_slots`; zones are rows in `wh_zones`. Add or deactivate rows
rather than editing code.

> `fallback_grace_minutes` and `daily_message_cap` are **safety rails, not preferences**. A settings
> UI should mark them as such. Lowering them toward zero while WhatsApp is stubbed is what would
> produce a message loop against a customer's phone — a regulatory problem in KSA, not just a cost
> one.
>
> `message_templates` is free-form JSON accepting `{name} {slot} {date} {code} {link}`. Unknown
> placeholders render empty rather than raising. `{code}` is available **only** in a slot proposal —
> the delivery code is a bcrypt hash and physically cannot be repeated in a reminder.

---

## 6. Error handling

Standard envelope throughout. What each status means here:

| code | meaning in this module |
|---|---|
| 400 | schema validation, unknown reason code, bad/expired token |
| 403 | role or policy denial; **wrong delivery code** (also writes a `wh_code_attempts` row) |
| 404 | parcel or token target not found |
| 409 | **illegal transition** (guard table), ambiguous barcode, lock wait timeout |
| 429 | rate limit on the public link; code-attempt throttle (5 / 15 min) |
| 500 | database error |

**409 is the interesting one.** It almost always means the UI offered an action the current status
does not permit — surface the server message, and fix the enabling logic rather than retrying.

---

## 7. Known limitations (agreed for the pilot)

- **WhatsApp is a stub.** It reports undelivered for every message, so Taqnyat SMS is what actually
  sends. Setting `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_ACCESS_TOKEN` promotes it with no code
  change.
- **"Delivered" means the provider accepted it**, not that the handset received it. True delivery
  confirmation needs a Taqnyat DLR webhook — a later additive change.
- **Slot capacity is advisory.** Over-subscription is recorded and reported, never rejected. The
  pilot's job is to discover what the number should be. A capacity bar should read as information,
  not as a blocker.
- **Barcodes are not unique.** Intake resolves to the most recent non-terminal parcel; the scan
  endpoint returns a disambiguation list rather than guessing between two live parcels — the UI
  needs a picker for the 409 case.
- **Zone assignment is manual.**
- Out of scope: shipping-company API integration, paid slot extension, masked/proxy phone numbers,
  any ML or prediction, geo-coordinate zone assignment, offline mode, a native courier app,
  automated exception logging.

## 8. Verification status

Application logic: **75 tests passing** on SQLite.

Five MySQL-specific checks are documented in `docs/warehouse-pilot-runbook.md` and remain
**unexecuted** — no local MySQL was available and production must not be migrated without explicit
authorisation: migration round-trip · trigger rejection · `FOR UPDATE` concurrency under
`processes = 4` · `GET_LOCK` mutual exclusion · report SQL and both CSV exports.

Environment facts verified against the pilot server on 2026-08-02: MySQL **8.0.46** (CTEs and
`ROW_NUMBER()` available), DB user holds `TRIGGER`, and the server timezone is **EEST** — a
DST-shifting zone against the app's fixed UTC+3, which is why every `wh_*` datetime uses a
Python-side default and why `server_default=func.now()` must never appear on a `wh_*` column.
