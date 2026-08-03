import {
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
  GetZonesRes,
  ReceivingScanData,
  ReturnParcelData,
  UpdateSettingRes,
  VoidEventData,
  WarehouseReportRange,
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

export const scanBarcode = async (barcode: string): Promise<GetParcelRes> => {
  return apiCall({ method: "GET", url: `/warehouse/scan/${barcode}` });
};

export const getWall = async (date: string): Promise<GetWallRes> => {
  return apiCall({ method: "GET", url: `/warehouse/wall?date=${date}` });
};

export const getLoadingManifest = async (
  slotId: string,
  date: string,
): Promise<GetLoadingManifestRes> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/loading/${slotId}?date=${date}`,
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
): Promise<GetReturnReconciliationRes> => {
  return apiCall({
    method: "GET",
    url: `/warehouse/return/${slotId}?date=${date}`,
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

export const getZones = async (): Promise<GetZonesRes> => {
  return apiCall({ method: "GET", url: "/warehouse/zones" });
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

// ---- Courier: /courier ----

export const getCourierManifest = async (
  slotId: string,
  date: string,
): Promise<GetCourierManifestRes> => {
  return apiCall({
    method: "GET",
    url: `/courier/manifest/${slotId}?date=${date}`,
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
