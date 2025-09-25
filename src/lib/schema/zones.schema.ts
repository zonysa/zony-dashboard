export interface Zone {
  id: string;
  zoneId: string;
  city: string;
  districts: string;
  pudoPoints: number;
  parcels: number;
  supervisor: string;
  status: "Active" | "Inactive" | "Pending" | "Suspended";
  createdAt: Date;
  updatedAt: Date;
}
