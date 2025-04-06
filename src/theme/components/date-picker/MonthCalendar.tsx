import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const MonthCalendar: Components<Omit<Theme, 'components'>>['MuiMonthCalendar'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      '& .MuiPickersMonth-root': {
        '& .MuiPickersMonth-monthButton': {
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
          },
        },
      },
    }),
  },
};

export default MonthCalendar;
