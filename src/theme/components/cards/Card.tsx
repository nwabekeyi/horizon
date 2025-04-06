import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const Card: Components<Omit<Theme, 'components'>>['MuiCard'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(2),
    }),
  },
};

export default Card;
