import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid';
import DataGridFooter from 'components/common/DataGridFooter';
import IconifyIcon from 'components/base/IconifyIcon';
import { rows as rowData } from 'data/complexTableData';
import ActionMenu from './ActionMenu';

// Define the Row data type with id being either string or number
interface RowData {
  id: string | number;
  name: string;
  status: string;
  date: string;
  progress: number;
  quantity: number;
  balance: number;
}

// Define columns with correct type for `GridColDef`
const columns: GridColDef[] = [
  {
    field: '__check__',
    headerName: '',
    width: 52,
    sortable: false,
    disableColumnMenu: true,
  },
  {
    field: 'id',
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
    renderCell: (params: GridCellParams) => (
      <Stack ml={1} height={1} direction="column" alignSelf="center" justifyContent="center">
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'name',
    headerName: 'NAME',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 190,
  },
  {
    field: 'status',
    headerName: 'STATUS',
    headerAlign: 'left',
    editable: false,
    flex: 1,
    minWidth: 160,
    renderCell: (params: GridCellParams) => {
      const status = params.value.toLowerCase();
      let color = '';
      let icon = '';

      if (status === 'approved') {
        color = 'success.main';
        icon = 'ic:baseline-check-circle';
      } else if (status === 'error') {
        color = 'warning.main';
        icon = 'ic:baseline-error';
      } else if (status === 'disable') {
        color = 'error.main';
        icon = 'ic:baseline-cancel';
      }

      return (
        <Stack alignItems="center" spacing={0.8} height={1}>
          <IconifyIcon icon={icon} color={color} fontSize="h5.fontSize" />
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Stack>
      );
    },
  },
  {
    field: 'date',
    headerName: 'DATE',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 150,
  },
  {
    field: 'progress',
    headerName: 'PROGRESS',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 220,
    renderCell: (params: GridCellParams) => {
      return (
        <Stack alignItems="center" pr={5} height={1} width={1}>
          <Typography variant="body2" fontWeight={600} minWidth={40}>
            {params.value}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{
              width: 1,
              height: 6,
              borderRadius: 10,
              bgcolor: 'info.dark',
              '& .MuiLinearProgress-bar': {
                borderRadius: 10,
              },
            }}
          />
        </Stack>
      );
    },
  },
  {
    field: 'quantity',
    headerName: 'QUANTITY',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 100,
  },
  {
    field: 'balance',
    headerName: 'BALANCE',
    headerAlign: 'right',
    align: 'right',
    editable: false,
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'action',
    headerAlign: 'right',
    align: 'right',
    editable: false,
    sortable: false,
    flex: 1,
    minWidth: 100,
    renderHeader: () => <ActionMenu />,
    renderCell: () => <ActionMenu />,
  },
];

interface TaskOverviewTableProps {
  searchText: string;
}

const DataTable = ({ searchText }: TaskOverviewTableProps) => {
  const [page, setPage] = useState(0); // Keep track of current page
  const [pageSize, setPageSize] = useState(4); // Set default page size

  // Define the rows type
  const rows: RowData[] = rowData.map((data) => ({
    ...data,
    balance: Number(data.balance), // Ensure balance is a number
  }));

  useEffect(() => {
    // Implement filtering logic here if needed
  }, [searchText]);

  return (
    <DataGrid
      density="standard"
      columns={columns}
      rows={rows}
      rowHeight={52}
      disableColumnMenu
      disableColumnSelector
      disableSelectionOnClick
      pagination
      page={page} // Set current page
      pageSize={pageSize} // Set page size
      onPageChange={(newPage) => setPage(newPage)} // Update page on change
      onPageSizeChange={(newPageSize) => setPageSize(newPageSize)} // Update page size on change
      components={{
        Footer: DataGridFooter, // Use the components prop for custom footer
      }}
      checkboxSelection
    />
  );
};

export default DataTable;
