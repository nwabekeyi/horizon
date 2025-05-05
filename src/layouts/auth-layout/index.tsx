import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'components/base/Image';
import Logo from 'assets/images/logo-white.png';
import { useNavigate } from 'react-router-dom';
import { blue } from 'theme/colors';


const AuthLayout = () => {
const navugate = useNavigate();
const goToHome = () => {
  navugate('/');
};

  return (
    <Stack justifyContent="space-between" height="100vh" bgcolor="info.lighter">
      <Stack px={3.5} py={2} flex={1} height={1} overflow="scroll">
        <Outlet />
      </Stack>
      <Stack
        flex={1}
        height={1}
        direction="column"
        alignItems="center"
        justifyContent="center"
        display={{ xs: 'none', md: 'flex' }}
        sx={(theme) => ({
          backgroundColor:  blue[500],
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottomLeftRadius: theme.shape.borderRadius * 24,
        })}
      >
        <Stack my="auto" direction="column" spacing={3} alignItems="center" justifyContent="center">
          <Image src={Logo} height={180} width={300} />

          <Box mt={5} p={2.25} width={300} border={2} borderRadius={4} borderColor="secondary.dark" onClick={goToHome}>
            <Typography
              mt={0.5}
              component={Link}
              href="#!"
              variant="h5"
              color="info.lighter"
              display="block"
              textAlign="center"
            >
              247activetrading.com
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AuthLayout;
