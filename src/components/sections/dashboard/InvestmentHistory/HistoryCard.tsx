import { useRef } from 'react';
import { Transaction } from 'utils/interfaces';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import useResizeObserver from 'hooks/useResizeObserver';
import customShadows from 'theme/shadows';
import { formatDistanceToNow } from 'date-fns';

interface HistoryCardProps {
  data: Transaction;
}

const HistoryCard = ({ data }: HistoryCardProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerSize = useResizeObserver(containerRef);

  // Get status icon and color based on transaction status
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return { icon: 'mdi:check-circle', color: 'success.main' };
      case 'pending':
        return { icon: 'mdi:clock-outline', color: 'warning.main' };
      case 'failed':
        return { icon: 'mdi:close-circle', color: 'error.main' };
      default:
        return { icon: 'mdi:help-circle', color: 'text.secondary' };
    }
  };

  const { icon, color } = getStatusIcon(data.status);

  // Format time ago
  const timeAgo = data.createdAt
    ? formatDistanceToNow(data.createdAt, { addSuffix: true })
    : 'Unknown';

  return (
    <Card
      ref={containerRef}
      sx={{ p: 1.5, mb: 0.875, bgcolor: 'transparent', '&:hover': { boxShadow: customShadows[1] } }}
    >
      <Stack alignItems="center" justifyContent="space-between">
        <Stack spacing={2} alignItems="center" minWidth={190}>
          <Stack
            alignItems="center"
            justifyContent="center"
            height={60}
            width={60}
            bgcolor="info.main"
            borderRadius="50%"
          >
            <IconifyIcon icon={icon} fontSize="h4.fontSize" color={color} />
          </Stack>
          <div>
            <Typography
              component="span"
              mb={-0.45}
              variant="body2"
              fontWeight={700}
              display="block"
              noWrap
            >
              {data.companyName}
            </Typography>
            <Typography mt={-0.45} variant="caption" color="text.disabled" fontWeight={400} noWrap>
              Status: {data.status}
            </Typography>
          </div>
        </Stack>

        <Stack spacing={0.35} alignItems="center">
          <IconifyIcon
            icon={data.currencyType === 'crypto' ? 'ri:eth-fill' : 'mdi:cash'}
            fontSize="body2.fontSize"
          />
          <Typography variant="body2" fontWeight={700}>
            {data.amount.toFixed(2)} {data.currencyType === 'crypto' ? data.cryptoCurrency?.toUpperCase() : 'USD'}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.disabled"
          display={containerSize > 360 ? 'flex' : 'none'}
        >
          {timeAgo}
        </Typography>
      </Stack>
    </Card>
  );
};

export default HistoryCard;