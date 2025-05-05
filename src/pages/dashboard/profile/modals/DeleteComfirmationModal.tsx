import { Box, Typography } from "@mui/material";
import { FC } from "react";
import CustomModal from "components/base/modal"; // Adjust path

interface DeleteConfirmationModalProps {
  open: boolean;
  paymentError: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({
  open,
  paymentError,
  onCancel,
  onConfirm,
}) => {
  return (
    <CustomModal
      open={open}
      title="Confirm Delete"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body1" color="text.primary">
          Are you sure you want to delete this payment detail? This action cannot be undone.
        </Typography>
        {paymentError && (
          <Typography variant="caption" color="error">
            {paymentError}
          </Typography>
        )}
      </Box>
    </CustomModal>
  );
};

export default DeleteConfirmationModal;