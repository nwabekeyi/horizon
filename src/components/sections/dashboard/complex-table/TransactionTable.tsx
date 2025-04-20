import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid';
import DataGridFooter from 'components/common/DataGridFooter';
import IconifyIcon from 'components/base/IconifyIcon';
import ActionMenu from './ActionMenu';
import useAnalytics from '../hook/useAnalytics';
import { Withdrawal, User } from 'utils/interfaces';
import dayjs from 'dayjs';

interface TransactionTableProps {
  searchText: string;
  user: User | null;
}

interface DisplayTransaction {
  _id: string;
  amount: number;
  createdAt: Date;
  status: 'pending' | 'failed' | 'successful';
  companyName: string;
  type: string;
}

const mockWithdrawals: Withdrawal[] = [
  {
    _id: 'wd1',
    amount: 2000,
    createdAt: new Date('2025-04-20T12:00:00+01:00'),
    status: 'pending',
    bankAccount: 'Bank A - ****1234',
    type: 'withdrawal',
  },
  {
    _id: 'wd2',
    amount: 1500,
    createdAt: new Date('2025-04-19T09:30:00+01:00'),
    status: 'successful',
    bankAccount: 'Bank B - ****5678',
    type: 'withdrawal',
  },
  {
    _id: 'wd3',
    amount: 500,
    createdAt: new Date('2025-04-18T14:15:00+01:00'),
    status: 'failed',
    bankAccount: 'Bank C - ****9012',
    type: 'withdrawal',
  },
];

const columns: GridColDef[] = [
  {
    field: '__check__',
    headerName: '',
    width: 52,
    sortable: false,
    disableColumnMenu: true,
  },
  {
    field: '_id',
    headerName: 'ID',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 130,
    renderHeader: () => (
      <Typography variant="body2" color="text.disabled" fontWeight={500} ml={1}>
        ID
      </Typography>
    ),
    renderCell: (params: GridCellParams) => {
      const id = params.value;
      const shortenedId = id && id.length > 6 ? `${id.slice(0, 6)}...` : id;

      return (
        <Stack ml={1} height={1} direction="column" alignSelf="center" justifyContent="center">
          <Typography variant="body2" fontWeight={600}>
            {shortenedId}
          </Typography>
        </Stack>
      );
    },
  },
  {
    field: 'companyName',
    headerName: 'Company/Bank',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 150,
    renderCell: (params: GridCellParams) => (
      <Typography variant="body2" fontWeight={600}>
        {params.value || 'Unknown'}
      </Typography>
    ),
  },
  {
    field: 'amount',
    headerName: 'Amount (USD)',
    editable: false,
    align: 'left',
    flex: 1,
    minWidth: 120,
    renderCell: (params: GridCellParams) => (
      <Typography variant="body2" fontWeight={600}>
        ${params.value.toFixed(2)}
      </Typography>
    ),
  },
  {
    field: 'type',
    headerName: 'Type',
    editable: false,
    align: 'left',
    flex: 1,
    minWidth: 100,
    renderCell: (params: GridCellParams) => (
      <Typography variant="body2" fontWeight={600}>
        {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
      </Typography>
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    headerAlign: 'left',
    editable: false,
    flex: 1,
    minWidth: 120,
    renderCell: (params: GridCellParams) => {
      const status = params.value.toLowerCase();
      let color = '';
      let icon = '';

      if (status === 'successful') {
        color = 'success.main';
        icon = 'ic:baseline-check-circle';
      } else if (status === 'pending') {
        color = 'warning.main';
        icon = 'ic:baseline-hourglass-top';
      } else if (status === 'failed') {
        color = 'error.main';
        icon = 'ic:baseline-cancel';
      }

      return (
        <Stack alignItems="center" spacing={0.8} height={1}>
          <IconifyIcon icon={icon} color={color} fontSize="h5.fontSize" />
          <Typography variant="body2" fontWeight={600}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Typography>
        </Stack>
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Date',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 150,
    renderCell: (params: GridCellParams) => (
      <Typography variant="body2" fontWeight={600}>
        {params.value instanceof Date && !isNaN(params.value.getTime())
          ? dayjs(params.value).format('MMM DD, YYYY HH:mm')
          : 'N/A'}
      </Typography>
    ),
  },
  {
    field: 'action',
    headerName: 'Action',
    headerAlign: 'right',
    align: 'right',
    editable: false,
    sortable: false,
    flex: 1,
    minWidth: 100,
    renderHeader: () => null,
    renderCell: (params: GridCellParams) => (
      <ActionMenu
        transactionId={params.row._id}
        status={params.row.status}
        onAction={(action, id) => {
          console.log(`Action: ${action} for transaction ID: ${id}`);
          // Add logic for API or status handling here
        }}
      />
    ),
  },
];

const TransactionTable = ({ searchText, user }: TransactionTableProps) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const { transactions: investmentTransactions } = useAnalytics(user);

  const allTransactions: DisplayTransaction[] = [
    ...investmentTransactions.map((tx) => {
      const createdAt =
        tx.createdAt instanceof Date
          ? tx.createdAt
          : new Date(tx.createdAt || Date.now());

      const normalizedStatus: DisplayTransaction['status'] =
        tx.status === 'completed'
          ? 'successful'
          : (tx.status as DisplayTransaction['status']);

      return {
        _id: tx._id,
        amount: tx.amount,
        createdAt,
        status: normalizedStatus,
        companyName: tx.companyName || 'Unknown',
        type: 'investment',
      };
    }),
    ...mockWithdrawals.map((wd) => ({
      _id: wd._id,
      amount: wd.amount,
      createdAt: wd.createdAt,
      status: wd.status,
      companyName: wd.bankAccount || 'Unknown',
      type: 'withdrawal',
    })),
  ];

  const filteredTransactions = allTransactions.filter(
    (tx) =>
      tx._id.toLowerCase().includes(searchText.toLowerCase()) ||
      tx.companyName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <DataGrid
      density="standard"
      columns={columns}
      rows={filteredTransactions}
      rowHeight={52}
      disableColumnMenu
      disableColumnSelector
      disableSelectionOnClick
      pagination
      page={page}
      pageSize={pageSize}
      onPageChange={(newPage) => setPage(newPage)}
      onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      components={{
        Footer: DataGridFooter,
      }}
      checkboxSelection
      getRowId={(row) => row._id}
    />
  );
};

export default TransactionTable;
