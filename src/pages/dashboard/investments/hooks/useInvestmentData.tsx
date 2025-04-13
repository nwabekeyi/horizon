import { useReducer, useEffect } from 'react';
import { useApiRequest } from '../../../../hooks/useApi'; // Adjust path as needed
import { ENDPOINTS } from '../../../../utils/endpoints'; // Adjust path as needed
import {
  InvestmentState,
  SubscribeResponse
} from "../interfaces"



// Define action types
type InvestmentAction =
  | { type: 'SET_INVESTMENT_TYPE'; payload: string }
  | { type: 'SET_INDUSTRY'; payload: string }
  | { type: 'SET_SELECTED_COMPANY'; payload: { name: string; id: string } }
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_FIAT_CURRENCY'; payload: string }
  | { type: 'SET_CRYPTO_TYPE'; payload: 'BTC' | 'ETH' | 'USDT' | '' }
  | { type: 'SET_INDUSTRIES'; payload: { _id: string; name: string; industry: string }[] };

// Reducer function
const investmentReducer = (state: InvestmentState, action: InvestmentAction): InvestmentState => {
  switch (action.type) {
    case 'SET_INVESTMENT_TYPE':
      return { ...state, investmentType: action.payload };
    case 'SET_INDUSTRY':
      return { ...state, industry: action.payload };
    case 'SET_SELECTED_COMPANY':
      return { ...state, selectedCompany: action.payload.name, selectedCompanyId: action.payload.id };
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

// Initial state
const initialState: InvestmentState = {
  investmentType: '',
  industry: '',
  selectedCompany: '',
  selectedCompanyId: '',
  amount: '',
  fiatCurrency: '',
  cryptoType: '',
  industries: [],
};

export const useInvestmentData = (userId: string) => {
  const [state, dispatch] = useReducer(investmentReducer, initialState);

  const { data: allIndustries, error: industriesError, loading: industriesLoading, callApi: fetchAllIndustries } = useApiRequest<string[]>();
  const { error: companiesError, loading: companiesLoading, callApi: fetchCompanies } = useApiRequest<{ _id: string; name: string; industry: string }[]>();
  const { callApi: submitInvestment } = useApiRequest<SubscribeResponse>(); // Replace any with SubscribeResponse

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
          dispatch({ type: 'SET_SELECTED_COMPANY', payload: { name: '', id: '' } });
        } catch (err) {
          console.error('Error fetching companies by industry:', err);
        }
      } else {
        dispatch({ type: 'SET_INDUSTRIES', payload: [] });
      }
    };
    fetchCompaniesByIndustry();
  }, [state.industry, fetchCompanies]);

  // Handlers
  const setInvestmentType = (value: string) => dispatch({ type: 'SET_INVESTMENT_TYPE', payload: value });
  const setIndustry = (value: string) => dispatch({ type: 'SET_INDUSTRY', payload: value });
  const setSelectedCompany = (name: string, id: string) => dispatch({ type: 'SET_SELECTED_COMPANY', payload: { name, id } });
  const setAmount = (value: string) => dispatch({ type: 'SET_AMOUNT', payload: value });
  const setFiatCurrency = (value: string) => dispatch({ type: 'SET_FIAT_CURRENCY', payload: value });
  const setCryptoType = (value: 'BTC' | 'ETH' | 'USDT' | '') => dispatch({ type: 'SET_CRYPTO_TYPE', payload: value });

  const handleInvest = async () => {
    if (
      !state.selectedCompanyId ||
      !state.amount ||
      (state.investmentType === 'fiat' && !state.fiatCurrency) ||
      (state.investmentType === 'crypto' && !state.cryptoType)
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    const currencyType = state.investmentType === 'fiat' ? 'fiat' : 'crypto';
    const payload = {
      companyId: state.selectedCompanyId,
      userId,
      amount: parseFloat(state.amount),
      currencyType,
    };

    try {
      const response = await submitInvestment({
        url: ENDPOINTS.SUBSCRIBE,
        method: 'POST',
        body: payload,
      });
      console.log('Investment submitted:', payload, 'Response:', response);
      alert('Investment submitted successfully!');
    } catch (err) {
      console.error('Error submitting investment:', err);
      alert('Failed to submit investment. Please try again.');
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
  };
};