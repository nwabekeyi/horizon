import { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import DataGridFooter from 'components/common/DataGridFooter';
import { blue, gray, white } from 'theme/colors'; // Import colors

interface ReusableDataTableProps<T> {
  data: T[];
  columns: GridColDef[];
  searchText?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  checkboxSelection?: boolean;
  showFooter?: boolean;
  tableHeight: number; // height as a prop
}

const Table = <T extends { id?: string | number }>({
  data,
  columns,
  searchText = '',
  pageSizeOptions = [4, 10, 20],
  defaultPageSize = 4,
  checkboxSelection = false,
  showFooter = true,
  tableHeight, // destructure the tableHeight prop
}: ReusableDataTableProps<T>) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const rows: GridRowsProp = data.map((item, index) => ({
    id: item.id ?? `row-${index}`,
    ...item,
  }));

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [rows, searchText]);

  return (
    <Box sx={{
      height: tableHeight, // apply the tableHeight prop here
      width: '100%',
      boxShadow: `0 4px 6px ${gray[500]}`, // Box shadow added to the parent Box
      borderRadius: '10px', // Rounded corners
    }}>
      <DataGrid
        rows={filteredRows}
        columns={columns}
        density="standard"
        rowHeight={52}
        pagination
        page={page}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={pageSizeOptions}
        disableColumnMenu
        disableColumnSelector
        disableSelectionOnClick
        checkboxSelection={checkboxSelection}
        components={{
          Footer: showFooter ? DataGridFooter : undefined,
        }}
        sx={{
          '& .MuiDataGrid-root': {
            backgroundColor: white[500], // Light background color for the grid
          },
          '& .MuiDataGrid-header': {
            padding: '5px', // Add 5px padding to the header
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: blue[500], // Footer background color
            color: white[100], // Footer text color
            padding: '5px', // Add 5px padding to the footer
          },
          '& .MuiDataGrid-cell': {
            padding: '10px', // Padding for cells
            color: gray[900], // Text color
            borderBottom: `1px solid ${gray[500]}`, // Border between rows
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: blue[500], // Hover effect for row
              color: white[100], // Text color on hover
              cursor: 'pointer', // Pointer cursor on hover
            },
          },
          '& .MuiDataGrid-row:nth-of-type(even)': {
            backgroundColor: gray[100], // Alternating row background
          },
          '& .css-1myfxih-MuiStack-root, .css-f3jnds-MuiDataGrid-columnHeaders': {
            padding: '10px', // Alternating row background
          },
        }}
      />
    </Box>
  );
};

export default Table;
