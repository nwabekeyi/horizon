import { FC } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate hook
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useAnalytics from '../hook/useAnalytics'; // Adjust path if needed
import { User } from 'utils/interfaces';
import HistoryCard from './HistoryCard';

interface HistoryProps {
  user: User | null;
}

const InvestmentHistory: FC<HistoryProps> = ({ user }) => {
  const navigate = useNavigate(); // ✅ Initialize the hook
  const { transactions } = useAnalytics(user);

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aTime = a.createdAt?.getTime() || 0;
    const bTime = b.createdAt?.getTime() || 0;
    return bTime - aTime;
  });

  return (
    <Paper sx={{ px: 1.5, py: 2, height: 350 }}>
      <Stack pl={1.5} pr={1} alignItems="center" justifyContent="space-between" direction="row">
        <Typography variant="h5">Investment History</Typography>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => navigate('/dashboard/investment')} // ✅ Navigate on click
        >
          See all
        </Button>
      </Stack>

      <Box mt={2}>
        {sortedTransactions.length === 0 ? (
          <Typography textAlign="center">No transactions to display</Typography>
        ) : (
          sortedTransactions.slice(0, 3).map((transaction) => (
            <HistoryCard key={transaction._id} data={transaction} />
          ))
        )}
      </Box>
    </Paper>
  );
};

export default InvestmentHistory;
