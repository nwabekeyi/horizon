import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const Avatar: Components<Omit<Theme, 'components'>>['MuiAvatar'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.info.lighter,
      backgroundColor: theme.palette.primary.main,
    }),
  },
};

export default Avatar;
