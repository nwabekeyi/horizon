import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const FormControlLabel: Components<Omit<Theme, 'components'>>['MuiFormControlLabel'] = {
  styleOverrides: {
    root: {
      marginLeft: 0,
    },
    label: ({ theme }) => ({
      marginLeft: 0,
      letterSpacing: 0.25,
      fontSize: theme.typography.body2.fontSize,
      userSelect: 'none',
      fontWeight: 500,
    }),
  },
};

export default FormControlLabel;
