import Grid from '@mui/material/Grid'; // Use Grid2 for v7
import { ThemeProvider } from '@mui/material/styles';
import {theme} from 'theme/theme'; // Adjust path to your theme file
import Earnings from './Earnings';
import Sales from './Sales';
import Spend from './Spend';
import Tasks from './Tasks';
import Balance from './balance';
import Projects from './Projects';

const Analytics = () => {
  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <Earnings />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <Spend />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <Sales />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <Balance />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <Tasks />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <Projects />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Analytics;