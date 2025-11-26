import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  alpha,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Gavel as GavelIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Transition } from "../../../../shared/transition";
import React from "react";
import useDriversStore from "../store";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../../firebase";
import { FirebaseCollections } from "../../../../../enums/collections";
import type { ReportModel } from "../../../../../models/report_model";
import { FormatDate } from "../../../../../utils/date_formatter";
import {
  getStatusColor,
  getDisplayStatus,
  statusChipStyles,
} from "../../../../../utils/status_utils";

export const DriverViolationsDialog: React.FC = () => {
  const { isViolationsModalOpen, selectedDriver, setViolationsModalOpen, setSelectedDriver } =
    useDriversStore();

  const handleClose = () => {
    setViolationsModalOpen(false);
    setSelectedDriver(undefined);
  };

  // Fetch violations for the selected driver
  const { data: violations, isLoading, error } = useQuery({
    queryKey: ["driver-violations", selectedDriver?.plateNumber],
    queryFn: async () => {
      if (!selectedDriver?.plateNumber) return [];

      const reportsRef = collection(db, FirebaseCollections.reports);
      const q = query(
        reportsRef,
        where("plateNumber", "==", selectedDriver.plateNumber)
      );
      const querySnapshot = await getDocs(q);

      const reports: ReportModel[] = [];
      querySnapshot.forEach((doc) => {
        reports.push({
          documentId: doc.id,
          ...doc.data(),
        } as ReportModel);
      });

      return reports;
    },
    enabled: isViolationsModalOpen && !!selectedDriver?.plateNumber,
  });

  const totalViolations = violations?.reduce(
    (sum, report) => sum + (report.violations?.length || 0),
    0
  ) || 0;

  const paidReports = violations?.filter((report) => report.status === "Paid").length || 0;
  const pendingReports = violations?.filter((report) => report.status === "Submitted").length || 0;

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={isViolationsModalOpen}
      slots={{
        transition: Transition,
      }}
      keepMounted
      onClose={handleClose}
      aria-describedby="driver-violations-dialog"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignments: "center",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha("#d32f2f", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GavelIcon sx={{ color: "#d32f2f", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              Driver Violations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedDriver?.firstName} {selectedDriver?.lastName} - {selectedDriver?.plateNumber}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">
            Error loading violations. Please try again.
          </Alert>
        ) : !violations || violations.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <WarningIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No violations found for this driver
            </Typography>
          </Box>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <ReceiptIcon sx={{ color: "primary.main", fontSize: 32 }} />
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {violations.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Reports
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <GavelIcon sx={{ color: "error.main", fontSize: 32 }} />
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="error">
                          {totalViolations}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Violations
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CheckCircleIcon sx={{ color: "success.main", fontSize: 32 }} />
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {paidReports}/{pendingReports}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Paid/Pending
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Violations List */}
            <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 2 }}>
              Violation Reports
            </Typography>
            <Stack spacing={2}>
              {violations.map((report, index) => (
                <Card
                  key={report.documentId || index}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Tracking Number
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {report.trackingNumber || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Date
                        </Typography>
                        <Typography variant="body2">
                          {FormatDate(report.createdAt)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Status
                        </Typography>
                        <Chip
                          label={getDisplayStatus(report.status)}
                          color={getStatusColor(report.status)}
                          size="small"
                          sx={statusChipStyles}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          Violations ({report.violations?.length || 0})
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {report.violations?.map((violation, vIndex) => (
                            <Chip
                              key={vIndex}
                              label={violation.violationName}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Grid>
                      {report.placeOfViolation && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Place of Violation
                          </Typography>
                          <Typography variant="body2">
                            {report.placeOfViolation}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
