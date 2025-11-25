import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { Balance } from "@mui/icons-material";
import { useRecentActivity } from "../hooks";
import { format } from "date-fns";

// Reports with Appeals Component - Requirement 10
const ReportsWithAppeals: React.FC = () => {
  const { reportsWithAppeals, isLoading } = useRecentActivity();

  if (isLoading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Reports with Appeals
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
          <Balance
            sx={{ mr: 1, verticalAlign: "middle", color: "info.main" }}
          />
          Reports with Appeals
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ mt: 2, maxHeight: 300 }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Tracking Number</TableCell>
                <TableCell>Plate Number</TableCell>
                <TableCell>Driver Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportsWithAppeals.slice(0, 5).map((violation, index) => (
                <TableRow key={index} hover>
                  <TableCell>{violation.trackingNumber || 'N/A'}</TableCell>
                  <TableCell>{violation.plateNumber}</TableCell>
                  <TableCell>{violation.fullname}</TableCell>
                  <TableCell>
                    {violation.createdAt
                      ? format(violation.createdAt instanceof Date ? violation.createdAt : violation.createdAt.toDate(), "MMM dd, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Has Appeal"
                      size="small"
                      color="info"
                      icon={<Balance sx={{ color: "info.main" }} />}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {reportsWithAppeals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No reports with appeals found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ReportsWithAppeals;
