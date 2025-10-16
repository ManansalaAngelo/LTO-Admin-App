import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { Transition } from "../../../../shared/transition";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  actionType: "Approve" | "Reject";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  actionType,
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason(""); // Reset reason after confirm
  };

  const handleClose = () => {
    setReason(""); // Reset reason on close
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slots={{ transition: Transition }}
      keepMounted
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Please provide a reason for this action. This will be recorded and
          visible to the user.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="reason"
          label="Reason"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={actionType === "Approve" ? "success" : "error"}
          disabled={!reason.trim()}
        >
          Confirm {actionType}
        </Button>
      </DialogActions>
    </Dialog>
  );
};