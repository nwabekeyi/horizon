import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const AppBar: Components<Omit<Theme, 'components'>>['MuiAppBar'] = {
  styleOverrides: {
    colorPrimary: {
      backgroundColor: 'transparent',
      borderRadius: 0,
      boxShadow: 'none',
    },
  },
};

export default AppBar;
