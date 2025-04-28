import { useState, ChangeEvent, FormEvent } from 'react';
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
import { loginUser } from 'store/slices/userSlice'; // Import loginUser thunk
import paths from 'routes/paths';
import { AppDispatch } from 'store'; // Import AppDispatch to type dispatch
import { useApiRequest } from '../../hooks/useApi'; // Adjust path
import Progress from '../../components/loading/Progress'; // Adjust path
import CustomModal from '../../components/base/modal'; // Adjust path
import { ENDPOINTS } from 'utils/endpoints';
import Footer from 'layouts/main-layout/footer';

interface User {
  [key: string]: string;
}

interface ForgotPasswordRequestBody {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

const SignIn = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false); // New state for forgot password
  const [error, setError] = useState<string | null>(null); // For handling login/forgot password errors
  const [modalOpen, setModalOpen] = useState(false); // For success modal
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { error: apiError, callApi } = useApiRequest<ForgotPasswordResponse, ForgotPasswordRequestBody>();
console.log(loading)
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (forgotPassword) {
      // Forgot Password submission
      const body: ForgotPasswordRequestBody = {
        email: user.email,
      };

      try {
        await callApi({
          url: ENDPOINTS.FORGETPASSWORD,
          method: 'POST',
          body,
        });
        setModalOpen(true); // Show success modal
      } catch (err) {
        setLoading(false);
        console.error('API Error:', err);
        setError('Failed to request password reset. Please try again.');
      }
    } else {
      // Sign-in submission
      const action = await dispatch(loginUser({ email: user.email, password: user.password }));

      if (loginUser.fulfilled.match(action)) {
        navigate(paths.dashboard);
      } else {
        setError(action.payload as string);
        setLoading(false);
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (forgotPassword) setForgotPassword(false); // Reset to sign-in form after forgot password success
  };

  // Show progress loader while API call is pending
  if (loading) {
    return <Box sx={{display: 'grid', placeContent: 'center', width: '100%' }}><Progress /></Box> ;
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
          {forgotPassword ? 'Enter your email to reset your password.' : 'Enter your email and password to sign in!'}
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
          {apiError && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {apiError.message}
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

        {/* Success Modal */}
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