// src/pages/dashboard/profile/modals/WithdrawFundsModal.tsx

import { FC, useState } from "react";
import { Box, CircularProgress, TextField, Typography, Button, styled } from "@mui/material";
import CustomModal from "components/base/modal";
import { User } from "utils/interfaces";
import { BrokerFeeResponse } from "../Interfaces";
import { useCompressedDropzone } from "hooks/useDropzoneConfig";
import { ENDPOINTS } from "utils/endpoints";

// Styled components
const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textTransform: "none",
}));

const DropzoneContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: theme.palette.background.default,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  marginBottom: theme.spacing(2),
}));

// Interface for API error
interface ApiError {
  message?: string;
}

// Interface for withdrawal API response
interface WithdrawalResponse {
  message: string;
  withdrawalId: string;
  brokerFeeProofUrl: string;
}

// Interface for callApi parameters
interface ApiRequestParams {
  url: string | null;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: FormData;
  headers?: Record<string, string>;
}

interface WithdrawFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  brokerFeeLoading: boolean;
  brokerFeeError: { message: string } | null;
  brokerFeeData: BrokerFeeResponse | null;
  callApi: (params: ApiRequestParams) => Promise<WithdrawalResponse>;
}

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  isSuccess: boolean;
}

// Result Modal Component
const ResultModal: FC<ResultModalProps> = ({ isOpen, onClose, message, isSuccess }) => (
  <CustomModal
    open={isOpen}
    title={isSuccess ? "Success" : "Error"}
    onCancel={onClose}
    onConfirm={onClose}
  >
    <Typography
      variant="body1"
      color={isSuccess ? "success.main" : "error.main"}
      textAlign="center"
    >
      {message}
    </Typography>
  </CustomModal>
);

export const WithdrawFundsModal: FC<WithdrawFundsModalProps> = ({
  isOpen,
  onClose,
  user,
  brokerFeeLoading,
  brokerFeeError,
  brokerFeeData,
  callApi,
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [amountError, setAmountError] = useState<string>("");
  const [brokerFeeProof, setBrokerFeeProof] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Setup dropzone for broker fee proof
  const { getRootProps, getInputProps, isDragActive } = useCompressedDropzone({
    onFileAccepted: (file) => {
      console.log("Accepted file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      if (file.type !== "image/png") {
        setFileError("Proof must be a PNG file");
        return;
      }
      setBrokerFeeProof(file);
      setFileError("");
    },
    onFileRejected: (reason) => {
      console.log("File rejected:", reason);
      setFileError(reason);
    },
    maxCompressedSizeMB: 5,
  });

  // Calculate broker fee based on amount and broker fee percentage
  const amount = parseFloat(withdrawAmount) || 0;
  const brokerFeePercentage = brokerFeeData?.brokerFee?.fee || 0;
  const calculatedBrokerFee = (amount * brokerFeePercentage) / 100;

  // Validate amount
  const validateAmount = () => {
    if (isNaN(amount) || amount <= 0) {
      setAmountError("Please enter a valid amount");
      return false;
    }
    if (user && amount > (user.accountBalance || 0)) {
      setAmountError("Amount exceeds available balance");
      return false;
    }
    setAmountError("");
    return true;
  };

  // Validate file
  const validateFile = () => {
    if (!brokerFeeProof) {
      setFileError("Please upload proof of broker fee payment");
      return false;
    }
    setFileError("");
    return true;
  };

  // Handle form submission
  const handleWithdrawSubmit = async () => {
    if (!user || !validateAmount() || !validateFile() || !brokerFeeProof) {
      setAmountError("Please complete all required fields");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("user", user._id);
    formData.append("amount", amount.toString());
    formData.append("brokerFee", calculatedBrokerFee.toString());
    formData.append("brokerFeeProof", brokerFeeProof, brokerFeeProof.name);
    formData.append("remarks", "");

    // Log FormData contents for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await callApi({
        url: ENDPOINTS.WITHDRAWALS,
        method: "POST",
        body: formData,
        headers: {
          // Avoid setting Content-Type; let browser handle multipart/form-data
        },
      });
      setResultMessage(response.message);
      setIsSuccess(true);
      setIsResultModalOpen(true);
      onClose(); // Close the withdraw modal
    } catch (error: unknown) {
      console.error("Withdrawal request failed:", error);
      const apiError = error as ApiError;
      setResultMessage(apiError.message || "Failed to submit withdrawal request");
      setIsSuccess(false);
      setIsResultModalOpen(true);
      onClose(); // Close the withdraw modal
    } finally {
      setSubmitting(false);
    }
  };

  // Handle result modal close
  const handleResultModalClose = () => {
    setIsResultModalOpen(false);
    setResultMessage("");
    setIsSuccess(false);
    // Reset form fields
    setWithdrawAmount("");
    setAmountError("");
    setBrokerFeeProof(null);
    setFileError("");
  };

  return (
    <>
      <CustomModal open={isOpen} title="Withdraw Funds" onCancel={onClose} noConfirm>
        <Box>
          {/* Amount Input */}
          <TextField
            fullWidth
            label="Withdrawal Amount (USD)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => {
              setWithdrawAmount(e.target.value);
              setAmountError("");
            }}
            error={!!amountError}
            helperText={amountError}
            inputProps={{ min: 0, step: "0.01" }}
            aria-label="Withdrawal amount"
            sx={{ mb: 2 }}
          />

          {/* Broker Fee Display */}
          {brokerFeeLoading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          )}
          {brokerFeeError && (
            <Typography color="error" variant="body2" mb={2}>
              Error fetching broker fee: {brokerFeeError.message}
            </Typography>
          )}
          {brokerFeeData?.brokerFee && (
            <>
              <Typography variant="body2" mb={1}>
                <strong>Broker Fee Percentage:</strong> {brokerFeeData.brokerFee.fee}% (Updated:{" "}
                {new Date(brokerFeeData.brokerFee.updatedAt).toLocaleDateString()})
              </Typography>
              <Typography variant="body2" mb={2}>
                <strong>Broker Fee Amount:</strong> $
                {calculatedBrokerFee.toFixed(2)} (
                {brokerFeeData.brokerFee.fee}% of ${amount.toFixed(2)})
              </Typography>
            </>
          )}

          {/* Available Balance */}
          <Typography variant="caption" color="text.secondary" mb={2}>
            Available Balance: ${(user?.accountBalance || 0).toFixed(2)}
          </Typography>

          {/* Broker Fee Proof Upload */}
          <Box mb={2}>
            <Typography variant="body2" mb={1}>
              Upload Broker Fee Proof (PNG)
            </Typography>
            <DropzoneContainer {...getRootProps()}>
              <input {...getInputProps()} aria-label="Upload broker fee proof" />
              {isDragActive ? (
                <Typography>Drop the PNG file here...</Typography>
              ) : brokerFeeProof ? (
                <Typography>{brokerFeeProof.name}</Typography>
              ) : (
                <Typography>Drag & drop a PNG file here, or click to select</Typography>
              )}
            </DropzoneContainer>
            {fileError && (
              <Typography color="error" variant="body2" mt={1}>
                {fileError}
              </Typography>
            )}
          </Box>

          {/* Submit Button */}
          <SubmitButton
            variant="contained"
            color="primary"
            onClick={handleWithdrawSubmit}
            disabled={!!amountError || !withdrawAmount || !brokerFeeProof || !!fileError || submitting}
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : "Submit Withdrawal"}
          </SubmitButton>
        </Box>
      </CustomModal>

      {/* Result Modal */}
      <ResultModal
        isOpen={isResultModalOpen}
        onClose={handleResultModalClose}
        message={resultMessage}
        isSuccess={isSuccess}
      />
    </>
  );
};