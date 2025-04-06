import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const CardMedia: Components<Omit<Theme, 'components'>>['MuiCardMedia'] = {
  styleOverrides: {
    root: {},
    img: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius * 2.5,
    }),
  },
};

export default CardMedia;
