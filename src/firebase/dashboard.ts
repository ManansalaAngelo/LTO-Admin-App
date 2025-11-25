import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";

// Types for Firestore timestamp handling
interface FirestoreTimestamp {
  toDate(): Date;
}

interface TimestampObject {
  seconds: number;
  nanoseconds?: number;
}
import { db } from "../firebase";
import { FirebaseCollections } from "../enums/collections";
import type { ReportModel } from "../models/report_model";
import type { PaymentModel } from "../models/payment_model";
import { enrichReportsWithEnforcerData } from "./reports";

// Dashboard data interface
export interface DashboardData {
  // Overview Metrics
  totalViolationsToday: number;
  totalViolationsThisMonth: number;
  totalPaidFines: number;
  totalUnpaidFines: number;
  totalRevenue: number;

  // Recent Activity
  latestViolations: ReportModel[];
  latestPayments: PaymentModel[];

  // Charts Data
  violationsByLocation: Record<string, number>;
  monthlyTrends: Record<string, number>;
  paymentStatusBreakdown: {
    completed: number;
    pending: number;
    refunded: number;
    overturned: number;
    cancelled: number;
  };

  // New Requirements
  reportsWithAppeals: ReportModel[];
  todaysPayments: PaymentModel[];

  // Additional Insights
  averageFineAmount: number;
  topViolationTypes: Record<string, number>;
  busiestLocations: string[];
}

// Helper function to safely convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: unknown): Date | null => {
  if (!timestamp) return null;

  // If it's already a Date object
  if (timestamp instanceof Date) return timestamp;

  // If it's a Firestore Timestamp with toDate method
  if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
    return (timestamp as FirestoreTimestamp).toDate();
  }

  // If it's a timestamp object with seconds and nanoseconds
  if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
    return new Date((timestamp as TimestampObject).seconds * 1000);
  }

  // If it's a string or number, try to parse it
  if (typeof timestamp === "string" || typeof timestamp === "number") {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

// Helper function to convert string date to comparable format
const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

// Helper function to check if a date string is today
const isToday = (dateString: string): boolean => {
  if (!dateString) return false;
  const today = getDateString(new Date());
  const checkDate = getDateString(new Date(dateString));
  return today === checkDate;
};

// Helper function to check if a date string is in current month
const isCurrentMonth = (dateString: string): boolean => {
  if (!dateString) return false;
  const today = new Date();
  const checkDate = new Date(dateString);
  return today.getFullYear() === checkDate.getFullYear() && 
         today.getMonth() === checkDate.getMonth();
};

// Helper function to convert Firestore document to ReportModel
const convertToReportModel = (doc: DocumentData): ReportModel => {
  const data = doc.data();
  
  // Handle createdAt - could be string or timestamp
  let createdAt: Date | null = null;
  if (data.createdAt) {
    if (typeof data.createdAt === 'string') {
      createdAt = new Date(data.createdAt);
    } else {
      createdAt = convertTimestampToDate(data.createdAt);
    }
  }
  
  return {
    documentId: doc.id,
    fullname: data.fullname || "",
    address: data.address || "",
    phoneNumber: data.phoneNumber || "",
    licenseNumber: data.licenseNumber || "",
    licensePhoto: data.licensePhoto || "",
    plateNumber: data.plateNumber || "",
    platePhoto: data.platePhoto || "",
    evidencePhoto: data.evidencePhoto || "",
    trackingNumber: data.trackingNumber || null,
    createdById: data.createdById || null,
    enforcerId: data.enforcerId || null,
    enforcerName: data.enforcerName || null,
    violations: data.violations || [],
    createdAt: createdAt || new Date(),
    draftId: data.draftId || null,
    status: data.status || "Submitted",
    paymentStatus: data.paymentStatus || "Pending",
  };
};

// Helper function to convert Firestore document to PaymentModel
const convertToPaymentModel = (doc: DocumentData): PaymentModel => {
  const data = doc.data();
  return {
    documentId: doc.id,
    violationTrackingNumber: data.violationTrackingNumber || "",
    violatorId: data.violatorId || "",
    violatorFullName: data.violatorFullName || "",
    amount: data.amount || 0,
    paidAt: convertTimestampToDate(data.paidAt) || new Date(),
    paidById: data.paidById || "",
    paidBy: data.paidBy || undefined,
    paymentMethod: data.paymentMethod || "Cash",
    paymentId: data.paymentId || "",
    createdAt: convertTimestampToDate(data.createdAt) || new Date(),
    lastUpdatedAt: convertTimestampToDate(data.lastUpdatedAt) || undefined,
    isDeleted: data.isDeleted || false,
    status: data.status,
    deletedAt: convertTimestampToDate(data.deletedAt) || null,
  };
};

// Helper function to fetch user data and enrich payments with driver names
const enrichPaymentsWithDriverNames = async (payments: PaymentModel[]): Promise<PaymentModel[]> => {
  const usersRef = collection(db, FirebaseCollections.users);
  const enrichedPayments = await Promise.all(
    payments.map(async (payment) => {
      if (payment.paidById && !payment.violatorFullName) {
        try {
          const userQuery = query(usersRef, where("uuid", "==", payment.paidById));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            return {
              ...payment,
              violatorFullName: (userData.firstName && userData.lastName) 
                ? `${userData.firstName} ${userData.lastName}` 
                : userData.displayName || "Unknown Driver"
            };
          }
        } catch (error) {
          console.warn(`Failed to fetch user data for paidById: ${payment.paidById}`, error);
        }
      }
      return payment;
    })
  );
  return enrichedPayments;
};

// Helper function to get start and end of today
const getTodayRange = () => {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  return {
    start: Timestamp.fromDate(startOfDay),
    end: Timestamp.fromDate(endOfDay),
  };
};

// Helper function to get Date from Timestamp or Date
const getDateValue = (dateValue: Timestamp | Date | null | undefined): Date | null => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  if (typeof (dateValue as any).toDate === 'function') {
    return (dateValue as any).toDate();
  }
  return null;
};

// Helper function to group violations by month
const groupByMonth = (reports: ReportModel[]): Record<string, number> => {
  return reports.reduce((acc, report) => {
    const createdDate = getDateValue(report.createdAt);
    if (!createdDate) return acc;

    const monthKey = `${createdDate.getFullYear()}-${String(
      createdDate.getMonth() + 1
    ).padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Helper function to group violations by location
const groupByLocation = (reports: ReportModel[]): Record<string, number> => {
  return reports.reduce((acc, report) => {
    const location = report.address || "Unknown Location";
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Helper function to get top violation types
const getTopViolationTypes = (
  reports: ReportModel[]
): Record<string, number> => {
  const violationCounts: Record<string, number> = {};

  reports.forEach((report) => {
    report.violations.forEach((violation) => {
      violationCounts[violation.violationName] = (violationCounts[violation.violationName] || 0) + 1;
    });
  });

  return violationCounts;
};

// Helper function to get busiest locations (top 5)
const getBusiestLocations = (
  violationsByLocation: Record<string, number>
): string[] => {
  return Object.entries(violationsByLocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([location]) => location);
};

// Main dashboard data fetching function
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const reportsRef = collection(db, FirebaseCollections.reports);
    const paymentsRef = collection(db, FirebaseCollections.payments);

    // Get today's date range (still needed for payments)
    const todayRange = getTodayRange();

    // Query all reports (for comprehensive analysis)
    const allReportsQuery = query(
      reportsRef,
      orderBy("createdAt", "desc")
    );
    const allReportsSnapshot = await getDocs(allReportsQuery);
    const allReportsRaw: ReportModel[] =
      allReportsSnapshot.docs.map(convertToReportModel);
    const allReports = await enrichReportsWithEnforcerData(allReportsRaw);

    // Count today's and month's violations from all reports
    const todayViolations = allReports.filter(report => {
      const createdDate = getDateValue(report.createdAt);
      return createdDate && isToday(createdDate.toISOString());
    }).length;

    const monthViolations = allReports.filter(report => {
      const createdDate = getDateValue(report.createdAt);
      return createdDate && isCurrentMonth(createdDate.toISOString());
    }).length;

    // Query latest violations (last 10)
    const latestViolationsQuery = query(
      reportsRef,
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const latestViolationsSnapshot = await getDocs(latestViolationsQuery);
    const latestViolationsRaw: ReportModel[] =
      latestViolationsSnapshot.docs.map(convertToReportModel);
    const latestViolations = await enrichReportsWithEnforcerData(latestViolationsRaw);

    // Query all payments
    const allPaymentsQuery = query(paymentsRef, orderBy("paidAt", "desc"));
    const allPaymentsSnapshot = await getDocs(allPaymentsQuery);
    const allPaymentsRaw: PaymentModel[] = allPaymentsSnapshot.docs.map(
      convertToPaymentModel
    );
    const allPayments = await enrichPaymentsWithDriverNames(allPaymentsRaw);

    // Query latest payments (last 10)
    const latestPaymentsQuery = query(
      paymentsRef,
      orderBy("paidAt", "desc"),
      limit(10)
    );
    const latestPaymentsSnapshot = await getDocs(latestPaymentsQuery);
    const latestPaymentsRaw: PaymentModel[] = latestPaymentsSnapshot.docs.map(
      convertToPaymentModel
    );
    const latestPayments = await enrichPaymentsWithDriverNames(latestPaymentsRaw);

    // Query reports with appeals (last 5)
    const appealsRef = collection(db, FirebaseCollections.appeals);
    const appealsQuery = query(
      appealsRef,
      where("status", "==", "Pending"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const appealsSnapshot = await getDocs(appealsQuery);
    
    // Get tracking numbers from appeals
    const trackingNumbers = appealsSnapshot.docs.map(doc => doc.data().violationTrackingNumber);
    // Query reports that match the tracking numbers
    let reportsWithAppeals: ReportModel[] = [];
    if (trackingNumbers.length > 0) {
      const reportsWithAppealsQuery = query(
        reportsRef,
        where("trackingNumber", "in", trackingNumbers),
        orderBy("createdAt", "desc")
      );
      const reportsWithAppealsSnapshot = await getDocs(reportsWithAppealsQuery);
      const reportsWithAppealsRaw = reportsWithAppealsSnapshot.docs.map(convertToReportModel);
      reportsWithAppeals = await enrichReportsWithEnforcerData(reportsWithAppealsRaw);
    }

    // Query today's payments (drivers who paid today)
    const todaysPaymentsQuery = query(
      paymentsRef,
      where("createdAt", ">=", todayRange.start),
      where("createdAt", "<", todayRange.end),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const todaysPaymentsSnapshot = await getDocs(todaysPaymentsQuery);
    const todaysPaymentsRaw: PaymentModel[] = todaysPaymentsSnapshot.docs.map(
      convertToPaymentModel
    );
    const todaysPayments = await enrichPaymentsWithDriverNames(todaysPaymentsRaw);

    // Calculate payment status breakdown
    const paymentStatusBreakdown = {
      completed: allReports.filter((r) => r.paymentStatus === "Completed")
        .length,
      pending: allReports.filter((r) => r.paymentStatus === "Pending" || r.paymentStatus === null || r.paymentStatus === undefined).length,
      refunded: allReports.filter((r) => r.paymentStatus === "Refunded").length,
      overturned: allReports.filter((r) => r.status === "Overturned").length,
      cancelled: allReports.filter((r) => r.paymentStatus === "Cancelled")
        .length,
    };

    // Calculate total revenue
    const totalRevenue = allPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate average fine amount
    const averageFineAmount =
      allPayments.length > 0 ? totalRevenue / allPayments.length : 0;

    // Group violations by location and month
    const violationsByLocation = groupByLocation(allReports);
    const monthlyTrends = groupByMonth(allReports);

    // Get top violation types
    const topViolationTypes = getTopViolationTypes(allReports);

    // Get busiest locations
    const busiestLocations = getBusiestLocations(violationsByLocation);

    // Return dashboard data
    return {
      // Overview Metrics
      totalViolationsToday: todayViolations,
      totalViolationsThisMonth: monthViolations,
      totalPaidFines: paymentStatusBreakdown.completed,
      totalUnpaidFines: paymentStatusBreakdown.pending,
      totalRevenue,

      // Recent Activity
      latestViolations,
      latestPayments,

      // Charts Data
      violationsByLocation,
      monthlyTrends,
      paymentStatusBreakdown,

      // Additional Insights
      averageFineAmount: Math.round(averageFineAmount * 100) / 100, // Round to 2 decimal places
      topViolationTypes,
      busiestLocations,

      // New Requirements
      reportsWithAppeals,
      todaysPayments,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error(
      `Failed to fetch dashboard data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Helper function to get dashboard overview only (for lighter queries)
export const getDashboardOverview = async (): Promise<
  Pick<
    DashboardData,
    | "totalViolationsToday"
    | "totalViolationsThisMonth"
    | "totalPaidFines"
    | "totalUnpaidFines"
    | "totalRevenue"
  >
> => {
  try {
    const reportsRef = collection(db, FirebaseCollections.reports);
    const paymentsRef = collection(db, FirebaseCollections.payments);

    // Get all reports to filter by date (since createdAt is stored as string)
    const allReportsQuery = query(reportsRef);
    const allReportsSnapshot = await getDocs(allReportsQuery);
    const allReports = allReportsSnapshot.docs.map(convertToReportModel);

    // Count today's and month's violations
    const todayViolationsCount = allReports.filter(report => {
      const createdDate = getDateValue(report.createdAt);
      return createdDate && isToday(createdDate.toISOString());
    }).length;

    const monthViolationsCount = allReports.filter(report => {
      const createdDate = getDateValue(report.createdAt);
      return createdDate && isCurrentMonth(createdDate.toISOString());
    }).length;

    // Get payment status counts
    const paidQuery = query(
      reportsRef,
      where("paymentStatus", "==", "Completed")
    );
    const paidSnapshot = await getDocs(paidQuery);

    // Get all reports to properly count pending (including null paymentStatus)
    const allReportsForStatusQuery = query(reportsRef);
    const allReportsForStatusSnapshot = await getDocs(allReportsForStatusQuery);
    const allReportsForStatus = allReportsForStatusSnapshot.docs.map(convertToReportModel);
    
    const unpaidCount = allReportsForStatus.filter((r) => 
      r.paymentStatus === "Pending" || 
      r.paymentStatus === null || 
      r.paymentStatus === undefined
    ).length;

    // Get total revenue
    const paymentsQuery = query(paymentsRef);
    const paymentsSnapshot = await getDocs(paymentsQuery);
    const totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => {
      const payment = convertToPaymentModel(doc);
      return sum + payment.amount;
    }, 0);

    return {
      totalViolationsToday: todayViolationsCount,
      totalViolationsThisMonth: monthViolationsCount,
      totalPaidFines: paidSnapshot.size,
      totalUnpaidFines: unpaidCount,
      totalRevenue,
    };
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    throw new Error(
      `Failed to fetch dashboard overview: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
