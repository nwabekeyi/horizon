import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import IconifyIcon from 'components/base/IconifyIcon';

interface CryptoData {
  id: string;
  symbol: string; // e.g., BTC, ETH
  name: string; // e.g., Bitcoin, Ethereum
  current_price: number; // Current price in USD
  price_change_percentage_24h: number; // 24-hour price change percentage
  image: string; // URL to crypto logo
}

interface CryptoCardProps {
  data: CryptoData;
}

const CryptoCard = ({ data }: CryptoCardProps) => {
  return (
    <Card sx={{ p: 2, bgcolor: 'info.dark', userSelect: 'none' }}>
      <Box position="relative">
        <CardMedia component="img" height="120" image={data.image} alt={`${data.name} logo`} />
        <IconButton
          size="medium"
          edge="start"
          color="inherit"
          aria-label="favorite"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'info.lighter',
            '&:hover': { bgcolor: 'info.lighter' },
          }}
        >
          <IconifyIcon icon="ic:sharp-favorite-border" sx={{ pointerEvents: 'none' }} />
        </IconButton>
      </Box>
      <CardContent sx={{ mt: 1.5 }}>
        <Stack alignItems="center" justifyContent="space-between">
          <div>
            <Typography
              component={Link}
              href={`https://www.coingecko.com/en/coins/${data.id}`}
              variant="h6"
              color="text.primary"
              display="block"
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.name}
            </Typography>
            <Typography variant="subtitle2" color="text.disabled">
              {data.symbol}
            </Typography>
          </div>
        </Stack>

        <Stack mt={1.5} alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="primary.main" fontWeight={700}>
            Price: ${data.current_price.toFixed(2)}
          </Typography>
          <Typography
            variant="body2"
            color={data.price_change_percentage_24h >= 0 ? 'success.main' : 'error.main'}
            fontWeight={700}
          >
            24h: {data.price_change_percentage_24h >= 0 ? '+' : ''}{data.price_change_percentage_24h.toFixed(2)}%
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CryptoCard;