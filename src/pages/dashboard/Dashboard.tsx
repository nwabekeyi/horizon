import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Grid from '@mui/material/Grid';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme/theme';
import Calendar from 'components/sections/dashboard/calendar';
import Analytics from 'components/sections/dashboard/analytics';
import TotalSpent from 'components/sections/dashboard/total-spent';
import PiChart from 'components/sections/dashboard/your-pi-chart';
import InvestmentHistory from 'components/sections/dashboard/InvestmentHistory';
import Revenue from 'components/sections/dashboard/revenue';
import Referral from 'components/sections/dashboard/referral';
import { useUserDetails } from 'hooks/useUserdetails';
import TrendingCryptos from 'components/sections/dashboard/trendingCryptos';
import PendingTransactions from 'components/sections/dashboard/pendingTransactions';
import AllTransactions from 'components/sections/dashboard/complex-table';

interface DecodedToken {
  exp: number;
  [key: string]: unknown;
}

const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();

  // Access user from Redux store
  const user = useUserDetails();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/authentication/sign-in');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        localStorage.removeItem('token');
        navigate('/authentication/sign-in');
      }
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/authentication/sign-in');
    }
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <Analytics user={user} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TotalSpent user={user} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Revenue user={user} />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <PiChart user={user} />
        </Grid>
        <Grid item xs={12} lg={8} xl={6}>
          <TrendingCryptos />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <InvestmentHistory user={user} />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Calendar />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Referral/>
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <PendingTransactions user={user} />
        </Grid>
        <Grid item xs={12} lg={8} xl={6}>
          <AllTransactions user={user} />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Dashboard;