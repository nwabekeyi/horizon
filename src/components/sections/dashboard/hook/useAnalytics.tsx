import { useEffect, useReducer } from 'react';
import { User, Transaction, Withdrawal } from 'utils/interfaces';
import { useApiRequest } from 'hooks/useApi';
import { ENDPOINTS } from 'utils/endpoints';

// Define API response types
interface TransactionApiResponse {
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

interface WithdrawalApiResponse {
  withdrawals: Array<{
    _id: string;
    user: string;
    amount: number;
    status: 'pending' | 'approved' | 'failed' | 'processing' | 'successful';
    paymentAccountDetails?: {
      type: 'fiat' | 'crypto';
      currency: 'usd' | 'cad' | 'eur' | 'gbp' | 'btc' | 'eth' | 'usdt';
      accountDetails: {
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
        address?: string;
        network?: 'erc20' | 'trc20' | 'bep20' | 'polygon' | 'solana';
      };
    };
    withdrawalPin?: string;
    brokerFee: number;
    brokerFeeProof: string;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
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
  pendingTransactions: Transaction[];
  withdrawals: Withdrawal[];
  totalWithdrawnThisMonth: number;
}

type Action =
  | { type: 'SET_TOTAL_INVESTMENT'; payload: number }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_SPENT_THIS_MONTH'; payload: number }
  | { type: 'SET_ROI'; payload: number }
  | { type: 'SET_ACCOUNT_BALANCE'; payload: number }
  | { type: 'SET_INVESTED_COMPANIES'; payload: string[] }
  | { type: 'SET_PENDING_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_WITHDRAWALS'; payload: Withdrawal[] }
  | { type: 'SET_TOTAL_WITHDRAWN_THIS_MONTH'; payload: number }
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
    case 'SET_PENDING_TRANSACTIONS':
      return { ...state, pendingTransactions: action.payload };
    case 'SET_WITHDRAWALS':
      return { ...state, withdrawals: action.payload };
    case 'SET_TOTAL_WITHDRAWN_THIS_MONTH':
      return { ...state, totalWithdrawnThisMonth: action.payload };
    case 'RESET':
      return {
        totalInvestment: 0,
        transactions: [],
        spentThisMonth: 0,
        ROI: 0,
        accountBalance: 0,
        investedCompanies: [],
        pendingTransactions: [],
        withdrawals: [],
        totalWithdrawnThisMonth: 0,
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
    pendingTransactions: [],
    withdrawals: [],
    totalWithdrawnThisMonth: 0,
  });

  const { callApi, loading, error } = useApiRequest<
    TransactionApiResponse | WithdrawalApiResponse,
    never
  >();

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

    const fetchData = async () => {
      try {
        // Fetch transactions and withdrawals in parallel
        const [transactionResponse, withdrawalResponse] = await Promise.all([
          callApi({
            url: `${ENDPOINTS.TRANSACTIONS}/user/${user._id}`,
            method: 'GET',
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
          }),
          callApi({
            url: `${ENDPOINTS.WITHDRAWALS}/user/${user._id}`,
            method: 'GET',
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
          }),
        ]);

        // Process transactions
        const transactionsArray = Array.isArray(
          (transactionResponse as TransactionApiResponse)?.transactions
        )
          ? (transactionResponse as TransactionApiResponse).transactions
          : [];

        const transactions: Transaction[] = transactionsArray.map((tx) => {
          const createdAt = tx.createdAt ? new Date(tx.createdAt) : new Date();
          const updatedAt = tx.updatedAt ? new Date(tx.updatedAt) : new Date();
          return {
            ...tx,
            createdAt,
            updatedAt,
          };
        });

        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });

        // Filter pending transactions
        const pendingTransactions = transactions.filter((tx) => tx.status === 'pending');
        console.log('Pending transactions:', pendingTransactions);
        dispatch({ type: 'SET_PENDING_TRANSACTIONS', payload: pendingTransactions });

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

        // Process withdrawals
        const withdrawalsArray = Array.isArray(
          (withdrawalResponse as WithdrawalApiResponse)?.withdrawals
        )
          ? (withdrawalResponse as WithdrawalApiResponse).withdrawals
          : [];

        const withdrawals: Withdrawal[] = withdrawalsArray.map((wd) => {
          const createdAt = wd.createdAt ? new Date(wd.createdAt) : new Date();
          const updatedAt = wd.updatedAt ? new Date(wd.updatedAt) : new Date();
          return {
            ...wd,
            createdAt,
            updatedAt,
          };
        });

        dispatch({ type: 'SET_WITHDRAWALS', payload: withdrawals });

        // Calculate total withdrawn this month
        const totalWithdrawnThisMonth = withdrawals.reduce((sum, wd) => {
          if (
            wd.status === 'successful' &&
            wd.createdAt &&
            wd.createdAt.getFullYear() === currentYear &&
            wd.createdAt.getMonth() === currentMonth
          ) {
            return sum + wd.amount;
          }
          return sum;
        }, 0);

        dispatch({ type: 'SET_TOTAL_WITHDRAWN_THIS_MONTH', payload: totalWithdrawnThisMonth });
      } catch (err) {
        console.error('Failed to fetch data:', err);
        dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
        dispatch({ type: 'SET_SPENT_THIS_MONTH', payload: 0 });
        dispatch({ type: 'SET_PENDING_TRANSACTIONS', payload: [] });
        dispatch({ type: 'SET_WITHDRAWALS', payload: [] });
        dispatch({ type: 'SET_TOTAL_WITHDRAWN_THIS_MONTH', payload: 0 });
      }
    };

    fetchData();
  }, [user, callApi]);

  useEffect(() => {
    if (loading) {
      console.log('Fetching data...');
    }
    if (error) {
      console.error('Data fetch error:', error);
    }
  }, [loading, error]);

  return state;
};

export default useAnalytics;
