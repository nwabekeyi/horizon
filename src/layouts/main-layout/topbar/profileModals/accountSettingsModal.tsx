import { useSelector } from 'react-redux';
import { RootState } from 'store'; // Adjust this import path if needed
import CustomModal from '../../../../components/base/modal';
import Account from 'pages/dashboard/profile/Account';

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

export const AccountSettingsModal = ({ open, handleClose }: ModalProps) => {
  const user = useSelector((state: RootState) => state.user.user); // Access user.user from the store

  return (
    <CustomModal open={open} onCancel={handleClose} title="Account Settings">
      <div>
        <Account user={user} />
      </div>
    </CustomModal>
  );
};
