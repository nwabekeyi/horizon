import { Transaction } from 'utils/interfaces'; // Assuming Transaction interface is defined
import customShadows from 'theme/shadows';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMenu from './CardMenu';
import dayjs from 'dayjs';

interface TransactionCardProps {
  data: Transaction;
  onAction: (action: string, transactionId: string) => void; // Callback for actions
}

const TransactionCard = ({ data, onAction }: TransactionCardProps) => {
  return (
    <Card sx={{ mb: 2.5, py: 1.75, borderRadius: 3.5, boxShadow: customShadows[1] }}>
      <Stack alignItems="center" justifyContent="space-between">
        <Stack spacing={1.5} alignItems="center" width="100%">
          <CardContent sx={{ width: '100%' }}>
            <Typography
              variant="body1"
              fontWeight={700}
              display="block"
              noWrap
            >
              {data.companyName || 'Unknown'}
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={600}
              mt={0.5}
            >
              Amount: ${data.amount.toFixed(2)}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              fontWeight={400}
              mt={0.5}
              noWrap
            >
              {data.createdAt ? dayjs(data.createdAt).format('MMM DD, YYYY HH:mm') : 'N/A'}
            </Typography>
          </CardContent>
        </Stack>

        <CardActions sx={{ mr: -1.5 }}>
          <CardMenu transactionId={data._id} onAction={onAction} />
        </CardActions>
      </Stack>
    </Card>
  );
};

export default TransactionCard;