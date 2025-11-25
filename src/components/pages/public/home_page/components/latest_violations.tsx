import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Paper,
  Skeleton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
import { useRecentActivity } from "../hooks";
import { format } from "date-fns";
import {
  getStatusColor,
  statusChipStyles,
} from "../../../../../utils/status_utils";

// Latest Violations Component - Requirement 5
const LatestViolations: React.FC = () => {
  const { latestViolations, isLoading } = useRecentActivity();

  if (isLoading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Latest Violations
          </Typography>
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Warning
            sx={{ mr: 1, verticalAlign: "middle", color: "warning.main" }}
          />
          Latest Violations
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ mt: 2, maxHeight: 300 }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Plate Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {latestViolations.slice(0, 5).map((violation, index) => (
                <TableRow key={index} hover>
                  <TableCell>{violation.plateNumber}</TableCell>
                  <TableCell>
                    {violation.createdAt
                      ? format(violation.createdAt instanceof Date ? violation.createdAt : violation.createdAt.toDate(), "MMM dd, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={violation.paymentStatus}
                      size="small"
                      color={getStatusColor(violation.paymentStatus)}
                      sx={statusChipStyles}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default LatestViolations;
