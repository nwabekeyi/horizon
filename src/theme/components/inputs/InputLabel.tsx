import { Theme } from '@mui/material/styles';
import { Components } from '@mui/material/styles';

const InputLabel: Components<Omit<Theme, 'components'>>['MuiInputLabel'] = {
  defaultProps: {
    shrink: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      left: 0,
      top: theme.spacing(-2.5),
      fontSize: theme.typography.body2.fontSize,
      color: theme.palette.text.primary,
      transform: 'none',
      fontWeight: 600,
      marginBottom: theme.spacing(5), // added padding bottom
    }),
  },
};

export default InputLabel;
