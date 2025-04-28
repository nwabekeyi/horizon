// utils/interfaces.ts

// Currency type for fiat and crypto currencies
export type Currency = 'usd' | 'cad' | 'eur' | 'gbp' | 'btc' | 'eth' | 'usdt';

// Interface for Payment Account Details, including account details and currency
export interface PaymentAccountDetails {
  type: 'fiat' | 'crypto';
  currency: Currency;
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    address?: string;
    network?: 'erc20' | 'trc20' | 'bep20' | 'polygon' | 'solana';
  };
}

// Interface for Investment record
export interface Investment {
  _id: string;
  amountInvested: number;
  companyName: string;
  currencyType: 'fiat' | 'crypto';
  investmentDate: string;
  roi: number;
  transactionId: string;
}

// Interface for PaymentDetail used in User's payment information
export interface PaymentDetail {
  _id: string;
  type: 'fiat' | 'crypto';
  currency: Currency;
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    address?: string;
    network?: 'erc20' | 'trc20' | 'bep20' | 'polygon' | 'solana';
  };
}

// Interface for Withdrawal with optional payment account details and currency
export interface Withdrawal {
  _id: string;
  user: string;
  amount: number;
  status: 'pending' | 'approved' | 'failed' | 'processing' | 'successful' | 'canceled';
  paymentAccountDetails?: PaymentAccountDetails;
  withdrawalPin?: string;
  brokerFee: number;
  brokerFeeProof: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// TwoFA Interface for Two-Factor Authentication
interface TwoFA {
  enabled: boolean;
  secret: string;
}

// KYC Interface for Know-Your-Customer details
interface KYC {
  status: 'pending' | 'approved' | 'rejected';
  documentType: 'passport' | 'driver_license' | 'national_id';
  documentFront?: string;
  documentBack?: string;
  addressProof?: string;
}

// User Information Interface
export interface UserInfo {
  _id: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateJoined: string;
  status: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
  accountBalance: number;
  totalROI: number;
  totalInvestment: number;
  paymentDetails: PaymentDetail[];
  twoFA: TwoFA;
  kyc?: KYC;
  investments?: Investment[];
}

// Main User interface (could be null or contain the UserInfo)
export type User = UserInfo | null;

// Transaction Interface for managing transactions
export interface Transaction {
  _id: string;
  companyName: string;
  transactionId: string;
  userId: string;
  status: 'completed' | 'pending' | 'failed' | 'canceled';
  amount: number;
  currencyType: 'fiat' | 'crypto';
  cryptoCurrency?: Currency;
  transactionDetails?: string;
  proofUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v: number;
}

// Display Transaction Interface (for showing transactions in the UI)
export interface DisplayTransaction {
  _id: string;
  amount: number;
  createdAt: Date;
  status: 'pending' | 'approved' | 'failed' | 'processing' | 'successful' | 'canceled';
  companyName: string;
  type: 'transaction' | 'withdrawal';
  currency?: Currency;
}
