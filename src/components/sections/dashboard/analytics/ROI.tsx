import { FC } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

interface RoiProps {
  ROI: number;
}

const Roi: FC<RoiProps> = ({ ROI }) => {
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
        <IconifyIcon icon="mdi:trending-up" fontSize="h2.fontSize" color="primary.main" />
      </Stack>
      <div>
        <Typography variant="body2" color="text.disabled">
          ROI
        </Typography>
        <Typography mt={0.25} variant="h3">
          ${ROI.toFixed(2)}
        </Typography>
      </div>
    </Stack>
  );
};

export default Roi;