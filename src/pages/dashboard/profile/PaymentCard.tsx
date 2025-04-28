import {
  Box,
  Card,
  IconButton,
  Typography,
  styled,
  useTheme,
  Avatar,
} from "@mui/material";
import { FC, MouseEvent } from "react";
import { FaEllipsisV } from "react-icons/fa";

// component props interface
interface PaymentDetailProps {
  paymentDetail: {
    type: 'fiat' | 'crypto';
    currency: 'usd' | 'cad' | 'eur' | 'gbp' | 'btc' | 'eth' | 'usdt';
    accountDetails: {
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      address?: string;
      network?: 'erc20' | 'trc20' | 'bep20' | 'polygon' | 'solana';
    };
  };
  handleMore: (event: MouseEvent<HTMLButtonElement>) => void;
}

// styled components
const SymbolAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  fontSize: 24,
  fontWeight: 700,
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.text.primary,
}));

// Currency symbols
const currencySymbols: { [key: string]: string } = {
  usd: '$',
  cad: 'C$',
  eur: '€',
  gbp: '£',
  btc: '₿',
  eth: 'Ξ',
  usdt: '₮', // you can change this if you prefer another symbol
};

const PaymentCard: FC<PaymentDetailProps> = ({ paymentDetail, handleMore }) => {
  const theme = useTheme();

  const currencySymbol = currencySymbols[paymentDetail.currency] || '?';

  return (
    <Card sx={{ padding: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <SymbolAvatar>
            {currencySymbol}
          </SymbolAvatar>

          <Box ml={1}>
            <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
              {paymentDetail.type.toUpperCase()} Payment
            </Typography>
            <Typography variant="caption" color="text.disabled" fontWeight={500}>
              {paymentDetail.currency.toUpperCase()}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={handleMore}>
          <FaEllipsisV size={18} color={theme.palette.text.disabled} />
        </IconButton>
      </Box>

      <Box mt={3}>
        {paymentDetail.type === 'fiat' ? (
          <>
            <Typography variant="body2" fontWeight={600}>
              Bank Name: {paymentDetail.accountDetails.bankName}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              Account Name: {paymentDetail.accountDetails.accountName}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              Account Number: {paymentDetail.accountDetails.accountNumber}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2" fontWeight={600}>
              Address: {paymentDetail.accountDetails.address}
            </Typography>
            {paymentDetail.accountDetails.network && (
              <Typography variant="body2" fontWeight={600}>
                Network: {paymentDetail.accountDetails.network.toUpperCase()}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Card>
  );
};

export default PaymentCard;
