import { Box, Typography } from "@mui/material";
import { PageLoadingIndicator } from "../../../shared/loading_indicator/page_loading";
import { PageMainCont } from "../../../shared/style_props/page_container";
import { PageHeader } from "../../../shared/page_header";
import { TableLoadingIndicator } from "../../../shared/loading_indicator/table_loading";
import { Pagination } from "../../../shared/pagination";
import useAppealsStore from "./store";
import { useAppeals, useUpdateAppealStatus } from "./hooks";
import { DataTable } from "./components/data_table";
import { AppealDetailsDialog } from "./components/appeal_details_dialog";
import { ConfirmationDialog } from "./components/confirmation_dialog";
import { useAuth } from "../../../../context/auth_context";
import type { AppealsModel } from "../../../../models/appeals_model";

const AppealsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    pageSize,
    searchQuery,
    selectedAppeal,
    isAppealDetailsDialogOpen,
    isConfirmationDialogOpen,
    confirmationAction,
    setSearchQuery,
    setSelectedAppeal,
    setAppealDetailsDialogOpen,
    setConfirmationDialogOpen,
    setConfirmationAction,
  } = useAppealsStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    isError,
  } = useAppeals({ pageSize, searchQuery });

  const updateAppealStatusMutation = useUpdateAppealStatus();

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleSearch = () => {
    refetch();
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleOpenAppeal = (appeal: AppealsModel) => {
    setSelectedAppeal(appeal);
    setAppealDetailsDialogOpen(true);
  };

  const handleApproveAppeal = (appeal: AppealsModel) => {
    setSelectedAppeal(appeal);
    setConfirmationAction("Approve");
    setConfirmationDialogOpen(true);
  };

  const handleRejectAppeal = (appeal: AppealsModel) => {
    setSelectedAppeal(appeal);
    setConfirmationAction("Reject");
    setConfirmationDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setAppealDetailsDialogOpen(false);
    setSelectedAppeal(undefined);
  };

  const handleCloseConfirmationDialog = () => {
    setConfirmationDialogOpen(false);
    setConfirmationAction(null);
  };

  const handleConfirmAction = (reason: string) => {
    if (selectedAppeal && currentUser?.uid && confirmationAction) {
      updateAppealStatusMutation.mutate(
        {
          documentId: selectedAppeal.documentId,
          status: confirmationAction === "Approve" ? "Approved" : "Rejected",
          currentUserId: currentUser.uid,
          violationTrackingNumber: selectedAppeal.violationTrackingNumber,
          reason,
        },
        {
          onSuccess: () => {
            handleCloseConfirmationDialog();
            handleCloseDialog();
          },
          onError: (error) => {
            alert(`Failed to update appeal: ${error.message}`);
          },
        }
      );
    }
  };

  if (isLoading) {
    return <PageLoadingIndicator />;
  }

  if (isError) {
    return <Typography color="error">Error fetching data.</Typography>;
  }

  const totalCount = data?.pages?.[0]?.totalCount ?? 0;
  const allData = data?.pages?.flatMap((page) => page.appeals) || [];
  const dataSeen = allData.length;

  return (
    <Box sx={PageMainCont}>
      <Box sx={PageMainCont.SubCont}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: {
              xs: 1,
              md: 2,
            },
          }}
        >
          <PageHeader
            title="Appeals"
            totalCountLabel="Total Appeals"
            searchPlaceholder="Search by violation tracking number"
            totalCount={totalCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchKeyDown={handleSearchKeyDown}
            handleSearch={handleSearch}
          />
        </Box>
        <Box sx={{ position: "relative" }}>
          {isRefetching && <TableLoadingIndicator />}
          <DataTable
            data={allData}
            onOpenAppeal={handleOpenAppeal}
            onApproveAppeal={handleApproveAppeal}
            onRejectAppeal={handleRejectAppeal}
          />
        </Box>
        <Pagination
          dataSeen={dataSeen}
          totalCount={totalCount}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={handleLoadMore}
        />
      </Box>

      <AppealDetailsDialog
        open={isAppealDetailsDialogOpen}
        onClose={handleCloseDialog}
        appeal={selectedAppeal || null}
        currentUserId={currentUser?.uid}
      />

      {confirmationAction && (
        <ConfirmationDialog
          open={isConfirmationDialogOpen}
          onClose={handleCloseConfirmationDialog}
          onConfirm={handleConfirmAction}
          title={`${confirmationAction} Appeal`}
          actionType={confirmationAction}
        />
      )}
    </Box>
  );
};
export default AppealsPage;