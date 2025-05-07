// src/components/InvestmentHistory.tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TransactionTable from '../../../components/sections/dashboard/complex-table/TransactionTable';
import CustomModal, { ChildrenBox } from '../../../components/base/modal';
import useAnalytics from 'components/sections/dashboard/hook/useAnalytics';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { useApiRequest } from 'hooks/useApi';
import { ENDPOINTS } from 'utils/endpoints';
import { DisplayTransaction, Transaction, Currency } from 'utils/interfaces';
import dayjs from 'dayjs';
import StatusBadge from 'components/common/statusBadge';

interface TransactionEditPayload {
  transactionId: string;
  amount: number;
  currencyType: 'fiat' | 'crypto';
  cryptoCurrency?: Currency;
  transactionDetails?: string;
}

interface TransactionResponse {
  message: string;
  transactionId: string;
}

const InvestmentHistory = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCurrencyType, setEditCurrencyType] = useState<'fiat' | 'crypto'>('fiat');
  const [editCryptoCurrency, setEditCryptoCurrency] = useState<Currency | ''>('');
  const [editTransactionDetails, setEditTransactionDetails] = useState<string>('');
  const { error, loading, callApi } = useApiRequest<TransactionResponse, TransactionEditPayload | { transactionId: string }>();

  const user = useSelector((state: RootState) => state.user.user);
  const userId = user?._id || '';

  const { transactions } = useAnalytics(user);

  const allTransactions: DisplayTransaction[] = transactions.map((tx: Transaction) => ({
    _id: tx._id,
    amount: tx.amount,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt || Date.now()),
    status:
      tx.status === 'completed' ? 'successful' :
      tx.status === 'pending' ? 'pending' :
      tx.status === 'failed' ? 'failed' :
      'canceled',
    companyName: tx.companyName || 'Unknown',
    type: 'transaction' as const,
    currency: tx.cryptoCurrency || (tx.currencyType === 'fiat' ? 'usd' : undefined),
  }));

  const filteredTransactions = allTransactions.filter(
    (tx) =>
      tx._id.toLowerCase().includes(searchText.toLowerCase()) ||
      tx.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewDetails = (id: string): void => {
    const transaction = transactions.find((tx: Transaction) => tx._id === id);
    setSelectedTransaction(transaction || null);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = (): void => {
    setViewModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleOpenEditModal = (id: string): void => {
    const transaction = transactions.find((tx: Transaction) => tx._id === id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setEditAmount(transaction.amount);
      setEditCurrencyType(transaction.currencyType);
      setEditCryptoCurrency(transaction.cryptoCurrency || '');
      setEditTransactionDetails(transaction.transactionDetails || '');
      setEditModalOpen(true);
    }
  };

  const handleCloseEditModal = (): void => {
    setEditModalOpen(false);
    setSelectedTransaction(null);
    setEditAmount(0);
    setEditCurrencyType('fiat');
    setEditCryptoCurrency('');
    setEditTransactionDetails('');
  };

  const handleCloseMessageModal = (): void => {
    setMessageModalOpen(false);
    setMessage('');
    setMessageType('success');
  };

  const handleCancelTransaction = async (id: string): Promise<void> => {
    try {
      const response = await callApi({
        url: `${ENDPOINTS.TRANSACTIONS}/cancel/${id}`,
        method: 'POST',
        body: { transactionId: id },
      });
      setMessage(response.message || `Transaction with ID ${id} has been canceled.`);
      setMessageType('success');
      setMessageModalOpen(true);
      handleCloseViewModal();
    } catch (err) {
      const errorMessage =
        err.status === 400 ? err.message || 'Invalid request data.' :
        err.status === 403 ? 'Unauthorized action.' :
        err.status === 404 ? 'Transaction not found.' :
        err.status === 503 ? 'Database error. Please try again later.' :
        'Failed to cancel transaction.';
      setMessage(errorMessage);
      setMessageType('error');
      setMessageModalOpen(true);
    }
  };

  const handleSubmitEdit = async (): Promise<void> => {
    if (!selectedTransaction || !userId) {
      setMessage('No transaction selected or user not found.');
      setMessageType('error');
      setMessageModalOpen(true);
      return;
    }

    if (editAmount <= 0) {
      setMessage('Amount must be greater than 0.');
      setMessageType('error');
      setMessageModalOpen(true);
      return;
    }

    if (editCurrencyType === 'crypto' && !editCryptoCurrency) {
      setMessage('Please select a cryptocurrency for crypto transactions.');
      setMessageType('error');
      setMessageModalOpen(true);
      return;
    }

    const payload: TransactionEditPayload = {
      transactionId: selectedTransaction._id,
      amount: editAmount,
      currencyType: editCurrencyType,
      cryptoCurrency: editCurrencyType === 'crypto' ? editCryptoCurrency || undefined : undefined,
      transactionDetails: editTransactionDetails || undefined,
    };

    try {
      const response = await callApi({
        url: `${ENDPOINTS.TRANSACTIONS}/${selectedTransaction._id}`,
        method: 'PUT',
        body: payload,
      });
      setMessage(response.message || 'Transaction updated successfully.');
      setMessageType('success');
      setMessageModalOpen(true);
      handleCloseEditModal();
    } catch (err) {
      const errorMessage =
        err.status === 400 ? err.message || 'Invalid request data.' :
        err.status === 403 ? 'Unauthorized action.' :
        err.status === 404 ? 'Transaction not found.' :
        err.status === 503 ? 'Database error. Please try again later.' :
        'Failed to update transaction.';
      setMessage(errorMessage);
      setMessageType('error');
      setMessageModalOpen(true);
    }
  };

  const actions = (transaction: Transaction) => {
    const actionList = [
      {
        icon: 'eva:eye-fill',
        label: 'View Details',
        onClick: () => handleViewDetails(transaction._id),
      },
    ];

    if (transaction.status === 'pending') {
      actionList.push(
        {
          icon: 'eva:edit-fill',
          label: 'Edit Transaction',
          onClick: () => handleOpenEditModal(transaction._id),
        },
        {
          icon: 'eva:close-circle-fill',
          label: 'Cancel Transaction',
          onClick: () => handleCancelTransaction(transaction._id),
        }
      );
    }

    return actionList;
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Investment History
      </Typography>

      <TextField
        label="Search by Company or Status"
        variant="outlined"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        fullWidth
        sx={{ mb: 3, maxWidth: 400 }}
      />

      <Box height={500}>
        <TransactionTable
          searchText={searchText}
          itemsPerPage={10}
          transactions={filteredTransactions}
          actions={(displayTransaction) => {
            const originalTransaction = transactions.find((tx) => tx._id === displayTransaction._id);
            return originalTransaction ? actions(originalTransaction) : [];
          }}
        />
      </Box>

      {/* View Details Modal */}
      <CustomModal
        open={viewModalOpen}
        title="Transaction Details"
        onCancel={handleCloseViewModal}
        noConfirm
      >
        {selectedTransaction ? (
          <ChildrenBox>
            <Typography variant="body1">
              <strong>Transaction ID:</strong> {selectedTransaction.transactionId}
            </Typography>
            <Typography variant="body1">
              <strong>Amount:</strong> {selectedTransaction.amount}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong>{' '}
              <StatusBadge status={selectedTransaction.status}>
                {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
              </StatusBadge>
            </Typography>
            <Typography variant="body1">
              <strong>Company:</strong> {selectedTransaction.companyName}
            </Typography>
            <Typography variant="body1">
              <strong>Currency Type:</strong> {selectedTransaction.currencyType}
            </Typography>
            {selectedTransaction.cryptoCurrency && (
              <Typography variant="body1">
                <strong>Cryptocurrency:</strong> {selectedTransaction.cryptoCurrency.toUpperCase()}
              </Typography>
            )}
            <Typography variant="body1">
              <strong>Date:</strong>{' '}
              {dayjs(selectedTransaction.createdAt).format('MMM DD, YYYY HH:mm')}
            </Typography>
            {actions(selectedTransaction).map((action, index) => (
              <Button
                key={index}
                variant="contained"
                color={action.label === 'Cancel Transaction' ? 'error' : 'primary'}
                onClick={action.onClick}
                sx={{ mt: 2 }}
              >
                {action.label}
              </Button>
            ))}
          </ChildrenBox>
        ) : (
          <Typography>No details available</Typography>
        )}
      </CustomModal>

      {/* Edit Transaction Modal */}
      <CustomModal
        open={editModalOpen}
        title="Edit Transaction"
        onCancel={handleCloseEditModal}
        onConfirm={handleSubmitEdit}
        noConfirm={false}
      >
        {selectedTransaction ? (
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Typography variant="body1">
              <strong>Transaction ID:</strong> {selectedTransaction._id}
            </Typography>
            <TextField
              label="Amount"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(Number(e.target.value))}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel id="currency-type-label">Currency Type</InputLabel>
              <Select
                labelId="currency-type-label"
                value={editCurrencyType}
                label="Currency Type"
                onChange={(e) => setEditCurrencyType(e.target.value as 'fiat' | 'crypto')}
              >
                <MenuItem value="fiat">Fiat</MenuItem>
                <MenuItem value="crypto">Crypto</MenuItem>
              </Select>
            </FormControl>
            {editCurrencyType === 'crypto' && (
              <FormControl fullWidth>
                <InputLabel id="crypto-currency-label">Cryptocurrency</InputLabel>
                <Select
                  labelId="crypto-currency-label"
                  value={editCryptoCurrency}
                  label="Cryptocurrency"
                  onChange={(e) => setEditCryptoCurrency(e.target.value as Currency)}
                >
                  <MenuItem value="btc">BTC</MenuItem>
                  <MenuItem value="eth">ETH</MenuItem>
                  <MenuItem value="usdt">USDT</MenuItem>
                </Select>
              </FormControl>
            )}
            <TextField
              label="Transaction Details"
              value={editTransactionDetails}
              onChange={(e) => setEditTransactionDetails(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            {error && (
              <Typography color="error" variant="body2">
                {error.message}
              </Typography>
            )}
            {loading && (
              <Typography variant="body2">Submitting transaction update...</Typography>
            )}
          </Box>
        ) : (
          <Typography>No transaction selected</Typography>
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

export default InvestmentHistory;