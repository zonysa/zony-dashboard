export interface Branch {
  id: string;
  partnerName: string;
  pudoId: string;
  city: string;
  zone: string;
  district: string;
  totalParcels: number;
  supervisor: string;
  status: "Active" | "Inactive" | "Pending" | "Suspended";
  pointUsage: number; // This seems to be a percentage or score
}
