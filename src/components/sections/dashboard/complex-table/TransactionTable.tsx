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
import IconifyIcon from 'components/base/IconifyIcon'; // Make sure this component supports icon name + sx props

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

const getCurrencyIcon = (currency: string | undefined) => {
  switch (currency?.toLowerCase()) {
    case 'usd':
      return <FaDollarSign style={{ fontSize: 15, color: '#85bb65' }} />;
    case 'cad':
      return <FaDollarSign style={{ fontSize: 15, color: '#d80621' }} />;
    case 'eur':
      return <FaEuroSign style={{ fontSize: 15, color: '#003399' }} />;
    case 'gbp':
      return <FaPoundSign style={{ fontSize: 15, color: '#00247d' }} />;
    case 'btc':
      return <FaBitcoin style={{ fontSize: 15, color: '#f7931a' }} />;
    case 'eth':
      return <FaEthereum style={{ fontSize: 15, color: '#3c3c3d' }} />;
    case 'usdt':
      return (
        <IconifyIcon
          icon="cryptocurrency:usdt"
          sx={{ fontSize: 15, color: '#26a17b', verticalAlign: 'middle' }}
        />
      );
    default:
      return <FaDollarSign style={{ fontSize: 15, color: '#999' }} />;
  }
};

const TransactionTable = ({
  searchText,
  itemsPerPage,
  transactions,
  actions,
}: TransactionTableProps) => {
  const [page, setPage] = useState<number>(0);

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
        <>
          {getCurrencyIcon(params.row.currency)} {params.value}
        </>
      ),
    },
    { field: 'companyName', headerName: 'Company', flex: 1 },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      renderCell: (params: GridCellParams) =>
        dayjs(params.value).format('MMM DD, YYYY'),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params: GridCellParams) => {
        const status = params.value as string;
        const statusStyles: { [key: string]: { backgroundColor: string; color: string } } = {
          pending: { backgroundColor: '#fff9c4', color: '#856404' }, // Yellow
          processing: { backgroundColor: '#c8e6c9', color: '#2e7d32' }, // Light green
          approved: { backgroundColor: '#388e3c', color: '#ffffff' }, // Dark green
          canceled: { backgroundColor: '#ffcdd2', color: '#c62828' }, // Light red
          failed: { backgroundColor: '#d32f2f', color: '#ffffff' }, // Dark red
          successful: { backgroundColor: '#388e3c', color: '#ffffff' }, // Dark green
        };

        const style = statusStyles[status] || {
          backgroundColor: '#e0e0e0',
          color: '#000000',
        }; // Default gray

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
            }}
          >
            {status}
          </Box>
        );
      },
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
                      sx={{ cursor: 'pointer', fontSize: 24 }}
                      onClick={() => action.onClick(row._id)}
                    />
                  ) : (
                    <span
                      style={{
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                      onClick={() => action.onClick(row._id)}
                    >
                      {action.label}
                    </span>
                  )}
                </span>
              </Tooltip>
            ))}
          </Stack>
        );
      },
    });
  }

  return (
    <DataGrid
      sx={{ px: 2 }}
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
    />
  );
};

export default TransactionTable;
