import { Box, Typography } from "@mui/material";
import { PageMainCont } from "../../../shared/style_props/page_container";

import { Pagination } from "../../../shared/pagination";

import useDriversStore from "./store";
import { useDrivers } from "./hooks";
import type React from "react";
import { PageLoadingIndicator } from "../../../shared/loading_indicator/page_loading";
import { PageHeader } from "../../../shared/page_header";
import { TableLoadingIndicator } from "../../../shared/loading_indicator/table_loading";
import { DataTable } from "./components/data_table";
import { DriverProfileDialog } from "./components/driver_profile_dialog";
import { DriverViolationsDialog } from "./components/driver_violations_dialog";

const DriverPage: React.FC = () => {
  const { pageSize, searchQuery, setSearchQuery } = useDriversStore();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    isError,
  } = useDrivers({ pageSize, searchQuery });

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
  const allDrivers = data?.pages?.flatMap((page) => page.users) || [];
  const driversSeen = allDrivers.length;

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
            title="Drivers"
            totalCountLabel="Total Drivers"
            searchPlaceholder="Search by name or plate number"
            totalCount={totalCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchKeyDown={handleSearchKeyDown}
            handleSearch={handleSearch}
          />
        </Box>
        <Box sx={{ position: "relative" }}>
          {isRefetching && <TableLoadingIndicator />}
          <DataTable drivers={allDrivers} />
        </Box>
        <Pagination
          dataSeen={driversSeen}
          totalCount={totalCount}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={handleLoadMore}
        />
      </Box>
      <DriverProfileDialog />
      <DriverViolationsDialog />
    </Box>
  );
};

export default DriverPage;
