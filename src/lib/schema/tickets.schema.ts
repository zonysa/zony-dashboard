export interface Ticket {
  id: string;
  trackingNumber: string;
  pudo: string;
  status: "Delivered" | "Failed To Deliver" | "Undelivered" | "In Transit";
  actionTaken: "Resolved" | "In Progress" | "Unresolved" | "Pending";
  issuesNo: string;
  phoneNumber: string;
  comments: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}
