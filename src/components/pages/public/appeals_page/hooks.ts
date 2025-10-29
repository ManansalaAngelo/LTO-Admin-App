import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import type { DocumentData } from "firebase/firestore";
import type { AppealsModel } from "../../../../models/appeals_model";
import type { ReportModel } from "../../../../models/report_model";
import { getAppeals, updateAppealStatus } from "../../../../firebase/apppeals";
import { getReportByTrackingNumber } from "../../../../firebase/reports";

interface UseAppealsParams {
  pageSize: number;
  searchQuery?: string;
}

export const useAppeals = ({
  pageSize,
  searchQuery = "",
}: UseAppealsParams) => {
  return useInfiniteQuery<{
    appeals: AppealsModel[];
    lastDoc: DocumentData | null;
    totalCount: number;
  }>({
    queryKey: ["appeals", searchQuery], // Add searchQuery to queryKey to refetch on change
    queryFn: ({ pageParam }) =>
      getAppeals({
        pageSize,
        lastDoc: pageParam as DocumentData,
        searchQuery,
      }),
    getNextPageParam: (lastPage) => lastPage.lastDoc ?? undefined,
    initialPageParam: null,
  });
};

export const useUpdateAppealStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // THIS IS THE FIX: The mutation now accepts and uses the 'reason' field.
    mutationFn: ({
      documentId,
      status,
      currentUserId,
      violationTrackingNumber,
      reason, // <-- Add reason here
    }: {
      documentId: string;
      status: "Approved" | "Rejected";
      currentUserId: string;
      violationTrackingNumber: string;
      reason?: string; // <-- Add reason to the type definition
    }) =>
      updateAppealStatus(
        documentId,
        status,
        currentUserId,
        violationTrackingNumber,
        reason // <-- Pass the reason to the database function
      ),
    onSuccess: () => {
      // Invalidate queries to force a refetch and update the UI
      queryClient.invalidateQueries({ queryKey: ["appeals"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
    onError: (error) => {
      console.error("Error updating appeal status: ", error);
      // Optional: Show a user-friendly error message here
    },
  });
};

export const useReportByTrackingNumber = (violationTrackingNumber: string) => {
  return useQuery<ReportModel | null, Error>({
    queryKey: ["report", "trackingNumber", violationTrackingNumber],
    queryFn: () => getReportByTrackingNumber(violationTrackingNumber),
    enabled: !!violationTrackingNumber,
  });
};