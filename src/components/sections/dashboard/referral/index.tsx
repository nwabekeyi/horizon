import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import AvatarGroup from '@mui/material/AvatarGroup';
import IconifyIcon from 'components/base/IconifyIcon';

import { Avatar1, Avatar2, Avatar3, Avatar4, Avatar5 } from 'data/images';

const avatars = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5];

const Referral = () => {
  return (
    <Stack
      component={Paper}
      direction="column"
      justifyContent="space-between"
      overflow="hidden"
      height={{ xs: 390, lg: 350, xl: 390 }}
      p={0}
    >
      <Stack p={3.5} pb={1} spacing={1.5} alignItems="center">
        <Stack
          component={ButtonBase}
          alignItems="center"
          justifyContent="center"
          height={52}
          width={52}
          bgcolor="info.light"
          borderRadius={3}
        >
          <IconifyIcon icon="mdi:gift-outline" color="info.main" fontSize="h2.fontSize" />
        </Stack>

        <Box mt={-0.5}>
          <Typography variant="caption" color="text.disabled">
            Referral Program
          </Typography>
          <Typography mt={-0.35} variant="body1" fontWeight={700} noWrap>
            Invite friends & earn rewards
          </Typography>
        </Box>
      </Stack>

      <Typography px={3.5} variant="h5" lineHeight={1.65}>
        Share your referral link and earn bonuses when friends sign up.
      </Typography>

      <Stack
        direction="column"
        justifyContent="space-between"
        px={3.5}
        py={2.5}
        height={150}
        bgcolor="info.light"
      >
        <Stack alignItems="center" spacing={3.5}>
          <Stack alignItems="center" justifyContent="center" borderRadius={2.5} spacing={0.75}>
            <IconifyIcon icon="mdi:currency-usd" color="success.dark" fontSize="h4.fontSize" />
            <Typography variant="body2" fontWeight={700}>
              Earn up to $50
            </Typography>
          </Stack>

          <Stack alignItems="center" justifyContent="center" borderRadius={2.5} spacing={0.75}>
            <IconifyIcon icon="mdi:account-plus-outline" color="primary.main" fontSize="h4.fontSize" />
            <Typography variant="body2" fontWeight={700}>
              Per successful referral
            </Typography>
          </Stack>
        </Stack>

        <Stack alignItems="center" justifyContent="space-between">
          <Stack height={1} alignItems="center">
            <AvatarGroup
              renderSurplus={(surplus) => (
                <Typography component="span" variant="body2" color="primary.main" fontWeight={700}>
                  {surplus.toString()}+
                </Typography>
              )}
              total={22}
              sx={{ '& .MuiAvatarGroup-avatar': { height: 30, width: 30 } }}
            >
              {avatars.map((avatar: string, index) => (
                <Avatar key={avatar} alt="avatar" src={avatar} sx={{ zIndex: index }} />
              ))}
            </AvatarGroup>
          </Stack>

          <Button variant="contained" color="primary">
            Get your referral link
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Referral;