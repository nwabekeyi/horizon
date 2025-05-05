import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import IconifyIcon from 'components/base/IconifyIcon';
import DateSelect from './DateSelect';
import SpentChart from './SpentChart';
import useAnalytics from '../hook/useAnalytics';
import { User } from 'utils/interfaces';
import dayjs, { Dayjs } from 'dayjs';

interface TotalSpentProps {
  user: User | null;
}

const TotalSpent = ({ user }: TotalSpentProps) => {
  const { transactions } = useAnalytics(user);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs()); // Default to current date

  // Calculate total spent for the selected month/year
  const totalSpent = useMemo(() => {
    if (!selectedDate || !transactions.length) return 0;

    const selectedYear = selectedDate.year();
    const selectedMonth = selectedDate.month();

    return transactions.reduce((sum, tx) => {
      if (
        tx.status === 'completed' &&
        tx.createdAt &&
        tx.createdAt.getFullYear() === selectedYear &&
        tx.createdAt.getMonth() === selectedMonth
      ) {
        return sum + tx.amount;
      }
      return sum;
    }, 0);
  }, [transactions, selectedDate]);

  // Calculate percentage change (example logic, adjust as needed)
  const percentageChange = useMemo(() => {
    if (!selectedDate || !transactions.length) return 0;

    const selectedYear = selectedDate.year();
    const selectedMonth = selectedDate.month();
    const prevMonth = selectedDate.subtract(1, 'month');
    const prevYear = prevMonth.year();
    const prevMonthIndex = prevMonth.month();

    const currentMonthSpent = transactions.reduce((sum, tx) => {
      if (
        tx.status === 'completed' &&
        tx.createdAt &&
        tx.createdAt.getFullYear() === selectedYear &&
        tx.createdAt.getMonth() === selectedMonth
      ) {
        return sum + tx.amount;
      }
      return sum;
    }, 0);

    const prevMonthSpent = transactions.reduce((sum, tx) => {
      if (
        tx.status === 'completed' &&
        tx.createdAt &&
        tx.createdAt.getFullYear() === prevYear &&
        tx.createdAt.getMonth() === prevMonthIndex
      ) {
        return sum + tx.amount;
      }
      return sum;
    }, 0);

    if (prevMonthSpent === 0) return currentMonthSpent > 0 ? 100 : 0;
    return ((currentMonthSpent - prevMonthSpent) / prevMonthSpent) * 100;
  }, [transactions, selectedDate]);

  // Generate chart data for the last 6 months
  const chartData = useMemo(() => {
    const months: string[] = [];
    const amounts: number[] = [];
    const currentDate = selectedDate || dayjs();

    // Generate data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = currentDate.subtract(i, 'month');
      const year = date.year();
      const month = date.month();
      const monthName = date.format('MMM').toUpperCase();
      months.push(monthName);

      const monthSpent = transactions.reduce((sum, tx) => {
        if (
          tx.status === 'completed' &&
          tx.createdAt &&
          tx.createdAt.getFullYear() === year &&
          tx.createdAt.getMonth() === month
        ) {
          return sum + tx.amount;
        }
        return sum;
      }, 0);
      amounts.push(monthSpent);
    }

    return { months, amounts };
  }, [transactions, selectedDate]);

  // Format total spent as currency
  const formattedTotalSpent = `$${totalSpent.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Box component={Paper} height={{ xs: 450, sm: 350 }}>
      <Stack justifyContent="space-between">
        <DateSelect onChange={setSelectedDate} />

        <Stack
          component={ButtonBase}
          alignItems="center"
          justifyContent="center"
          height={36}
          width={36}
          bgcolor="info.main"
          borderRadius={2.5}
          aria-label="View spending details"
        >
          <IconifyIcon
            icon="ic:round-bar-chart"
            color="primary.main"
            fontSize="h4.fontSize"
            aria-hidden="true"
          />
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} mt={1.75}>
        <Box minWidth={150}>
          <Typography mt={0.35} variant="h2" color="text.primary">
            {formattedTotalSpent}
          </Typography>
          <Stack spacing={1}>
            <Typography variant="h6" fontSize={10} color="text.disabled" fontWeight={500}>
              Monthly Investments
            </Typography>

            <Stack alignItems="center" spacing={0.25}>
              <IconifyIcon
                icon={percentageChange >= 0 ? 'ic:baseline-arrow-drop-up' : 'ic:baseline-arrow-drop-down'}
                color={percentageChange >= 0 ? 'success.main' : 'error.main'}
                fontSize="h6.fontSize"
                aria-hidden="true"
              />
              <Typography
                variant="caption"
                color={percentageChange >= 0 ? 'success.main' : 'error.main'}
                fontWeight={700}
              >
                {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
              </Typography>
            </Stack>
          </Stack>
          <Stack mt={2} alignItems="center" spacing={0.5}>
            <IconifyIcon
              icon={percentageChange >= 0 ? 'ic:round-check-circle' : 'ic:round-close'}
              color={percentageChange >= 0 ? 'success.main' : 'error.main'}
              fontSize="h6.fontSize"
              aria-hidden="true"
            />
            <Typography
              variant="body1"
              color={percentageChange >= 0 ? 'success.main' : 'error.main'}
              fontWeight={700}
            >
              {percentageChange >= 0 ? 'On track' : 'Falling short'}
            </Typography>
          </Stack>
        </Box>

        <SpentChart data={chartData} sx={{ width: 1, height: '235px !important' }} />
      </Stack>
    </Box>
  );
};

export default TotalSpent;