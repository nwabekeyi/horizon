import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TransactionTable from '../../components/sections/dashboard/complex-table/TransactionTable';
import CustomModal from '../../components/base/modal';
import useAnalytics from '../../components/sections/dashboard/hook/useAnalytics';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { useApiRequest } from '../../hooks/useApi';
import { ENDPOINTS } from '../../utils/endpoints';
import { User, Withdrawal, PaymentDetail, Currency } from 'utils/interfaces';
import dayjs from 'dayjs';

interface TransactionHistoryProps {
  user: User | null;
}

interface DisplayTransaction {
  _id: string;
  amount: number;
  createdAt: Date;
  status: 'pending' | 'approved' | 'failed' | 'processing' | 'successful' | 'canceled';
  companyName: string;
  type: 'withdrawal';
  currency?: Currency;
}

interface WithdrawalRequestPayload {
  withdrawalId: string;
  userId: string;
  paymentAccountDetails: PaymentDetail;
  withdrawalPin: string;
}

interface WithdrawalResponse {
  message: string;
  withdrawalId: string;
}

const WithdrawalHistory = ({ user }: TransactionHistoryProps) => {
  const [searchText, setSearchText] = useState<string>('');
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState<boolean>(false);
  const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false); // New state for message modal
  const [message, setMessage] = useState<string>(''); // Message content
  const [messageType, setMessageType] = useState<'success' | 'error'>('success'); // Message type
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<string>('');
  const [withdrawalPin, setWithdrawalPin] = useState<string>('');
  const { withdrawals } = useAnalytics(user);
  const { error, loading, callApi } = useApiRequest<WithdrawalResponse, WithdrawalRequestPayload>();

  const reduxUser = useSelector((state: RootState) => state.user.user);
  const paymentDetails: PaymentDetail[] = reduxUser?.paymentDetails || [];
  const userId = reduxUser?._id || '';

  const allWithdrawals: DisplayTransaction[] = withdrawals.map((wd: Withdrawal) => ({
    _id: wd._id,
    amount: wd.amount,
    createdAt: wd.createdAt instanceof Date ? wd.createdAt : new Date(wd.createdAt || Date.now()),
    status: wd.status,
    companyName: wd.paymentAccountDetails
      ? wd.paymentAccountDetails.accountDetails?.bankName ||
        `${wd.paymentAccountDetails.currency?.toUpperCase() || 'Unknown'} Wallet`
      : 'Unknown',
    type: 'withdrawal' as const,
    currency: wd.paymentAccountDetails?.currency,
  }));

  const statusTotals = {
    pending: allWithdrawals.filter((wd) => wd.status === 'pending').length,
    processing: allWithdrawals.filter((wd) => wd.status === 'processing').length,
    approved: allWithdrawals.filter((wd) => wd.status === 'approved').length,
    successful: allWithdrawals.filter((wd) => wd.status === 'successful').length,
  };

  const filteredWithdrawals = allWithdrawals.filter(
    (wd) =>
      wd._id.toLowerCase().includes(searchText.toLowerCase()) ||
      wd.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
      wd.status.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewDetails = (id: string): void => {
    const withdrawal = withdrawals.find((wd: Withdrawal) => wd._id === id);
    setSelectedWithdrawal(withdrawal || null);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = (): void => {
    setViewModalOpen(false);
    setSelectedWithdrawal(null);
  };

  const handleCancelWithdrawal = (id: string): void => {
    setMessage(`Withdrawal with ID ${id} has been canceled.`);
    setMessageType('success'); // Treat cancellation as success for simplicity
    setMessageModalOpen(true);
    handleCloseViewModal();
  };

  const handleOpenWithdrawalModal = (id: string): void => {
    const withdrawal = withdrawals.find((wd: Withdrawal) => wd._id === id);
    setSelectedWithdrawal(withdrawal || null);
    setWithdrawalModalOpen(true);
    setSelectedPaymentDetail('');
    setWithdrawalPin('');
  };

  const handleCloseWithdrawalModal = (): void => {
    setWithdrawalModalOpen(false);
    setSelectedWithdrawal(null);
    setSelectedPaymentDetail('');
    setWithdrawalPin('');
  };

  const handleCloseMessageModal = (): void => {
    setMessageModalOpen(false);
    setMessage('');
    setMessageType('success');
  };

  const handleSubmitWithdrawal = async (): Promise<void> => {
    if (!selectedWithdrawal || !userId || !selectedPaymentDetail || !withdrawalPin) {
      setMessage('Please select a payment account and enter a withdrawal pin.');
      setMessageType('error');
      setMessageModalOpen(true);
      return;
    }

    if (!/^\d{4}$/.test(withdrawalPin)) {
      setMessage('Withdrawal PIN must be a 4-digit number.');
      setMessageType('error');
      setMessageModalOpen(true);
      return;
    }

    const selectedDetail = paymentDetails.find((detail) => detail._id === selectedPaymentDetail);
    if (!selectedDetail) {
      setMessage('Selected payment detail not found.');
      setMessageType('error');
      setMessageModalOpen(true);
      return;
    }

    if (selectedDetail.type === 'fiat') {
      if (
        !selectedDetail.accountDetails.bankName ||
        !selectedDetail.accountDetails.accountNumber ||
        !selectedDetail.accountDetails.accountName
      ) {
        setMessage('Fiat payment details must include bank name, account number, and account name.');
        setMessageType('error');
        setMessageModalOpen(true);
        return;
      }
    } else if (selectedDetail.type === 'crypto') {
      if (!selectedDetail.accountDetails.address) {
        setMessage('Crypto payment details must include a wallet address.');
        setMessageType('error');
        setMessageModalOpen(true);
        return;
      }
    }

    const payload: WithdrawalRequestPayload = {
      withdrawalId: selectedWithdrawal._id,
      userId,
      paymentAccountDetails: selectedDetail,
      withdrawalPin,
    };

    try {
      const response = await callApi({
        url: ENDPOINTS.MAKE_WITHDRAWAL,
        method: 'POST',
        body: payload,
      });
      setMessage(response.message); // e.g., "Withdrawal is now processing."
      setMessageType('success');
      setMessageModalOpen(true);
      handleCloseWithdrawalModal();
    } catch (err) {
      const errorMessage =
        err.status === 401 ? 'Invalid withdrawal PIN.' :
        err.status === 400 ? err.message || 'Invalid request data.' :
        err.status === 403 ? 'Unauthorized action.' :
        err.status === 404 ? 'Withdrawal not found.' :
        err.status === 503 ? 'Database error. Please try again later.' :
        'Failed to process withdrawal.';
      setMessage(errorMessage);
      setMessageType('error');
      setMessageModalOpen(true);
    }
  };

  const actions = (withdrawal: Withdrawal) => {
    const actionList = [
      {
        icon: 'eva:eye-fill',
        label: 'View Details',
        onClick: () => handleViewDetails(withdrawal._id),
      },
    ];

    if (withdrawal.status === 'pending') {
      actionList.push({
        icon: 'eva:close-circle-fill',
        label: 'Cancel Withdrawal',
        onClick: () => handleCancelWithdrawal(withdrawal._id),
      });
    }

    if (withdrawal.status === 'approved') {
      actionList.push({
        icon: 'eva:checkmark-circle-fill',
        label: 'Make Withdrawal',
        onClick: () => handleOpenWithdrawalModal(withdrawal._id),
      });
    }

    return actionList;
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Withdrawal History
      </Typography>

      <TextField
        label="Search by ID, Bank/Wallet or Status"
        variant="outlined"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        fullWidth
        sx={{ mb: 3, maxWidth: 400 }}
      />

      <Stack direction="row" spacing={2} mb={2}>
        <Chip
          label={`Pending: ${statusTotals.pending}`}
          color="warning"
          variant="filled"
          icon={<span style={{ fontSize: 18 }}>⏳</span>}
          sx={{ borderRadius: '16px', fontWeight: 'bold' }}
        />
        <Chip
          label={`Processing: ${statusTotals.processing}`}
          color="info"
          variant="filled"
          icon={<span style={{ fontSize: 18 }}>⚙️</span>}
          sx={{ borderRadius: '16px', fontWeight: 'bold' }}
        />
        <Chip
          label={`Approved: ${statusTotals.approved}`}
          color="primary"
          variant="filled"
          icon={<span style={{ fontSize: 18 }}>✅</span>}
          sx={{ borderRadius: '16px', fontWeight: 'bold' }}
        />
        <Chip
          label={`Successful: ${statusTotals.successful}`}
          color="success"
          variant="filled"
          icon={<span style={{ fontSize: 18 }}>🎉</span>}
          sx={{ borderRadius: '16px', fontWeight: 'bold' }}
        />
      </Stack>

      <Box height={500}>
        <TransactionTable
          searchText={searchText}
          itemsPerPage={10}
          transactions={filteredWithdrawals}
          actions={(displayTransaction) => {
            const originalWithdrawal = withdrawals.find((wd) => wd._id === displayTransaction._id);
            return originalWithdrawal ? actions(originalWithdrawal) : [];
          }}
        />
      </Box>

      {/* View Details Modal */}
      <CustomModal
        open={viewModalOpen}
        title="Withdrawal Details"
        onCancel={handleCloseViewModal}
        noConfirm
      >
        {selectedWithdrawal ? (
          <Stack spacing={2} sx={{ py: 2 }}>
            <Typography variant="body1">
              <strong>ID:</strong> {selectedWithdrawal._id}
            </Typography>
            <Typography variant="body1">
              <strong>Amount:</strong> {selectedWithdrawal.amount}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong>{' '}
              {selectedWithdrawal.status.charAt(0).toUpperCase() + selectedWithdrawal.status.slice(1)}
            </Typography>
            <Typography variant="body1">
              <strong>Date:</strong>{' '}
              {dayjs(selectedWithdrawal.createdAt).format('MMM DD, YYYY HH:mm')}
            </Typography>
            {actions(selectedWithdrawal).map((action, index) => (
              <Button
                key={index}
                variant="contained"
                color={action.label === 'Cancel Withdrawal' ? 'error' : 'primary'}
                onClick={action.onClick}
                sx={{ mt: 2 }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        ) : (
          <Typography>No details available</Typography>
        )}
      </CustomModal>

      {/* Withdrawal Modal */}
      <CustomModal
        open={withdrawalModalOpen}
        title="Make Withdrawal"
        onCancel={handleCloseWithdrawalModal}
        onConfirm={handleSubmitWithdrawal}
        noConfirm={false}
      >
        {selectedWithdrawal ? (
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Typography variant="body1">
              <strong>Withdrawal ID:</strong> {selectedWithdrawal._id}
            </Typography>
            <Typography variant="body1">
              <strong>Amount:</strong> {selectedWithdrawal.amount}
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="payment-detail-label">Select Payment Account</InputLabel>
              <Select
                labelId="payment-detail-label"
                value={selectedPaymentDetail}
                label="Select Payment Account"
                onChange={(e) => setSelectedPaymentDetail(e.target.value)}
                disabled={paymentDetails.length === 0}
              >
                {paymentDetails.length === 0 ? (
                  <MenuItem value="" disabled>
                    No payment accounts available
                  </MenuItem>
                ) : (
                  paymentDetails.map((detail) => (
                    <MenuItem key={detail._id} value={detail._id}>
                      {detail.type === 'fiat'
                        ? `${detail.accountDetails.bankName || 'Unknown Bank'} - ${
                            detail.accountDetails.accountNumber || 'Unknown'
                          }`
                        : `${detail.currency.toUpperCase()} Wallet - ${
                            detail.accountDetails.address || 'Unknown Address'
                          }`}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              label="Withdrawal Pin"
              type="password"
              value={withdrawalPin}
              onChange={(e) => setWithdrawalPin(e.target.value)}
              fullWidth
              required
            />
            {error && (
              <Typography color="error" variant="body2">
                {error.message}
              </Typography>
            )}
            {loading && (
              <Typography variant="body2">Submitting withdrawal request...</Typography>
            )}
          </Box>
        ) : (
          <Typography>No withdrawal selected</Typography>
        )}
      </CustomModal>

      {/* Message Modal */}
      <CustomModal
        open={messageModalOpen}
        title={messageType === 'success' ? 'Success' : 'Error'}
        onCancel={handleCloseMessageModal}
        onConfirm={handleCloseMessageModal}
        noConfirm={false}
      >
        <Typography
          variant="body1"
          color={messageType === 'success' ? 'success.main' : 'error.main'}
          sx={{ py: 2 }}
        >
          {message}
        </Typography>
      </CustomModal>
    </Box>
  );
};

export default WithdrawalHistory;