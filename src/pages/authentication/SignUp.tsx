import { useState, ChangeEvent, FormEvent, KeyboardEvent, useRef } from 'react';
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
import { useApiRequest } from '../../hooks/useApi';
import Progress from '../../components/loading/Progress';
import CustomModal from '../../components/base/modal';
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

interface RegistrationPinRequestBody {
  firstName: string;
  email: string;
}

interface SignUpRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  pin: string;
  role: 'user' | 'admin';
}

interface ForgotPasswordRequestBody {
  email: string;
}

interface SignUpResponse {
  success: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    dateJoined: string;
  };
  message: string;
}

interface BasicApiResponse {
  success: boolean;
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
  const [forgotPassword, setForgotPassword] = useState(false);
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<'signup' | 'forgotPassword' | null>(null);

  const { error: apiError, loading, callApi } = useApiRequest<
    SignUpResponse | BasicApiResponse,
    SignUpRequestBody | RegistrationPinRequestBody | ForgotPasswordRequestBody
  >();

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
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    setFormError(null);
  };

  const handlePinInputChange = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    if (/^\d$/.test(value) || value === '') {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      setFormError(null);

      if (value && index < 3) {
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
          const response = await callApi({
            url: ENDPOINTS.USERS,
            method: 'POST',
            body,
          });
          if ('success' in response && response.success) {
            setModalContext('signup');
            setModalOpen(true);
          } else {
            setFormError(response.message || 'Failed to complete registration.');
          }
        } catch (error: unknown) {
          console.error('API Error:', error);
          setFormError(
            error instanceof Error ? error.message : 'An error occurred during registration.'
          );
        }
      }
    }
  };

  const handlePinKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registrationFilled) {
      // PIN submission handled in handlePinInputChange
    } else if (forgotPassword) {
      const body: ForgotPasswordRequestBody = {
        email: user.email,
      };

      try {
        await callApi({
          url: ENDPOINTS.FORGETPASSWORD,
          method: 'POST',
          body,
        });
        setModalContext('forgotPassword');
        setModalOpen(true);
      } catch (error: unknown) {
        console.error('API Error:', error);
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
      } catch (error: unknown) {
        console.error('API Error:', error);
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalContext(null);
    if (forgotPassword) setForgotPassword(false);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
          href="https://247activetrading.com"
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
        <Typography variant="h3">
          {forgotPassword ? 'Forgot Password' : registrationFilled ? 'You are almost there' : 'Sign Up'}
        </Typography>
        <Typography mt={1.5} variant="body2" color="text.disabled">
          {forgotPassword
            ? 'Enter your email to reset your password.'
            : registrationFilled
            ? 'Complete the registration and get access to your account'
            : 'Join us and start your journey today!'}
        </Typography>

        <Divider sx={{ my: 3 }}>{!registrationFilled ? 'or' : ''}</Divider>

        <Box component="form" onSubmit={handleSubmit}>
          {registrationFilled ? (
            <>
              <Typography variant="body2" color="text.secondary" mb={2} sx={{fontWeight:'bold'}}>
                Please check your email inbox or spam folder for the PIN we sent you.
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                {pin.map((digit, index) => (
                  <TextField
                    key={index}
                    value={digit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handlePinInputChange(e, index)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handlePinKeyDown(e, index)}
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

        <CustomModal
          open={modalOpen}
          title={modalContext === 'forgotPassword' ? 'Password Reset Requested' : 'Registration has been completed'}
          onCancel={handleModalClose}
          noConfirm={true}
        >
          <Typography variant="body1">
            {modalContext === 'forgotPassword'
              ? 'A password reset link has been sent to your email. Please check your inbox.'
              : 'Your account has been created successfully! Would you like to log in now?'}
          </Typography>
          {modalContext === 'signup' && (
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