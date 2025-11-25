import { Timestamp } from "firebase/firestore";
import type { ViolationModel } from "./violation_model";

export interface ReportModel {
  id?: string;
  documentId?: string; // Firestore document ID
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
  enforcerId?: string; // ID of the enforcer who created this report
  enforcerName?: string; // Full name of the enforcer (firstName + lastName)
  violations: ViolationModel[];
  createdAt: Timestamp | Date;
  dueDate?: Timestamp; // ✅ ADD THIS LINE
  draftId?: string;
  paymentReferenceId?: string;
  status: "Overturned" | "Submitted" | "Cancelled" | "Paid";
  paymentStatus: "Pending" | "Completed" | "Refunded" | "Cancelled";
  // Additional violation details
  age?: number;
  birthdate?: string | Timestamp | Date;
  vehicleType?: string;
  placeOfViolation?: string;
  confiscated?: "Yes" | "No" | boolean;
}