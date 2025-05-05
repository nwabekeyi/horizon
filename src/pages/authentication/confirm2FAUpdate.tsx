import { useState, ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconifyIcon from 'components/base/IconifyIcon';
import { useApiRequest } from '../../hooks/useApi';
import Progress from '../../components/loading/Progress';
import CustomModal, { ChildrenBox } from '../../components/base/modal';
import { twoFA } from 'utils/endpoints';
import Footer from 'layouts/main-layout/footer';

interface TwoFAUpdateForm {
  newSecret: string;
  confirmSecret: string;
}

interface ConfirmTwoFAUpdateRequestBody {
  newSecret: string;
}

interface ConfirmTwoFAUpdateResponse {
  success: boolean;
  message: string;
}

const Confirm2FAUpdate = () => {
  const [formData, setFormData] = useState<TwoFAUpdateForm>({
    newSecret: '',
    confirmSecret: '',
  });
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { error: apiError, loading, callApi } = useApiRequest<ConfirmTwoFAUpdateResponse, ConfirmTwoFAUpdateRequestBody>();

  // Extract token from URL search params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || '';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.newSecret !== formData.confirmSecret) {
      setError('Secrets do not match');
      return;
    }

    if (formData.newSecret.length < 6) {
      setError('2FA secret must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid or missing token');
      return;
    }

    const body: ConfirmTwoFAUpdateRequestBody = {
      newSecret: formData.newSecret,
    };

    try {
      const response = await callApi({
        url: `${twoFA}/confirm-update?token=${token}`,
        method: 'PUT', // Keep PUT to match your current setup
        body,
      });
      if (response.success) {
        setModalOpen(true);
      } else {
        setError(response.message || 'Failed to update 2FA secret');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(apiError?.message || 'Failed to update 2FA secret. Please try again.');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    navigate('/dashboard');
  };

  if (loading) {
    return <Progress />;
  }

  return (
    <Stack
      mx="auto"
      width={410}
      height="auto"
      minHeight={800}
      direction="column"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box width={1}>
        <Button
          variant="text"
          component={Link}
          href="https://247activetrading.vercel.app"
          sx={{ ml: -1.75, pl: 1, pr: 2 }}
          startIcon={
            <IconifyIcon
              icon="ic:round-keyboard-arrow-left"
              sx={(theme) => ({ fontSize: `${theme.typography.h3.fontSize} !important` })}
            />
          }
        >
          Back to home
        </Button>
      </Box>

      <Box width={1}>
        <Typography variant="h3">Update 2FA Secret</Typography>
        <Typography mt={1.5} variant="body2" color="text.disabled">
          Enter your new 2FA secret to update your two-factor authentication.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            id="newSecret"
            name="newSecret"
            label="New 2FA Secret"
            type={showSecret ? 'text' : 'password'}
            value={formData.newSecret}
            onChange={handleInputChange}
            variant="filled"
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            sx={{ mt: 3 }}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    opacity: formData.newSecret ? 1 : 0,
                    pointerEvents: formData.newSecret ? 'auto' : 'none',
                  }}
                >
                  <IconButton
                    aria-label="toggle secret visibility"
                    onClick={() => setShowSecret(!showSecret)}
                    sx={{ border: 'none', bgcolor: 'transparent !important' }}
                    edge="end"
                  >
                    <IconifyIcon
                      icon={showSecret ? 'ic:outline-visibility' : 'ic:outline-visibility-off'}
                      color="neutral.main"
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            id="confirmSecret"
            name="confirmSecret"
            label="Confirm 2FA Secret"
            type={showSecret ? 'text' : 'password'}
            value={formData.confirmSecret}
            onChange={handleInputChange}
            variant="filled"
            placeholder="Confirm your new 2FA secret"
            sx={{ mt: 6 }}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    opacity: formData.confirmSecret ? 1 : 0,
                    pointerEvents: formData.confirmSecret ? 'auto' : 'none',
                  }}
                >
                  <IconButton
                    aria-label="toggle secret visibility"
                    onClick={() => setShowSecret(!showSecret)}
                    sx={{ border: 'none', bgcolor: 'transparent !important' }}
                    edge="end"
                  >
                    <IconifyIcon
                      icon={showSecret ? 'ic:outline-visibility' : 'ic:outline-visibility-off'}
                      color="neutral.main"
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Typography color="error" variant="body2" mt={2}>
              {error}
            </Typography>
          )}
          {apiError && (
            <Typography color="error" variant="body2" mt={2}>
              {apiError.message}
            </Typography>
          )}

          <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} fullWidth>
            Update 2FA Secret
          </Button>
        </Box>

        <Typography
          mt={3}
          variant="body2"
          textAlign={{ xs: 'center', md: 'left' }}
          letterSpacing={0.25}
        >
          Return to{' '}
          <Link href="/dashboard" color="primary.main" fontWeight={600}>
            Dashboard
          </Link>
        </Typography>

        <CustomModal
          open={modalOpen}
          title="2FA Secret Updated"
          onCancel={handleModalClose}
          noConfirm={true}
        >
          <ChildrenBox>
            <Typography variant="body1">
              Your 2FA secret has been successfully updated! You will be redirected to your dashboard.
            </Typography>
            <Button
              component={Link}
              href="/dashboard"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleModalClose}
            >
              Go to Dashboard
            </Button>
          </ChildrenBox>
        </CustomModal>
      </Box>

      <Footer />
    </Stack>
  );
};

export default Confirm2FAUpdate;