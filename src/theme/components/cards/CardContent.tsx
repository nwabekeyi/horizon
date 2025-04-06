import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const CardContent: Components<Omit<Theme, 'components'>>['MuiCardContent'] = {
  styleOverrides: {
    root: {
      padding: 0,
      '&:last-child': {
        paddingBottom: 0,
      },
    },
  },
};

export default CardContent;
