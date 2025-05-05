import { useState, ChangeEvent, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconifyIcon from 'components/base/IconifyIcon';
import { useApiRequest } from '../../hooks/useApi'; // Reusable API hook
import Progress from '../../components/loading/Progress';
import CustomModal, {ChildrenBox} from '../../components/base/modal';
import { ENDPOINTS } from 'utils/endpoints';
import Footer from 'layouts/main-layout/footer';

interface PasswordResetForm {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordRequestBody {
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

const PasswordReset = () => {
  const [formData, setFormData] = useState<PasswordResetForm>({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false); // For success modal
  const location = useLocation();

  const { error: apiError, loading, callApi } = useApiRequest<ResetPasswordResponse, ResetPasswordRequestBody>();

  // Extract token from URL search params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || '';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!token) {
      setError('Invalid or missing token');
      return;
    }

    const body: ResetPasswordRequestBody = {
      token,
      newPassword: formData.newPassword,
    };

    try {
      await callApi({
        url: ENDPOINTS.RESETPASSWORD,
        method: 'PATCH',
        body,
      });
      setModalOpen(true); // Show success modal instead of direct navigation
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to reset password. Please try again.');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
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
          href="c"
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
        <Typography variant="h3">Password Reset</Typography>
        <Typography mt={1.5} variant="body2" color="text.disabled">
          Enter your new password to reset your password!
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            id="newPassword"
            name="newPassword"
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleInputChange}
            variant="filled"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            sx={{ mt: 3 }}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    opacity: formData.newPassword ? 1 : 0,
                    pointerEvents: formData.newPassword ? 'auto' : 'none',
                  }}
                >
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ border: 'none', bgcolor: 'transparent !important' }}
                    edge="end"
                  >
                    <IconifyIcon
                      icon={showPassword ? 'ic:outline-visibility' : 'ic:outline-visibility-off'}
                      color="neutral.main"
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            variant="filled"
            placeholder="Confirm your new password"
            sx={{ mt: 6 }}
            fullWidth
            required
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
            Reset Password
          </Button>
        </Box>

        <Typography
          mt={3}
          variant="body2"
          textAlign={{ xs: 'center', md: 'left' }}
          letterSpacing={0.25}
        >
          Remember your password?{' '}
          <Link href="/authentication/sign-in" color="primary.main" fontWeight={600}>
            Sign In
          </Link>
        </Typography>

        {/* Success Modal */}
        <CustomModal
          open={modalOpen}
          title="Password Reset Successful"
          onCancel={handleModalClose}
          noConfirm={true}
        >
          <ChildrenBox>
            <Typography variant="body1">
              Your password has been successfully reset! Would you like to log in now?
            </Typography>
            <Button
              component={Link}
              href="/authentication/sign-in"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </ChildrenBox>
        
        </CustomModal>
      </Box>

    <Footer />
    </Stack>
  );
};

export default PasswordReset;