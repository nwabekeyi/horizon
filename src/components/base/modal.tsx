import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';

interface CustomModalProps {
  open: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  noConfirm?: boolean;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  title,
  onCancel,
  onConfirm,
  noConfirm = false,
  children,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onCancel} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}

      <DialogContent dividers>
        {children}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color="secondary" variant="contained">
          Cancel
        </Button>
        {!noConfirm && (
          <Button onClick={onConfirm} color="primary" variant="contained">
            Confirm
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal;