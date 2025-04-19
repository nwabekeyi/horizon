import { useEffect, useReducer } from 'react';
import { User, Transaction } from 'utils/interfaces';
import { useApiRequest } from 'hooks/useApi';
import { ENDPOINTS } from 'utils/endpoints';

// Define API response type
interface ApiResponse {
  success: boolean;
  transactions: Array<{
    _id: string;
    companyName: string;
    transactionId: string;
    userId: string;
    status: 'completed' | 'pending' | 'failed';
    amount: number;
    currencyType: 'fiat' | 'crypto';
    cryptoCurrency?: 'usdt' | 'btc' | 'eth';
    transactionDetails?: string;
    proofUrl: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
}

// State & Actions
interface AnalyticsState {
  totalInvestment: number;
  transactions: Transaction[];
  spentThisMonth: number;
  ROI: number;
  accountBalance: number;
  investedCompanies: string[];
}

type Action =
  | { type: 'SET_TOTAL_INVESTMENT'; payload: number }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_SPENT_THIS_MONTH'; payload: number }
  | { type: 'SET_ROI'; payload: number }
  | { type: 'SET_ACCOUNT_BALANCE'; payload: number }
  | { type: 'SET_INVESTED_COMPANIES'; payload: string[] }
  | { type: 'RESET' };

// Reducer
const analyticsReducer = (state: AnalyticsState, action: Action): AnalyticsState => {
  switch (action.type) {
    case 'SET_TOTAL_INVESTMENT':
      return { ...state, totalInvestment: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_SPENT_THIS_MONTH':
      return { ...state, spentThisMonth: action.payload };
    case 'SET_ROI':
      return { ...state, ROI: action.payload };
    case 'SET_ACCOUNT_BALANCE':
      return { ...state, accountBalance: action.payload };
    case 'SET_INVESTED_COMPANIES':
      return { ...state, investedCompanies: action.payload };
    case 'RESET':
      return {
        totalInvestment: 0,
        transactions: [],
        spentThisMonth: 0,
        ROI: 0,
        accountBalance: 0,
        investedCompanies: [],
      };
    default:
      return state;
  }
};

// Hook
const useAnalytics = (user: User | null): AnalyticsState => {
  const [state, dispatch] = useReducer(analyticsReducer, {
    totalInvestment: 0,
    transactions: [],
    spentThisMonth: 0,
    ROI: 0,
    accountBalance: 0,
    investedCompanies: [],
  });
  console.log(user)

  const { callApi, loading, error } = useApiRequest<ApiResponse, never>();

  useEffect(() => {
    if (!user || !user._id) {
      dispatch({ type: 'RESET' });
      return;
    }

    // Set static values from user
    dispatch({ type: 'SET_TOTAL_INVESTMENT', payload: user.totalInvestment ?? 0 });
    dispatch({ type: 'SET_ROI', payload: user.totalROI ?? 0 });
    dispatch({ type: 'SET_ACCOUNT_BALANCE', payload: user.accountBalance ?? 0 });

    // Extract unique company names from user.investments
    const investedCompanies = Array.isArray(user.investments)
      ? [...new Set(user.investments.map((investment) => investment.companyName))]
      : [];
    console.log('Invested companies:', investedCompanies);
    dispatch({ type: 'SET_INVESTED_COMPANIES', payload: investedCompanies });

    const fetchTransactions = async () => {
      try {
        const response = await callApi({
          url: `${ENDPOINTS.TRANSACTIONS}/user/${user._id}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        const transactionsArray = Array.isArray(response?.transactions)
          ? response.transactions
          : [];

        const transactions: Transaction[] = transactionsArray.map((tx) => {
          const createdAt = tx.createdAt ? new Date(tx.createdAt) : undefined;
          const updatedAt = tx.updatedAt ? new Date(tx.updatedAt) : undefined;
          return {
            ...tx,
            createdAt,
            updatedAt,
          };
        });

        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });

        // Calculate spent this month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const spentThisMonth = transactions.reduce((sum, tx) => {
          if (
            tx.status === 'completed' &&
            tx.createdAt &&
            tx.createdAt.getFullYear() === currentYear &&
            tx.createdAt.getMonth() === currentMonth
          ) {
            return sum + tx.amount;
          }
          return sum;
        }, 0);

        dispatch({ type: 'SET_SPENT_THIS_MONTH', payload: spentThisMonth });
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
        dispatch({ type: 'SET_SPENT_THIS_MONTH', payload: 0 });
      }
    };

    fetchTransactions();
  }, [user, callApi]);

  useEffect(() => {
    if (loading) {
      console.log('Fetching transactions...');
    }
    if (error) {
      console.error('Transaction fetch error:', error);
    }
  }, [loading, error]);

  return state;
};

export default useAnalytics;