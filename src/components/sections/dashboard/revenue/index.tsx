import { FC } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import IconifyIcon from 'components/base/IconifyIcon';
import useAnalytics from '../hook/useAnalytics';
import { User } from 'utils/interfaces';
import RevenueChart from './RevenueChart';

// Get ISO week number (1–52/53) for a date (Monday–Sunday weeks)
function getISOWeek(date: Date): { week: number; year: number } {
  const temp = new Date(date.getTime());
  temp.setUTCDate(temp.getUTCDate() + 4 - (temp.getUTCDay() || 7)); // Nearest Thursday
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year: temp.getUTCFullYear() };
}

interface RevenueProps {
  user: User | null;
}

const Revenue: FC<RevenueProps> = ({ user }) => {
  const { ROI, transactions } = useAnalytics(user);

  // Log transactions for debugging
  console.log('Transactions:', transactions.map(tx => ({
    _id: tx._id,
    amount: tx.amount,
    createdAt: tx.createdAt,
    status: tx.status,
  })));

  // Generate data for the past 10 weeks
  const weeklyData = {
    categories: Array.from({ length: 10 }, (_, i) => `Week ${i + 1}`), // Week 1 (oldest) to Week 10 (newest)
    series: [
      {
        name: 'ROI',
        data: Array(10).fill(0), // Initialize to 0, populate below
      },
      {
        name: 'Transactions',
        data: Array(10).fill(0), // Initialize to 0, populate below
      },
      {
        name: 'Withdrawals',
        data: Array(10).fill(500), // Fixed $500 per week
      },
    ],
  };

  // Calculate weekly transaction totals and ROI
  const now = new Date();
  const currentWeek = getISOWeek(now);
  console.log('Current Week:', currentWeek);

  // Calculate total transaction amount for ROI allocation
  const totalTxAmount = transactions
    .filter(tx => tx.status === 'completed' && tx.createdAt)
    .reduce((sum, tx) => sum + tx.amount, 0);

  transactions.forEach((tx) => {
    if (tx.status === 'completed' && tx.createdAt) {
      const txDate = new Date(tx.createdAt);
      if (isNaN(txDate.getTime())) {
        console.warn(`Invalid date for transaction ${tx._id}:`, tx.createdAt);
        return;
      }
      const txWeek = getISOWeek(txDate);

      let weeksAgo = 0;
      if (txWeek.year === currentWeek.year) {
        weeksAgo = currentWeek.week - txWeek.week;
      } else if (txWeek.year < currentWeek.year) {
        weeksAgo = currentWeek.week + (52 - txWeek.week) + (currentWeek.year - txWeek.year - 1) * 52;
      } else {
        weeksAgo = -((txWeek.week - currentWeek.week) + (txWeek.year - currentWeek.year) * 52);
      }

      console.log(`Transaction ${tx._id}:`, {
        createdAt: tx.createdAt,
        parsedDate: txDate,
        txWeek,
        weeksAgo,
        amount: tx.amount,
        index: weeksAgo >= 0 && weeksAgo < 10 ? 9 - weeksAgo : 'out of range',
      });

      if (weeksAgo >= 0 && weeksAgo < 10) {
        const index = 9 - weeksAgo;
        // Add transaction amount
        weeklyData.series[1].data[index] += tx.amount;
        // Allocate ROI proportional to transaction amount
        if (totalTxAmount > 0) {
          weeklyData.series[0].data[index] += (tx.amount / totalTxAmount) * ROI;
        }
      }
    }
  });

  // Log final weeklyData
  console.log('Weekly Data:', weeklyData);

  return (
    <Box component={Paper} height={350}>
      <Stack justifyContent="space-between">
        <Typography variant="h4">Weekly Revenue</Typography>
        <Stack
          component={ButtonBase}
          alignItems="center"
          justifyContent="center"
          height={36}
          width={36}
          bgcolor="info.main"
          borderRadius={2.5}
        >
          <IconifyIcon icon="ic:round-bar-chart" color="primary.main" fontSize="h4.fontSize" />
        </Stack>
      </Stack>

      <RevenueChart data={weeklyData} sx={{ height: '265px !important' }} />
    </Box>
  );
};

export default Revenue;