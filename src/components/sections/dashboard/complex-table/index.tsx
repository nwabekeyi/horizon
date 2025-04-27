import { useState, ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconifyIcon from 'components/base/IconifyIcon';
import TransactionTable from './TransactionTable'; // Ensure this imports correctly
import useAnalytics from 'components/sections/dashboard/hook/useAnalytics';
import { User } from 'utils/interfaces'; // Import User type
import { DisplayTransaction } from 'utils/interfaces'; // Import the shared DisplayTransaction type

const AllTransactions = ({ user }: { user: User | null }) => {
  const [searchText, setSearchText] = useState('');
  const { transactions, withdrawals } = useAnalytics(user);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Map transactions to DisplayTransaction format
  const allTransactions: DisplayTransaction[] = transactions.map((tx) => ({
    _id: tx._id,
    amount: tx.amount,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt || Date.now()),
    status: tx.status === 'completed' ? 'successful' : tx.status,
    companyName: tx.companyName || 'Unknown',
    type: 'transaction',
    currency: tx.cryptoCurrency || 'usd', // Default to USD if fiat
  }));

  // Map withdrawals to DisplayTransaction format
  const allWithdrawals: DisplayTransaction[] = withdrawals.map((wd) => {
    let companyName = 'Unknown';
    let currency: DisplayTransaction['currency'] = 'usd';
    if (wd.paymentAccountDetails) {
      const details = wd.paymentAccountDetails;
      if (details.type === 'fiat' && details.accountDetails.bankName) {
        companyName = details.accountDetails.bankName;
        currency = details.currency;
      } else if (details.type === 'crypto' && details.currency) {
        companyName = `${details.currency.toUpperCase()} Wallet`;
        currency = details.currency;
      }
    }

    return {
      _id: wd._id,
      amount: wd.amount,
      createdAt: wd.createdAt instanceof Date ? wd.createdAt : new Date(wd.createdAt || Date.now()),
      status: wd.status,
      companyName,
      type: 'withdrawal',
      currency,
    };
  });

  const combinedTransactions = [...allTransactions, ...allWithdrawals];

  return (
    <Box component={Paper} px={0} height={{ xs: 435, sm: 390 }}>
      <Stack
        px={3.5}
        spacing={{ xs: 2, sm: 0 }}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
      >
        <Typography variant="h4" textAlign={{ xs: 'center', sm: 'left' }}>
          All Transactions
        </Typography>

        <TextField
          variant="filled"
          size="small"
          placeholder="Search by ID or Company"
          value={searchText}
          onChange={handleInputChange}
          sx={{ mx: { xs: 'auto', sm: 'initial' }, width: 1, maxWidth: { xs: 300, sm: 220 } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconifyIcon icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box mt={{ xs: 1.25, sm: 1 }} height={313}>
        <TransactionTable
          searchText={searchText}
          itemsPerPage={10}
          transactions={combinedTransactions}
        />
      </Box>
    </Box>
  );
};

export default AllTransactions;
