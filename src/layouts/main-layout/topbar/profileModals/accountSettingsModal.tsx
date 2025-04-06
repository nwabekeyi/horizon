import CustomModal from '../../../../components/base/modal'; // Adjust path

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}


export const AccountSettingsModal = ({ open, handleClose }: ModalProps) => (
  <CustomModal open={open} onCancel={handleClose} title="Account Settings">
    <div>Account settings form goes here...</div>
  </CustomModal>
);