import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const List: Components<Omit<Theme, 'components'>>['MuiList'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(1),
    }),
  },
};

export default List;
