// src/theme/components/data-grid/DataGrid.tsx

const DataGrid = {
  styleOverrides: {
    root: {
      border: 'none',
      borderRadius: '0 !important',
      '--DataGrid-rowBorderColor': '#e0e0e0',
      '&:hover, &:focus': {
        '*::-webkit-scrollbar, *::-webkit-scrollbar-thumb': {
          visibility: 'visible',
        },
      },
      '& .MuiDataGrid-scrollbar--vertical': {
        visibility: 'hidden',
      },
      '& .MuiDataGrid-scrollbarFiller': {
        minWidth: 0,
      },
    },

    row: {
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },

    cell: {
      padding: 0,
      color: '#1a1a1a',
      fontSize: '14px',
      fontWeight: 600,
      '&:focus-within': {
        outline: 'none !important',
      },
    },

    cellCheckbox: {
      justifyContent: 'flex-end',
    },

    columnHeaderCheckbox: {
      '& .MuiDataGrid-columnHeaderTitleContainer': {
        justifyContent: 'flex-end',
      },
    },

    columnHeader: {
      padding: 0,
      borderBottom: '1px solid #90caf9',
      height: '3rem !important',
      '&:focus-within': {
        outline: 'none !important',
      },
    },

    columnHeaderTitle: {
      color: '#9e9e9e',
      fontSize: '14px',
      fontWeight: 500,
    },

    iconButtonContainer: {
      '& .MuiIconButton-root': {
        backgroundColor: 'transparent !important',
        border: 'none',
      },
    },

    columnSeparator: {
      display: 'none',
    },

    selectedRowCount: {
      display: 'none',
    },

    footerContainer: {
      border: 0,
      borderTop: '1px solid #90caf9',
    },
  },
};

export default DataGrid;
