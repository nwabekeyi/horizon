import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const YearCalendar: Components<Omit<Theme, 'components'>>['MuiYearCalendar'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      '& .MuiPickersYear-root': {
        '& .MuiPickersYear-yearButton': {
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
          },
        },
      },
    }),
  },
};

export default YearCalendar;
