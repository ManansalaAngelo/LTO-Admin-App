import {
  ClickAwayListener,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import type React from "react";
import { TableStyleProps } from "../../../../shared/style_props/table";
import { FormatDate } from "../../../../../utils/date_formatter";
import { getStatusColor, getDisplayStatus, statusChipStyles } from "../../../../../utils/status_utils";
import { Delete, DriveEta, Info, MoreVert } from "@mui/icons-material";
import useViolationsStore from "../store";
import type { ReportModel } from "../../../../../models/report_model";
import { useRef } from "react";
import { mainColor } from "../../../../../themes/colors";

interface IDataTable {
  allReports: ReportModel[];
}
export const DataTable: React.FC<IDataTable> = ({ allReports }) => {
  const anchorRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const {
    openMenuId,
    setOpenMenuId,
    setFullDetailDialogOpen,
    setSelectedReport,
    setDeleteConfirmationDialog,
    setDriverDialogOpen,
  } = useViolationsStore();

  const handleToggle = (reportId: string) => {
    setOpenMenuId(openMenuId === reportId ? null : reportId);
  };

  const handleOpenFullDetails = (report: ReportModel) => {
    setFullDetailDialogOpen(true);
    setSelectedReport(report);
  };
  const handleDeleteReport = (report: ReportModel) => {
    setSelectedReport(report);
    setDeleteConfirmationDialog(true);
  };

  const handleViewDriversProfile = (report: ReportModel) => {
    setSelectedReport(report);
    setDriverDialogOpen(true);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpenMenuId(null);
    } else if (event.key === "Escape") {
      setOpenMenuId(null);
    }
  }

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      openMenuId &&
      anchorRefs.current[openMenuId]?.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpenMenuId(null);
  };
  return (
    <TableContainer component={Paper} sx={TableStyleProps.container}>
      <Table
        stickyHeader
        sx={{
          minWidth: 650,
        }}
        aria-label="simple table"
      >
        <TableHead sx={TableStyleProps.tableHead}>
          <TableRow sx={TableStyleProps.tableRow}>
            <TableCell sx={TableStyleProps.tableHeadLeft}>#</TableCell>
            <TableCell>Tracking Number</TableCell>
            <TableCell width="15%">Full Name</TableCell>
            <TableCell>Plate Number</TableCell>
            <TableCell>Violations</TableCell>
            <TableCell>Enforcer</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell sx={TableStyleProps.tableHeadRight}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allReports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No reports found.
              </TableCell>
            </TableRow>
          ) : (
            allReports.map((report, index) => {
              const reportId = report.documentId || `report-${index}`;
              const isOpen = openMenuId === reportId;
              return (
                <TableRow key={reportId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{report.trackingNumber || "N/A"}</TableCell>
                  <TableCell>{report.fullname}</TableCell>
                  <TableCell>{report.plateNumber}</TableCell>
                  <TableCell>{report.violations.map(v => v.violationName).join(", ")}</TableCell>
                  <TableCell>{report.enforcerName || "N/A"}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getDisplayStatus(report.status)}
                      color={getStatusColor(report.status)}
                      size="small"
                      sx={statusChipStyles}
                    />
                  </TableCell>
                  <TableCell>{FormatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      ref={(el) => {
                        anchorRefs.current[reportId] = el;
                      }}
                      id={`composition-button-${reportId}`}
                      aria-controls={
                        isOpen
                          ? `composition-menu-${reportId}`
                          : undefined
                      }
                      aria-expanded={isOpen ? "true" : undefined}
                      aria-haspopup="true"
                      onClick={() => handleToggle(reportId)}
                    >
                      <MoreVert
                        sx={{
                          color: mainColor.tertiary,
                        }}
                      />
                    </IconButton>
                    <Popper
                      open={isOpen}
                      anchorEl={anchorRefs.current[reportId]}
                      role={undefined}
                      placement="bottom-start"
                      transition
                      disablePortal
                      style={{ zIndex: 1300 }}
                    >
                      {({ TransitionProps, placement }) => (
                        <Grow
                          {...TransitionProps}
                          style={{
                            transformOrigin:
                              placement === "bottom-start"
                                ? "left top"
                                : "left bottom",
                          }}
                        >
                          <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                              <MenuList
                                autoFocusItem={isOpen}
                                id={`composition-menu-${reportId}`}
                                aria-labelledby={`composition-button-${reportId}`}
                                onKeyDown={handleListKeyDown}
                                sx={{
                                  color: "secondary.main",
                                }}
                              >
                                <MenuItem
                                  onClick={() => handleOpenFullDetails(report)}
                                >
                                  <Info
                                    sx={{
                                      color: "success.main",
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    Full Details
                                  </Typography>
                                </MenuItem>
                                <MenuItem
                                  onClick={() =>
                                    handleViewDriversProfile(report)
                                  }
                                >
                                  <DriveEta
                                    sx={{
                                      color: mainColor.highlight,
                                    }}
                                  />

                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    View Driver's Profile
                                  </Typography>
                                </MenuItem>
                                <MenuItem
                                  onClick={() => handleDeleteReport(report)}
                                >
                                  <Delete
                                    sx={{
                                      color: "error.main",
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    Delete
                                  </Typography>
                                </MenuItem>
                              </MenuList>
                            </ClickAwayListener>
                          </Paper>
                        </Grow>
                      )}
                    </Popper>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
