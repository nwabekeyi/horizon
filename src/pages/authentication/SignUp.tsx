import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';
import { useApiRequest } from '../../hooks/useApi'; // Adjust path
import Progress from '../../components/loading/Progress'; // Adjust path
import CustomModal from '../../components/base/modal'; // Adjust path
import { ENDPOINTS } from 'utils/endpoints';
import Footer from 'layouts/main-layout/footer';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface InputField {
  id: string;
  name: keyof User;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  showToggle?: boolean;
}

// Type for the initial registration PIN API call (only firstName and email)
interface RegistrationPinRequestBody {
  firstName: string;
  email: string;
}

// Type for the full sign-up API call (including PIN)
interface SignUpRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  pin: string;
  role: 'user' | 'admin';
}

// Type for the forgot password API call (only email)
interface ForgotPasswordRequestBody {
  email: string;
}

interface SignUpResponse {
  message: string;
}

const SignUp = () => {
  const [user, setUser] = useState<User>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationFilled, setRegistrationFilled] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false); // New state
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { error: apiError, loading, callApi } = useApiRequest<
    SignUpResponse,
    SignUpRequestBody | RegistrationPinRequestBody | ForgotPasswordRequestBody
  >();

  // Refs for PIN input fields
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const inputFields: InputField[] = [
    {
      id: 'firstName',
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Your First Name',
      autoComplete: 'given-name',
    },
    {
      id: 'lastName',
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Your Last Name',
      autoComplete: 'family-name',
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'mail@example.com',
      autoComplete: 'email',
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      type: showPassword ? 'text' : 'password',
      placeholder: 'Min. 8 characters',
      autoComplete: 'new-password',
      showToggle: true,
    },
    {
      id: 'confirmPassword',
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: showConfirmPassword ? 'text' : 'password',
      placeholder: 'Confirm your password',
      autoComplete: 'new-password',
      showToggle: true,
    },
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setFormError(null);
  };

  const handlePinChange = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^\d$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      if (index < 3) {
        pinRefs[index + 1].current?.focus();
      }

      if (index === 3 && newPin.every((digit) => digit.length === 1)) {
        const pinString = newPin.join('');
        const body: SignUpRequestBody = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          pin: pinString,
          role: 'user',
        };

        try {
          await callApi({
            url: ENDPOINTS.USERS,
            method: 'POST',
            body,
          });
          setModalOpen(true);
        } catch (err) {
          console.error('API Error:', err);
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registrationFilled) {
      // PIN submission handled in handlePinChange
    } else if (forgotPassword) {
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
        setModalOpen(true); // Show success modal (adjust message as needed)
      } catch (err) {
        console.error('API Error:', err);
      }
    } else {
      if (user.password !== user.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
      setFormError(null);

      const body: RegistrationPinRequestBody = {
        firstName: user.firstName,
        email: user.email,
      };

      try {
        await callApi({
          url: ENDPOINTS.REGISTRATION_PIN,
          method: 'POST',
          body,
        });
        setRegistrationFilled(true);
      } catch (err) {
        console.error('API Error:', err);
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (forgotPassword) setForgotPassword(false); // Reset to sign-up form after forgot password success
  };

  // Show  loader while API call is pending
  if (loading) {
    return <Box sx={{width: '100%', display:'flex', justifyContent:'center', alignItems: 'center'}}><Progress /></Box>;
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
          Back to home page
        </Button>
      </Box>

      <Box width={1}>
        <Typography variant="h3">{forgotPassword ? 'Forgot Password' : 'Sign Up'}</Typography>
        <Typography mt={1.5} variant="body2" color="text.disabled">
          {forgotPassword ? 'Enter your email to reset your password.' : 'Join us and start your journey today!'}
        </Typography>

        <Divider sx={{ my: 3 }}>or</Divider>

        <Box component="form" onSubmit={handleSubmit}>
          {registrationFilled ? (

            <>
            <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
              Please check your email inbox or spam folder for the PIN we sent you.
            </Typography>

                 <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              {pin.map((digit, index) => (
                <TextField
                  key={index}
                  value={digit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handlePinChange(e, index)}
                  inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '24px' } }}
                  variant="filled"
                  inputRef={pinRefs[index]}
                  sx={{
                    width: 50,
                    height: 60,
                    mb: 5,
                    '& .MuiFilledInput-root': {
                      border: '1px solid grey',
                      bgcolor: 'grey.100',
                    },
                  }}
                  required
                />
              ))}
            </Stack>
            </>
          ) : forgotPassword ? (
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
              {formError && (
                <Typography color="error" variant="body2">
                  {formError}
                </Typography>
              )}
              <Button type="submit" variant="contained" size="large" fullWidth>
                Reset Password
              </Button>
            </Stack>
          ) : (
            <Stack direction="column" spacing={3}>
              {inputFields.map((field, index) => (
                <TextField
                  key={field.id}
                  id={field.id}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  value={user[field.name]}
                  onChange={handleInputChange}
                  variant="filled"
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  fullWidth
                  required
                  autoFocus={index === 0}
                  sx={{
                    mb: 3,
                    '& .MuiFilledInput-root': {
                      border: '1px solid grey',
                      bgcolor: 'grey.100',
                    },
                  }}
                  InputProps={
                    field.showToggle
                      ? {
                          endAdornment: (
                            <InputAdornment
                              position="end"
                              sx={{
                                opacity: user[field.name] ? 1 : 0,
                                pointerEvents: user[field.name] ? 'auto' : 'none',
                              }}
                            >
                              <IconButton
                                aria-label={`toggle ${field.name} visibility`}
                                onClick={() =>
                                  field.name === 'password'
                                    ? setShowPassword(!showPassword)
                                    : setShowConfirmPassword(!showConfirmPassword)
                                }
                                sx={{ border: 'none', bgcolor: 'transparent !important' }}
                                edge="end"
                              >
                                <IconifyIcon
                                  icon={
                                    (field.name === 'password' && showPassword) ||
                                    (field.name === 'confirmPassword' && showConfirmPassword)
                                      ? 'ic:outline-visibility'
                                      : 'ic:outline-visibility-off'
                                  }
                                  color="neutral.main"
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }
                      : undefined
                  }
                />
              ))}
              {formError && (
                <Typography color="error" variant="body2">
                  {formError}
                </Typography>
              )}
              <Button type="submit" variant="contained" size="large" fullWidth>
                Sign Up
              </Button>
            </Stack>
          )}
          {apiError && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {apiError.message}
            </Typography>
          )}
        </Box>

        {!forgotPassword && !registrationFilled && (
          <Typography
            mt={3}
            variant="body2"
            textAlign={{ xs: 'center', md: 'left' }}
            letterSpacing={0.25}
          >
            Already have an account?{' '}
            <Link href={paths.signin} color="primary.main" fontWeight={600}>
              Let's Sign in
            </Link>
            {' | '}
            <Link
              component="button"
              onClick={() => setForgotPassword(true)}
              color="primary.main"
              fontWeight={600}
            >
              Forgot Password?
            </Link>
          </Typography>
        )}

        {/* Success Modal */}
        <CustomModal
          open={modalOpen}
          title={forgotPassword ? 'Password Reset Requested' : 'Registration Successful'}
          onCancel={handleModalClose}
          noConfirm={true}
        >
          <Typography variant="body1">
            {forgotPassword
              ? 'A password reset link has been sent to your email. Please check your inbox.'
              : 'Your account has been created successfully! Would you like to log in now?'}
          </Typography>
          {!forgotPassword && (
            <Button
              component={Link}
              href={paths.signin}
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          )}
        </CustomModal>
      </Box>

<Footer />
    </Stack>
  );
};

export default SignUp;