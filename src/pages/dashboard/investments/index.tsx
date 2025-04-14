// src/pages/dashboard/investments/index.tsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { RootState } from '../../../store';
import { useInvestmentData } from './hooks/useInvestmentData';
import { MultiStepFlow } from '../../../components/common/multiStepFlow';
import { useCompressedDropzone } from '../../../hooks/useDropzoneConfig';
import { useInvestmentSteps } from './hooks/useInvestmentSteps';
import CustomModal from 'components/base/modal';

// Mock wire transfer details
const wireTransferDetails: {
  [key: string]: { account: string; bank: string; routing?: string; iban?: string };
} = {
  NGN: { account: '0123-4567-8901', bank: 'Zenith Bank', routing: '221000021' },
  USD: { account: '1234-5678-9012', bank: 'Bank of America', routing: '021000021' },
  EUR: { account: '9876-5432-1098', bank: 'Deutsche Bank', iban: 'DE89370400440532013000' },
  GBP: { account: '5678-9012-3456', bank: 'Barclays', iban: 'GB29NWBK60161331926819' },
  CAD: { account: '3456-7890-1234', bank: 'RBC', routing: '003000021' },
};

// Mock crypto addresses
const cryptoAddresses: { BTC: string; ETH: string; USDT: string } = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  ETH: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
};

const Investment = () => {
  const userId = useSelector((state: RootState) => state.user.user?._id || '');
  console.log(userId)
  const [isInvestmentFlowOpen, setIsInvestmentFlowOpen] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const {
    state,
    allIndustries,
    industriesLoading,
    industriesError,
    companiesLoading,
    companiesError,
    setInvestmentType,
    setIndustry,
    setSelectedCompany,
    setAmount,
    setFiatCurrency,
    setCryptoType,
    handleInvest,
    modalState,
    handleCloseModal,
  } = useInvestmentData(userId, paymentProof);

  const paymentProofDropzone = useCompressedDropzone({
    onFileAccepted: (file: File) => {
      console.log('Payment Proof:', { name: file.name, type: file.type, size: file.size });
      setPaymentProof(file);
    },
    onFileRejected: (reason: string) => {
      console.log('Payment Proof rejected:', reason);
      alert(`Upload failed: ${reason}`);
    },
    maxCompressedSizeMB: 5,
  });

  const handleCompanyChange = (e: SelectChangeEvent<string>) => {
    if (!state.industry) {
      alert('Please select an industry first.');
      return;
    }
    const selectedCompanyName = e.target.value;
    const selectedCompany = state.industries.find((company) => company.name === selectedCompanyName);
    if (selectedCompany) {
      setSelectedCompany(selectedCompany.name, selectedCompany._id);
    }
  };

  const handleStartInvestmentFlow = () => {
    setIsInvestmentFlowOpen(true);
  };

  const handleCloseInvestmentFlow = () => {
    setIsInvestmentFlowOpen(false);
    setPaymentProof(null);
    // Do not reset state to preserve localStorage data
  };

  const handleSubmitInvestmentFlow = async () => {
    console.log('Investment Flow Completed:', {
      userId,
      ...state,
      paymentProof: paymentProof?.name || 'Not uploaded',
    });
    await handleInvest();
    handleCloseInvestmentFlow();
  };

  const investmentSteps = useInvestmentSteps({
    state,
    allIndustries,
    paymentProof,
    paymentProofDropzone,
    setInvestmentType,
    setIndustry,
    setSelectedCompany,
    setAmount,
    setFiatCurrency,
    setCryptoType,
    handleCompanyChange,
    cryptoAddresses,
    wireTransferDetails,
  });

  if (industriesLoading || companiesLoading) {
    return <CircularProgress />;
  }

  if (industriesError) {
    return <Alert severity="error">{industriesError.message}</Alert>;
  }

  if (companiesError) {
    return <Alert severity="error">{companiesError.message}</Alert>;
  }

  return (
    <Box sx={{ p: 3, minHeight: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Investment Opportunities
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartInvestmentFlow}
            >
              Invest
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isInvestmentFlowOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1300,
          }}
        >
          <Paper sx={{ p: 3, maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <Typography variant="h5" gutterBottom>
              Investment Process
            </Typography>
            <MultiStepFlow steps={investmentSteps} onSubmit={handleSubmitInvestmentFlow} />
            <Button
              variant="outlined"
              onClick={handleCloseInvestmentFlow}
              sx={{ mt: 2, backgroundColor: '#D32F2F', border: 'none', textAlign: 'right' }}
            >
              Cancel
            </Button>
          </Paper>
        </Box>
      )}

      <CustomModal
        open={modalState.open}
        title={modalState.title}
        onCancel={handleCloseModal}
        noConfirm={true}
      >
        <Typography color={modalState.isError ? 'error' : 'success'}>
          {modalState.message}
        </Typography>
      </CustomModal>
    </Box>
  );
};

export default Investment;