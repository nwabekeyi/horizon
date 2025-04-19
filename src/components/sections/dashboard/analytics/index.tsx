import Grid from '@mui/material/Grid'; // Use Grid for MUI v5/6
import { ThemeProvider } from '@mui/material/styles';
import { theme } from 'theme/theme'; // Adjust path to your theme file
import Roi from './ROI';
import Spend from './Spend';
import CompanyInvestedIn from './CompanyInvestedIn';
import Balance from './balance';
import { User } from 'utils/interfaces'; // Import User interface
import TotalInvestments from './TotalInvestments';
import {FC} from 'react'
import useAnalytics from '../hook/useAnalytics';
import PendingInvestments from './PendingInvestments';

interface AnalyticsProps {
  user: User | null;
}

const Analytics: FC<AnalyticsProps> = ({ user }) => {
  const {
    totalInvestment,
    spentThisMonth,
    ROI,
    accountBalance,
    investedCompanies,
    pendingTransactions
  }= useAnalytics(user);
  console.log(investedCompanies)
  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <TotalInvestments totalInvestment={totalInvestment} />
        </Grid>

        <Grid item xs={12} sm={6} md={4} xl={2}>
          <Spend spent={spentThisMonth} />
        </Grid>

        <Grid item xs={12} sm={6} md={4} xl={2}>
          <Roi ROI={ROI} />
        </Grid>

        <Grid item xs={12} sm={6} md={4} xl={2}>
          <Balance balance={accountBalance}/>
        </Grid>

        <Grid item xs={12} sm={6} md={4} xl={2}>
          <CompanyInvestedIn companiesInvested={investedCompanies.length} />
        </Grid>

        <Grid item xs={12} sm={6} md={4} xl={2}>
          <PendingInvestments pendingInvestments={pendingTransactions.length} />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Analytics;