import type React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import {
  Box,
  Button,
  Divider,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  alpha,
  IconButton,
} from "@mui/material";
import useViolationsStore from "../store";
import { FormatDate } from "../../../../../utils/date_formatter";
import {
  getStatusColor,
  getDisplayStatus,
  statusChipStyles,
} from "../../../../../utils/status_utils";
import {
  CheckBox,
  Close as CloseIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Gavel as GavelIcon,
  CameraAlt as CameraAltIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { mainColor } from "../../../../../themes/colors";
import { Transition } from "../../../../shared/transition";

export const FullDetailsDialog: React.FC = () => {
  const {
    isFullDetailDialogOpen,
    selectedReport,
    setFullDetailDialogOpen,
    setSelectedReport,
  } = useViolationsStore();

  const handleClose = () => {
    setFullDetailDialogOpen(false);
    setSelectedReport(undefined);
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth={"lg"}
        open={isFullDetailDialogOpen}
        slots={{
          transition: Transition,
        }}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundImage: "none",
          },
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                color="primary"
                sx={{ mb: 1 }}
              >
                Violation Report Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete information about the violation report
              </Typography>
            </Box>
            <IconButton onClick={handleClose} sx={{ color: "text.secondary" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Report Overview Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha("#1976d2", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AssignmentIcon sx={{ color: "#1976d2", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="primary">
                  Report Overview
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <ModernDetailItem
                    label="Tracking Number"
                    value={selectedReport?.trackingNumber}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <ModernDetailItem
                    label="Date Created"
                    value={FormatDate(selectedReport?.createdAt)}
                  />
                </Grid>

                {/* ✅ ADDED: Payment Due Date Field */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontSize: "0.7rem",
                        mb: 1,
                        display: "block",
                      }}
                    >
                      Payment Due Date
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedReport?.dueDate ? "red" : "text.primary",
                        fontWeight: selectedReport?.dueDate ? 700 : 500,
                      }}
                    >
                      {FormatDate(selectedReport?.dueDate)}
                    </Typography>
                  </Box>
                </Grid>
                {/* ✅ END OF NEW CODE BLOCK */}

                <Grid size={{ xs: 12, md: 3 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontSize: "0.7rem",
                        mb: 1,
                        display: "block",
                      }}
                    >
                      Status
                    </Typography>
                    <Chip
                      label={getDisplayStatus(selectedReport?.status)}
                      color={getStatusColor(selectedReport?.status)}
                      sx={statusChipStyles}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha("#2e7d32", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon sx={{ color: "#2e7d32", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="primary">
                  Personal Information
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <ModernDetailItem
                    label="Full Name"
                    value={selectedReport?.fullname}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <ModernDetailItem
                    label="Phone Number"
                    value={selectedReport?.phoneNumber}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <ModernDetailItem
                    label="Address"
                    value={selectedReport?.address}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {/* License and Plate Information Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha("#ed6c02", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BadgeIcon sx={{ color: "#ed6c02", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="primary">
                  License and Plate Information
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ModernPhotoItem
                    label="License Number"
                    value={selectedReport?.licenseNumber}
                    imageUrl={selectedReport?.licensePhoto}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ModernPhotoItem
                    label="Plate Number"
                    value={selectedReport?.plateNumber}
                    imageUrl={selectedReport?.platePhoto}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Violations Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
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
                  <GavelIcon sx={{ color: "#d32f2f", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="primary">
                  Violations ({selectedReport?.violations.length || 0})
                </Typography>
              </Box>

              <Stack spacing={2}>
                {selectedReport?.violations.map((violation, index) => (
                  <ModernViolationItem
                    key={index}
                    name={violation.violationName}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Evidence Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha("#7b1fa2", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CameraAltIcon sx={{ color: "#7b1fa2", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="primary">
                  Evidence Photo
                </Typography>
              </Box>

              {selectedReport?.evidencePhoto && (
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <img
                    src={selectedReport.evidencePhoto}
                    alt="Evidence photo"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "400px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, backgroundColor: alpha("#f8fafc", 0.5) }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

interface IModernDetailItem {
  label: string;
  value?: string | null;
}

const ModernDetailItem: React.FC<IModernDetailItem> = ({ label, value }) => {
  return (
    <Box>
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontSize: "0.7rem",
          mb: 1,
          display: "block",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "text.primary",
          fontWeight: 500,
        }}
      >
        {value || "N/A"}
      </Typography>
    </Box>
  );
};

interface IModernPhotoItem {
  label: string;
  value?: string | null;
  imageUrl?: string | null;
}

const ModernPhotoItem: React.FC<IModernPhotoItem> = ({
  label,
  value,
  imageUrl,
}) => {
  return (
    <Box>
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontSize: "0.7rem",
          mb: 1,
          display: "block",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "text.primary",
          fontWeight: 500,
          mb: 2,
        }}
      >
        {value || "N/A"}
      </Typography>

      {imageUrl && (
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "#f5f5f5",
            maxWidth: "300px",
          }}
        >
          <img
            src={imageUrl}
            alt={`${label} photo`}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "200px",
              objectFit: "cover",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

interface IModernViolationItem {
  name: string;
}

const ModernViolationItem: React.FC<IModernViolationItem> = ({ name }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: alpha("#f5f5f5", 0.5),
        border: "1px solid",
        borderColor: alpha("#e0e0e0", 0.8),
      }}
    >
      <CheckBox
        sx={{
          color: mainColor.tertiary,
        }}
      />
      <Typography variant="body2" fontWeight={500}>
        {name}
      </Typography>
    </Box>
  );
};
