import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
  Paper,
  Box,
  Chip,
  Card,
  CardContent,
  Stack,
  alpha,
} from "@mui/material";
import type React from "react";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import GavelIcon from "@mui/icons-material/Gavel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Transition } from "../../../../shared/transition";
import { useReportByTrackingNumber, useUpdateAppealStatus } from "../hooks";
import { PageLoadingIndicator } from "../../../../shared/loading_indicator/page_loading";
import { NotFoundOne } from "../../../../shared/not_found/not_found_one";
import type { AppealsModel } from "../../../../../models/appeals_model";
import { FormatDate } from "../../../../../utils/date_formatter";
import {
  getStatusColor,
  statusChipStyles,
} from "../../../../../utils/status_utils";
import useAppealsStore from "../store";

interface IAppealDetailsDialog {
  open: boolean;
  onClose: () => void;
  appeal: AppealsModel | null;
  currentUserId?: string;
}

export const AppealDetailsDialog: React.FC<IAppealDetailsDialog> = ({
  open,
  onClose,
  appeal,
}) => {
  const { setConfirmationAction, setConfirmationDialogOpen } = useAppealsStore();
  const updateAppealStatusMutation = useUpdateAppealStatus();

  const { data: report, isLoading: isReportLoading } =
    useReportByTrackingNumber(appeal?.violationTrackingNumber || "");

  const handleApprove = () => {
    setConfirmationAction("Approve");
    setConfirmationDialogOpen(true);
  };

  const handleReject = () => {
    setConfirmationAction("Reject");
    setConfirmationDialogOpen(true);
  };

  const getOffenseText = (repetition: number): string => {
    switch (repetition) {
      case 1:
        return "1st Offense";
      case 2:
        return "2nd Offense";
      case 3:
        return "3rd Offense";
      default:
        return `${repetition}th Offense`;
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      open={open}
      slots={{
        transition: Transition,
      }}
      keepMounted
      onClose={onClose}
      aria-describedby="appeal-details-dialog"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: "none",
        },
      }}
    >
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 3 }} fontWeight={600}>
          Appeal Details
        </Typography>

        {!appeal ? (
          <Box sx={{ p: 6 }}>
            <NotFoundOne caption="No appeal selected" />
          </Box>
        ) : (
          <Box sx={{ p: 0 }}>
            <Grid container spacing={4}>
              {/* Appeal Information */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "fit-content",
                    background:
                      "linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: alpha("#667eea", 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <DescriptionIcon
                          sx={{ color: "#667eea", fontSize: 24 }}
                        />
                      </Box>
                      <Typography variant="h6" fontWeight={600} color="primary">
                        Appeal Information
                      </Typography>
                    </Box>

                    <Stack spacing={2.5}>
                      <ModernDetailItem
                        icon={<PersonIcon />}
                        label="Violator Name"
                        value={appeal.violatorFullName}
                      />
                      <ModernDetailItem
                        icon={<CalendarTodayIcon />}
                        label="Appeal Date"
                        value={FormatDate(appeal.createdAt)}
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography fontWeight={600}>Status:</Typography>
                        <Chip
                          label={appeal.status}
                          color={getStatusColor(appeal.status)}
                          size="small"
                          sx={statusChipStyles}
                        />
                      </Box>
                      <ModernDetailItem
                        icon={<DescriptionIcon />}
                        label="Reason for Appeal"
                        value={appeal.reasonForAppeal}
                        multiline
                      />
                      {appeal.status !== "Pending" && appeal.statusReason && (
                        <ModernDetailItem
                          icon={<DescriptionIcon />}
                          label="Reason for Status"
                          value={appeal.statusReason}
                          multiline
                        />
                      )}

                      {appeal.supportingDocuments.length > 0 && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{
                              mb: 1,
                              color: "text.primary",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <DescriptionIcon fontSize="small" />
                            Supporting Documents
                          </Typography>
                          <Box sx={{ pl: 3 }}>
                            {appeal.supportingDocuments.map((doc, index) => (
                              <Paper
                                key={index}
                                sx={{
                                  p: 1.5,
                                  mb: 1,
                                  backgroundColor: alpha("#667eea", 0.05),
                                  border: "1px solid",
                                  borderColor: alpha("#667eea", 0.2),
                                  borderRadius: 1,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    backgroundColor: alpha("#667eea", 0.1),
                                    transform: "translateY(-1px)",
                                  },
                                }}
                                onClick={() => window.open(doc, "_blank")}
                              >
                                <Typography
                                  variant="body2"
                                  color="primary"
                                  fontWeight={500}
                                >
                                  📄 File {index + 1}
                                </Typography>
                              </Paper>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Original Report Information */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "fit-content",
                    background:
                      "linear-gradient(145deg, #fff7ed 0%, #ffffff 100%)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: alpha("#f59e0b", 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <GavelIcon sx={{ color: "#f59e0b", fontSize: 24 }} />
                      </Box>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ color: "#f59e0b" }}
                      >
                        Original Violation Report
                      </Typography>
                    </Box>

                    {isReportLoading ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 4,
                        }}
                      >
                        <PageLoadingIndicator />
                      </Box>
                    ) : !report ? (
                      <Box sx={{ py: 4 }}>
                        <NotFoundOne caption="Report not found for this tracking number" />
                      </Box>
                    ) : (
                      <Stack spacing={2.5}>
                        <ModernDetailItem
                          icon={<PersonIcon />}
                          label="Full Name"
                          value={report.fullname}
                        />
                        <ModernDetailItem
                          icon={<PersonIcon />}
                          label="Address"
                          value={report.address}
                        />
                        <ModernDetailItem
                          icon={<PersonIcon />}
                          label="Phone Number"
                          value={report.phoneNumber}
                        />
                        <ModernDetailItem
                          icon={<PersonIcon />}
                          label="License Number"
                          value={report.licenseNumber}
                        />
                        <ModernDetailItem
                          icon={<PersonIcon />}
                          label="Plate Number"
                          value={report.plateNumber}
                        />
                        <ModernDetailItem
                          icon={<CalendarTodayIcon />}
                          label="Report Date"
                          value={
                            report.createdAt
                              ? FormatDate(report.createdAt)
                              : "N/A"
                          }
                        />

                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          <Chip
                            label={`Status: ${report.status ?? "Submitted"}`}
                            color={
                              report.status === "Paid" ? "success" : "warning"
                            }
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                          <Chip
                            label={`Payment: ${
                              report.paymentStatus ?? "Pending"
                            }`}
                            color={
                              report.paymentStatus === "Completed"
                                ? "success"
                                : "warning"
                            }
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>

                        {report.violations.length > 0 && (
                          <Box>
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              sx={{
                                mb: 2,
                                color: "text.primary",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <GavelIcon fontSize="small" />
                              Violations ({report.violations.length})
                            </Typography>
                            <Stack spacing={1.5}>
                              {report.violations.map((violation, index) => (
                                <Paper
                                  key={index}
                                  sx={{
                                    p: 2,
                                    backgroundColor: alpha("#dc2626", 0.05),
                                    border: "1px solid",
                                    borderColor: alpha("#dc2626", 0.2),
                                    borderRadius: 1.5,
                                    borderLeft: "4px solid #dc2626",
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    color="error.main"
                                  >
                                    {violation.violationName}
                                  </Typography>
                                  <Box
                                    sx={{ display: "flex", gap: 2, mt: 0.5 }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Offense:{" "}
                                      <strong>
                                        {getOffenseText(violation.repetition)}
                                      </strong>
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Fine:{" "}
                                      <strong>
                                        ₱{violation.price.toLocaleString()}
                                      </strong>
                                    </Typography>
                                  </Box>
                                </Paper>
                              ))}

                              <Paper
                                sx={{
                                  p: 2,
                                  backgroundColor: alpha("#059669", 0.05),
                                  border: "1px solid",
                                  borderColor: alpha("#059669", 0.2),
                                  borderRadius: 1.5,
                                  textAlign: "center",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  fontWeight={700}
                                  color="success.main"
                                >
                                  Total Fine: ₱
                                  {report.violations
                                    .reduce(
                                      (total, v) =>
                                        total + v.price * v.repetition,
                                      0
                                    )
                                    .toLocaleString()}
                                </Typography>
                              </Paper>
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          Close
        </Button>
        {appeal?.status === "Pending" && (
          <>
            <Button
              variant="contained"
              color="warning" // **FIX: Changed to "warning" for Yellow**
              onClick={handleReject}
              disabled={updateAppealStatusMutation.isPending}
              sx={{
                borderRadius: 1,
                px: 4,
                py: 1,
                fontWeight: 600,
              }}
            >
              Reject Appeal
            </Button>
            <Button
              variant="contained"
              color="success" // **FIX: Changed to "success" for Green**
              onClick={handleApprove}
              disabled={updateAppealStatusMutation.isPending}
              sx={{
                borderRadius: 1,
                px: 4,
                py: 1,
                fontWeight: 600,
              }}
            >
              Approve Appeal
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

interface IModernDetailItem {
  icon: React.ReactNode;
  label: string;
  value?: string;
  multiline?: boolean;
}

const ModernDetailItem: React.FC<IModernDetailItem> = ({
  icon,
  label,
  value,
  multiline = false,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: multiline ? "flex-start" : "center",
        gap: 2,
        p: 1.5,
        borderRadius: 1.5,
        backgroundColor: alpha("#f8fafc", 0.5),
        border: "1px solid",
        borderColor: alpha("#e2e8f0", 0.8),
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: alpha("#f1f5f9", 0.8),
          borderColor: alpha("#cbd5e1", 0.8),
        },
      }}
    >
      <Box
        sx={{
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          minWidth: 20,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            fontSize: "0.7rem",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
            fontWeight: 500,
            wordBreak: multiline ? "break-word" : "normal",
            mt: 0.25,
          }}
        >
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );
};