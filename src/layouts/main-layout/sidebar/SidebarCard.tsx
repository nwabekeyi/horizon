import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HorizonLogo from 'assets/images/logo-white.png';
import Image from 'components/base/Image';

const Logo = () => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      height={94}
      width={94}
      border={4}
      borderColor="info.lighter"
      borderRadius="50%"
      position="absolute"
      top={0}
      left="50%"
      sx={(theme) => ({
        background: `linear-gradient(135deg, ${theme.palette.gradients.primary.state} 0%, ${theme.palette.gradients.primary.main} 100%)`,
        transform: 'translate(-50%, -50%)',
      })}
    >
      <Image src={HorizonLogo} sx={{ width: 65, height: 40 }} />
    </Stack>
  );
};

const SidebarCard = () => {
  return (
    <Stack
      alignItems="center"
      direction="column"
      position="relative"
      borderRadius={6}
      width={1}
      pt={8}
      pb={6}
      mt="auto"
      sx={(theme) => ({
        background: `linear-gradient(135deg, ${theme.palette.gradients.primary.state} 0%, ${theme.palette.gradients.primary.main} 100%)`,
        position: 'relative',
      })}
    >
      <Logo />
      <Button sx={{ color: 'info.lighter', fontWeight: 700 }}>Upgrade your Income</Button>
      <Typography variant="body2" color="info.main" lineHeight={1.75}>
        make your dream a reality <br />
        invest and earn
      </Typography>
    </Stack>
  );
};

export default SidebarCard;
