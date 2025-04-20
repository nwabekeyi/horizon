import { useState, useEffect, useRef } from 'react';
import { Swiper as SwiperClass } from 'swiper/types';
import { SwiperSlide } from 'swiper/react';
import { CircularProgress, Alert, Stack, Paper, Typography, IconButton } from '@mui/material';
import ReactSwiper from 'components/base/ReactSwiper';
import IconifyIcon from 'components/base/IconifyIcon';
import useResizeObserver from 'hooks/useResizeObserver';
import CryptoCard from './cryptoCard';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface ApiError {
  message: string;
  status?: number;
}

const TrendingCryptos = () => {
  const swiperRef = useRef<SwiperClass | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerSize = useResizeObserver(containerRef);
  const [isSlideBegin, setIsSlideBegin] = useState(true);
  const [isSlideEnd, setIsSlideEnd] = useState(false);
  const [data, setData] = useState<{ assets: CryptoData[] } | null>(null);
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
          ids: 'bitcoin,ethereum,litecoin,bitcoin-cash', // Popular coins
          order: 'market_cap_desc',
          per_page: '10',
          page: '1',
          sparkline: 'false',
        });

        const response = await fetch(`${endpoint}?${params}`);
        const fetchedData: CryptoData[] = await response.json();
        if (!isMounted) {
          console.log('Component unmounted, skipping state update');
          return;
        }
        if (response.ok) {
          setData({ assets: fetchedData });
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

    // Poll every 60 seconds for real-time updates
    const interval = setInterval(fetchCryptoPrices, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      console.log('useEffect cleanup:', new Date().toISOString());
    };
  }, []);

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  return (
    <Stack
      component={Paper}
      height={350}
      ref={containerRef}
      direction="column"
      spacing={1.75}
      width={1}
      p={2}
    >
      <Stack alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Trending Cryptocurrencies</Typography>
        <Stack mr={-1} spacing={1} alignItems="center" justifyContent="center">
          <IconButton
            onClick={handlePrev}
            size="large"
            sx={{
              p: 1,
              border: 'none',
              bgcolor: 'transparent !important',
              pointerEvents: isSlideBegin ? 'none' : 'auto',
            }}
          >
            <IconifyIcon
              icon="ic:round-arrow-back-ios"
              color={isSlideBegin ? 'text.secondary' : 'text.primary'}
              fontSize="h4.fontSize"
            />
          </IconButton>
          <IconButton
            onClick={handleNext}
            size="large"
            sx={{
              p: 1,
              border: 'none',
              bgcolor: 'transparent !important',
              pointerEvents: isSlideEnd ? 'none' : 'auto',
            }}
          >
            <IconifyIcon
              icon="ic:round-arrow-forward-ios"
              color={isSlideEnd ? 'text.secondary' : 'text.primary'}
              fontSize="h4.fontSize"
            />
          </IconButton>
        </Stack>
      </Stack>

      {loading ? (
        <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error.message}
        </Alert>
      ) : !data?.assets.length ? (
        <Typography variant="body1" textAlign="center">
          No data available
        </Typography>
      ) : (
        <ReactSwiper
          slidesPerView={
            containerSize > 1440 ? 4 : containerSize > 1024 ? 3 : containerSize > 600 ? 2 : 1
          }
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
            setIsSlideBegin(swiper.isBeginning);
            setIsSlideEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsSlideBegin(swiper.isBeginning);
            setIsSlideEnd(swiper.isEnd);
          }}
          sx={{ '& .swiper-slide': { width: 300 } }}
        >
          {data.assets.map((item) => (
            <SwiperSlide key={item.id}>
              <CryptoCard data={item} />
            </SwiperSlide>
          ))}
        </ReactSwiper>
      )}
    </Stack>
  );
};

export default TrendingCryptos;