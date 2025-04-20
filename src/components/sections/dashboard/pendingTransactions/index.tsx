import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TransactionCard from './TransactionCard';
import useAnalytics from '../hook/useAnalytics';
import { User, Transaction } from 'utils/interfaces';

interface PendingTransactionsProps {
  user: User | null; // Match YourPiChart prop
}

const PendingTransactions = ({ user }: PendingTransactionsProps) => {
  const { transactions } = useAnalytics(user);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);

  // Filter pending transactions
  useEffect(() => {
    const filtered = transactions.filter((tx) => tx.status === 'pending');
    setPendingTransactions(filtered.slice(0, 3)); // Limit to 3 for display
  }, [transactions]);

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