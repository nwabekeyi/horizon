// src/components/common/StatusBadge.tsx
import { Typography } from '@mui/material';

interface StatusBadgeProps {
  status: string;
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'successful':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'failed':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Typography
      variant="body1"
      component="span"
      color={getStatusColor(status)}
    >
      {children}
    </Typography>
  );
};

export default StatusBadge;