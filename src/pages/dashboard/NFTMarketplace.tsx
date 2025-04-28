import { useEffect, useState } from 'react';
import { CircularProgress, Alert, Box, Link } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import Table from 'components/base/table';
import TrendingCryptos from 'components/sections/dashboard/trendingCryptos';

interface CryptoItem {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  image: string;
}

interface ApiError {
  message: string;
  status?: number;
}

const NFTMarketplace = (): JSX.Element => {
  const [data, setData] = useState<{ assets: CryptoItem[] } | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCryptoPrices = async () => {
      console.log('API call started:', new Date().toISOString());

      try {
        const endpoint = 'https://api.coingecko.com/api/v3/coins/markets';
        const params = new URLSearchParams({
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum,ripple,litecoin,cardano,polkadot,dogecoin,solana,binancecoin,uniswap,chainlink,tron,avax,matic,algorand,monero,stellar,vechain,cosmos,dash,zcash,ethereum-classic,ftx-token,neo,tezos,elrond,terra,luna,axie-infinity,sand,december,blockstack', // 30 coins
        });

        const response = await fetch(`${endpoint}?${params}`);
        const data: CryptoItem[] = await response.json();
        if (!isMounted) {
          console.log('Component unmounted, skipping state update');
          return;
        }
        if (response.ok) {
          setData({ assets: data });
        } else {
          throw new Error('Failed to fetch cryptocurrency prices');
        }
      } catch (err: unknown) {
        console.error('Error fetching crypto prices:', err);
        if (!isMounted) {
          console.log('Component unmounted, skipping error state update');
          return;
        }
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch crypto prices';
        setError({
          message: errorMessage,
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        console.log('API call completed:', new Date().toISOString());
      }
    };

    fetchCryptoPrices();

    return () => {
      isMounted = false;
      console.log('useEffect cleanup:', new Date().toISOString());
    };
  }, []);

  // Define table columns for displaying crypto prices
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Coin', width: 150 },
    { field: 'symbol', headerName: 'Symbol', width: 100 },
    { field: 'current_price', headerName: 'Price (USD)', width: 150 },
    { field: 'market_cap', headerName: 'Market Cap (USD)', width: 200 },
    { field: 'total_volume', headerName: '24h Volume (USD)', width: 200 },
    { field: 'price_change_percentage_24h', headerName: '24h Change (%)', width: 150 },
    {
      field: 'trade_link',
      headerName: 'Trade Link',
      width: 200,
      renderCell: (params) => {
        const coinId = params.row.id;
        return (
          <Link
            href={`https://etherscan.io/token/${coinId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ color: 'primary.main' }}
          >
            Trade on Etherscan
          </Link>
        );
      },
    },
  ];

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <TrendingCryptos />
      <Table
        data={data?.assets || []}
        columns={columns}
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection={false}
        showFooter={true}
        tableHeight={600} // Pass the table height here
      />
    </Box>
  );
};

export default NFTMarketplace;
