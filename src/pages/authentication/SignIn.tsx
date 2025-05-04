import { useState, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import IconifyIcon from 'components/base/IconifyIcon';
import { loginUser } from 'store/slices/userSlice';
import paths from 'routes/paths';
import { AppDispatch } from 'store';
import { useApiRequest } from '../../hooks/useApi';
import Progress from '../../components/loading/Progress';
import CustomModal from '../../components/base/modal';
import { ENDPOINTS } from 'utils/endpoints';
import Footer from 'layouts/main-layout/footer';

// Form state for email and password
interface User {
  [key: string]: string;
}

// User object in login response
interface UserResponse {
  _id: string;
  email: string;
  [key: string]: unknown;
}

// Forgot Password types
interface ForgotPasswordRequestBody {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

// Union type for login response (consistent with userSlice)
type LoginResponse =
  | {
      user: UserResponse;
      token: string;
    }
  | {
      success: boolean;
      message: string;
      twoFA?: {
        userId: string;
        enabled: boolean;
      };
    };

// Type guard for 2FA response from login
const isTwoFAResponse = (
  response: LoginResponse
): response is { success: boolean; message: string; twoFA?: { userId: string; enabled: boolean } } => {
  return 'success' in response && 'message' in response;
};

const SignIn = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    error: forgotPasswordApiError,
    callApi: callForgotPasswordApi,
  } = useApiRequest<ForgotPasswordResponse, ForgotPasswordRequestBody>();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (forgotPassword) {
      const body: ForgotPasswordRequestBody = { email: user.email };
      try {
        await callForgotPasswordApi({
          url: ENDPOINTS.FORGETPASSWORD,
          method: 'POST',
          body,
        });
        setModalOpen(true);
      } catch (err) {
        setLoading(false);
        console.error('Forgot Password API Error:', err);
        setError('Failed to request password reset. Please try again.');
      }
    } else {
      const action = await dispatch(loginUser({ email: user.email, password: user.password }));
      if (loginUser.fulfilled.match(action)) {
        const response = action.payload as LoginResponse;
        if (
          isTwoFAResponse(response) &&
          response.success &&
          response.message === '2FA required' &&
          response.twoFA?.enabled &&
          response.twoFA.userId
        ) {
          sessionStorage.setItem('twoFAUserId', response.twoFA.userId);
          navigate('/authentication/2FAverification');
        } else {
          navigate(paths.dashboard);
        }
      } else {
        setError(action.payload as string);
      }
      setLoading(false);
    }
  };

  const handlePasswordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !forgotPassword) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (forgotPassword) setForgotPassword(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeContent: 'center', width: '100%' }}>
        <Progress />
      </Box>
    );
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
          href="/"
          sx={{ ml: -1.75, pl: 1, pr: 2 }}
          startIcon={
            <IconifyIcon
              icon="ic:round-keyboard-arrow-left"
              sx={(theme) => ({ fontSize: `${theme.typography.h3.fontSize} !important` })}
            />
          }
        >
          Back to home page
        </Button>
      </Box>

      <Box width={1}>
        <Typography variant="h3">{forgotPassword ? 'Forgot Password' : 'Sign In'}</Typography>
        <Typography mt={1.5} variant="body2" color="text.disabled">
          {forgotPassword
            ? 'Enter your email to reset your password.'
            : 'Enter your email and password to sign in!'}
        </Typography>

        <Divider sx={{ my: 3 }}>or</Divider>

        <Box component="form" onSubmit={handleSubmit}>
          {forgotPassword ? (
            <Stack direction="column" spacing={3}>
              <TextField
                id="forgot-email"
                name="email"
                label="Email"
                type="email"
                value={user.email}
                onChange={handleInputChange}
                variant="filled"
                placeholder="mail@example.com"
                autoComplete="email"
                fullWidth
                required
                autoFocus
                sx={{
                  mb: 3,
                  '& .MuiFilledInput-root': {
                    border: '1px solid grey',
                    bgcolor: 'grey.100',
                  },
                }}
              />
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
              <Button type="submit" variant="contained" size="large" fullWidth>
                Reset Password
              </Button>
            </Stack>
          ) : (
            <>
              <TextField
                id="email"
                name="email"
                type="email"
                label="Email"
                value={user.email}
                onChange={handleInputChange}
                variant="filled"
                placeholder="mail@example.com"
                autoComplete="email"
                sx={{
                  mt: 3,
                  '& .MuiFilledInput-root': {
                    border: '1px solid grey',
                    bgcolor: 'grey.100',
                  },
                }}
                fullWidth
                autoFocus
                required
              />
              <TextField
                id="password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={user.password}
                onChange={handleInputChange}
                onKeyDown={handlePasswordKeyDown}
                variant="filled"
                placeholder="Min. 8 characters"
                autoComplete="current-password"
                sx={{
                  mt: 6,
                  '& .MuiFilledInput-root': {
                    border: '1px solid grey',
                    bgcolor: 'grey.100',
                  },
                }}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{
                        opacity: user.password ? 1 : 0,
                        pointerEvents: user.password ? 'auto' : 'none',
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

              <Stack mt={1.5} alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={<Checkbox id="checkbox" name="checkbox" size="medium" color="primary" />}
                  label="Keep me logged in"
                  sx={{ ml: -0.75 }}
                />
                <Link
                  component="button"
                  onClick={() => setForgotPassword(true)}
                  fontSize="body2.fontSize"
                  fontWeight={600}
                >
                  Forgot password?
                </Link>
              </Stack>

              {error && (
                <Typography color="error" variant="body2" mt={2}>
                  {error}
                </Typography>
              )}

              <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} fullWidth>
                Sign In
              </Button>
            </>
          )}
          {forgotPasswordApiError && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {forgotPasswordApiError.message}
            </Typography>
          )}
        </Box>

        {!forgotPassword && (
          <Typography
            mt={3}
            variant="body2"
            textAlign={{ xs: 'center', md: 'left' }}
            letterSpacing={0.25}
          >
            Not registered yet?{' '}
            <Link href={paths.signup} color="primary.main" fontWeight={600}>
              Create an Account
            </Link>
          </Typography>
        )}

        <CustomModal
          open={modalOpen}
          title="Password Reset Requested"
          onCancel={handleModalClose}
          noConfirm={true}
        >
          <Typography variant="body1">
            A password reset link has been sent to your email. Please check your inbox.
          </Typography>
        </CustomModal>
      </Box>

      <Footer />
    </Stack>
  );
};

export default SignIn;