import { FC } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

interface BalanceProps {
  balance: number;
}

const Balance: FC<BalanceProps> = ({ balance }) => {
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
        <IconifyIcon icon="mdi:wallet" fontSize="h2.fontSize" color="primary.main" />
      </Stack>
      <div>
        <Typography variant="body2" color="text.disabled">
          Your Balance
        </Typography>
        <Typography mt={0.25} variant="h3">
          ${balance.toFixed(2)}
        </Typography>
      </div>
    </Stack>
  );
};

export default Balance;