import { Box, Typography, CircularProgress, Link, IconButton, Tooltip, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Table from 'components/base/table';

interface Referral {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  status: 'Active' | 'Pending';
}

const dummyReferrals: Referral[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', dateJoined: '2025-04-01', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', dateJoined: '2025-04-03', status: 'Pending' },
  { id: '3', name: 'Alice Johnson', email: 'alice@example.com', dateJoined: '2025-04-07', status: 'Active' },
];

const ReferralDashboard = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setReferrals(dummyReferrals);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const referralLink = 'https://yourdomain.com/signup?ref=USER123';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'dateJoined', headerName: 'Date Joined', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Typography
          sx={{ color: params.value === 'Active' ? 'green' : 'orange', fontWeight: 600 }}
        >
          {params.value}
        </Typography>
      ),
    },
  ];

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  return (
    <Box sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="h6">Your Referral Link:</Typography>
        <Link href={referralLink} target="_blank" underline="hover">
          {referralLink}
        </Link>
        <Tooltip title="Copy to clipboard">
          <IconButton size="small" onClick={handleCopy}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Your Referrals
        </Typography>
        <Table
          data={referrals}
          columns={columns}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection={false}
          showFooter={true}
          tableHeight={400}
        />
      </Box>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Referral link copied!"
      />
    </Box>
  );
};

export default ReferralDashboard;
