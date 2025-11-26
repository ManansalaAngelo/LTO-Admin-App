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
import useEnforcersStore from "../store";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../../../../firebase";
import { FirebaseCollections } from "../../../../../enums/collections";
import type { ReportModel } from "../../../../../models/report_model";
import { FormatDate } from "../../../../../utils/date_formatter";
import {
  getStatusColor,
  getDisplayStatus,
  statusChipStyles,
} from "../../../../../utils/status_utils";

export const EnforcerReportsDialog: React.FC = () => {
  const { isReportsModalOpen, selectedEnforcer, setReportsModalOpen, setSelectedEnforcer } =
    useEnforcersStore();

  const handleClose = () => {
    setReportsModalOpen(false);
    setSelectedEnforcer(undefined);
  };

  // Fetch reports created by the selected enforcer
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ["enforcer-reports", selectedEnforcer?.uuid, selectedEnforcer?.documentId],
    queryFn: async () => {
      if (!selectedEnforcer) return [];

      const reportsRef = collection(db, FirebaseCollections.reports);
      
      // Try querying by enforcerId first (using uuid)
      let q = query(
        reportsRef,
        where("enforcerId", "==", selectedEnforcer.uuid)
      );
      let querySnapshot = await getDocs(q);

      // If no results, try with documentId
      if (querySnapshot.empty && selectedEnforcer.documentId) {
        q = query(
          reportsRef,
          where("enforcerId", "==", selectedEnforcer.documentId)
        );
        querySnapshot = await getDocs(q);
      }

      // If still no results, try with createdById
      if (querySnapshot.empty) {
        q = query(
          reportsRef,
          where("createdById", "==", selectedEnforcer.uuid)
        );
        querySnapshot = await getDocs(q);
      }

      const reportsData: ReportModel[] = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({
          documentId: doc.id,
          ...doc.data(),
        } as ReportModel);
      });

      // Sort by creation date (newest first)
      return reportsData.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : 
                     a.createdAt instanceof Date ? a.createdAt : new Date();
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : 
                     b.createdAt instanceof Date ? b.createdAt : new Date();
        return dateB.getTime() - dateA.getTime();
      });
    },
    enabled: isReportsModalOpen && !!selectedEnforcer?.uuid,
  });

  const totalViolations = reports?.reduce(
    (sum, report) => sum + (report.violations?.length || 0),
    0
  ) || 0;

  const paidReports = reports?.filter((report) => report.status === "Paid").length || 0;
  const submittedReports = reports?.filter((report) => report.status === "Submitted").length || 0;

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={isReportsModalOpen}
      slots={{
        transition: Transition,
      }}
      keepMounted
      onClose={handleClose}
      aria-describedby="enforcer-reports-dialog"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          backgroundColor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ReceiptIcon />
        <Typography variant="h6" component="span">
          Reports Published by {selectedEnforcer?.firstName} {selectedEnforcer?.lastName}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "white",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">
            Failed to load reports. Please try again.
          </Alert>
        ) : !reports || reports.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
            gap={2}
          >
            <WarningIcon sx={{ fontSize: 60, color: "text.secondary" }} />
            <Typography variant="h6" color="text.secondary">
              No reports published yet
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Summary Cards */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card
                  sx={{
                    background: (theme) =>
                      `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                        }}
                      >
                        <ReceiptIcon color="primary" sx={{ fontSize: 32 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {reports?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Reports
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Card
                  sx={{
                    background: (theme) =>
                      `linear-gradient(135deg, ${alpha(
                        theme.palette.warning.main,
                        0.1
                      )} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.warning.main, 0.1),
                        }}
                      >
                        <GavelIcon color="warning" sx={{ fontSize: 32 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {totalViolations}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Violations
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Card
                  sx={{
                    background: (theme) =>
                      `linear-gradient(135deg, ${alpha(
                        theme.palette.success.main,
                        0.1
                      )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.success.main, 0.1),
                        }}
                      >
                        <CheckCircleIcon
                          color="success"
                          sx={{ fontSize: 32 }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {paidReports}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Paid
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Card
                  sx={{
                    background: (theme) =>
                      `linear-gradient(135deg, ${alpha(
                        theme.palette.info.main,
                        0.1
                      )} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.info.main, 0.1),
                        }}
                      >
                        <WarningIcon color="info" sx={{ fontSize: 32 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {submittedReports}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pending
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider />

            {/* Reports List */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Report Details
              </Typography>
              <Stack spacing={2}>
                {reports.map((report) => (
                  <Card
                    key={report.documentId}
                    variant="outlined"
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 2,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Tracking Number
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {report.trackingNumber || "N/A"}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Plate Number
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {report.plateNumber || "N/A"}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Date Published
                          </Typography>
                          <Typography variant="body1">
                            {FormatDate(report.createdAt)}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Status
                          </Typography>
                          <Chip
                            label={getDisplayStatus(report.status)}
                            color={getStatusColor(report.status)}
                            size="small"
                            sx={{ ...statusChipStyles, mt: 0.5 }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 8 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Violations
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {report.violations && report.violations.length > 0 ? (
                              <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                                {report.violations.map((violation, idx) => (
                                  <Chip
                                    key={idx}
                                    label={violation.violationName}
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                  />
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No violations listed
                              </Typography>
                            )}
                          </Box>
                        </Grid>

                        {report.placeOfViolation && (
                          <Grid size={{ xs: 12 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
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
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
