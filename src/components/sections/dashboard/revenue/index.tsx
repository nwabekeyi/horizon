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

function getISOWeek(date: Date): { week: number; year: number } {
  const temp = new Date(date.getTime());
  temp.setUTCDate(temp.getUTCDate() + 4 - (temp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year: temp.getUTCFullYear() };
}

interface RevenueProps {
  user: User | null;
}

const Revenue: FC<RevenueProps> = ({ user }) => {
  const { ROI, transactions, withdrawals, loading } = useAnalytics(user);

  if (loading || !transactions || !withdrawals) {
    return (
      <Box component={Paper} height={350} display="flex" alignItems="center" justifyContent="center">
        <Typography>Loading revenue data...</Typography>
      </Box>
    );
  }

  const weeklyData = {
    categories: Array.from({ length: 10 }, (_, i) => `Week ${i + 1}`),
    series: [
      { name: 'ROI', data: Array(10).fill(0) },
      { name: 'Investments', data: Array(10).fill(0) },
      { name: 'Withdrawals', data: Array(10).fill(0) },
    ],
  };

  const now = new Date();
  const currentWeek = getISOWeek(now);

  const totalTxAmount = transactions
    .filter(tx => tx.status === 'completed' && tx.createdAt)
    .reduce((sum, tx) => sum + tx.amount, 0);

  transactions.forEach((tx) => {
    if (tx.status === 'completed' && tx.createdAt) {
      const txDate = new Date(tx.createdAt);
      const txWeek = getISOWeek(txDate);
      const weeksAgo = currentWeek.year === txWeek.year
        ? currentWeek.week - txWeek.week
        : currentWeek.week + (52 - txWeek.week) + (currentWeek.year - txWeek.year - 1) * 52;

      if (weeksAgo >= 0 && weeksAgo < 10) {
        const index = 9 - weeksAgo;
        weeklyData.series[1].data[index] += tx.amount;
        if (totalTxAmount > 0) {
          weeklyData.series[0].data[index] += (tx.amount / totalTxAmount) * ROI;
        }
      }
    }
  });

  withdrawals.forEach((wd) => {
    if (wd.status === 'successful' && wd.createdAt) {
      const wdDate = new Date(wd.createdAt);
      const wdWeek = getISOWeek(wdDate);
      const weeksAgo = currentWeek.year === wdWeek.year
        ? currentWeek.week - wdWeek.week
        : currentWeek.week + (52 - wdWeek.week) + (currentWeek.year - wdWeek.year - 1) * 52;

      if (weeksAgo >= 0 && weeksAgo < 10) {
        const index = 9 - weeksAgo;
        weeklyData.series[2].data[index] += wd.amount;
      }
    }
  });

  return (
    <Box component={Paper} height={350} p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Weekly Revenue</Typography>
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
