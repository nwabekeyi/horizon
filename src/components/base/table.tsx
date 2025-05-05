import { useMemo, useState, ChangeEvent } from 'react';
import { Box, LinearProgress, Pagination } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import DataGridFooter from 'components/common/DataGridFooter';
import { blue, white, gray, skyblue } from 'theme/colors'; // Your existing color tokens

interface ReusableDataTableProps<T> {
  data: T[];
  columns: GridColDef[];
  searchText?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  checkboxSelection?: boolean;
  showFooter?: boolean;
  tableHeight: number;
}

const Table = <T extends { id?: string | number }>({
  data,
  columns,
  searchText = '',
  pageSizeOptions = [4, 10, 20],
  defaultPageSize = 4,
  checkboxSelection = false,
  showFooter = true,
  tableHeight,
}: ReusableDataTableProps<T>) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Define the color shades type inline
  type ColorShades = { [key: number]: string };

  // Assert imported colors as typed
  const blueColors = blue as ColorShades;
  const whiteColors = white as ColorShades;
  const grayColors = gray as ColorShades;
  const skyblueColors = skyblue as ColorShades;

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
    <Box
      sx={{
        height: tableHeight,
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Montserrat',
        backgroundColor: whiteColors[100],
      }}
    >
      {filteredRows.length === 0 && (
        <LinearProgress sx={{ backgroundColor: blueColors[500] }} />
      )}
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
          LoadingOverlay: () => (
            <LinearProgress sx={{ backgroundColor: blueColors[500] }} />
          ),
          Pagination: () => (
            <Box
              sx={{
                padding: '20px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                '& .MuiPaginationItem-root': {
                  color: skyblueColors[500],
                  fontFamily: 'Montserrat',
                },
              }}
            >
              <Pagination
                count={Math.ceil(filteredRows.length / pageSize)}
                page={page + 1}
                onChange={(
                  event: ChangeEvent<unknown>,
                  value: number
                ) => setPage(value - 1)}
              />
            </Box>
          ),
        }}
        sx={{
          '& .MuiDataGrid-root': {
            backgroundColor: whiteColors[100],
            fontFamily: 'Montserrat',
            border: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: blueColors[700],
            color: whiteColors[100],
            fontWeight: 700,
            fontFamily: 'Montserrat',
            padding: '10px',
          },
          '& .MuiDataGrid-cell': {
            color: '#333',
            backgroundColor: whiteColors[100],
            padding: '10px',
            borderBottom: `1px solid ${grayColors[200]}`,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: grayColors[100],
            cursor: 'pointer',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: whiteColors[100],
            color: '#333',
            fontFamily: 'Montserrat',
            padding: '5px',
          },
          '& .MuiDataGrid-overlay': {
            backgroundColor: whiteColors[100],
          },
        }}
      />
    </Box>
  );
};

export default Table;
