export interface Supervisor {
  id: string;
  name: string;
  city: string;
  zone: string;
  districts: string;
  status: "Active" | "Inactive" | "Pending" | "Suspended";
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}
