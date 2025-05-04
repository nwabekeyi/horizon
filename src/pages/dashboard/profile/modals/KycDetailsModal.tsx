import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";
import { FC } from "react";
import CustomModal from "components/base/modal"; // Adjust path
import { Action } from "../Account"; // Import Action type from Account.tsx

interface KycDetailsModalProps {
  open: boolean;
  kycDocumentType: string;
  kycError: string;
  dispatch: React.Dispatch<Action>;
  onCancel: () => void;
  onConfirm: () => void;
}

const KycDetailsModal: FC<KycDetailsModalProps> = ({
  open,
  kycDocumentType,
  kycError,
  dispatch,
  onCancel,
  onConfirm,
}) => {
  return (
    <CustomModal
      open={open}
      title="Add KYC Details"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="document-type-label">Document Type</InputLabel>
          <Select
            labelId="document-type-label"
            value={kycDocumentType}
            label="Document Type"
            onChange={(e) => dispatch({ type: "SET_KYC_DOCUMENT_TYPE", payload: e.target.value })}
            aria-label="Select document type"
          >
            <MenuItem value="driver_license">Driver's License</MenuItem>
            <MenuItem value="passport">Passport</MenuItem>
            <MenuItem value="national_id">National ID Card</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" fontWeight="medium" color="text.primary">
          Document Front
        </Typography>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => dispatch({ type: "SET_DOCUMENT_FRONT", payload: e.target.files?.[0] || null })}
          style={{ marginBottom: 16 }}
          aria-label="Upload document front"
        />
        <Typography variant="body2" fontWeight="medium" color="text.primary">
          Document Back
        </Typography>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => dispatch({ type: "SET_DOCUMENT_BACK", payload: e.target.files?.[0] || null })}
          style={{ marginBottom: 16 }}
          aria-label="Upload document back"
        />
        <Typography variant="body2" fontWeight="medium" color="text.primary">
          Address Proof
        </Typography>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => dispatch({ type: "SET_ADDRESS_PROOF", payload: e.target.files?.[0] || null })}
          style={{ marginBottom: 16 }}
          aria-label="Upload address proof"
        />
        {kycError && (
          <Typography variant="caption" color="error">
            {kycError}
          </Typography>
        )}
      </Box>
    </CustomModal>
  );
};

export default KycDetailsModal;