import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import useViolationsStore from "../store";
import { Transition } from "../../../../shared/transition";
import { useDeleteReport } from "../hooks";
import { mainColor } from "../../../../../themes/colors";

export const DeleteConfimationDialog: React.FC = () => {
  const deleteReport = useDeleteReport();
  const {
    isDeleteConfirmationDialogOpen,
    selectedReport,
    setSelectedReport,
    setDeleteConfirmationDialog,
  } = useViolationsStore();
  const handleClose = () => {
    setDeleteConfirmationDialog(false);
    setSelectedReport(undefined);
  };
  const handleDelete = () => {
    if (selectedReport?.documentId) {
      deleteReport.mutate(selectedReport.documentId, {
        onSuccess: () => {
          handleClose();
        },
      });
    }
  };
  return (
    <>
      <Dialog
        fullWidth
        maxWidth={"xs"}
        open={isDeleteConfirmationDialogOpen}
        slots={{
          transition: Transition,
        }}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        sx={{
          color: "primary.main",
        }}
      >
        <DialogContent>
          <Typography
            variant="h6"
            sx={{
              mb: 1,
            }}
            fontWeight={600}
          >
            Delete ${selectedReport?.trackingNumber}?
          </Typography>
          <Typography>This action cannot be undone?</Typography>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            loading={deleteReport.isPending}
            variant="contained"
            sx={{
              backgroundColor: mainColor.accent,
            }}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
