import { useState, useMemo } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid';
import DataGridFooter from 'components/common/DataGridFooter';
import {
  FaBitcoin,
  FaEthereum,
  FaDollarSign,
  FaEuroSign,
  FaPoundSign,
} from 'react-icons/fa';
import dayjs from 'dayjs';
import { DisplayTransaction } from 'utils/interfaces';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTheme } from '@mui/material/styles';

interface ActionItem {
  icon?: string;
  label: string;
  onClick: (id: string) => void;
}

interface TransactionTableProps {
  searchText: string;
  itemsPerPage: number;
  transactions: DisplayTransaction[];
  actions?: ActionItem[] | ((transaction: DisplayTransaction) => ActionItem[]);
}

const getCurrencyIcon = (currency: string | undefined, fontSize: string) => {
  switch (currency?.toLowerCase()) {
    case 'usd':
      return <FaDollarSign style={{ fontSize, color: '#85bb65' }} />;
    case 'cad':
      return <FaDollarSign style={{ fontSize, color: '#d80621' }} />;
    case 'eur':
      return <FaEuroSign style={{ fontSize, color: '#003399' }} />;
    case 'gbp':
      return <FaPoundSign style={{ fontSize, color: '#00247d' }} />;
    case 'btc':
      return <FaBitcoin style={{ fontSize, color: '#f7931a' }} />;
    case 'eth':
      return <FaEthereum style={{ fontSize, color: '#3c3c3d' }} />;
    case 'usdt':
      return (
        <IconifyIcon
          icon="cryptocurrency:usdt"
          sx={{ fontSize, color: '#26a17b', verticalAlign: 'middle' }}
        />
      );
    default:
      return <FaDollarSign style={{ fontSize, color: '#999' }} />;
  }
};

const TransactionTable = ({
  searchText,
  itemsPerPage,
  transactions,
  actions,
}: TransactionTableProps) => {
  const [page, setPage] = useState<number>(0);
  const theme = useTheme();

  const filteredTransactions = useMemo(() => {
    if (!searchText) return transactions;
    return transactions.filter(
      (transaction) =>
        transaction.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.status.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction._id.toLowerCase().includes(searchText.toLowerCase()) ||
        (transaction.currency && transaction.currency.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, transactions]);

  const columns: GridColDef[] = [
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getCurrencyIcon(
            params.row.currency,
            theme.typography.body2.fontSize as string // Responsive, ~0.875rem
          )}
          <Box
            component="span"
            sx={{
              fontSize: {
                xs: '0.75rem', // Smaller on mobile
                sm: '0.875rem', // Matches body2
                md: '1rem', // Slightly larger on desktop
              },
            }}
          >
            {params.value}
          </Box>
        </Box>
      ),
      headerClassName: 'responsive-header',
      cellClassName: 'responsive-cell',
    },
    {
      field: 'companyName',
      headerName: 'Company',
      flex: 1,
      headerClassName: 'responsive-header',
      cellClassName: 'responsive-cell',
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      renderCell: (params: GridCellParams) =>
        dayjs(params.value).format('MMM DD, YYYY'),
      headerClassName: 'responsive-header',
      cellClassName: 'responsive-cell',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params: GridCellParams) => {
        const status = params.value as string;
        const statusStyles: { [key: string]: { backgroundColor: string; color: string } } = {
          pending: { backgroundColor: '#fff9c4', color: '#856404' },
          processing: { backgroundColor: '#c8e6c9', color: '#2e7d32' },
          approved: { backgroundColor: '#388e3c', color: '#ffffff' },
          canceled: { backgroundColor: '#ffcdd2', color: '#c62828' },
          failed: { backgroundColor: '#d32f2f', color: '#ffffff' },
          successful: { backgroundColor: '#388e3c', color: '#ffffff' },
        };

        const style = statusStyles[status] || {
          backgroundColor: '#e0e0e0',
          color: '#000000',
        };

        return (
          <Box
            sx={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: '12px',
              backgroundColor: style.backgroundColor,
              color: style.color,
              fontWeight: 'medium',
              textTransform: 'capitalize',
              fontSize: {
                xs: '0.5rem',
                sm: '0.7rem',
                md: '0.8rem',
              },
            }}
          >
            {status}
          </Box>
        );
      },
      headerClassName: 'responsive-header',
      cellClassName: 'responsive-cell',
    },
  ];

  if (actions) {
    columns.push({
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params: GridCellParams) => {
        const row = params.row as DisplayTransaction;
        const actionList: ActionItem[] =
          typeof actions === 'function' ? actions(row) : actions;

        return (
          <Stack direction="row" spacing={1}>
            {actionList.map((action, index) => (
              <Tooltip key={index} title={action.label}>
                <span>
                  {action.icon ? (
                    <IconifyIcon
                      icon={action.icon}
                      sx={{
                        cursor: 'pointer',
                        fontSize: {
                          xs: '1rem', // 16px on mobile
                          sm: '1.25rem', // 20px on tablet
                          md: '1.5rem', // 24px on desktop
                        },
                      }}
                      onClick={() => action.onClick(row._id)}
                    />
                  ) : (
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: {
                          xs: '0.75rem',
                          sm: '0.875rem',
                          md: '1rem',
                        },
                      }}
                      onClick={() => action.onClick(row._id)}
                    >
                      {action.label}
                    </Box>
                  )}
                </span>
              </Tooltip>
            ))}
          </Stack>
        );
      },
      headerClassName: 'responsive-header',
      cellClassName: 'responsive-cell',
    });
  }

  return (
    <DataGrid
      autoHeight
      pageSize={itemsPerPage}
      rowsPerPageOptions={[itemsPerPage]}
      rows={filteredTransactions}
      columns={columns}
      getRowId={(row) => row._id}
      onPageChange={(newPage) => setPage(newPage)}
      page={page}
      components={{
        Footer: DataGridFooter,
      }}
      sx={{
        // Responsive font sizes for headers
        '& .css-1epsd68-MuiDataGrid-columnHeaderTitle ': {
          fontSize: {
            xs: '0.65rem', // 12px on mobile
            sm: '0.75rem', // 14px on tablet
            md: '1rem', // 16px on desktop
          },
          fontWeight: 'bold',
        },
        // Responsive font sizes for cells
        '& .responsive-cell': {
          fontSize: {
            xs: '0.6rem', // 12px on mobile
            sm: '0.75rem', // 14px on tablet
            md: '1rem', // 16px on desktop
          },
        },
      }}
    />
  );
};

export default TransactionTable;