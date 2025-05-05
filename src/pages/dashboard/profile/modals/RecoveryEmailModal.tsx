import { Box, TextField, Typography } from "@mui/material";
import { FC } from "react";
import CustomModal from "components/base/modal"; // Adjust path
import { Action } from "../Account"; // Import Action type from Account.tsx

interface RecoveryEmailModalProps {
  open: boolean;
  recoveryEmail: string;
  recoveryEmailError: string;
  dispatch: React.Dispatch<Action>;
  onCancel: () => void;
  onConfirm: () => void;
}

const RecoveryEmailModal: FC<RecoveryEmailModalProps> = ({
  open,
  recoveryEmail,
  recoveryEmailError,
  dispatch,
  onCancel,
  onConfirm,
}) => {
  return (
    <CustomModal
      open={open}
      title="Add Recovery Email"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth
          label="Recovery Email"
          type="email"
          value={recoveryEmail}
          onChange={(e) => dispatch({ type: "SET_RECOVERY_EMAIL", payload: e.target.value })}
          aria-label="Recovery email"
        />
        {recoveryEmailError && (
          <Typography variant="caption" color="error">
            {recoveryEmailError}
          </Typography>
        )}
      </Box>
    </CustomModal>
  );
};

export default RecoveryEmailModal;