import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const PaginationItem: Components<Omit<Theme, 'components'>>['MuiPaginationItem'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.text.primary,
      fontSize: theme.typography.body2.fontSize,
      '&.Mui-selected': {
        color: theme.palette.info.lighter,
        backgroundColor: theme.palette.primary.main,
        '&:hover': { backgroundColor: theme.palette.primary.main },
      },
    }),
  },
};

export default PaginationItem;
