import { Theme } from '@mui/material/styles';
import { Components } from '@mui/material/styles';

const FormControl: Components<Omit<Theme, 'components'>>['MuiFormControl'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    }),
  },
};

export default FormControl;
