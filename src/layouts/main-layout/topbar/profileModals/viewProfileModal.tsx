import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CustomModal from '../../../../components/base/modal'; // Adjust path
import { useApiRequest } from '../../../../hooks/useApi'; // Adjust path
import { useCompressedDropzone } from '../../../../hooks/useDropzoneConfig'; // Adjust path
import { ENDPOINTS } from '../../../../utils/endpoints'; // Adjust path
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

interface Transaction {
  id: string;
  amount: number;
  date: string;
}

interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

interface UserInfo {
  _id: string;
  firstName?: string; // Made optional for safety
  lastName?: string; // Made optional for safety
  email?: string; // Made optional for safety
  role: string;
  kyc: { status: string };
  transactions: Transaction[];
  twoFA: { enabled: boolean };
  isBanned: boolean;
  wallets: Wallet[];
  dateJoined?: string; // Made optional for safety
  createdAt: string;
  updatedAt: string;
  __v: number;
  status?: string; // Made optional for safety
  profilePicture?: string; // Made optional for safety
}

interface UpdateProfilePictureResponse {
  message: string;
  user: UserInfo;
}

interface RootState {
  user: {
    user: UserInfo | null;
  };
}

export const ViewProfileModal = ({ open, handleClose }: ModalProps) => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  const [editPictureOpen, setEditPictureOpen] = React.useState(false);
  const [profilePictureFile, setProfilePictureFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { error: apiError, loading, callApi } = useApiRequest<UpdateProfilePictureResponse, FormData>();

  const profilePictureDropzone = useCompressedDropzone({
    onFileAccepted: (file: File) => {
      console.log('Accepted file:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      setProfilePictureFile(file);
    },
    onFileRejected: (reason: string) => {
      console.log('File rejected:', reason);
      setError(reason);
    },
    maxCompressedSizeMB: 5,
  });

  const handleEditPictureOpen = () => {
    setEditPictureOpen(true);
  };

  const handleEditPictureClose = () => {
    setEditPictureOpen(false);
    setProfilePictureFile(null);
    setError(null);
  };

  const handlePictureSubmit = async () => {
    if (!profilePictureFile) {
      setError('Please upload a profile picture.');
      return;
    }

    if (!isImage(profilePictureFile)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (!user?._id) {
      setError('User ID is not available.');
      return;
    }

    const formData = new FormData();
    // Ensure the file is appended with its original name and type
    formData.append('profilePicture', profilePictureFile, profilePictureFile.name);
    // Log FormData contents for debugging (note: FormData logging is limited in console)
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await callApi({
        url: `${ENDPOINTS.USERS}/${user._id}`,
        method: 'PUT',
        body: formData,
        headers: {
          // Explicitly avoid setting Content-Type; let the browser handle multipart/form-data
        },
      });

      dispatch({
        type: 'user/login/fulfilled',
        payload: { user: response.user, token: null },
      });
      handleEditPictureClose();
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to update profile picture. Please try again.');
    }
  };

  const isImage = (file: File | null): boolean => {
    return !!file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  };

  if (!user) {
    return (
      <CustomModal open={open} onCancel={handleClose} title="Your Profile" noConfirm>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" color="error">
            User data not available. Please log in.
          </Typography>
        </Box>
      </CustomModal>
    );
  }

  // Format dateJoined
  const formattedDateJoined = user.dateJoined
    ? new Date(user.dateJoined).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'User has not updated status';

  return (
    <CustomModal open={open} onCancel={handleClose} title="Your Profile" noConfirm>
      <Box sx={{ p: 2 }}>
        <Stack direction="column" spacing={3} alignItems="center">
          <Box position="relative">
            <Avatar
              src={user.profilePicture || undefined}
              alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
              sx={{ width: 100, height: 100 }}
            />
            <IconButton
              onClick={handleEditPictureOpen}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'grey.300',
                '&:hover': { bgcolor: 'grey.400' },
              }}
            >
              <EditIcon />
            </IconButton>
          </Box>

          <Stack direction="column" spacing={1} sx={{ width: '100%' }}>
            <Typography variant="body1">
              <strong>First Name:</strong> {user.firstName || 'User has not updated status'}
            </Typography>
            <Typography variant="body1">
              <strong>Last Name:</strong> {user.lastName || 'User has not updated status'}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email || 'User has not updated status'}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong> {user.status || 'User has not updated status'}
            </Typography>
            <Typography variant="body1">
              <strong>Date Joined:</strong> {formattedDateJoined}
            </Typography>
          </Stack>
        </Stack>

        <Dialog open={editPictureOpen} onClose={handleEditPictureClose}>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogContent>
            <Box
              {...profilePictureDropzone.getRootProps()}
              sx={{
                border: '2px dashed #ccc',
                padding: 2,
                textAlign: 'center',
                bgcolor: profilePictureDropzone.isDragActive ? '#f0f0f0' : 'transparent',
                cursor: 'pointer',
                minHeight: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <input {...profilePictureDropzone.getInputProps()} />
              {profilePictureFile ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  {isImage(profilePictureFile) && (
                    <img
                      src={URL.createObjectURL(profilePictureFile)}
                      alt="Profile Picture Preview"
                      style={{ maxWidth: '100px', maxHeight: '100px' }}
                    />
                  )}
                  <Typography>{profilePictureFile.name}</Typography>
                </Stack>
              ) : (
                <Typography>Drag or click to upload a new profile picture (JPEG, PNG, WEBP)</Typography>
              )}
            </Box>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            {apiError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {apiError.message}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditPictureClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handlePictureSubmit} variant="contained" disabled={loading}>
              {loading ? 'Uploading...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </CustomModal>
  );
};