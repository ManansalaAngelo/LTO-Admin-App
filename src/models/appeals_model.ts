
export interface AppealsModel {
  documentId: string;
  violatorFullName: string;
  reasonForAppeal: string;
  createdById: string;
  createdAt: Date;
  violationTrackingNumber: string;
  supportingDocuments: string[];
  uploadedDocuments: string[];
  status: "Pending" | "Approved" | "Rejected";
  statusUpdatedById?: string;
  statusReason?: string;
}
