import { useReducer, useEffect, useState } from 'react';
import { useApiRequest } from '../../../../hooks/useApi';
import { ENDPOINTS } from '../../../../utils/endpoints';
import { InvestmentState, SubscribeResponse } from '../interfaces';

// Define action types
type InvestmentAction =
  | { type: 'SET_INVESTMENT_TYPE'; payload: string }
  | { type: 'SET_INDUSTRY'; payload: string }
  | { type: 'SET_SELECTED_COMPANY'; payload: { name: string; id: string } }
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_FIAT_CURRENCY'; payload: string }
  | { type: 'SET_CRYPTO_TYPE'; payload: 'BTC' | 'ETH' | 'USDT' | '' }
  | { type: 'SET_INDUSTRIES'; payload: InvestmentState['industries'] };

// Reducer function
const investmentReducer = (state: InvestmentState, action: InvestmentAction): InvestmentState => {
  switch (action.type) {
    case 'SET_INVESTMENT_TYPE':
      return { ...state, investmentType: action.payload };
    case 'SET_INDUSTRY':
      return { ...state, industry: action.payload };
    case 'SET_SELECTED_COMPANY':
      return {
        ...state,
        selectedCompany: action.payload.name,
        selectedCompanyId: action.payload.id,
      };
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
    case 'SET_FIAT_CURRENCY':
      return { ...state, fiatCurrency: action.payload };
    case 'SET_CRYPTO_TYPE':
      return { ...state, cryptoType: action.payload };
    case 'SET_INDUSTRIES':
      return { ...state, industries: action.payload };
    default:
      return state;
  }
};

// Initialize state with localStorage data
const getInitialState = (): InvestmentState => {
  const savedData = localStorage.getItem('investmentForm');
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      console.log('Loaded initial state from localStorage:', parsedData);
      return {
        investmentType: parsedData.investmentType || '',
        industry: parsedData.industry || '',
        selectedCompany: parsedData.selectedCompany || '',
        selectedCompanyId: parsedData.selectedCompanyId || '',
        amount: parsedData.amount || '',
        fiatCurrency: parsedData.fiatCurrency || '',
        cryptoType: parsedData.cryptoType || '',
        industries: parsedData.industries || [],
      };
    } catch (err) {
      console.error('Error parsing localStorage data:', err);
    }
  }
  return {
    investmentType: '',
    industry: '',
    selectedCompany: '',
    selectedCompanyId: '',
    amount: '',
    fiatCurrency: '',
    cryptoType: '',
    industries: [],
  };
};

// Define error interface for API responses
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const useInvestmentData = (
  userId: string | null,
  paymentProof: File | null,
  selectedPaymentAccountId: string
) => {
  const [state, dispatch] = useReducer(investmentReducer, getInitialState());
  const [modalState, setModalState] = useState<{
    open: boolean;
    title: string;
    message: string;
    isError: boolean;
  }>({ open: false, title: '', message: '', isError: false });

  const {
    data: allIndustries,
    error: industriesError,
    loading: industriesLoading,
    callApi: fetchAllIndustries,
  } = useApiRequest<string[]>();
  const {
    error: companiesError,
    loading: companiesLoading,
    callApi: fetchCompanies,
  } = useApiRequest<InvestmentState['industries']>();
  const { callApi: submitInvestment } = useApiRequest<SubscribeResponse>();

  // Supported fiat currencies
  const supportedFiatCurrencies = ['USD', 'EUR', 'GBP', 'CAD'];

  // Fetch all industries on mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        await fetchAllIndustries({
          url: ENDPOINTS.ALL_INDUSTRIES_CATEGORIES,
          method: 'GET',
        });
      } catch (err) {
        console.error('Error fetching industries:', err);
      }
    };
    fetchIndustries();
  }, [fetchAllIndustries]);

  // Fetch companies when industry changes
  useEffect(() => {
    const fetchCompaniesByIndustry = async () => {
      if (state.industry) {
        try {
          const response = await fetchCompanies({
            url: `${ENDPOINTS.COMPANY_BY_INDUSTRIES}/${state.industry}`,
            method: 'GET',
          });
          dispatch({ type: 'SET_INDUSTRIES', payload: response || [] });
          const isValidCompany = (response || []).some(
            (company) => company._id === state.selectedCompanyId
          );
          if (!isValidCompany && state.selectedCompanyId) {
            console.log('Resetting invalid selectedCompany:', state.selectedCompanyId);
            dispatch({ type: 'SET_SELECTED_COMPANY', payload: { name: '', id: '' } });
          }
        } catch (err) {
          console.error('Error fetching companies by industry:', err);
        }
      } else {
        dispatch({ type: 'SET_INDUSTRIES', payload: [] });
        if (state.selectedCompanyId) {
          dispatch({ type: 'SET_SELECTED_COMPANY', payload: { name: '', id: '' } });
        }
      }
    };
    fetchCompaniesByIndustry();
  }, [state.industry, fetchCompanies]);

  // Save data to localStorage when form state changes
  useEffect(() => {
    console.log('Saving state to localStorage:', state);
    localStorage.setItem('investmentForm', JSON.stringify(state));
  }, [state]);

  const setInvestmentType = (value: string) =>
    dispatch({ type: 'SET_INVESTMENT_TYPE', payload: value });
  const setIndustry = (value: string) => dispatch({ type: 'SET_INDUSTRY', payload: value });
  const setSelectedCompany = (name: string, id: string) =>
    dispatch({ type: 'SET_SELECTED_COMPANY', payload: { name, id } });
  const setAmount = (value: string) => dispatch({ type: 'SET_AMOUNT', payload: value });
  const setFiatCurrency = (value: string) =>
    dispatch({ type: 'SET_FIAT_CURRENCY', payload: value });
  const setCryptoType = (value: 'BTC' | 'ETH' | 'USDT' | '') =>
    dispatch({ type: 'SET_CRYPTO_TYPE', payload: value });

  const handleCloseModal = () => {
    setModalState({ open: false, title: '', message: '', isError: false });
  };

  const handleInvest = async () => {
    if (
      !state.selectedCompany ||
      !state.amount ||
      (state.investmentType === 'fiat' && !state.fiatCurrency) ||
      (state.investmentType === 'crypto' && !state.cryptoType) ||
      !paymentProof
    ) {
      setModalState({
        open: true,
        title: 'Validation Error',
        message: 'Please fill in all required fields, including proof of payment.',
        isError: true,
      });
      return;
    }

    if (!userId) {
      setModalState({
        open: true,
        title: 'Authentication Error',
        message: 'User ID is missing. Please log in and try again.',
        isError: true,
      });
      return;
    }

    // Validate amount
    const amountToSend = parseFloat(state.amount);
    if (isNaN(amountToSend) || amountToSend <= 0) {
      setModalState({
        open: true,
        title: 'Validation Error',
        message: 'Please enter a valid investment amount.',
        isError: true,
      });
      return;
    }

    if (state.investmentType === 'fiat') {
      if (!supportedFiatCurrencies.includes(state.fiatCurrency)) {
        setModalState({
          open: true,
          title: 'Validation Error',
          message: `Unsupported fiat currency: ${state.fiatCurrency}. Please select a valid currency (USD, EUR, GBP, CAD).`,
          isError: true,
        });
        return;
      }
    }

    const formData = new FormData();
    formData.append('companyName', state.selectedCompany);
    formData.append('userId', userId);
    formData.append('amount', amountToSend.toString());
    formData.append('currencyType', state.investmentType);
    if (state.investmentType === 'fiat') {
      formData.append('fiatCurrency', state.fiatCurrency);
    }
    if (state.investmentType === 'crypto') {
      formData.append('cryptoCurrency', state.cryptoType.toLowerCase());
    }
    if (selectedPaymentAccountId) {
      formData.append('paymentAccountId', selectedPaymentAccountId);
    }
    // Validate and prepare proof file
    const mimeTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    const fileExtension = paymentProof.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setModalState({
        open: true,
        title: 'File Error',
        message: 'Invalid file format. Please upload a JPG, PNG, or WEBP file.',
        isError: true,
      });
      return;
    }
    const mimeType = mimeTypeMap[fileExtension];
    const fileName = paymentProof.name.includes('.') ? paymentProof.name : `proof.${fileExtension}`;
    const proofFile = new File([paymentProof], fileName, { type: mimeType });
    formData.append('proof', proofFile);

    try {
      const response = await submitInvestment({
        url: ENDPOINTS.TRANSACTIONS,
        method: 'POST',
        body: formData,
        headers: {
          // Let browser set Content-Type for FormData
        },
      });
      console.log('Investment submitted:', Object.fromEntries(formData), 'Response:', response);
      if (response?.success) {
        localStorage.removeItem('investmentForm');
        setModalState({
          open: true,
          title: 'Success',
          message: 'Investment submitted successfully!',
          isError: false,
        });
      } else {
        throw new Error('No proof URL received');
      }
    } catch (err: unknown) {
      console.error('Error submitting investment:', err);
      const apiError = err as ApiError;
      setModalState({
        open: true,
        title: 'Submission Error',
        message:
          apiError.response?.data?.message ||
          apiError.message ||
          'Failed to submit investment. Please try again.',
        isError: true,
      });
    }
  };

  return {
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
  };
};