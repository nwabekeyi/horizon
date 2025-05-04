import { useState } from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconifyIcon from 'components/base/IconifyIcon';
import { useUserDetails } from 'hooks/useUserdetails';
import {
  ViewProfileModal,
  AccountSettingsModal,
  NotificationsModal,
  HelpCenterModal,
  LogoutModal,
  VerificationModal,
} from './profileModals'; // Named exports from modals

interface MenuItems {
  id: number;
  title: string;
  icon: string;
  onClick: () => void;
}

const ProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const user = useUserDetails();
  const { firstName, lastName, email, profilePicture } = user || {};

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = (modalKey: string) => {
    setActiveModal(modalKey);
    handleProfileMenuClose();
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const menuItems: MenuItems[] = [
    { id: 1, title: 'View Profile', icon: 'material-symbols:account-circle-outline', onClick: () => handleOpenModal('viewProfile') },
    { id: 2, title: 'Account Settings', icon: 'material-symbols:settings-account-box-outline-rounded', onClick: () => handleOpenModal('accountSettings') },
    { id: 3, title: 'Notifications', icon: 'ic:outline-notifications-none', onClick: () => handleOpenModal('notifications') },
    { id: 5, title: 'Help Center', icon: 'material-symbols:help-outline', onClick: () => handleOpenModal('helpCenter') },
    { id: 6, title: 'Verification', icon: 'material-symbols:verified-user-outline', onClick: () => handleOpenModal('verification') },
    { id: 7, title: 'Logout', icon: 'material-symbols:logout', onClick: () => handleOpenModal('logout') },
  ];

  return (
    <>
      <ButtonBase
        onClick={handleProfileClick}
        aria-controls={open ? 'account-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        disableRipple
      >
        <Avatar
          src={profilePicture || undefined}
          sx={{ height: 44, width: 44, bgcolor: 'primary.main' }}
        >
          {!profilePicture && `${firstName?.[0] || ''}${lastName?.[0] || ''}`}
        </Avatar>
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        sx={{
          mt: 1.5,
          '& .MuiList-root': {
            p: 0,
            width: 230,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box p={1}>
          <MenuItem onClick={handleProfileMenuClose} sx={{ '&:hover': { bgcolor: 'info.dark' } }}>
            <Avatar
              src={profilePicture || undefined}
              sx={{ mr: 1, height: 42, width: 42 }}
            >
              {!profilePicture && `${firstName?.[0] || ''}${lastName?.[0] || ''}`}
            </Avatar>
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="column">
                <Typography variant="body2" color="text.primary" fontWeight={600}>
                  {firstName} {lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={400}>
                  {email}
                </Typography>
              </Stack>
            </Stack>
          </MenuItem>
        </Box>

        <Divider sx={{ my: 0 }} />

        <Box p={1}>
          {menuItems.map((item) => (
            <MenuItem key={item.id} onClick={item.onClick} sx={{ py: 1 }}>
              <ListItemIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 'h5.fontSize' }}>
                <IconifyIcon icon={item.icon} />
              </ListItemIcon>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {item.title}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      </Menu>

      {/* Modals */}
      <ViewProfileModal open={activeModal === 'viewProfile'} handleClose={handleCloseModal} />
      <AccountSettingsModal open={activeModal === 'accountSettings'} handleClose={handleCloseModal} />
      <NotificationsModal open={activeModal === 'notifications'} handleClose={handleCloseModal} />
      <HelpCenterModal open={activeModal === 'helpCenter'} handleClose={handleCloseModal} />
      <VerificationModal open={activeModal === 'verification'} handleClose={handleCloseModal} />
      <LogoutModal open={activeModal === 'logout'} handleClose={handleCloseModal} />
    </>
  );
};

export default ProfileMenu;
