import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import HorizonLogo from 'assets/images/logo-main.png';
import Image from 'components/base/Image';
import ProfileMenu from './ProfileMenu';

interface TopbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Topbar = ({ isClosing, mobileOpen, setMobileOpen }: TopbarProps) => {
  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Stack
      direction="column"
      width="100%"
      bgcolor="transparent"
      zIndex={1200}
      sx={{ overflow: 'hidden' }}
    >
      {/* Support Contact Container */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent={{ xs: 'center', sm: 'space-between' }}
        bgcolor="primary.light"
        color="primary.contrastText"
        px={{ xs: 2, sm: 3 }}
        py={1}
        width="100%"
        borderBottom={1}
        borderColor="divider"
      >
        <Typography
          variant="body2"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: { xs: 0.5, sm: 0 } }}
        >
          Email:{' '}
          <Link href="mailto:support@horizon.com" color="inherit" underline="hover">
          247activetrading@proton.me
          </Link>
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Phone:{' '}
          <Link href="tel:+2341234567890" color="inherit" underline="hover">
          +1-917-268-6276
          </Link>
        </Typography>
      </Stack>

      {/* Main Topbar Content */}
      <Stack
        height={90}
        alignItems="center"
        justifyContent="space-between"
        direction="row"
        px={{ xs: 2, sm: 3 }}
        width="100%"
      >
        <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center" direction="row">
          <ButtonBase
            component={Link}
            href="/authentication/sign-in"
            disableRipple
            sx={{ lineHeight: 0, display: { xs: 'none', sm: 'block', lg: 'none' } }}
          >
            <Image src={HorizonLogo} alt="logo" height={44} width={44} />
          </ButtonBase>

          <Toolbar sx={{ display: { xs: 'block', lg: 'none' } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
            >
              <IconifyIcon icon="ic:baseline-menu" />
            </IconButton>
          </Toolbar>

         

          <TextField
            variant="filled"
            placeholder="Search"
            sx={{ width: 320, display: { xs: 'none', md: 'flex' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconifyIcon icon="bx:search" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center" direction="row">
          <ProfileMenu />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Topbar;