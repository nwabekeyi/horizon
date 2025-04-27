import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import { FC } from 'react';

interface Withdrawal {
  withdrawals : number;
}

const MonthylWithrawal: FC<Withdrawal> = ({withdrawals}) => {
  return (
    <Stack component={Paper} p={2.5} alignItems="center" spacing={2.25} height={100}>
      <Stack
        alignItems="center"
        justifyContent="center"
        height={56}
        width={56}
        bgcolor="info.main"
        borderRadius="50%"
      >
        <IconifyIcon icon="ic:round-attach-money" fontSize="h2.fontSize" color="primary.main" />
      </Stack>
      <div>
        <Typography variant="body2" color="text.disabled" noWrap>
          Spend this month
        </Typography>
        <Typography mt={0.25} variant="h3">
          ${withdrawals.toFixed(2)}
        </Typography>
      </div>
    </Stack>
  );
};

export default MonthylWithrawal;
