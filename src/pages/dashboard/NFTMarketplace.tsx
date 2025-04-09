import { useEffect } from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useApiRequest } from '../../hooks/useApi';  // Adjust the import path based on your file structure

interface NFTItem {
  id: string;
  name: string;
  image_url: string;
  price: string;
  external_link: string;
}

const NFTMarketplace = (): JSX.Element => {
  const { data, error, loading, callApi } = useApiRequest<NFTItem[]>();

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        // Manually construct the query string
        const queryParams = new URLSearchParams({
          order_direction: 'desc',
          offset: '0',
          limit: '10',
          order_by: 'price',
          asset_contract_address: '0xabc123',  // Optional, filter by collection
        }).toString();

        // Fetch NFTs from OpenSea API (or another source)
        const response = await callApi({
          url: `https://api.opensea.io/api/v1/assets?${queryParams}`, // Append query parameters to the URL
          method: 'GET',
        });

        console.log(response);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
      }
    };

    fetchNFTs();
  }, [callApi]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Grid container spacing={2}>
      {data?.map((nft) => (
        <Grid item xs={12} sm={6} md={4} key={nft.id}>
          <Card>
            <CardMedia
              component="img"
              alt={nft.name}
              height="200"
              image={nft.image_url}
            />
            <CardContent>
              <Typography variant="h6" component="div">
                {nft.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price: {nft.price}
              </Typography>
              <Button
                size="small"
                color="primary"
                href={nft.external_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default NFTMarketplace;
