import CustomModal from '../../../../components/base/modal'; // Adjust path

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

export const NotificationsModal = ({ open, handleClose }: ModalProps) => (
  <CustomModal open={open} onCancel={handleClose} title="Notifications" noConfirm>
    <div>Your notification preferences...</div>
  </CustomModal>
);