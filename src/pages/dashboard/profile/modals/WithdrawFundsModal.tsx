import { FC, useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  TextField,
  Typography,
  Button,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CustomModal from 'components/base/modal';
import { User } from 'utils/interfaces';
import { useCompressedDropzone } from 'hooks/useDropzoneConfig';
import { ENDPOINTS } from 'utils/endpoints';
import { useApiRequest } from 'hooks/useApi';

// Interfaces defined locally
interface PaymentAccount {
  _id: string;
  userId: string;
  currency: 'usd' | 'usdt';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  bankSwiftCode?: string;
  walletAddress?: string;
  network?: string;
  createdAt: string;
  updatedAt: string;
}

interface BrokerFeeResponse {
  brokerFee: {
    fee: number;
    updatedAt: string;
  };
}

interface WithdrawalResponse {
  message: string;
  withdrawalId: string;
  brokerFeeProofUrl: string;
}

interface ApiError {
  message?: string;
}

interface ApiRequestParams {
  url: string | null;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
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

// Styled components
const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textTransform: 'none',
}));

const DropzoneContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  marginBottom: theme.spacing(2),
}));

const PaymentDetailsContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[1],
}));

// Result Modal Component
const ResultModal: FC<ResultModalProps> = ({ isOpen, onClose, message, isSuccess }) => (
  <CustomModal
    open={isOpen}
    title={isSuccess ? 'Success' : 'Error'}
    onCancel={onClose}
    onConfirm={onClose}
  >
    <Typography
      variant="body1"
      color={isSuccess ? 'success.main' : 'error.main'}
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
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto' | ''>('');
  const [currency, setCurrency] = useState<'usd' | 'usdt' | ''>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [accountError, setAccountError] = useState<string>('');
  const [brokerFeeProof, setBrokerFeeProof] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Fetch payment accounts
  const {
    data: paymentAccountsData,
    loading: paymentAccountsLoading,
    error: paymentAccountsError,
    callApi: callPaymentAccountsApi,
  } = useApiRequest<PaymentAccount[]>();

  useEffect(() => {
    if (isOpen && user?._id) {
      callPaymentAccountsApi({
        url: `${ENDPOINTS.PAYMENT_ACCOUNTS}?userId=${user._id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
    }
  }, [isOpen, user?._id, callPaymentAccountsApi]);

  // Filter payment accounts based on payment method
  const filteredAccounts = paymentAccountsData
    ? paymentAccountsData.filter((account) =>
        paymentMethod === 'fiat' ? !!account.accountNumber : !!account.walletAddress
      )
    : [];

  // Infer currency based on payment method
  useEffect(() => {
    if (paymentMethod === 'fiat') {
      setCurrency('usd');
    } else if (paymentMethod === 'crypto') {
      setCurrency('usdt');
    } else {
      setCurrency('');
    }
    // Reset account selection when payment method changes
    setSelectedAccountId('');
    setAccountError('');
  }, [paymentMethod]);

  // Auto-select account if only one exists
  useEffect(() => {
    if (filteredAccounts.length === 1) {
      setSelectedAccountId(filteredAccounts[0]._id);
      setAccountError('');
    } else {
      setSelectedAccountId('');
    }
  }, [filteredAccounts]);

  // Get selected account details
  const selectedAccount = filteredAccounts.find((account) => account._id === selectedAccountId);

  // Setup dropzone for broker fee proof
  const { getRootProps, getInputProps, isDragActive } = useCompressedDropzone({
    onFileAccepted: (file) => {
      console.log('Accepted file:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      if (file.type !== 'image/png') {
        setFileError('Proof must be a PNG file');
        return;
      }
      setBrokerFeeProof(file);
      setFileError('');
    },
    onFileRejected: (reason) => {
      console.log('File rejected:', reason);
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
      setAmountError('Please enter a valid amount');
      return false;
    }
    if (user && amount > (user.accountBalance || 0)) {
      setAmountError('Amount exceeds available balance');
      return false;
    }
    setAmountError('');
    return true;
  };

  // Validate payment account
  const validateAccount = () => {
    if (!selectedAccountId) {
      setAccountError('Please select a payment account');
      return false;
    }
    setAccountError('');
    return true;
  };

  // Validate file
  const validateFile = () => {
    if (!brokerFeeProof) {
      setFileError('Please upload proof of broker fee payment');
      return false;
    }
    setFileError('');
    return true;
  };

  // Handle form submission
  const handleWithdrawSubmit = async () => {
    if (!user || !validateAmount() || !validateAccount() || !validateFile() || !brokerFeeProof || !currency) {
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('user', user._id);
    formData.append('amount', amount.toString());
    formData.append('currency', currency);
    formData.append('brokerFee', calculatedBrokerFee.toString());
    formData.append('brokerFeeProof', brokerFeeProof, brokerFeeProof.name);
    formData.append('paymentAccountId', selectedAccountId);
    formData.append('remarks', '');

    // Log FormData contents for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await callApi({
        url: ENDPOINTS.WITHDRAWALS,
        method: 'POST',
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
      console.error('Withdrawal request failed:', error);
      const apiError = error as ApiError;
      setResultMessage(apiError.message || 'Failed to submit withdrawal request');
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
    setResultMessage('');
    setIsSuccess(false);
    // Reset form fields
    setWithdrawAmount('');
    setPaymentMethod('');
    setCurrency('');
    setSelectedAccountId('');
    setAmountError('');
    setAccountError('');
    setBrokerFeeProof(null);
    setFileError('');
  };

  return (
    <>
      <CustomModal open={isOpen} title="Withdraw Funds" onCancel={onClose} noConfirm>
        <Box>
          {/* Payment Method Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value as 'fiat' | 'crypto')}
            >
              <MenuItem value="fiat">Fiat</MenuItem>
              <MenuItem value="crypto">Crypto</MenuItem>
            </Select>
          </FormControl>

          {/* Payment Account Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Account</InputLabel>
            <Select
              value={selectedAccountId}
              label="Payment Account"
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                setAccountError('');
              }}
              disabled={paymentAccountsLoading || !paymentMethod || filteredAccounts.length === 0}
              error={!!accountError}
            >
              {filteredAccounts.length === 0 && paymentMethod && (
                <MenuItem value="" disabled>
                  {paymentMethod === 'fiat'
                    ? 'Fiat payment method is unavailable for now'
                    : 'Crypto payment method is unavailable for now'}
                </MenuItem>
              )}
              {!paymentMethod && (
                <MenuItem value="" disabled>
                  Please select a payment method
                </MenuItem>
              )}
              {filteredAccounts.map((account) => (
                <MenuItem key={account._id} value={account._id}>
                  {account.accountNumber
                    ? `${account.accountNumber} (${account.bankName})`
                    : `${account.walletAddress} (${account.network})`}
                </MenuItem>
              ))}
            </Select>
            {accountError && (
              <Typography color="error" variant="body2" mt={1}>
                {accountError}
              </Typography>
            )}
          </FormControl>

          {/* Display Account Details */}
          {paymentAccountsLoading && (
            <Box display="flex" justifyContent="center" mb={2}>
              <CircularProgress size={24} />
            </Box>
          )}
          {paymentAccountsError && (
            <Typography color="error" variant="body2" mb={2}>
              Error loading payment accounts: {paymentAccountsError.message}
            </Typography>
          )}
          {!paymentAccountsLoading &&
            !paymentAccountsError &&
            paymentAccountsData?.length === 0 && (
              <Typography color="error" variant="body2" mb={2}>
                No payment accounts found. Please add an account.
              </Typography>
            )}
          {selectedAccount && (
            <>
              <Typography
                variant="body2"
                fontWeight="bold"
                color="text.primary"
                mb={1}
              >
                Withdrawal will be processed in {currency === 'usd' ? 'USD (Fiat)' : 'USDT (Crypto)'}
              </Typography>
              <PaymentDetailsContainer>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="text.primary"
                  mb={1}
                >
                  Payment Details
                </Typography>
                {selectedAccount.accountNumber ? (
                  <>
                    <Typography variant="body2" fontWeight="bold">
                      Bank: <span style={{ fontWeight: 'normal' }}>{selectedAccount.bankName || 'N/A'}</span>
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Account Number: <span style={{ fontWeight: 'normal' }}>{selectedAccount.accountNumber || 'N/A'}</span>
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Account Name: <span style={{ fontWeight: 'normal' }}>{selectedAccount.accountName || 'N/A'}</span>
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" fontWeight="bold">
                      Wallet Address: <span style={{ fontWeight: 'normal' }}>{selectedAccount.walletAddress || 'N/A'}</span>
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Network: <span style={{ fontWeight: 'normal' }}>{selectedAccount.network || 'N/A'}</span>
                    </Typography>
                  </>
                )}
              </PaymentDetailsContainer>
            </>
          )}

          {/* Amount Input */}
          <TextField
            fullWidth
            label={`Withdrawal Amount (${currency ? currency.toUpperCase() : 'Select a payment method'})`}
            type="number"
            value={withdrawAmount}
            onChange={(e) => {
              setWithdrawAmount(e.target.value);
              setAmountError('');
            }}
            error={!!amountError}
            helperText={amountError}
            inputProps={{ min: 0, step: '0.01' }}
            aria-label="Withdrawal amount"
            sx={{ mb: 2 }}
            disabled={!currency}
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
                <strong>Broker Fee Percentage:</strong> {brokerFeeData.brokerFee.fee}% (Updated:{' '}
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
            disabled={
              !!amountError ||
              !withdrawAmount ||
              !!accountError ||
              !selectedAccountId ||
              !currency ||
              !brokerFeeProof ||
              !!fileError ||
              submitting ||
              paymentAccountsLoading ||
              brokerFeeLoading
            }
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit Withdrawal'}
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