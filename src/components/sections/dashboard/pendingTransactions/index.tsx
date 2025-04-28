import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TransactionCard from './TransactionCard';
import useAnalytics from '../hook/useAnalytics';
import { User, Transaction} from 'utils/interfaces';

interface PendingTransactionsProps {
  user: User | null;
}

const PendingTransactions = ({ user }: PendingTransactionsProps) => {
  const { transactions, withdrawals } = useAnalytics(user);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);

  // Filter pending transactions and withdrawals
  useEffect(() => {
    // Filter pending transactions
    const pendingTxs = transactions.filter((tx) => tx.status === 'pending');

    // Filter pending withdrawals and normalize to Transaction interface
    const pendingWithdrawals = withdrawals
      .filter((wd) => wd.status === 'pending')
      .map((wd): Transaction => ({
        _id: wd._id,
        companyName: 'Withdrawal', // Placeholder, as paymentAccountDetails is likely empty
        transactionId: wd._id, // Use _id as transactionId
        userId: wd.user,
        status: 'pending', // Matches Transaction status
        amount: wd.amount,
        currencyType: 'fiat', // Default, as Withdrawal doesn’t specify
        proofUrl: wd.brokerFeeProof || '', // Use brokerFeeProof or empty string
        createdAt: wd.createdAt,
        updatedAt: wd.updatedAt,
        __v: 0, // Default for compatibility
      }));

    // Combine and limit to 3
    const combined = [...pendingTxs, ...pendingWithdrawals].slice(0, 3);
    setPendingTransactions(combined);
  }, [transactions, withdrawals]);

  // Handle transaction actions (placeholder for actual implementation)
  const handleAction = (action: string, transactionId: string) => {
    console.log(`Action: ${action} for transaction ID: ${transactionId}`);
    // Implement action logic here (e.g., API calls)
    switch (action) {
      case 'View Details':
        // Navigate to transaction details page or show modal
        break;
      case 'Edit':
        // Open edit form for transaction
        break;
      case 'Retry Transaction':
        // Call API to retry transaction
        break;
      default:
        break;
    }
  };

  return (
    <Box component={Paper} p={3} height={390}>
      <Stack alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Pending Transactions</Typography>
        <Typography variant="body2" color="text.disabled">
          {pendingTransactions.length} Pending
        </Typography>
      </Stack>

      <Box mt={3}>
        {pendingTransactions.length === 0 ? (
          <Typography variant="body1" textAlign="center" color="text.disabled">
            No pending transactions
          </Typography>
        ) : (
          pendingTransactions.map((item) => (
            <TransactionCard key={item._id} data={item} onAction={handleAction} />
          ))
        )}
      </Box>
    </Box>
  );
};

export default PendingTransactions;