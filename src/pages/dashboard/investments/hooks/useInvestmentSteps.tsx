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
import { ChangeEvent, HTMLAttributes, useState, useEffect } from 'react';
import { PaymentAccount } from '../interfaces'; // Adjust to '../../../types/paymentAccount' if needed

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

interface FormField {
  id: keyof InvestmentState;
  label: string;
  type: 'select' | 'text';
  value: string;
  options?: { value: string; label: string }[];
  onChange: (e: SelectChangeEvent<string> | ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

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
  paymentAccounts: PaymentAccount[];
  selectedPaymentAccountId: string;
  setSelectedPaymentAccountId: (value: string) => void;
}

interface Step {
  label: string;
  content: JSX.Element;
  validate: () => boolean;
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
  handleCompanyChange,
  paymentAccounts,
  selectedPaymentAccountId,
  setSelectedPaymentAccountId,
}: UseInvestmentStepsProps): Step[] => {
  const isImage = (file: File | null): boolean => {
    return !!file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  };

  // Explicitly type as string | null to fix previous TypeScript error
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);

  const handleToggleCollapse = (companyId: string) => {
    setExpandedCompanyId(expandedCompanyId === companyId ? null : companyId);
  };

  const handlePaymentAccountChange = (e: SelectChangeEvent<string>) => {
    setSelectedPaymentAccountId(e.target.value);
  };

  const selectedPaymentAccount = paymentAccounts.find(
    (account) => account._id === selectedPaymentAccountId
  );

  // Determine available investment types and currencies from paymentAccounts
  const hasFiat = paymentAccounts.some((account) => account.currency === 'usd');
  const hasCrypto = paymentAccounts.some((account) => account.currency === 'usdt');
  const availableFiatCurrencies = Array.from(
    new Set(paymentAccounts.filter((account) => account.currency === 'usd').map(() => 'USD'))
  );
  const availableCryptoTypes = Array.from(
    new Set(
      paymentAccounts
        .filter((account) => account.currency === 'usdt' && account.network)
        .map((account) => {
          switch (account.network?.toLowerCase()) {
            case 'erc':
              return 'USDT';
            case 'eth':
              return 'ETH';
            case 'btc':
              return 'BTC';
            default:
              return '';
          }
        })
        .filter((type) => type !== '')
    )
  ) as ('BTC' | 'ETH' | 'USDT')[];

  // Reset invalid selections when paymentAccounts changes
  useEffect(() => {
    if (state.investmentType === 'fiat' && !hasFiat) {
      setInvestmentType('');
      setFiatCurrency('');
    } else if (state.investmentType === 'crypto' && !hasCrypto) {
      setInvestmentType('');
      setCryptoType('');
    }
    if (state.fiatCurrency && !availableFiatCurrencies.includes(state.fiatCurrency)) {
      setFiatCurrency('');
    }
    if (state.cryptoType && !availableCryptoTypes.includes(state.cryptoType)) {
      setCryptoType('');
    }
  }, [
    paymentAccounts,
    state.investmentType,
    state.fiatCurrency,
    state.cryptoType,
    hasFiat,
    hasCrypto,
    availableFiatCurrencies,
    availableCryptoTypes,
    setInvestmentType,
    setFiatCurrency,
    setCryptoType,
  ]);

  const formFields: FormField[] = [
    {
      id: 'investmentType',
      label: 'Investment Type',
      type: 'select',
      value: state.investmentType,
      options: [
        ...(hasFiat ? [{ value: 'fiat', label: 'Fiat' }] : []),
        ...(hasCrypto ? [{ value: 'crypto', label: 'Crypto' }] : []),
      ],
      onChange: (e) => {
        const value = (e as SelectChangeEvent<string>).target.value;
        setInvestmentType(value);
        // Reset currency when investment type changes
        setFiatCurrency('');
        setCryptoType('');
      },
      disabled: !hasFiat && !hasCrypto,
    },
    {
      id: state.investmentType === 'crypto' ? 'cryptoType' : 'fiatCurrency',
      label: state.investmentType === 'crypto' ? 'Crypto Currency' : 'Fiat Currency',
      type: 'select',
      value: state.investmentType === 'crypto' ? state.cryptoType : state.fiatCurrency,
      options:
        state.investmentType === 'crypto'
          ? availableCryptoTypes.map((type) => ({
              value: type,
              label: type === 'BTC' ? 'Bitcoin (BTC)' : type === 'ETH' ? 'Ethereum (ETH)' : 'Tether (USDT)',
            }))
          : availableFiatCurrencies.map((currency) => ({
              value: currency,
              label: currency === 'USD' ? 'US Dollar (USD)' : currency,
            })),
      onChange: (e) =>
        state.investmentType === 'crypto'
          ? setCryptoType((e as SelectChangeEvent<string>).target.value as 'BTC' | 'ETH' | 'USDT' | '')
          : setFiatCurrency((e as SelectChangeEvent<string>).target.value),
      disabled: state.investmentType === 'crypto' ? !availableCryptoTypes.length : !availableFiatCurrencies.length,
    },
    {
      id: 'amount',
      label: 'Investment Amount',
      type: 'text',
      value: state.amount,
      onChange: (e) => setAmount((e as ChangeEvent<HTMLInputElement>).target.value),
    },
  ];

  return [
    {
      label: 'Select Industry & Company',
      content: (
        <Box>
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
                <FormControl fullWidth sx={{ my: 3 }}>
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={state.selectedCompany}
                    onChange={handleCompanyChange}
                    label="Company"
                  >
                    {state.industries.map((company) => (
                      <MenuItem key={company._id} value={company.name}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', display:"flex", flexDirection:"column", gap:2 }}>
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
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => {
                              handleCompanyChange({
                                target: { value: company.name },
                              } as SelectChangeEvent<string>);
                            }}
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(e)}
                    variant="outlined"
                  />
                )}
              </Grid>
            ))}
            {/* Payment Instructions */}
            <Grid item xs={12} mt={3}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Account</InputLabel>
                <Select
                  value={selectedPaymentAccountId}
                  onChange={handlePaymentAccountChange}
                  label="Payment Account"
                >
                  {paymentAccounts.length === 0 ? (
                    <MenuItem value="" disabled>
                      No payment accounts available
                    </MenuItem>
                  ) : (
                    paymentAccounts.map((account) => (
                      <MenuItem key={account._id} value={account._id}>
                        {account.currency.toUpperCase()} -{' '}
                        {account.currency === 'usd'
                          ? `${account.accountName} (${account.bankName})`
                          : `${account.walletAddress?.substring(0, 8)}... (${account.network})`}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {selectedPaymentAccount ? (
                <List>
                  {selectedPaymentAccount.currency === 'usd' ? (
                    <>
                      <ListItem>
                        <ListItemText
                          primary="Bank"
                          secondary={selectedPaymentAccount.bankName || 'Not available'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Account Name"
                          secondary={selectedPaymentAccount.accountName || 'Not available'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Account Number"
                          secondary={selectedPaymentAccount.accountNumber || 'Not available'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Swift Code"
                          secondary={selectedPaymentAccount.bankSwiftCode || 'Not available'}
                        />
                      </ListItem>
                      <Typography variant="caption" color="textSecondary">
                        Transfer {state.amount} {state.fiatCurrency} to this account.
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ListItem>
                        <ListItemText
                          primary="Wallet Address"
                          secondary={selectedPaymentAccount.walletAddress || 'Not available'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Network"
                          secondary={selectedPaymentAccount.network || 'Not available'}
                        />
                      </ListItem>
                      <Typography variant="caption" color="textSecondary">
                        Send {state.amount} {state.cryptoType} to this address.
                      </Typography>
                    </>
                  )}
                </List>
              ) : (
                <Typography color="textSecondary">
                  Please select a payment account to view payment details.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      ),
      validate: () =>
        !!state.investmentType &&
        (state.investmentType === 'crypto' ? !!state.cryptoType : !!state.fiatCurrency) &&
        !!state.amount &&
        parseFloat(state.amount) > 0 &&
        (paymentAccounts.length === 0 || !!selectedPaymentAccountId),
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