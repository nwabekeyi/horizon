// src/pages/dashboard/profile/InvestmentCard.tsx

import { FC, useEffect, useState, useCallback } from "react";
import { Box, Card, CircularProgress, Typography, styled, Button } from "@mui/material";
import { User } from "utils/interfaces";
import { useApiRequest } from "hooks/useApi";
import { ENDPOINTS } from "utils/endpoints";
import {
  Transaction,
  TransactionResponse,
  ExchangeRateResponse,
  BrokerFeeResponse,
  InvestmentTotals,
} from "./Interfaces";
import { TransactionDetailsModal, StatusBadge } from "./modals/TransactionDetailsModal";
import { TotalInvestmentModal } from "./modals/TotalInvestmentsModal"; // Fixed import
import { WithdrawFundsModal } from "./modals/WithdrawFundsModal";

// Interface for withdrawal API response
interface WithdrawalResponse {
  message: string;
  withdrawalId: string;
  brokerFeeProofUrl: string;
}

// Styled components
const TransactionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const TransactionRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderRadius: "8px",
  backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[800],
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[200] : theme.palette.grey[700],
  },
}));

const ViewButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginRight: theme.spacing(1),
  textTransform: "none",
}));

const SummaryBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  borderRadius: "8px",
  backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
  marginBottom: theme.spacing(3),
}));

const InvestmentCard: FC<{ user: User }> = ({ user }) => {
  const {
    data: transactionData,
    loading: transactionLoading,
    error: transactionError,
    callApi: callTransactionApi,
  } = useApiRequest<TransactionResponse>();
  const {
    data: exchangeData,
    loading: exchangeLoading,
    error: exchangeError,
    callApi: callExchangeApi,
  } = useApiRequest<ExchangeRateResponse>();
  const {
    data: brokerFeeData,
    loading: brokerFeeLoading,
    error: brokerFeeError,
    callApi: callBrokerFeeApi,
  } = useApiRequest<BrokerFeeResponse>();
  const { callApi: callWithdrawApi } = useApiRequest<WithdrawalResponse>();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTotalModalOpen, setIsTotalModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Fetch transactions
  useEffect(() => {
    if (user?._id) {
      callTransactionApi({
        url: `${ENDPOINTS.TRANSACTIONS}?userId=${user._id}`,
        method: "GET",
      });
    }
  }, [callTransactionApi, user?._id]);

  // Fetch exchange rates when total investment modal is opened
  const fetchExchangeRates = useCallback(() => {
    callExchangeApi({
      url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd",
      method: "GET",
    });
  }, [callExchangeApi]);

  // Fetch broker fee when withdraw modal opens
  useEffect(() => {
    if (isWithdrawModalOpen) {
      callBrokerFeeApi({
        url: ENDPOINTS.BROKER_FEE,
        method: "GET",
      });
    }
  }, [isWithdrawModalOpen, callBrokerFeeApi]);

  // Calculate total investments
  const calculateTotals = useCallback((): InvestmentTotals => {
    if (!transactionData?.transactions || !exchangeData || !user) {
      return { fiat: 0, btc: 0, eth: 0, usdt: 0, totalUsd: 0 };
    }

    const totals: InvestmentTotals = { fiat: 0, btc: 0, eth: 0, usdt: 0, totalUsd: 0 };
    const rates = {
      btc: exchangeData.bitcoin?.usd || 0,
      eth: exchangeData.ethereum?.usd || 0,
      usdt: exchangeData.tether?.usd || 0,
    };

    transactionData.transactions
      .filter((tx) => tx.userId === user._id)
      .forEach((tx) => {
        if (tx.currencyType === "fiat") {
          totals.fiat += tx.amount;
          totals.totalUsd += tx.amount;
        } else if (tx.currencyType === "crypto" && tx.cryptoCurrency) {
          totals[tx.cryptoCurrency] += tx.amount;
          totals.totalUsd += tx.amount * rates[tx.cryptoCurrency];
        }
      });

    return totals;
  }, [transactionData, exchangeData, user]);

  // Handle transaction click
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  // Handle total investment modal
  const handleTotalModalOpen = () => {
    fetchExchangeRates();
    setIsTotalModalOpen(true);
  };

  const handleTotalModalClose = () => {
    setIsTotalModalOpen(false);
  };

  const handleModalClose = () => {
    setSelectedTransaction(null);
  };

  // Handle withdraw modal
  const handleWithdrawModalOpen = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawModalClose = () => {
    setIsWithdrawModalOpen(false);
  };

  // Filter transactions to ensure uniqueness and user match
  const uniqueTransactions = user && transactionData?.transactions
    ? Array.from(
        new Map(transactionData.transactions.map((tx) => [tx.transactionId, tx])).values()
      ).filter((tx) => tx.userId === user._id)
    : [];

  return (
    <TransactionCard>
      {/* Summary Section */}
      {user ? (
        <SummaryBox>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="text.secondary">
              Account Balance
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              ${(user.accountBalance || 0).toFixed(2)}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="text.secondary">
              Total Investment
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              ${(user.totalInvestment || 0).toFixed(2)}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="text.secondary">
              Total ROI
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              ${(user.totalROI || 0).toFixed(2)}
            </Typography>
          </Box>
        </SummaryBox>
      ) : (
        <Typography variant="body2" color="error" mb={3}>
          User data not available.
        </Typography>
      )}

      <Typography variant="h6" fontWeight={600} mb={2}>
        Transactions
      </Typography>

      {transactionLoading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {transactionError && (
        <Typography color="error" variant="body2" mb={2}>
          Error: {transactionError.message}
        </Typography>
      )}

      {!transactionLoading && !transactionError && uniqueTransactions.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No transactions found for this user.
        </Typography>
      )}

      {!transactionLoading && !transactionError && uniqueTransactions.length > 0 && (
        <Box>
          {uniqueTransactions.map((transaction) => (
            <TransactionRow
              key={transaction.transactionId}
              onClick={() => handleTransactionClick(transaction)}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {transaction.companyName}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="body2" fontWeight={500}>
                  {transaction.amount.toFixed(2)}{" "}
                  {transaction.currencyType === "crypto" && transaction.cryptoCurrency
                    ? transaction.cryptoCurrency.toUpperCase()
                    : transaction.currencyType.toUpperCase()}
                </Typography>
                <StatusBadge status={transaction.status}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </StatusBadge>
              </Box>
            </TransactionRow>
          ))}
        </Box>
      )}

      {user && (
        <Box display="flex">
          <ViewButton variant="contained" color="primary" onClick={handleTotalModalOpen}>
            View Total Investment
          </ViewButton>
          <ViewButton variant="contained" color="secondary" onClick={handleWithdrawModalOpen}>
            Withdraw Funds
          </ViewButton>
        </Box>
      )}

      {/* Modals */}
      <TransactionDetailsModal selectedTransaction={selectedTransaction} onClose={handleModalClose} />
      <TotalInvestmentModal
        isOpen={isTotalModalOpen}
        onClose={handleTotalModalClose}
        exchangeLoading={exchangeLoading}
        exchangeError={exchangeError}
        exchangeData={exchangeData}
        calculateTotals={calculateTotals}
      />
      <WithdrawFundsModal
        isOpen={isWithdrawModalOpen}
        onClose={handleWithdrawModalClose}
        user={user}
        brokerFeeLoading={brokerFeeLoading}
        brokerFeeError={brokerFeeError}
        brokerFeeData={brokerFeeData}
        callApi={callWithdrawApi}
      />
    </TransactionCard>
  );
};

export default InvestmentCard;