import { MenuItem } from 'routes/sitemap';
import Link from '@mui/material/Link';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconifyIcon from 'components/base/IconifyIcon';

interface ListItemProps extends MenuItem {
  handleDrawerClose?: () => void;
}

const ListItem = ({ subheader, path, icon, active, handleDrawerClose }: ListItemProps) => {
  return (
    <ListItemButton
      component={Link}
      href={path}
      sx={{ bgcolor: active ? 'info.main' : null }}
      onClick={handleDrawerClose}
    >
      <ListItemIcon>
        {icon && (
          <IconifyIcon
            icon={icon}
            sx={{
              color: active ? 'primary.main' : null,
            }}
          />
        )}
      </ListItemIcon>
      <ListItemText
        primary={subheader}
        sx={{
          '& .MuiListItemText-primary': {
            color: active ? 'primary.main' : null,
          },
        }}
      />
    </ListItemButton>
  );
};

export default ListItem;