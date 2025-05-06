import { FC } from 'react';
import { Box, Typography, CircularProgress, Link, IconButton, Tooltip, Snackbar } from '@mui/material';
import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useUserDetails } from 'hooks/useUserdetails';

const ReferralDashboard: FC = () => {
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch user from Redux store
  const user = useUserDetails();

  // Simulate loading (optional, kept for consistency)
  setTimeout(() => {
    setLoading(false);
  }, 1000);

  const handleCopy = async () => {
    if (user?.referralLink) {
      try {
        await navigator.clipboard.writeText(user.referralLink);
        setCopySuccess(true);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  return (
    <Box sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="h6">Your Referral Link:</Typography>
        {user?.referralLink ? (
          <Link href={user.referralLink} target="_blank" underline="hover">
            {user.referralLink}
          </Link>
        ) : (
          <Typography>Not available</Typography>
        )}
        <Tooltip title="Copy to clipboard">
          <IconButton size="small" onClick={handleCopy} disabled={!user?.referralLink}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box>
        <Typography variant="h6" color="text.primary" fontWeight={600}>
          Referral program coming soon!
        </Typography>
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