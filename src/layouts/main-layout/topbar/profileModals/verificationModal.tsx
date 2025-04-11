import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CustomModal from '../../../../components/base/modal';
import { useApiRequest } from '../../../../hooks/useApi';
import { ENDPOINTS } from '../../../../utils/endpoints';
import Progress from '../../../../components/loading/Progress';
import { useCompressedDropzone } from '../../../../hooks/useDropzoneConfig';
import { MultiStepFlow } from '../../../../components/common/multiStepFlow'; // Adjust path as needed

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

interface VerificationData {
  documentFront: File | null;
  documentBack: File | null;
  addressProof: File | null;
  documentType: string;
}

interface VerificationResponse {
  message: string;
  user: UserInfo;
}

interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePicture?: string;
}

interface RootState {
  user: {
    user: UserInfo | null;
  };
}

export const VerificationModal = ({ open, handleClose }: ModalProps) => {
  const [verificationData, setVerificationData] = React.useState<VerificationData>({
    documentFront: null,
    documentBack: null,
    addressProof: null,
    documentType: '',
  });
  const [error, setError] = React.useState<string | null>(null);

  const { error: apiError, loading, callApi } = useApiRequest<VerificationResponse, FormData>();
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const dispatch = useDispatch();

  const documentFrontDropzone = useCompressedDropzone({
    onFileAccepted: (file: File) => {
      console.log('Document Front:', { name: file.name, type: file.type, size: file.size });
      setVerificationData((prev) => ({ ...prev, documentFront: file }));
    },
    onFileRejected: (reason: string) => {
      console.log('Document Front rejected:', reason);
      setError(reason);
    },
    maxCompressedSizeMB: 5,
  });

  const documentBackDropzone = useCompressedDropzone({
    onFileAccepted: (file: File) => {
      console.log('Document Back:', { name: file.name, type: file.type, size: file.size });
      setVerificationData((prev) => ({ ...prev, documentBack: file }));
    },
    onFileRejected: (reason: string) => {
      console.log('Document Back rejected:', reason);
      setError(reason);
    },
    maxCompressedSizeMB: 5,
  });

  const addressProofDropzone = useCompressedDropzone({
    onFileAccepted: (file: File) => {
      console.log('Address Proof:', { name: file.name, type: file.type, size: file.size });
      setVerificationData((prev) => ({ ...prev, addressProof: file }));
    },
    onFileRejected: (reason: string) => {
      console.log('Address Proof rejected:', reason);
      setError(reason);
    },
    maxCompressedSizeMB: 5,
  });

  const handleDocumentTypeChange = (event: SelectChangeEvent<string>) => {
    setVerificationData((prev) => ({ ...prev, documentType: event.target.value }));
  };

  const handleSubmit = async () => {
    if (
      !verificationData.documentFront ||
      !verificationData.documentBack ||
      !verificationData.addressProof ||
      !verificationData.documentType ||
      !userId
    ) {
      setError('Please upload all required documents, select a document type, and ensure user is logged in.');
      return;
    }

    if (
      !isImage(verificationData.documentFront) ||
      !isImage(verificationData.documentBack) ||
      !isImage(verificationData.addressProof)
    ) {
      setError('All files must be JPEG, PNG, or WebP images.');
      return;
    }

    const formData = new FormData();
    formData.append('documentFront', verificationData.documentFront, verificationData.documentFront.name);
    formData.append('documentBack', verificationData.documentBack, verificationData.documentBack.name);
    formData.append('addressProof', verificationData.addressProof, verificationData.addressProof.name);
    formData.append('documentType', verificationData.documentType);
    formData.append('userId', userId);

    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await callApi({
        url: ENDPOINTS.VERIFICATION_SUBMISSION,
        method: 'PUT',
        body: formData,
        headers: {},
      });
      dispatch({
        type: 'user/login/fulfilled',
        payload: { user: response.user, token: null },
      });
      handleClose();
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to submit verification documents. Please try again.');
    }
  };

  const isImage = (file: File | null): boolean => {
    return !!file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  };

  if (loading) {
    return <Progress />;
  }

  const steps = [
    {
      label: 'ID Card',
      content: (
        <>
          <Typography variant="body1">Please upload the front and back of your ID card.</Typography>
          <FormControl fullWidth>
            <InputLabel id="document-type-label">Document Type</InputLabel>
            <Select
              labelId="document-type-label"
              value={verificationData.documentType}
              label="Document Type"
              onChange={handleDocumentTypeChange}
            >
              <MenuItem value="passport">Passport</MenuItem>
              <MenuItem value="driver_license">Driver's License</MenuItem>
              <MenuItem value="national_id">National ID</MenuItem>
            </Select>
          </FormControl>
          <Box
            {...documentFrontDropzone.getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              padding: 2,
              textAlign: 'center',
              bgcolor: documentFrontDropzone.isDragActive ? '#f0f0f0' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <input {...documentFrontDropzone.getInputProps()} />
            {verificationData.documentFront ? (
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                {isImage(verificationData.documentFront) && (
                  <img
                    src={URL.createObjectURL(verificationData.documentFront)}
                    alt="Front Preview"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                )}
                <Typography>Front: {verificationData.documentFront.name}</Typography>
              </Stack>
            ) : (
              <Typography>Drag or click to upload front of ID (JPEG, PNG, WEBP)</Typography>
            )}
          </Box>
          <Box
            {...documentBackDropzone.getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              padding: 2,
              textAlign: 'center',
              bgcolor: documentBackDropzone.isDragActive ? '#f0f0f0' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <input {...documentBackDropzone.getInputProps()} />
            {verificationData.documentBack ? (
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                {isImage(verificationData.documentBack) && (
                  <img
                    src={URL.createObjectURL(verificationData.documentBack)}
                    alt="Back Preview"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                )}
                <Typography>Back: {verificationData.documentBack.name}</Typography>
              </Stack>
            ) : (
              <Typography>Drag or click to upload back of ID (JPEG, PNG, WEBP)</Typography>
            )}
          </Box>
        </>
      ),
      validate: () =>
        !!verificationData.documentFront && !!verificationData.documentBack && !!verificationData.documentType,
    },
    {
      label: 'Proof of Address',
      content: (
        <>
          <Typography variant="body1">
            Please upload a proof of address (e.g., utility bill, bank statement).
          </Typography>
          <Box
            {...addressProofDropzone.getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              padding: 2,
              textAlign: 'center',
              bgcolor: addressProofDropzone.isDragActive ? '#f0f0f0' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <input {...addressProofDropzone.getInputProps()} />
            {verificationData.addressProof ? (
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                {isImage(verificationData.addressProof) && (
                  <img
                    src={URL.createObjectURL(verificationData.addressProof)}
                    alt="Address Proof Preview"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                )}
                <Typography>{verificationData.addressProof.name}</Typography>
              </Stack>
            ) : (
              <Typography>Drag or click to upload proof of address (JPEG, PNG, WEBP)</Typography>
            )}
          </Box>
        </>
      ),
      validate: () => !!verificationData.addressProof,
    },
    {
      label: 'Summary',
      content: (
        <>
          <Typography variant="body1">Review your submitted documents:</Typography>
          <Box>
            <Typography variant="body2">
              <strong>User ID:</strong> {userId || 'Not available'}
            </Typography>
            <Typography variant="body2">
              <strong>Document Type:</strong> {verificationData.documentType || 'Not selected'}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">
                <strong>Front of ID:</strong>{' '}
                {verificationData.documentFront ? verificationData.documentFront.name : 'Not uploaded'}
              </Typography>
              {isImage(verificationData.documentFront) && verificationData.documentFront && (
                <img
                  src={URL.createObjectURL(verificationData.documentFront)}
                  alt="Front Preview"
                  style={{ maxWidth: '50px', maxHeight: '50px' }}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">
                <strong>Back of ID:</strong>{' '}
                {verificationData.documentBack ? verificationData.documentBack.name : 'Not uploaded'}
              </Typography>
              {isImage(verificationData.documentBack) && verificationData.documentBack && (
                <img
                  src={URL.createObjectURL(verificationData.documentBack)}
                  alt="Back Preview"
                  style={{ maxWidth: '50px', maxHeight: '50px' }}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">
                <strong>Proof of Address:</strong>{' '}
                {verificationData.addressProof ? verificationData.addressProof.name : 'Not uploaded'}
              </Typography>
              {isImage(verificationData.addressProof) && verificationData.addressProof && (
                <img
                  src={URL.createObjectURL(verificationData.addressProof)}
                  alt="Address Proof Preview"
                  style={{ maxWidth: '50px', maxHeight: '50px' }}
                />
              )}
            </Stack>
          </Box>
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          {apiError && <Typography color="error" variant="body2">{apiError.message}</Typography>}
        </>
      ),
    },
  ];

  return (
    <CustomModal open={open} onCancel={handleClose} title="Verify Account" noConfirm>
      <MultiStepFlow steps={steps} onSubmit={handleSubmit} />
    </CustomModal>
  );
};