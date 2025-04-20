import React, { useState, useRef, useMemo } from 'react';
import { useTheme } from '@mui/material'; // Corrected import
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import EChartsReactCore from 'echarts-for-react/lib/core';
import useAnalytics from '../hook/useAnalytics';
import { User} from 'utils/interfaces';
import customShadows from 'theme/shadows';
import PiChart from './PiChart';
import dayjs from 'dayjs';

interface YourPiChartProps {
  user: User | null;
}

interface PiChartDataItem {
  id: number;
  name: string;
  value: number; // Percentage
  visible: boolean;
}

const YourPiChart = ({ user }: YourPiChartProps) => {
  const { transactions } = useAnalytics(user);
  const [timeline, setTimeline] = useState('monthly');
  const chartRef = useRef<EChartsReactCore>(null);
  const theme = useTheme(); // Corrected from useTheme0

  // Compute chart data based on transactions and timeline
  const chartData = useMemo(() => {
    const now = dayjs();
    let filteredTransactions = transactions.filter((tx) => tx.status === 'completed');

    // Filter transactions by timeline
    if (timeline === 'weekly') {
      const startOfWeek = now.startOf('week');
      filteredTransactions = filteredTransactions.filter(
        (tx) => tx.createdAt && dayjs(tx.createdAt).isAfter(startOfWeek),
      );
    } else if (timeline === 'monthly') {
      const startOfMonth = now.startOf('month');
      filteredTransactions = filteredTransactions.filter(
        (tx) => tx.createdAt && dayjs(tx.createdAt).isAfter(startOfMonth),
      );
    } else if (timeline === 'yearly') {
      const startOfYear = now.startOf('year');
      filteredTransactions = filteredTransactions.filter(
        (tx) => tx.createdAt && dayjs(tx.createdAt).isAfter(startOfYear),
      );
    }

    // Aggregate amounts by company
    const companyTotals = filteredTransactions.reduce((acc, tx) => {
      if (tx.companyName) {
        acc[tx.companyName] = (acc[tx.companyName] || 0) + tx.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate total amount
    const totalAmount = Object.values(companyTotals).reduce((sum, amount) => sum + amount, 0);

    // Convert to percentage data
    return Object.entries(companyTotals).map(([name], index) => ({
      id: index + 1,
      name,
      value: totalAmount > 0 ? Number(((companyTotals[name] / totalAmount) * 100).toFixed(2)) : 0,
      visible: true,
    }));
  }, [transactions, timeline]);

  const handleSelectChange = (event: SelectChangeEvent) => {
    setTimeline(event.target.value);
  };

  const toggleVisibility = (name: string) => {
    const updatedData = chartData.map((item) =>
      item.name === name ? { ...item, visible: !item.visible } : item,
    );
    updateChart(updatedData);
  };

  const updateChart = (data: PiChartDataItem[]) => {
    const echartsInstance = chartRef.current?.getEchartsInstance();
    if (!echartsInstance) return;

    const visibleData = data
      .filter((item) => item.visible)
      .map((item, index) => ({
        value: item.value,
        name: item.name,
        itemStyle: {
          color: index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
        },
      }));

    echartsInstance.setOption({
      series: [
        {
          data: visibleData,
        },
      ],
    });
  };

  return (
    <Paper sx={{ py: 2.5, height: 350 }}>
      <Stack alignItems="center" justifyContent="space-between" direction="row">
        <Typography variant="body1" fontWeight={700}>
          Investment Distribution
        </Typography>

        <FormControl
          variant="filled"
          sx={{
            minWidth: 110,
            '& .MuiInputBase-root': {
              '&:focus-within': {
                borderColor: 'transparent !important',
                boxShadow: 'none',
              },
            },
          }}
        >
          <Select id="select-filled" value={timeline} onChange={handleSelectChange}>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <PiChart chartRef={chartRef} data={chartData} sx={{ height: '180px !important' }} />

      <Stack px={2} py={1} alignItems="center" borderRadius={4} boxShadow={customShadows[1]} direction="row">
        {chartData.map((item, index) => (
          <React.Fragment key={item.id}>
            <Stack
              component={ButtonBase}
              width="50%"
              mt={0.75}
              spacing={0.75}
              alignItems="flex-start"
              justifyContent="center"
              onClick={() => toggleVisibility(item.name)}
              disableRipple
            >
              <Box
                height={10}
                width={10}
                borderRadius="50%"
                bgcolor={
                  item.visible
                    ? index % 2 === 0
                      ? 'primary.main'
                      : 'secondary.main'
                    : 'neutral.light'
                }
              />
              <Box mt={-0.55}>
                <Typography variant="caption" color="text.disabled">
                  {item.name}
                </Typography>
                <Typography variant="h6" textAlign="left">
                  {item.value}%
                </Typography>
              </Box>
            </Stack>
            {index < chartData.length - 1 && (
              <Divider sx={{ height: 50 }} orientation="vertical" variant="middle" flexItem />
            )}
          </React.Fragment>
        ))}
      </Stack>
    </Paper>
  );
};

export default YourPiChart;