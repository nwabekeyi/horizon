import { useState, ChangeEvent, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useApiRequest } from '../../hooks/useApi';
import Progress from '../../components/loading/Progress';
import CustomModal, { ChildrenBox } from '../../components/base/modal';
import { twoFA } from 'utils/endpoints';
import Footer from 'layouts/main-layout/footer';
import IconifyIcon from 'components/base/IconifyIcon';
import { updateUserAfter2FA } from 'store/slices/userSlice';
import { AppDispatch } from 'store';
import { User } from 'utils/interfaces';

interface TwoFaForm {
  secret: string;
}

interface TwoFaRequestBody {
  userId: string;
  secret: string;
}

interface TwoFaResponse {
  message: string;
  success: boolean;
  user: User;
  token?: string;
}

const TwoFaVerification = () => {
  const [formData, setFormData] = useState<TwoFaForm>({
    secret: '',
  });
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { error: apiError, loading, callApi } = useApiRequest<TwoFaResponse, TwoFaRequestBody>();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, secret: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userId = sessionStorage.getItem('twoFAUserId');
    if (!userId) {
      setError('User session not found. Please log in again.');
      navigate('/authentication/sign-in');
      return;
    }

    if (!formData.secret.trim()) {
      setError('Please enter the verification code');
      return;
    }

    const body: TwoFaRequestBody = {
      userId,
      secret: formData.secret,
    };

    try {
      const response = await callApi({
        url: `${twoFA}/verify`,
        method: 'POST',
        body,
      });

      if (response.success) {
        // Save token to localStorage before dispatching or navigating
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Dispatch user and token to Redux store
        dispatch(
          updateUserAfter2FA({
            user: response.user,
            token: response.token,
          })
        );

        // Clean up sessionStorage
        sessionStorage.removeItem('twoFAUserId');

        // Show success modal
        setModalOpen(true);
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to verify code. Please try again.');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Navigate to dashboard after token is saved and modal is closed
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
          href="/authentication/sign-in"
          sx={{ ml: -1.75, pl: 1, pr: 2 }}
          startIcon={
            <IconifyIcon
              icon="ic:round-keyboard-arrow-left"
              sx={(theme) => ({ fontSize: `${theme.typography.h3.fontSize} !important` })}
            />
          }
        >
          Back to login
        </Button>
      </Box>

      <Box width={1}>
        <Typography variant="h3">Two-Factor Verification</Typography>
        <Typography mt={1.5} variant="body2" color="text.disabled">
          Enter the verification code from your authenticator app
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            id="secret"
            name="secret"
            label="Verification Code"
            type={showSecret ? 'text' : 'password'}
            value={formData.secret}
            onChange={handleInputChange}
            variant="filled"
            placeholder="Enter your code"
            sx={{ mt: 3 }}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    opacity: formData.secret ? 1 : 0,
                    pointerEvents: formData.secret ? 'auto' : 'none',
                  }}
                >
                  <IconButton
                    aria-label="toggle code visibility"
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
            Verify Code
          </Button>
        </Box>

        <Typography
          mt={3}
          variant="body2"
          textAlign={{ xs: 'center', md: 'left' }}
          letterSpacing={0.25}
        >
          Lost access to your authenticator?{' '}
          <Link href="/authentication/recovery" color="primary.main" fontWeight={600}>
            Recover Account
          </Link>
        </Typography>

        <CustomModal
          open={modalOpen}
          title="Verification Successful"
          onCancel={handleModalClose}
          noConfirm={true}
        >
          <ChildrenBox>
            <Typography variant="body1">
              Two-factor authentication verified successfully!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalClose}
              sx={{ mt: 2 }}
            >
              Continue
            </Button>
          </ChildrenBox>
        </CustomModal>
      </Box>

      <Footer />
    </Stack>
  );
};

export default TwoFaVerification;