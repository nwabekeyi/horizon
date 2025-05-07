import { useState, useEffect } from 'react';
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
import { useInvestmentData } from './hooks/useInvestmentData';
import { MultiStepFlow } from '../../../components/common/multiStepFlow';
import { useCompressedDropzone } from '../../../hooks/useDropzoneConfig';
import { useInvestmentSteps } from './hooks/useInvestmentSteps';
import CustomModal from 'components/base/modal';
import { useUserDetails } from 'hooks/useUserdetails';
import InvestmentHistory from './investmentHistory';
import { useApiRequest } from '../../../hooks/useApi';
import { ENDPOINTS } from '../../../utils/endpoints';
import { User, PaymentAccount } from './interfaces';

// Types
interface InvestmentProps {}

const Investment: React.FC<InvestmentProps> = () => {
  const user = useUserDetails() as User | null;
  const userId = user?._id;
  const [isInvestmentFlowOpen, setIsInvestmentFlowOpen] = useState<boolean>(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState<string>('');

  // Fetch payment accounts
  const { data: paymentAccounts, loading: paymentAccountsLoading, error: paymentAccountsError, callApi } =
    useApiRequest<PaymentAccount[]>();

  useEffect(() => {
    if (isInvestmentFlowOpen && userId) {
      callApi({
        url: ENDPOINTS.PAYMENT_ACCOUNTS,
        method: 'GET',
      });
    }
  }, [isInvestmentFlowOpen, userId, callApi]);

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
  } = useInvestmentData(userId ?? null, paymentProof, selectedPaymentAccountId);

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
    if (!userId) {
      alert('Please log in to start an investment.');
      return;
    }
    setIsInvestmentFlowOpen(true);
  };

  const handleCloseInvestmentFlow = () => {
    setIsInvestmentFlowOpen(false);
    setPaymentProof(null);
    setSelectedPaymentAccountId('');
  };

  const handleSubmitInvestmentFlow = async () => {
    console.log('Investment Flow Completed:', {
      userId,
      ...state,
      paymentProof: paymentProof?.name || 'Not uploaded',
      selectedPaymentAccountId,
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
    paymentAccounts: paymentAccounts || [],
    selectedPaymentAccountId,
    setSelectedPaymentAccountId,
  });

  if (industriesLoading || companiesLoading || paymentAccountsLoading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  if (industriesError) {
    return <Alert severity="error">{industriesError.message}</Alert>;
  }

  if (companiesError) {
    return <Alert severity="error">{companiesError.message}</Alert>;
  }

  if (paymentAccountsError) {
    return <Alert severity="error">{paymentAccountsError.message}</Alert>;
  }

  return (
    <Box sx={{ minHeight: '100%', pt:4 }}>
      <Typography variant="h4" gutterBottom>
        Investment Opportunities
      </Typography>
      <Paper elevation={3}>
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

      <InvestmentHistory />

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