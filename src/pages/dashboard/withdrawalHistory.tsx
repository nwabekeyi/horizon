import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import TransactionTable from '../../components/sections/dashboard/complex-table/TransactionTable';
import CustomModal from '../../components/base/modal';
import useAnalytics from '../../components/sections/dashboard/hook/useAnalytics';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { useApiRequest } from '../../hooks/useApi';
import { ENDPOINTS } from '../../utils/endpoints';
import { User, Withdrawal, PaymentDetail } from 'utils/interfaces';

interface TransactionHistoryProps {
  user: User | null;
}

interface DisplayTransaction {
  _id: string;
  amount: number;
  createdAt: Date;
  status: 'pending' | 'approved' | 'failed' | 'processing' | 'successful';
  companyName: string;
  type: 'withdrawal';
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
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<string>('');
  const [withdrawalPin, setWithdrawalPin] = useState<string>('');
  const { withdrawals } = useAnalytics(user);
  const { callApi } = useApiRequest<WithdrawalResponse, WithdrawalRequestPayload>();

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
    type: 'withdrawal',
  }));

  const statusTotals = {
    pending: allWithdrawals.filter((wd) => wd.status === 'pending').length,
    processing: allWithdrawals.filter((wd) => wd.status === 'processing').length,
    approved: allWithdrawals.filter((wd) => wd.status === 'approved').length,
    successful: allWithdrawals.filter((wd) => wd.status === 'successful').length,
  };

  const filteredWithdrawals = allWithdrawals.filter((wd) =>
    wd._id.toLowerCase().includes(searchText.toLowerCase()) ||
    wd.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
    wd.status.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewDetails = (id: string) => {
    const withdrawal = withdrawals.find((wd) => wd._id === id);
    setSelectedWithdrawal(withdrawal || null);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedWithdrawal(null);
  };

  const handleCancelWithdrawal = (id: string) => {
    alert(`Withdrawal with ID ${id} has been canceled.`);
    handleCloseViewModal();
  };

  const handleOpenWithdrawalModal = (id: string) => {
    const withdrawal = withdrawals.find((wd) => wd._id === id);
    setSelectedWithdrawal(withdrawal || null);
    setWithdrawalModalOpen(true);
    setSelectedPaymentDetail('');
    setWithdrawalPin('');
  };

  const handleCloseWithdrawalModal = () => {
    setWithdrawalModalOpen(false);
    setSelectedWithdrawal(null);
    setSelectedPaymentDetail('');
    setWithdrawalPin('');
  };

  const handleSubmitWithdrawal = async () => {
    if (!selectedWithdrawal || !userId || !selectedPaymentDetail || !withdrawalPin) {
      alert('Please select a payment account and enter a withdrawal pin.');
      return;
    }

    if (!/^\d{4}$/.test(withdrawalPin)) {
      alert('Withdrawal PIN must be a 4-digit number.');
      return;
    }

    const selectedDetail = paymentDetails.find((detail) => detail._id === selectedPaymentDetail);
    if (!selectedDetail) {
      alert('Selected payment detail not found.');
      return;
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
      alert(response.message);
      handleCloseWithdrawalModal();
    } catch (err) {
      const errorMessage =
        err.status === 401 ? 'Invalid withdrawal PIN.' :
        err.status === 400 ? err.message || 'Invalid request data.' :
        err.status === 403 ? 'Unauthorized action.' :
        err.status === 404 ? 'Withdrawal not found.' :
        err.status === 503 ? 'Database error. Please try again later.' :
        'Failed to process withdrawal.';
      alert(`Error: ${errorMessage}`);
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
        <Chip label={`Pending: ${statusTotals.pending}`} color="warning" />
        <Chip label={`Processing: ${statusTotals.processing}`} color="info" />
        <Chip label={`Approved: ${statusTotals.approved}`} color="primary" />
        <Chip label={`Successful: ${statusTotals.successful}`} color="success" />
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
        {selectedWithdrawal && (
          <Stack spacing={2} sx={{ py: 2 }}>
            <Typography variant="body1">
              <strong>ID:</strong> {selectedWithdrawal._id}
            </Typography>
            <Typography variant="body1">
              <strong>Amount:</strong> {selectedWithdrawal.amount}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong> {selectedWithdrawal.status}
            </Typography>
          </Stack>
        )}
      </CustomModal>

      {/* Withdrawal Modal */}
      <CustomModal
        open={withdrawalModalOpen}
        title="Make Withdrawal"
        onCancel={handleCloseWithdrawalModal}
        onConfirm={handleSubmitWithdrawal}
      >
        <Stack spacing={2} sx={{ py: 2 }}>
          {/* Add components for selecting payment details and PIN */}
        </Stack>
      </CustomModal>
    </Box>
  );
};

export default WithdrawalHistory;
