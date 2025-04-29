import { useDispatch } from 'react-redux';
import CustomModal from '../../../../components/base/modal';
import { logout } from 'store/slices/userSlice';
import type { AppDispatch } from 'store';

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

export const LogoutModal = ({ open, handleClose }: ModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
    handleClose(); // optional, depending on if modal auto-closes on redirect
  };

  return (
    <CustomModal open={open} onCancel={handleClose} onConfirm={handleLogout} title="Confirm Logout">
      <div>Are you sure you want to log out?</div>
    </CustomModal>
  );
};
