import { Box, Button, Card, Typography, styled, CircularProgress, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { FC, useEffect, useState, useCallback } from "react";
import { User, PaymentDetail } from "utils/interfaces"; // Import updated interfaces
import { useApiRequest } from "hooks/useApi"; // Adjust path to your hook
import { ENDPOINTS } from "utils/endpoints"; // Adjust path to your endpoints
import CustomModal from "components/base/modal"; // Adjust path to your CustomModal component
import { MultiStepFlow } from "components/common/multiStepFlow"; // Adjust path to MultiStepFlow component

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
  const { data: transactionData, loading: transactionLoading, error: transactionError, callApi: callTransactionApi } = useApiRequest<TransactionResponse>();
  const { data: exchangeData, loading: exchangeLoading, error: exchangeError, callApi: callExchangeApi } = useApiRequest<ExchangeRateResponse>();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTotalModalOpen, setIsTotalModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number | "">(""); // Use index since no _id
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [amountError, setAmountError] = useState<string>("");


  console.log(user)
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

  // Calculate total investments
  const calculateTotals = useCallback((): InvestmentTotals => {
    if (!transactionData || !transactionData.transactions || !exchangeData || !user) {
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
          totals.totalUsd += tx.amount; // Assume fiat is USD
        } else if (tx.currencyType === "crypto" && tx.cryptoCurrency) {
          totals[tx.cryptoCurrency] += tx.amount;
          totals.totalUsd += tx.amount * rates[tx.cryptoCurrency];
        }
      });

    return totals;
  }, [transactionData, exchangeData, user?._id]);

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
    setSelectedAccountIndex("");
    setWithdrawAmount("");
    setAmountError("");
  };

  // Validate payment detail
  const validatePaymentDetail = (detail: PaymentDetail): boolean => {
    if (detail.type === "fiat") {
      return !!(
        detail.accountDetails.bankName &&
        detail.accountDetails.accountNumber &&
        detail.accountDetails.accountName
      );
    } else if (detail.type === "crypto") {
      return !!detail.accountDetails.address;
    }
    return false;
  };

  // Check if there are any valid payment details
  const hasValidPaymentDetails = user && user.paymentDetails && user.paymentDetails.some(validatePaymentDetail);

  // Validate amount
  const validateAmount = () => {
    const amount = parseFloat(withdrawAmount);
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

  // MultiStepFlow steps
  const withdrawSteps = [
    {
      label: "Select Account",
      content: (
        <Box>
          {hasValidPaymentDetails ? (
            <FormControl fullWidth>
              <InputLabel id="account-select-label">Select Account</InputLabel>
              <Select
                labelId="account-select-label"
                value={selectedAccountIndex}
                label="Select Account"
                onChange={(e) => setSelectedAccountIndex(Number(e.target.value))}
                aria-label="Select withdrawal account"
              >
                {user?.paymentDetails
                  .map((detail, index) => ({ detail, index }))
                  .filter(({ detail }) => validatePaymentDetail(detail))
                  .map(({ detail, index }) => (
                    <MenuItem key={index} value={index}>
                      {detail.type === "fiat"
                        ? detail.currency
                          ? `${detail.currency.toUpperCase()} - ${detail.accountDetails.bankName || "N/A"} (${detail.accountDetails.accountNumber || "N/A"})`
                          : "Currency not specified"
                        : detail.type === "crypto"
                        ? detail.currency
                          ? `${detail.currency.toUpperCase()} - ${detail.accountDetails.address || "N/A"}`
                          : "Currency not specified"
                        : "Unknown payment type"}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : (
            <Box>
              <Typography variant="body2" color="error" mb={2}>
                No valid withdrawal details found. Please add details in account settings.
              </Typography>
              <Button
                variant="text"
                color="primary"
                href="/account/settings"
                aria-label="Go to account settings"
              >
                Go to Account Settings
              </Button>
            </Box>
          )}
        </Box>
      ),
      validate: () => {
        if (selectedAccountIndex === "" || !user || !user.paymentDetails) {
          return false;
        }
        const selectedDetail = user.paymentDetails[selectedAccountIndex];
        return !!selectedDetail && validatePaymentDetail(selectedDetail);
      },
      disableNext: !hasValidPaymentDetails || selectedAccountIndex === "" || !user || !user.paymentDetails || !user.paymentDetails[selectedAccountIndex] || !validatePaymentDetail(user.paymentDetails[selectedAccountIndex]),
    },
    {
      label: "Enter Amount",
      content: (
        <Box>
          <TextField
            fullWidth
            label={`Withdrawal Amount (${user && selectedAccountIndex !== "" ? user.paymentDetails[selectedAccountIndex].currency.toUpperCase() : "USD"})`}
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
          />
          <Typography variant="caption" color="text.secondary" mt={1}>
            Available Balance: ${(user?.accountBalance || 0).toFixed(2)}
          </Typography>
        </Box>
      ),
      validate: validateAmount,
    },
  ];

  // Handle withdraw submission (placeholder for future API call)
  const handleWithdrawSubmit = () => {
    if (user && selectedAccountIndex !== "") {
      const selectedAccount = user.paymentDetails[selectedAccountIndex];
      console.log("Withdrawal Request:", {
        account: selectedAccount,
        amount: parseFloat(withdrawAmount),
      });
    }
    handleWithdrawModalClose();
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

      {/* Modal for withdraw funds */}
      <CustomModal
        open={isWithdrawModalOpen}
        title="Withdraw Funds"
        onCancel={handleWithdrawModalClose}
        noConfirm
      >
        <MultiStepFlow
          steps={withdrawSteps}
          onSubmit={handleWithdrawSubmit}
          initialStep="1"
        />
      </CustomModal>
    </TransactionCard>
  );
};

export default InvestmentCard;