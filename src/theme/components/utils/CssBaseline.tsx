import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles'; // Corrected import path for Components
import scrollbar from 'theme/styles/scrollbar';
import echart from 'theme/styles/echart';

// Using the correct type for the MuiCssBaseline component
const CssBaseline: Components<Theme>['MuiCssBaseline'] = {
  defaultProps: {},
  styleOverrides: (theme) => ({
    '*, *::before, *::after': {
      margin: 0,
      padding: 0,
    },
    html: {
      scrollBehavior: 'smooth',
    },
    body: {
      fontVariantLigatures: 'none',
      backgroundColor: theme.palette.info.main,
      ...scrollbar(theme),
    },
    ...echart(),
  }),
};

export default CssBaseline;
