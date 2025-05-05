import { useEffect, useReducer} from 'react';
import { User, Transaction, Withdrawal } from 'utils/interfaces';
import { useApiRequest } from 'hooks/useApi';
import { ENDPOINTS } from 'utils/endpoints';

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
  loading: boolean; // Added loading to state
  error: Error | null; // Added error to state for better error handling
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
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'RESET' };

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
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
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
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

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
    loading: false,
    error: null,
  });

  // Use separate API hooks for transactions and withdrawals to track their loading states
  const {
    callApi: fetchTransactions,
  } = useApiRequest<TransactionApiResponse, never>();
  const {
    callApi: fetchWithdrawals,
  } = useApiRequest<WithdrawalApiResponse, never>();

  useEffect(() => {
    if (!user || !user._id) {
      dispatch({ type: 'RESET' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_TOTAL_INVESTMENT', payload: user.totalInvestment ?? 0 });
    dispatch({ type: 'SET_ROI', payload: user.totalROI ?? 0 });
    dispatch({ type: 'SET_ACCOUNT_BALANCE', payload: user.accountBalance ?? 0 });

    const fetchData = async () => {
      try {
        const [transactionResponse, withdrawalResponse] = await Promise.all([
          fetchTransactions({
            url: `${ENDPOINTS.TRANSACTIONS}/user/${user._id}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          }),
          fetchWithdrawals({
            url: `${ENDPOINTS.WITHDRAWALS}/user/${user._id}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          }),
        ]);

        const transactionsArray = Array.isArray((transactionResponse as TransactionApiResponse)?.transactions)
          ? (transactionResponse as TransactionApiResponse).transactions
          : [];

        const transactions: Transaction[] = transactionsArray.map((tx) => ({
          ...tx,
          createdAt: tx.createdAt ? new Date(tx.createdAt) : new Date(),
          updatedAt: tx.updatedAt ? new Date(tx.updatedAt) : new Date(),
        }));

        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });

        const pendingTransactions = transactions.filter((tx) => tx.status === 'pending');
        dispatch({ type: 'SET_PENDING_TRANSACTIONS', payload: pendingTransactions });

        const spentThisMonth = transactions.reduce((sum, tx) => {
          if (
            tx.status === 'completed' &&
            tx.createdAt &&
            tx.createdAt.getFullYear() === new Date().getFullYear() &&
            tx.createdAt.getMonth() === new Date().getMonth()
          ) {
            return sum + tx.amount;
          }
          return sum;
        }, 0);

        dispatch({ type: 'SET_SPENT_THIS_MONTH', payload: spentThisMonth });

        const investedCompanies = [
          ...new Set(transactions.filter((tx) => tx.status === 'completed').map((tx) => tx.companyName)),
        ];
        dispatch({ type: 'SET_INVESTED_COMPANIES', payload: investedCompanies });

        const withdrawalsArray = Array.isArray((withdrawalResponse as WithdrawalApiResponse)?.withdrawals)
          ? (withdrawalResponse as WithdrawalApiResponse).withdrawals
          : [];

        const withdrawals: Withdrawal[] = withdrawalsArray.map((wd) => ({
          ...wd,
          createdAt: wd.createdAt ? new Date(wd.createdAt) : new Date(),
          updatedAt: wd.updatedAt ? new Date(wd.updatedAt) : new Date(),
        }));

        dispatch({ type: 'SET_WITHDRAWALS', payload: withdrawals });

        const totalWithdrawnThisMonth = withdrawals.reduce((sum, wd) => {
          if (
            wd.status === 'successful' &&
            wd.createdAt &&
            wd.createdAt.getFullYear() === new Date().getFullYear() &&
            wd.createdAt.getMonth() === new Date().getMonth()
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
        dispatch({ type: 'SET_INVESTED_COMPANIES', payload: [] });
        dispatch({ type: 'SET_WITHDRAWALS', payload: [] });
        dispatch({ type: 'SET_TOTAL_WITHDRAWN_THIS_MONTH', payload: 0 });
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err : new Error('Unknown error') });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchData();
  }, [user, fetchTransactions, fetchWithdrawals]);

  return state;
};

export default useAnalytics;