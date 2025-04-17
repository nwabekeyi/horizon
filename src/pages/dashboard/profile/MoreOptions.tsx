import { Menu, MenuItem } from "@mui/material";
import { FaPen, FaTrash } from "react-icons/fa"; // Replacing custom icons with react-icons
import { FC } from "react";
import { Typography } from "@mui/material";

// component props interface

interface MoreOptionsProps {
  open?: boolean;
  anchorEl: HTMLElement | null;
  handleMoreClose: () => void;
}

const MoreOptions: FC<MoreOptionsProps> = ({ anchorEl, handleMoreClose }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMoreClose}
    >
      <MenuItem
        onClick={handleMoreClose}
        sx={{ "&:hover": { color: "primary.main" } }}
      >
        <FaPen size={14} style={{ marginRight: 8 }} />
        <Typography fontWeight={500}>Edit</Typography>
      </MenuItem>
      <MenuItem
        onClick={handleMoreClose}
        sx={{ "&:hover": { color: "primary.main" } }}
      >
        <FaTrash size={14} style={{ marginRight: 8 }} />
        <Typography fontWeight={500}>Remove</Typography>
      </MenuItem>
    </Menu>
  );
};

export default MoreOptions;
