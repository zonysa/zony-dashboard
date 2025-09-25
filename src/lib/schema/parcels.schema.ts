export interface Parcel {
  id: string;
  trackingNumber: string;
  pudoId: string;
  deliveryId: string;
  city: string;
  zone: string;
  receivingDate: Date;
  status: "Delivered" | "In Transit" | "Pending" | "Failed" | "Returned";
  client: string;
  createdAt: Date;
  updatedAt: Date;
}
