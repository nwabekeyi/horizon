import { useEffect, useState } from 'react';
import { CircularProgress, Alert, Box, Link, Typography, Card, CardContent } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Table from 'components/base/table';
import TrendingCryptos from 'components/sections/dashboard/trendingCryptos';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Interface for CoinGecko API response
interface CoinGeckoItem {
  id: string;
  name: string;
  symbol: string;
  current_price: number | string;
  market_cap: number | string;
  total_volume: number | string;
  price_change_24h: number | string;
  price_change_percentage_24h: number | string;
  image: string;
}

// Interface for CryptoItem (used in state)
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

// Interface for Etherscan NFT Transfer
interface NFTTransfer {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  contractAddress: string;
  from: string;
  to: string;
  tokenID: string;
  tokenName: string;
  tokenSymbol: string;
}

// Interface for Etherscan API response
interface EtherscanResponse {
  status: string;
  message: string;
  result: NFTTransfer[];
}

interface ApiError {
  message: string;
  status?: number;
}

// Blockchain explorer mapping
const BLOCKCHAIN_EXPLORERS: { [key: string]: { url: string; type: string; chain: string } } = {
  ethereum: { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  uniswap: { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  chainlink: { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  matic: { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  'axie-infinity': { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  sand: { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  binancecoin: { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  avax: { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  'ftx-token': { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  decentraland: { url: 'https://etherscan.io/token', type: 'token', chain: 'Ethereum' },
  bitcoin: { url: 'https://blockchair.com/bitcoin', type: 'coin', chain: 'Bitcoin' },
  ripple: { url: 'https://xrpscan.com', type: 'coin', chain: 'XRP Ledger' },
  litecoin: { url: 'https://blockchair.com/litecoin', type: 'coin', chain: 'Litecoin' },
  cardano: { url: 'https://explorer.cardano.org/en', type: 'coin', chain: 'Cardano' },
  polkadot: { url: 'https://polkadot.subscan.io', type: 'coin', chain: 'Polkadot' },
  dogecoin: { url: 'https://dogechain.info', type: 'coin', chain: 'Dogecoin' },
  solana: { url: 'https://solscan.io', type: 'coin', chain: 'Solana' },
  tron: { url: 'https://tronscan.org', type: 'coin', chain: 'TRON' },
  algorand: { url: 'https://algoexplorer.io', type: 'coin', chain: 'Algorand' },
  monero: { url: 'https://monerohash.com/explorer', type: 'coin', chain: 'Monero' },
  stellar: { url: 'https://stellar.expert/explorer/public', type: 'coin', chain: 'Stellar' },
  vechain: { url: 'https://explore.vechain.org', type: 'coin', chain: 'VeChain' },
  cosmos: { url: 'https://www.mintscan.io/cosmos', type: 'coin', chain: 'Cosmos' },
  dash: { url: 'https://chainz.cryptoid.info/dash', type: 'coin', chain: 'Dash' },
  zcash: { url: 'https://explorer.z.cash', type: 'coin', chain: 'Zcash' },
  'ethereum-classic': { url: 'https://blockscout.com/etc/mainnet', type: 'coin', chain: 'Ethereum Classic' },
  neo: { url: 'https://explorer.n3o.one', type: 'coin', chain: 'NEO' },
  tezos: { url: 'https://tzkt.io', type: 'coin', chain: 'Tezos' },
  elrond: { url: 'https://explorer.elrond.com', type: 'coin', chain: 'Elrond' },
  terra: { url: 'https://finder.terra.money/mainnet', type: 'coin', chain: 'Terra' },
  luna: { url: 'https://finder.terra.money/mainnet', type: 'coin', chain: 'Terra' },
  blockstack: { url: 'https://explorer.stacks.co', type: 'coin', chain: 'Stacks' },
};

// Ethereum token contract addresses
const ETHEREUM_TOKEN_ADDRESSES: { [key: string]: string } = {
  ethereum: '0x0000000000000000000000000000000000000000',
  uniswap: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  chainlink: '0x514910771af9ca656af840dff83e8264ecf986ca',
  matic: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  'axie-infinity': '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b',
  sand: '0x3845badade8e6dff049820680d1f14bd3903a5d0',
  binancecoin: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
  avax: '0x1CE0c2827e2eF5D5c2aA580D7367Af720520F04c',
  'ftx-token': '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9',
  decentraland: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
};

const NFTMarketplace = (): JSX.Element => {
  const [cryptoData, setCryptoData] = useState<{ assets: CryptoItem[] } | null>(null);
  const [nftData, setNFTData] = useState<NFTTransfer[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [nftLoading, setNFTLoading] = useState(true);

  // Access Etherscan API key from environment variable
  const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API || '';

  useEffect(() => {
    let isMounted = true;

    // Check if Etherscan API key is available
    if (!ETHERSCAN_API_KEY) {
      console.error('Etherscan API key is missing');
      setError({ message: 'Etherscan API key is not configured' });
      setNFTLoading(false);
      return;
    }

    // Fetch CoinGecko crypto prices
    const fetchCryptoPrices = async () => {
      console.log('CoinGecko API call started:', new Date().toISOString());
      try {
        const endpoint = 'https://api.coingecko.com/api/v3/coins/markets';
        const params = new URLSearchParams({
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum,ripple,litecoin,cardano,polkadot,dogecoin,solana,binancecoin,uniswap,chainlink,tron,avax,matic,algorand,monero,stellar,vechain,cosmos,dash,zcash,ethereum-classic,ftx-token,neo,tezos,elrond,terra,luna,axie-infinity,sand,decentraland,blockstack',
        });

        const response = await fetch(`${endpoint}?${params}`);
        const rawData: CoinGeckoItem[] = await response.json();
        if (!isMounted) {
          console.log('Component unmounted, skipping crypto state update');
          return;
        }
        if (response.ok) {
          const data: CryptoItem[] = rawData.map((item) => ({
            id: item.id,
            name: item.name,
            symbol: item.symbol,
            current_price: Number(item.current_price),
            market_cap: Number(item.market_cap),
            total_volume: Number(item.total_volume),
            price_change_24h: Number(item.price_change_24h),
            price_change_percentage_24h: Number(item.price_change_percentage_24h),
            image: item.image,
          }));
          setCryptoData({ assets: data });
        } else {
          throw new Error('Failed to fetch cryptocurrency prices');
        }
      } catch (err: unknown) {
        console.error('Error fetching crypto prices:', err);
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch crypto prices';
        setError({ message: errorMessage });
      } finally {
        if (isMounted) setLoading(false);
        console.log('CoinGecko API call completed:', new Date().toISOString());
      }
    };

    // Fetch recent NFT transfers from Etherscan
    const fetchNFTTransfers = async () => {
      console.log('Etherscan API call started:', new Date().toISOString());
      try {
        const nftContracts = [
          { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', name: 'Bored Ape Yacht Club' },
          { address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', name: 'CryptoPunks' },
          { address: '0xED5AF388653567Af2f388E6224dC7C4b3241C544', name: 'Azuki' },
          { address: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6', name: 'Mutant Ape Yacht Club' },
          { address: '0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7', name: 'Meebits' },
        ];
        const allTransfers: NFTTransfer[] = [];

        for (const contract of nftContracts) {
          // Use tokennfttx endpoint for ERC-721 transfers
          const endpoint = `https://api.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${contract.address}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
          console.log(`Fetching transfers for ${contract.name} (${contract.address})`);
          const response = await fetch(endpoint);
          const data: EtherscanResponse = await response.json();
          if (!isMounted) {
            console.log('Component unmounted, skipping NFT state update');
            return;
          }
          if (data.status === '1' && data.message === 'OK' && data.result.length > 0) {
            console.log(`Found ${data.result.length} transfers for ${contract.name}`);
            // Take up to 3 transfers per contract to balance representation
            allTransfers.push(...data.result.slice(0, 3));
          } else {
            console.warn(`No transfers or error for ${contract.name}: ${data.message}`, data);
            if (data.status !== '1') {
              console.error(`API error for ${contract.name}: Status ${data.status}, Message: ${data.message}`);
            }
          }
          // Delay to avoid Etherscan rate limits (5 requests/second)
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (allTransfers.length === 0) {
          console.error('No transfers found for any contract');
          setError({ message: 'No recent NFT transfers found for the specified collections' });
        } else {
          // Sort by timestamp and limit to 15 to include multiple contracts
          const sortedTransfers = allTransfers
            .sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp))
            .slice(0, 15);
          console.log('Combined transfers:', sortedTransfers.map(t => ({
            tokenName: t.tokenName,
            tokenID: t.tokenID,
            timeStamp: new Date(Number(t.timeStamp) * 1000).toISOString(),
          })));
          setNFTData(sortedTransfers);
        }
      } catch (err: unknown) {
        console.error('Error fetching NFT transfers:', err);
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NFT transfers';
        setError({ message: errorMessage });
      } finally {
        if (isMounted) setNFTLoading(false);
        console.log('Etherscan API call completed:', new Date().toISOString());
      }
    };

    fetchCryptoPrices();
    fetchNFTTransfers();

    return () => {
      isMounted = false;
      console.log('useEffect cleanup:', new Date().toISOString());
    };
  }, [ETHERSCAN_API_KEY]);

  // Columns for cryptocurrency table
  const cryptoColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Coin',
      width: 200,
      renderCell: (params) => {
        const coin = params.row as CryptoItem;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={coin.image}
              alt={coin.name}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            {coin.name}
          </Box>
        );
      },
    },
    { field: 'symbol', headerName: 'Symbol', width: 100 },
    {
      field: 'current_price',
      headerName: 'Price (USD)',
      width: 150,
      valueFormatter: ({ value }) => {
        const numValue = Number(value);
        return isNaN(numValue) ? 'N/A' : `$${numValue.toFixed(2)}`;
      },
    },
    {
      field: 'market_cap',
      headerName: 'Market Cap (USD)',
      width: 200,
      valueFormatter: ({ value }) => {
        const numValue = Number(value);
        return isNaN(numValue) ? 'N/A' : `$${numValue.toLocaleString()}`;
      },
    },
    {
      field: 'total_volume',
      headerName: '24h Volume (USD)',
      width: 200,
      valueFormatter: ({ value }) => {
        const numValue = Number(value);
        return isNaN(numValue) ? 'N/A' : `$${numValue.toLocaleString()}`;
      },
    },
    {
      field: 'price_change_percentage_24h',
      headerName: '24h Change (%)',
      width: 150,
      valueFormatter: ({ value }) => {
        const numValue = Number(value);
        return isNaN(numValue) ? 'N/A' : `${numValue.toFixed(2)}%`;
      },
    },
    {
      field: 'trade_link',
      headerName: 'Explorer Link',
      width: 200,
      renderCell: (params) => {
        const coinId = params.row.id;
        const explorer = BLOCKCHAIN_EXPLORERS[coinId];
        if (explorer) {
          if (explorer.type === 'token') {
            const contractAddress = ETHEREUM_TOKEN_ADDRESSES[coinId];
            if (contractAddress) {
              return (
                <Link
                  href={`${explorer.url}/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'primary.main' }}
                >
                  View on Etherscan
                </Link>
              );
            }
          } else if (explorer.type === 'coin') {
            return (
              <Link
                href={explorer.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'primary.main' }}
              >
                View on {explorer.chain} Explorer
              </Link>
            );
          }
        }
        return <span>Not available</span>;
      },
    },
  ];

  if (loading || nftLoading) {
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
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Global styles for Swiper */}
      <style>{`
        .swiper {
          padding-bottom: 48px;
        }
        .swiper-button-next,
        .swiper-button-prev {
          color: #1976d2 !important;
        }
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 24px !important;
        }
        .swiper-pagination-bullet {
          background-color: rgba(0, 0, 0, 0.54) !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #1976d2 !important;
        }
      `}</style>

      <TrendingCryptos />
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Cryptocurrency Prices
        </Typography>
        <Table
          data={cryptoData?.assets || []}
          columns={cryptoColumns}
          defaultPageSize={10}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection={false}
          showFooter={true}
          tableHeight={600}
        />
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Recent NFT Transfers
        </Typography>
        {nftData.length > 0 ? (
          <Box sx={{ margin: '16px 0', padding: '0 8px' }}>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {nftData.map((nft, index) => (
                <SwiperSlide key={`${nft.hash}-${index}`}>
                  <Card
                    sx={{
                      maxWidth: 345,
                      mx: 'auto',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 'bold',
                          color: 'text.primary',
                          textAlign: 'center',
                          mb: 2,
                        }}
                      >
                        {nft.tokenName || 'Unknown NFT'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mb: 1, fontSize: '0.9rem' }}
                      >
                        <strong>Token ID:</strong> {nft.tokenID}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mb: 1, fontSize: '0.9rem' }}
                      >
                        <strong>From:</strong>{' '}
                        <Link
                          href={`https://etherscan.io/address/${nft.from}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {nft.from.slice(0, 6)}...{nft.from.slice(-4)}
                        </Link>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mb: 1, fontSize: '0.9rem' }}
                      >
                        <strong>To:</strong>{' '}
                        <Link
                          href={`https://etherscan.io/address/${nft.to}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {nft.to.slice(0, 6)}...{nft.to.slice(-4)}
                        </Link>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mb: 1, fontSize: '0.9rem' }}
                      >
                        <strong>Timestamp:</strong>{' '}
                        {new Date(Number(nft.timeStamp) * 1000).toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mb: 2, fontSize: '0.9rem' }}
                      >
                        <strong>Transaction:</strong>{' '}
                        <Link
                          href={`https://etherscan.io/tx/${nft.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {nft.hash.slice(0, 6)}...{nft.hash.slice(-4)}
                        </Link>
                      </Typography>
                      <Link
                        href={`https://etherscan.io/token/${nft.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'block',
                          textAlign: 'center',
                          color: 'primary.main',
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        View Collection on Etherscan
                      </Link>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No recent NFT transfers available.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default NFTMarketplace;