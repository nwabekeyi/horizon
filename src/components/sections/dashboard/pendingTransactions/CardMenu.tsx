import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconifyIcon from 'components/base/IconifyIcon';

interface Action {
  id: number;
  icon: string;
  title: string;
}

interface CardMenuProps {
  transactionId: string; // Pass transaction ID to handle actions
  onAction: (action: string, transactionId: string) => void; // Callback for actions
}

const actions: Action[] = [
  {
    id: 1,
    icon: 'ic:outline-visibility',
    title: 'View Details',
  },
  {
    id: 2,
    icon: 'ic:baseline-edit',
    title: 'Edit',
  },
  {
    id: 3,
    icon: 'ic:baseline-refresh',
    title: 'Retry Transaction',
  },
];

const CardMenu = ({ transactionId, onAction }: CardMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleActionButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionItemClick = (actionTitle: string) => {
    onAction(actionTitle, transactionId); // Trigger the action callback
    handleActionMenuClose();
  };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="transaction-menu"
        onClick={handleActionButtonClick}
        sx={{ bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent' } }}
      >
        <IconifyIcon icon="ic:baseline-more-vert" color="text.disabled" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="transaction-menu"
        open={open}
        onClose={handleActionMenuClose}
        sx={{
          mt: 0.5,
          '& .MuiList-root': {
            width: 140,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions.map((actionItem) => (
          <MenuItem
            key={actionItem.id}
            onClick={() => handleActionItemClick(actionItem.title)}
          >
            <ListItemIcon sx={{ mr: 1, fontSize: 'h5.fontSize' }}>
              <IconifyIcon icon={actionItem.icon} color="text.primary" />
            </ListItemIcon>
            <ListItemText>
              <Typography color="text.primary">{actionItem.title}</Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CardMenu;