import CustomModal from '../../../../components/base/modal'; // Adjust path

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

export const HelpCenterModal = ({ open, handleClose }: ModalProps) => (
  <CustomModal open={open} onCancel={handleClose} title="Help Center" noConfirm>
    <div>How can we help you?</div>
  </CustomModal>
);