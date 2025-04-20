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

interface ActionMenuProps {
  transactionId: string;
  status: 'pending' | 'failed' | 'successful';
  onAction: (action: string, transactionId: string) => void;
}

const actions: Action[] = [
  { id: 1, icon: 'ic:outline-visibility', title: 'View Details' },
  { id: 2, icon: 'ic:baseline-edit', title: 'Edit' },
  { id: 3, icon: 'ic:baseline-refresh', title: 'Retry' },
];

const ActionMenu = ({ transactionId, status, onAction }: ActionMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleActionButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionItemClick = (actionTitle: string) => {
    onAction(actionTitle, transactionId);
    handleActionMenuClose();
  };

  const filteredActions = actions.filter(
    (action) => action.title !== 'Retry' || ['pending', 'failed'].includes(status)
  );

  return (
    <>
      <IconButton
        onClick={handleActionButtonClick}
        sx={{ p: 0.75, border: 'none', bgcolor: 'transparent !important' }}
        size="medium"
      >
        <IconifyIcon icon="solar:menu-dots-bold" color="text.primary" />
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
        {filteredActions.map((actionItem) => (
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

export default ActionMenu;
