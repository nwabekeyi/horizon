import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Stack, Paper, Divider, MenuItem, Typography,
  ButtonBase, FormControl, Select, SelectChangeEvent, useTheme,
} from '@mui/material';
import EChartsReactCore from 'echarts-for-react/lib/core';
import dayjs from 'dayjs';

import useAnalytics from '../hook/useAnalytics';
import PiChart from './PiChart';
import customShadows from 'theme/shadows';
import { User } from 'utils/interfaces';

interface YourPiChartProps {
  user: User | null;
}

interface PiChartDataItem {
  id: number;
  name: string;
  value: number;
  visible: boolean;
}

const YourPiChart = ({ user }: YourPiChartProps) => {
  const { transactions } = useAnalytics(user);
  const [timeline, setTimeline] = useState('monthly');
  const [visibleChartData, setVisibleChartData] = useState<PiChartDataItem[]>([]);
  const chartRef = useRef<EChartsReactCore>(null);
  const theme = useTheme();

  const colorPalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light,
  ];

  useEffect(() => {
    const now = dayjs();
    let filteredTransactions = transactions.filter((tx) => tx.status === 'completed');

    if (timeline === 'weekly') {
      filteredTransactions = filteredTransactions.filter((tx) =>
        tx.createdAt && dayjs(tx.createdAt).isAfter(now.startOf('week'))
      );
    } else if (timeline === 'monthly') {
      filteredTransactions = filteredTransactions.filter((tx) =>
        tx.createdAt && dayjs(tx.createdAt).isAfter(now.startOf('month'))
      );
    } else if (timeline === 'yearly') {
      filteredTransactions = filteredTransactions.filter((tx) =>
        tx.createdAt && dayjs(tx.createdAt).isAfter(now.startOf('year'))
      );
    }

    const companyTotals = filteredTransactions.reduce((acc, tx) => {
      if (tx.companyName) {
        acc[tx.companyName] = (acc[tx.companyName] || 0) + tx.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = Object.values(companyTotals).reduce((sum, amount) => sum + amount, 0);

    const chartItems = Object.entries(companyTotals).map(([name], index) => ({
      id: index + 1,
      name,
      value: totalAmount > 0 ? Number(((companyTotals[name] / totalAmount) * 100).toFixed(2)) : 0,
      visible: true,
    }));

    setVisibleChartData(chartItems);
  }, [transactions, timeline]);

  const handleSelectChange = (event: SelectChangeEvent) => {
    setTimeline(event.target.value);
  };

  const toggleVisibility = (name: string) => {
    setVisibleChartData((prevData) =>
      prevData.map((item) =>
        item.name === name ? { ...item, visible: !item.visible } : item
      )
    );
  };

  return (
    <Paper sx={{ py: 2.5, height: 350 }}>
      <Stack alignItems="center" justifyContent="space-between" direction="row" px={2}>
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

      <PiChart chartRef={chartRef} data={visibleChartData} sx={{ height: '180px !important' }} />

      <Box
        sx={{
          px: 2,
          py: 1,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: '8px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[500],
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[200],
            borderRadius: '4px',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.grey[500]} ${theme.palette.grey[200]}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          borderRadius={4}
          boxShadow={customShadows[1]}
          sx={{ flexWrap: 'nowrap', display: 'flex', minWidth: 'max-content' }}
        >
          {visibleChartData.map((item, index) => (
            <React.Fragment key={item.id}>
              <Stack
                component={ButtonBase}
                minWidth={150}
                mt={0.75}
                spacing={0.75}
                alignItems="flex-start"
                justifyContent="center"
                onClick={() => toggleVisibility(item.name)}
                disableRipple
                sx={{ flexShrink: 0 }}
              >
                <Box
                  height={10}
                  width={10}
                  borderRadius="50%"
                  bgcolor={
                    item.visible
                      ? colorPalette[index % colorPalette.length]
                      : 'neutral.light'
                  }
                />
                <Box
                  sx={{
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    maxWidth: 130,
                    '&::-webkit-scrollbar': { height: '4px' },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: theme.palette.grey[500],
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: theme.palette.grey[200],
                      borderRadius: '2px',
                    },
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${theme.palette.grey[500]} ${theme.palette.grey[200]}`,
                  }}
                >
                  <Typography variant="caption" color="text.disabled">
                    {item.name}
                  </Typography>
                  <Typography variant="h6" textAlign="left">
                    {item.value}%
                  </Typography>
                </Box>
              </Stack>
              {index < visibleChartData.length - 1 && (
                <Divider sx={{ height: 50, mx: 2 }} orientation="vertical" variant="middle" flexItem />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default YourPiChart;
