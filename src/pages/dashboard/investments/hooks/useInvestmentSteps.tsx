import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Collapse,
  Button,
  ListItemButton,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { ChangeEvent, HTMLAttributes, useState } from 'react';

// Define Dropzone props
interface DropzoneProps {
  getRootProps: () => HTMLAttributes<HTMLElement>;
  getInputProps: () => HTMLAttributes<HTMLInputElement>;
  isDragActive: boolean;
}

interface InvestmentState {
  investmentType: string;
  industry: string;
  selectedCompany: string;
  selectedCompanyId: string;
  industries: {
    _id: string;
    name: string;
    description: string;
    industry: string;
    location: string;
    logoUrl: string;
    establishedYear: number;
    totalFiatInvestment: number;
    totalCryptoInvestment: number;
    subscribers: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  }[];
  amount: string;
  fiatCurrency: string;
  cryptoType: 'BTC' | 'ETH' | 'USDT' | '';
}

// Define form field configs
interface SelectFormField {
  id: keyof InvestmentState;
  label: string;
  type: 'select';
  value: string;
  options: { value: string; label: string }[];
  onChange: (e: SelectChangeEvent<string>) => void;
  disabled?: boolean;
}

interface TextFormField {
  id: keyof InvestmentState;
  label: string;
  type: 'text';
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

type FormField = SelectFormField | TextFormField;

interface UseInvestmentStepsProps {
  state: InvestmentState;
  allIndustries: string[] | null;
  paymentProof: File | null;
  paymentProofDropzone: DropzoneProps;
  setInvestmentType: (value: string) => void;
  setIndustry: (value: string) => void;
  setSelectedCompany: (name: string, id: string) => void;
  setAmount: (value: string) => void;
  setFiatCurrency: (value: string) => void;
  setCryptoType: (value: 'BTC' | 'ETH' | 'USDT' | '') => void;
  handleCompanyChange: (e: SelectChangeEvent<string>) => void;
  cryptoAddresses: { BTC: string; ETH: string; USDT: string };
  wireTransferDetails: {
    [key: string]: { account: string; bank: string; routing?: string; iban?: string };
  };
}

export const useInvestmentSteps = ({
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
  // handleCompanyChange, // Not used
  cryptoAddresses,
  wireTransferDetails,
}: UseInvestmentStepsProps) => {
  const isImage = (file: File | null): boolean => {
    return !!file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  };

  // Track which company is expanded
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);

  // Toggle collapse for a company
  const handleToggleCollapse = (companyId: string) => {
    setExpandedCompanyId(expandedCompanyId === companyId ? null : companyId);
  };

  // Form fields for Step 2
  const formFields: FormField[] = [
    {
      id: 'investmentType',
      label: 'Investment Type',
      type: 'select',
      value: state.investmentType,
      options: [
        { value: 'fiat', label: 'Fiat' },
        { value: 'crypto', label: 'Crypto' },
      ],
      onChange: (e) => setInvestmentType(e.target.value),
    },
    {
      id: state.investmentType === 'crypto' ? 'cryptoType' : 'fiatCurrency',
      label: state.investmentType === 'crypto' ? 'Crypto Currency' : 'Fiat Currency',
      type: 'select',
      value: state.investmentType === 'crypto' ? state.cryptoType : state.fiatCurrency,
      options:
        state.investmentType === 'crypto'
          ? [
              { value: 'BTC', label: 'Bitcoin (BTC)' },
              { value: 'ETH', label: 'Ethereum (ETH)' },
              { value: 'USDT', label: 'Tether (USDT)' },
            ]
          : [
              { value: 'NGN', label: 'Nigerian Naira (NGN)' },
              { value: 'USD', label: 'US Dollar (USD)' },
              { value: 'EUR', label: 'Euro (EUR)' },
              { value: 'GBP', label: 'British Pound (GBP)' },
              { value: 'CAD', label: 'Canadian Dollar (CAD)' },
            ],
      onChange: (e) =>
        state.investmentType === 'crypto'
          ? setCryptoType(e.target.value as 'BTC' | 'ETH' | 'USDT' | '')
          : setFiatCurrency(e.target.value),
    },
    {
      id: 'amount',
      label: 'Investment Amount',
      type: 'text',
      value: state.amount,
      onChange: (e) => setAmount(e.target.value),
    },
  ];

  return [
    {
      label: 'Select Industry & Company',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Select Industry and Company
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={!allIndustries}>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={state.industry}
                  label="Industry"
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  {allIndustries && allIndustries.length ? (
                    allIndustries.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No industries available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            {state.industry && state.industries.length > 0 ? (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Available Companies
                </Typography>
                <List sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                  {state.industries.map((company) => (
                    <Box key={company._id}>
                      <ListItemButton
                        selected={state.selectedCompanyId === company._id}
                        onClick={() => handleToggleCollapse(company._id)}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: '#e3f2fd',
                          },
                        }}
                      >
                        <ListItemText
                          primary={company.name}
                          secondary={`Location: ${company.location}`}
                        />
                      </ListItemButton>
                      <Collapse in={expandedCompanyId === company._id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                          {company.logoUrl && company.logoUrl !== 'string' ? (
                            <img
                              src={company.logoUrl}
                              alt={`${company.name} logo`}
                              style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '8px' }}
                            />
                          ) : null}
                          <Typography variant="body2">
                            <strong>Description:</strong> {company.description || 'No description available'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Industry:</strong> {company.industry}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Location:</strong> {company.location}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Established:</strong> {company.establishedYear}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total Fiat Investment:</strong> ${company.totalFiatInvestment}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total Crypto Investment:</strong> ${company.totalCryptoInvestment}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Created:</strong> {new Date(company.createdAt).toLocaleDateString()}
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => setSelectedCompany(company.name, company._id)}
                          >
                            Invest
                          </Button>
                        </Box>
                      </Collapse>
                    </Box>
                  ))}
                </List>
              </Grid>
            ) : state.industry ? (
              <Grid item xs={12}>
                <Typography color="textSecondary">No companies available for this industry.</Typography>
              </Grid>
            ) : null}
          </Grid>
        </Box>
      ),
      validate: () => !!state.industry && !!state.selectedCompany && !!state.selectedCompanyId,
    },
    {
      label: 'Investment Details',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Enter Investment Details
          </Typography>
          <Grid container spacing={2}>
            {formFields.map((field) => (
              <Grid item xs={12} mt={3} key={field.id}>
                {field.type === 'select' ? (
                  <FormControl fullWidth>
                    <InputLabel>{field.label}</InputLabel>
                    <Select value={field.value} label={field.label} onChange={field.onChange}>
                      {field.options?.length ? (
                        field.options.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No options available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label={field.label}
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    variant="outlined"
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      ),
      validate: () =>
        !!state.investmentType &&
        (state.investmentType === 'crypto' ? !!state.cryptoType : !!state.fiatCurrency) &&
        !!state.amount &&
        parseFloat(state.amount) > 0,
    },
    {
      label: 'Payment Instructions',
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
                {cryptoAddresses[state.cryptoType] || 'Address not available'}
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
                  secondary={wireTransferDetails[state.fiatCurrency]?.account || 'Not available'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Bank"
                  secondary={wireTransferDetails[state.fiatCurrency]?.bank || 'Not available'}
                />
              </ListItem>
              {['USD', 'CAD', 'NGN'].includes(state.fiatCurrency) && (
                <ListItem>
                  <ListItemText
                    primary="Routing Number"
                    secondary={wireTransferDetails[state.fiatCurrency]?.routing || 'Not available'}
                  />
                </ListItem>
              )}
              {['EUR', 'GBP'].includes(state.fiatCurrency) && (
                <ListItem>
                  <ListItemText
                    primary="IBAN"
                    secondary={wireTransferDetails[state.fiatCurrency]?.iban || 'Not available'}
                  />
                </ListItem>
              )}
              <Typography variant="caption" color="textSecondary">
                Transfer {state.amount} {state.fiatCurrency} to this account.
              </Typography>
            </List>
          ) : (
            <Typography color="error">Please complete investment details in the previous step.</Typography>
          )}
        </Box>
      ),
      validate: () =>
        state.investmentType === 'crypto'
          ? !!state.cryptoType && !!cryptoAddresses[state.cryptoType]
          : !!state.fiatCurrency && !!wireTransferDetails[state.fiatCurrency]?.account,
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
};