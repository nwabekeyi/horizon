import CustomModal from '../../../../components/base/modal'; // Adjust path

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

export const SwitchAccountModal = ({ open, handleClose }: ModalProps) => (
  <CustomModal open={open} onCancel={handleClose} title="Switch Account">
    <div>Switch to another account</div>
  </CustomModal>
);