import { Box, Button, Card, Typography, styled, CircularProgress } from "@mui/material";
import { FC, useEffect, useState, useCallback } from "react";
import { User } from "utils/interfaces";
import { useApiRequest } from "hooks/useApi"; // Adjust path to your hook
import { ENDPOINTS } from "utils/endpoints"; // Adjust path to your endpoints
import CustomModal from "components/base/modal"; // Adjust path to your CustomModal component

// Define Transaction type based on API response
interface Transaction {
  _id: string;
  transactionId: string;
  companyName: string;
  userId: string;
  status: "pending" | "completed" | "failed";
  amount: number;
  currencyType: "fiat" | "crypto";
  cryptoCurrency?: "usdt" | "btc" | "eth";
  proofUrl: string;
  createdAt: string;
  updatedAt: string;
  transactionDetails: Record<string, string>;
  __v: number;
}

// Define API response type for transactions
interface TransactionResponse {
  success: boolean;
  transactions: Transaction[];
}

// Define CoinGecko API response type
interface ExchangeRateResponse {
  bitcoin?: { usd: number };
  ethereum?: { usd: number };
  tether?: { usd: number };
}

// Define total investment breakdown
interface InvestmentTotals {
  fiat: number;
  btc: number;
  eth: number;
  usdt: number;
  totalUsd: number;
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

const StatusBadge = styled(Typography)<{ status: string }>(({ theme, status }) => ({
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

const ViewButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textTransform: "none",
}));

const InvestmentCard: FC<{ user: User }> = ({ user }) => {
  const { data: transactionData, loading: transactionLoading, error: transactionError, callApi: callTransactionApi } = useApiRequest<TransactionResponse>();
  const { data: exchangeData, loading: exchangeLoading, error: exchangeError, callApi: callExchangeApi } = useApiRequest<ExchangeRateResponse>();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTotalModalOpen, setIsTotalModalOpen] = useState(false);

  // Fetch transactions
  useEffect(() => {
    callTransactionApi({
      url: user && `${ENDPOINTS.TRANSACTIONS}?userId=${user._id}`,
      method: "GET",
    });
  }, [callTransactionApi, user && user._id]);

  // Fetch exchange rates when total investment modal is opened
  const fetchExchangeRates = useCallback(() => {
    callExchangeApi({
      url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd",
      method: "GET",
    });
  }, [callExchangeApi]);

  // Calculate total investments
  const calculateTotals = useCallback((): InvestmentTotals => {
    if (!transactionData || !transactionData.transactions || !exchangeData) {
      return { fiat: 0, btc: 0, eth: 0, usdt: 0, totalUsd: 0 };
    }

    const totals: InvestmentTotals = { fiat: 0, btc: 0, eth: 0, usdt: 0, totalUsd: 0 };
    const rates = {
      btc: exchangeData.bitcoin?.usd || 0,
      eth: exchangeData.ethereum?.usd || 0,
      usdt: exchangeData.tether?.usd || 0,
    };

    (user && transactionData.transactions
      .filter((tx) => tx.userId === user._id)
      .forEach((tx) => {
        if (tx.currencyType === "fiat") {
          totals.fiat += tx.amount;
          totals.totalUsd += tx.amount; // Assume fiat is USD
        } else if (tx.currencyType === "crypto" && tx.cryptoCurrency) {
          totals[tx.cryptoCurrency] += tx.amount;
          totals.totalUsd += tx.amount * rates[tx.cryptoCurrency];
        }
      }));

    return totals;
  }, [transactionData, exchangeData, user && user._id]);

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

  // Filter transactions to ensure uniqueness and user match
  const uniqueTransactions = user && transactionData?.transactions
    ? Array.from(
        new Map(transactionData.transactions.map((tx) => [tx.transactionId, tx])).values()
      ).filter((tx) => tx.userId === user._id)
    : [];


  return (
    <TransactionCard>
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

      <ViewButton variant="contained" color="primary" onClick={handleTotalModalOpen}>
        View Total Investment
      </ViewButton>

      {/* Modal for transaction details */}
      <CustomModal
        open={!!selectedTransaction}
        title="Transaction Details"
        onCancel={handleModalClose}
        noConfirm
      >
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
              {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
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
            {/* <Typography variant="body2" mb={1}>
              <strong>Transaction Details:</strong>{" "}
              {Object.keys(selectedTransaction.transactionDetails).length > 0
                ? JSON.stringify(selectedTransaction.transactionDetails)
                : "None"}
            </Typography> */}
          </Box>
        )}
      </CustomModal>

      {/* Modal for total investment */}
      <CustomModal
        open={isTotalModalOpen}
        title="Total Investment"
        onCancel={handleTotalModalClose}
        noConfirm
      >
        {exchangeLoading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}
        {exchangeError && (
          <Typography color="error" variant="body2" mb={2}>
            Error fetching exchange rates: {exchangeError.message}
          </Typography>
        )}
        {!exchangeLoading && !exchangeError && (
          <Box>
            {(() => {
              const totals = calculateTotals();
              return (
                <>
                  <Typography variant="body2" mb={1}>
                    <strong>Total Fiat (USD):</strong> ${totals.fiat.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Total BTC:</strong> {totals.btc.toFixed(8)} (~${(totals.btc * (exchangeData?.bitcoin?.usd || 0)).toFixed(2)})
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Total ETH:</strong> {totals.eth.toFixed(8)} (~${(totals.eth * (exchangeData?.ethereum?.usd || 0)).toFixed(2)})
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Total USDT:</strong> {totals.usdt.toFixed(2)} (~${(totals.usdt * (exchangeData?.tether?.usd || 0)).toFixed(2)})
                  </Typography>
                  <Typography variant="body2" fontWeight={600} mt={2}>
                    <strong>Total in USD:</strong> ${totals.totalUsd.toFixed(2)}
                  </Typography>
                </>
              );
            })()}
          </Box>
        )}
      </CustomModal>
    </TransactionCard>
  );
};

export default InvestmentCard;