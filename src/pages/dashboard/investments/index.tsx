import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import { RootState } from '../../../store'; // Adjust path to your store
import { useInvestmentData } from './useInvestmentData'; // Adjust path as needed
import { MultiStepFlow } from '../../../components/common/multiStepFlow'; // Adjust path as needed
import { useCompressedDropzone } from '../../../hooks/useDropzoneConfig'; // Adjust path as needed

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
  const userId = useSelector((state: RootState) => state.user.user?.id || '');
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
  } = useInvestmentData(userId);

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
    setPaymentProof(null); // Reset proof on close
    // Optionally reset state if you want a fresh start each time
    setInvestmentType('');
    setIndustry('');
    setSelectedCompany('', '');
    setAmount('');
    setFiatCurrency('');
    setCryptoType('');
  };

  const handleSubmitInvestmentFlow = () => {
    console.log('Investment Flow Completed:', {
      ...state,
      paymentProof: paymentProof?.name || 'Not uploaded',
    });
    handleCloseInvestmentFlow();
  };

  const isImage = (file: File | null): boolean => {
    return !!file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  };

  const investmentSteps = [
    {
      label: 'Investment Details',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Enter Investment Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Investment Type</InputLabel>
                <Select
                  value={state.investmentType}
                  label="Investment Type"
                  onChange={(e) => setInvestmentType(e.target.value as string)}
                >
                  <MenuItem value="fiat">Fiat</MenuItem>
                  <MenuItem value="crypto">Crypto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={state.industry}
                  label="Industry"
                  onChange={(e) => setIndustry(e.target.value as string)}
                >
                  {allIndustries?.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Company</InputLabel>
                <Select
                  value={state.selectedCompany}
                  label="Select Company"
                  onChange={handleCompanyChange}
                >
                  {state.industries.map((company) => (
                    <MenuItem key={company._id} value={company.name}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Investment Amount"
                type="number"
                value={state.amount}
                onChange={(e) => setAmount(e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Box>
      ),
      validate: () =>
        !!state.investmentType &&
        !!state.industry &&
        !!state.selectedCompany &&
        !!state.amount &&
        parseFloat(state.amount) > 0,
    },
    {
      label: 'Currency Selection',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Select Currency
          </Typography>
          {state.investmentType === 'crypto' ? (
            <FormControl fullWidth>
              <InputLabel>Crypto Currency</InputLabel>
              <Select
                value={state.cryptoType}
                label="Crypto Currency"
                onChange={(e) => setCryptoType(e.target.value as 'BTC' | 'ETH' | 'USDT' | '')}
              >
                <MenuItem value="BTC">Bitcoin (BTC)</MenuItem>
                <MenuItem value="ETH">Ethereum (ETH)</MenuItem>
                <MenuItem value="USDT">Tether (USDT)</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Fiat Currency</InputLabel>
              <Select
                value={state.fiatCurrency}
                label="Fiat Currency"
                onChange={(e) => setFiatCurrency(e.target.value as string)}
              >
                <MenuItem value="NGN">Nigerian Naira (NGN)</MenuItem>
                <MenuItem value="USD">US Dollar (USD)</MenuItem>
                <MenuItem value="EUR">Euro (EUR)</MenuItem>
                <MenuItem value="GBP">British Pound (GBP)</MenuItem>
                <MenuItem value="CAD">Canadian Dollar (CAD)</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      ),
      validate: () =>
        state.investmentType === 'crypto' ? !!state.cryptoType : !!state.fiatCurrency,
    },
    {
      label: 'Payment Details',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Payment Instructions
          </Typography>
          {state.investmentType === 'crypto' && state.cryptoType ? (
            <>
              <Typography variant="body1">
                Send {state.cryptoType} to the following address:
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 1 }}>
                {cryptoAddresses[state.cryptoType]}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Ensure you send the exact amount: {state.amount} {state.cryptoType}
              </Typography>
            </>
          ) : state.investmentType === 'fiat' && state.fiatCurrency ? (
            <List>
              <ListItem>
                <ListItemText
                  primary="Account Number"
                  secondary={wireTransferDetails[state.fiatCurrency]?.account}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Bank"
                  secondary={wireTransferDetails[state.fiatCurrency]?.bank}
                />
              </ListItem>
              {['USD', 'CAD', 'NGN'].includes(state.fiatCurrency) && (
                <ListItem>
                  <ListItemText
                    primary="Routing Number"
                    secondary={wireTransferDetails[state.fiatCurrency]?.routing}
                  />
                </ListItem>
              )}
              {['EUR', 'GBP'].includes(state.fiatCurrency) && (
                <ListItem>
                  <ListItemText
                    primary="IBAN"
                    secondary={wireTransferDetails[state.fiatCurrency]?.iban}
                  />
                </ListItem>
              )}
              <Typography variant="caption" color="textSecondary">
                Transfer {state.amount} {state.fiatCurrency} to this account.
              </Typography>
            </List>
          ) : (
            <Typography color="error">Please select a currency first.</Typography>
          )}
        </Box>
      ),
      validate: () => true, // No validation needed here; just display info
    },
    {
      label: 'Upload Proof',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Upload Payment Proof
          </Typography>
          <Box
            {...paymentProofDropzone.getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              padding: 2,
              textAlign: 'center',
              bgcolor: paymentProofDropzone.isDragActive ? '#f0f0f0' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <input {...paymentProofDropzone.getInputProps()} />
            {paymentProof ? (
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                {isImage(paymentProof) && (
                  <img
                    src={URL.createObjectURL(paymentProof)}
                    alt="Proof Preview"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                )}
                <Typography>{paymentProof.name}</Typography>
              </Stack>
            ) : (
              <Typography>Drag or click to upload payment proof (JPEG, PNG, WEBP)</Typography>
            )}
          </Box>
        </Box>
      ),
      validate: () => !!paymentProof,
    },
  ];

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

      {/* Investment Flow Modal */}
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
              sx={{ mt: 2 }}
            >
              Cancel
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Investment;