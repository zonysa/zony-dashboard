import {
  AssignWarehouseStaffRes,
  BinParcelData,
  CheckoutParcelData,
  CourierCheckoutData,
  CourierDeliverData,
  CourierFailData,
  CourierReturnData,
  DeliverParcelData,
  FailParcelData,
  GetCourierManifestRes,
  GetFailureReasonsRes,
  GetLoadingManifestRes,
  GetParcelEventsRes,
  GetParcelRes,
  GetReportRes,
  GetReturnReconciliationRes,
  GetSettingsRes,
  GetSlotsRes,
  GetStateDiffRes,
  GetWallRes,
  GetWarehouseRes,
  GetWarehousesRes,
  GetWarehouseStaffRes,
  GetZonesRes,
  ReceivingScanData,
  ReturnParcelData,
  UpdateSettingRes,
  VoidEventData,
  WarehouseCreateData,
  WarehouseReportRange,
  WarehouseUpdateData,
  WHReceivingScanRes,
  WHResendCodeRes,
  WHScanEventRes,
} from "../schema/warehouse.schema";
import { apiCall } from "./apiClient";

// ---- Staff: /warehouse ----

export const receivingScan = async (
  data: ReceivingScanData,
): Promise<WHReceivingScanRes> => {
  return apiCall({ method: "POST", url: "/warehouse/receiving/scan", data });
};

// Every read below is scoped to one building. The server requires it for
// admin/supervisor (who run every site and must say which one) and derives it
// for a pinned `responsible` clerk — but sending it is always correct, and
// omitting it is a 400 for the roles that operate the dashboard's screens.
export const scanBarcode = async (
  barcode: string,
  warehouseId: number,
): Promise<GetParcelRes> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/scan/${barcode}?warehouse_id=${warehouseId}`,
  });
};

export const getWall = async (
  date: string,
  warehouseId: number,
): Promise<GetWallRes> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/wall?date=${date}&warehouse_id=${warehouseId}`,
  });
};

export const getLoadingManifest = async (
  slotId: string,
  date: string,
  warehouseId: number,
): Promise<GetLoadingManifestRes> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/loading/${slotId}?date=${date}&warehouse_id=${warehouseId}`,
  });
};

export const binParcel = async (
  id: string,
  data: BinParcelData,
): Promise<WHScanEventRes> => {
  return apiCall({ method: "POST", url: `/warehouse/parcels/${id}/bin`, data });
};

export const checkoutParcel = async (
  id: string,
  data: CheckoutParcelData,
): Promise<WHScanEventRes> => {
  return apiCall({
    method: "POST",
    url: `/warehouse/parcels/${id}/checkout`,
    data,
  });
};

export const getReturnReconciliation = async (
  slotId: string,
  date: string,
  warehouseId: number,
): Promise<GetReturnReconciliationRes> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/return/${slotId}?date=${date}&warehouse_id=${warehouseId}`,
  });
};

export const failParcel = async (
  id: string,
  data: FailParcelData,
): Promise<WHScanEventRes> => {
  return apiCall({
    method: "POST",
    url: `/warehouse/parcels/${id}/fail`,
    data,
  });
};

export const returnParcel = async (
  id: string,
  data: ReturnParcelData,
): Promise<WHScanEventRes> => {
  return apiCall({
    method: "POST",
    url: `/warehouse/parcels/${id}/return`,
    data,
  });
};

export const deliverParcel = async (
  id: string,
  data: DeliverParcelData,
): Promise<WHScanEventRes> => {
  return apiCall({
    method: "POST",
    url: `/warehouse/parcels/${id}/deliver`,
    data,
  });
};

export const getParcel = async (id: string): Promise<GetParcelRes> => {
  return apiCall({ method: "GET", url: `/warehouse/parcels/${id}` });
};

export const getParcelEvents = async (
  id: string,
): Promise<GetParcelEventsRes> => {
  return apiCall({ method: "GET", url: `/warehouse/parcels/${id}/events` });
};

export const voidEvent = async (
  id: string,
  data: VoidEventData,
): Promise<WHScanEventRes> => {
  return apiCall({
    method: "POST",
    url: `/warehouse/parcels/${id}/void`,
    data,
  });
};

export const resendCode = async (
  id: string,
  clientEventId: string,
): Promise<WHResendCodeRes> => {
  return apiCall({
    method: "POST",
    url: `/warehouse/parcels/${id}/resend-code`,
    data: { client_event_id: clientEventId },
  });
};

export const getSlots = async (
  includeInactive?: boolean,
): Promise<GetSlotsRes> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/slots${includeInactive ? "?include_inactive=true" : ""}`,
  });
};

// wh_zones are per-building — the same code may exist at two warehouses, so
// this list is meaningless without one.
export const getZones = async (
  warehouseId: number,
): Promise<GetZonesRes> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/zones?warehouse_id=${warehouseId}`,
  });
};

export const getFailureReasons = async (): Promise<GetFailureReasonsRes> => {
  return apiCall({ method: "GET", url: "/warehouse/failure-reasons" });
};

export const getSettings = async (): Promise<GetSettingsRes> => {
  return apiCall({ method: "GET", url: "/warehouse/settings" });
};

export const updateSetting = async (
  key: string,
  value: unknown,
): Promise<UpdateSettingRes> => {
  return apiCall({
    method: "PUT",
    url: `/warehouse/settings/${key}`,
    data: { value },
  });
};

export const getReport = async (
  range: WarehouseReportRange,
): Promise<GetReportRes> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/report?start=${range.start}&end=${range.end}`,
  });
};

// Streaming CSV — returned as a Blob rather than parsed JSON.
export const exportEventsCsv = async (
  range: WarehouseReportRange,
): Promise<Blob> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/report/export/events.csv?start=${range.start}&end=${range.end}`,
    responseType: "blob",
  });
};

export const exportParcelsCsv = async (
  range: WarehouseReportRange,
): Promise<Blob> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/report/export/parcels.csv?start=${range.start}&end=${range.end}`,
    responseType: "blob",
  });
};

export const getStateDiff = async (): Promise<GetStateDiffRes> => {
  return apiCall({ method: "GET", url: "/warehouse/state/diff" });
};

// ---- Warehouses (admin) ----
// Reads are open to any warehouse role including couriers, who need the list
// to pick a building to load from. Writes are admin/supervisor only, as is
// the whole roster surface — an assignment is what grants a clerk access to a
// building's floor, so a clerk editing it could grant themselves another site.

export const listWarehouses = async (filters?: {
  city_id?: number;
  zone_id?: number;
  status?: string;
}): Promise<GetWarehousesRes> => {
  const params = new URLSearchParams();
  if (filters?.city_id) params.set("city_id", String(filters.city_id));
  if (filters?.zone_id) params.set("zone_id", String(filters.zone_id));
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();
  return apiCall({
    method: "GET",
    url: `/warehouse/warehouses${qs ? `?${qs}` : ""}`,
  });
};

export const getWarehouse = async (id: number): Promise<GetWarehouseRes> => {
  return apiCall({ method: "GET", url: `/warehouse/warehouses/${id}` });
};

export const createWarehouse = async (
  data: WarehouseCreateData,
): Promise<GetWarehouseRes> => {
  return apiCall({ method: "POST", url: "/warehouse/warehouses", data });
};

export const updateWarehouse = async (
  id: number,
  data: WarehouseUpdateData,
): Promise<GetWarehouseRes> => {
  return apiCall({
    method: "PATCH",
    url: `/warehouse/warehouses/${id}`,
    data,
  });
};

export const getWarehouseStaff = async (
  id: number,
): Promise<GetWarehouseStaffRes> => {
  return apiCall({ method: "GET", url: `/warehouse/warehouses/${id}/staff` });
};

export const assignWarehouseStaff = async (
  id: number,
  userId: string,
): Promise<AssignWarehouseStaffRes> => {
  return apiCall({
    method: "POST",
    url: `/warehouse/warehouses/${id}/staff`,
    data: { user_id: userId },
  });
};

export const unassignWarehouseStaff = async (
  id: number,
  userId: string,
): Promise<{ status: "success"; message: string }> => {
  return apiCall({
    method: "DELETE",
    url: `/warehouse/warehouses/${id}/staff/${userId}`,
  });
};

// ---- Courier: /courier ----

export const getCourierManifest = async (
  slotId: string,
  date: string,
  warehouseId: number,
): Promise<GetCourierManifestRes> => {
  return apiCall({
    method: "GET",
    url: `/courier/manifest/${slotId}?date=${date}&warehouse_id=${warehouseId}`,
  });
};

export const courierCheckoutParcel = async (
  id: string,
  data: CourierCheckoutData,
): Promise<WHScanEventRes> => {
  return apiCall({
    method: "POST",
    url: `/courier/parcels/${id}/checkout`,
    data,
  });
};

export const courierDeliverParcel = async (
  id: string,
  data: CourierDeliverData,
): Promise<WHScanEventRes> => {
  return apiCall({
    method: "POST",
    url: `/courier/parcels/${id}/deliver`,
    data,
  });
};

export const courierFailParcel = async (
  id: string,
  data: CourierFailData,
): Promise<WHScanEventRes> => {
  return apiCall({
    method: "POST",
    url: `/courier/parcels/${id}/fail`,
    data,
  });
};

export const courierReturnParcel = async (
  id: string,
  data: CourierReturnData,
): Promise<WHScanEventRes> => {
  return apiCall({
    method: "POST",
    url: `/courier/parcels/${id}/return`,
    data,
  });
};

export const getCourierFailureReasons =
  async (): Promise<GetFailureReasonsRes> => {
    return apiCall({ method: "GET", url: "/courier/failure-reasons" });
  };
