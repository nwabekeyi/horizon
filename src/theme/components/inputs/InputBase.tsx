import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';
import { blue

 } from 'theme/colors';
const InputBase: Components<Omit<Theme, 'components'>>['MuiInputBase'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      border: 1,
      borderStyle: 'solid',
      borderColor: theme.palette.text.primary,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: `${theme.palette.info.lighter} !important`,
      fontSize: theme.typography.subtitle2.fontSize,
      color: theme.palette.text.secondary,
      padding: theme.spacing(1.45, 2),
      letterSpacing: 0.5,

      '&:focus-within': {
        borderColor: theme.palette.primary.main,
      },

      '&:before, &:after': {
        display: 'none',
      },
    }),
    colorSecondary: () => ({
      backgroundColor: `${blue[500]} !important`,
    }),
    sizeSmall: ({ theme }) => ({
      padding: theme.spacing(1, 1.25),
      paddingLeft: `${theme.spacing(1.75)} !important`,
      fontSize: theme.typography.caption.fontSize,
    }),
    input: ({ theme }) => ({
      '&::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 1,
      },
    }),
    inputSizeSmall: ({ theme }) => ({
      marginBottom: theme.spacing(0.2),
    }),
  },
};

export default InputBase;
