import CustomModal from '../../../../components/base/modal'; // Adjust path

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

export const LogoutModal = ({ open, handleClose }: ModalProps) => {
  const handleLogout = () => {
    console.log('Logging out...');
    handleClose();
  };

  return (
    <CustomModal open={open} onCancel={handleClose} onConfirm={handleLogout} title="Confirm Logout">
      <div>Are you sure you want to log out?</div>
    </CustomModal>
  );
};