import React from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactNode } from "react";

interface ChildrenBoxProps {
  children: ReactNode;
}

export const ChildrenBox = ({ children }: ChildrenBoxProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        justifyContent: 'center',
        mt: 2
      }}
    >
      {children}
    </Box>
  );
};


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

      <DialogContent dividers >
        <Box marginTop={2}>
            {children}
        </Box>
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