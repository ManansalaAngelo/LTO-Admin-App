import {
  Box,
  Button,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type React from "react";
import { PageMainCont } from "../../../shared/style_props/page_container";
import { PageHeader } from "../../../shared/page_header";
import { useEnforcers } from "./hooks";
import useEnforcersStore from "./store";
import { TableLoadingIndicator } from "../../../shared/loading_indicator/table_loading";
import { Pagination } from "../../../shared/pagination";
import { PageLoadingIndicator } from "../../../shared/loading_indicator/page_loading";
import { DataTable } from "./components/data_table";
import { EnforcerDetailsDialog } from "./components/enforcer_details_dialog";
import { EnforcerReportsDialog } from "./components/enforcer_reports_dialog";
import { mainColor } from "../../../../themes/colors";
import { AddModal } from "./components/add_modal";
import { DeleteConfimationDialog } from "./components/delete_confirmation_dialog";

const EnforcerPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { pageSize, searchQuery, setSearchQuery, setAddModalOpen } =
    useEnforcersStore();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    isError,
  } = useEnforcers({ pageSize, searchQuery });

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };
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

  if (isLoading) {
    return <PageLoadingIndicator />;
  }

  if (isError) {
    return <Typography color="error">Error fetching data.</Typography>;
  }

  const totalCount = data?.pages?.[0]?.totalCount ?? 0;
  const allEnforcers = data?.pages?.flatMap((page) => page.users) || [];
  const enforcersSeen = allEnforcers.length;

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
            title="Enforcers"
            totalCountLabel="Total Enforcers"
            searchPlaceholder="Search by name"
            totalCount={totalCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchKeyDown={handleSearchKeyDown}
            handleSearch={handleSearch}
          />
          <Box sx={{ mb: 2 }}>
            <Button
              onClick={handleOpenAddModal}
              variant="contained"
              sx={{
                bgcolor: mainColor.tertiary,
                height: 55,
                minWidth: isMobile ? 55 : undefined,
                p: isMobile ? 0 : undefined,
              }}
            >
              {isMobile ? (
                <Tooltip title="Add Enforcer">
                  <AddIcon />
                </Tooltip>
              ) : (
                "Add Enforcer"
              )}
            </Button>
          </Box>
        </Box>
        <Box sx={{ position: "relative" }}>
          {isRefetching && <TableLoadingIndicator />}
          <DataTable enforcers={allEnforcers} />
        </Box>
        <Pagination
          dataSeen={enforcersSeen}
          totalCount={totalCount}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={handleLoadMore}
        />
      </Box>
      <EnforcerDetailsDialog />
      <EnforcerReportsDialog />
      <DeleteConfimationDialog />
      <AddModal />
    </Box>
  );
};

export default EnforcerPage;
