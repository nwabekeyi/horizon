// src/pages/dashboard/profile/modals/TransactionDetailsModal.tsx

import { FC } from "react";
import { Box, Typography, styled } from "@mui/material";
import CustomModal from "components/base/modal";
import { Transaction } from "../Interfaces";

// Styled components
export const StatusBadge = styled(Typography)<{ status: string }>(({ theme, status }) => ({
  fontSize: 12,
  fontWeight: 500,
  padding: "4px 8px",
  borderRadius: "12px",
  color: "white",
  backgroundColor:
    status === "completed"
      ? theme.palette.success.main
      : status === "pending"
      ? theme.palette.warning.main
      : theme.palette.error.main,
}));

interface TransactionDetailsModalProps {
  selectedTransaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailsModal: FC<TransactionDetailsModalProps> = ({
  selectedTransaction,
  onClose,
}) => (
  <CustomModal open={!!selectedTransaction} title="Transaction Details" onCancel={onClose} noConfirm>
    {selectedTransaction && (
      <Box>
        <Typography variant="body2" mb={1}>
          <strong>Company:</strong> {selectedTransaction.companyName}
        </Typography>
        <Typography variant="body2" mb={1}>
          <strong>Transaction ID:</strong> {selectedTransaction.transactionId}
        </Typography>
        <Typography variant="body2" mb={1}>
          <strong>Amount:</strong>{" "}
          {selectedTransaction.amount.toFixed(2)}{" "}
          {selectedTransaction.currencyType === "crypto" && selectedTransaction.cryptoCurrency
            ? selectedTransaction.cryptoCurrency.toUpperCase()
            : selectedTransaction.currencyType.toUpperCase()}
        </Typography>
        <Typography variant="body2" mb={1}>
          <strong>Status:</strong>{" "}
          <StatusBadge status={selectedTransaction.status}>
            {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
          </StatusBadge>
        </Typography>
        <Typography variant="body2" mb={1}>
          <strong>Currency:</strong>{" "}
          {selectedTransaction.currencyType === "crypto" && selectedTransaction.cryptoCurrency
            ? selectedTransaction.cryptoCurrency.toUpperCase()
            : selectedTransaction.currencyType.toUpperCase()}
        </Typography>
        <Typography variant="body2" mb={1}>
          <strong>Proof URL:</strong>{" "}
          <a href={selectedTransaction.proofUrl} target="_blank" rel="noopener noreferrer">
            View Proof
          </a>
        </Typography>
        <Typography variant="body2" mb={1}>
          <strong>Created At:</strong>{" "}
          {new Date(selectedTransaction.createdAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Typography>
        <Typography variant="body2" mb={1}>
          <strong>Updated At:</strong>{" "}
          {new Date(selectedTransaction.updatedAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Typography>
      </Box>
    )}
  </CustomModal>
);