import { Timestamp } from "firebase/firestore";
import type { ViolationModel } from "./violation_model";

export interface ReportModel {
  id?: string;
  fullname: string;
  address: string;
  phoneNumber: string;
  licenseNumber: string;
  licensePhoto: string;
  plateNumber: string;
  platePhoto: string;
  evidencePhoto: string;
  trackingNumber?: string;
  createdById?: string;
  violations: ViolationModel[];
  createdAt: Timestamp;
  dueDate?: Timestamp; // ✅ ADD THIS LINE
  draftId?: string;
  paymentReferenceId?: string;
  status: "Overturned" | "Submitted" | "Cancelled" | "Paid";
  paymentStatus: "Pending" | "Completed" | "Refunded" | "Cancelled";
}