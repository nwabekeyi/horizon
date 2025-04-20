// utils/interfaces.ts
export interface Investment {
  _id: string;
  amountInvested: number;
  companyName: string;
  currencyType: 'fiat' | 'crypto';
  investmentDate: string; // ISO string, as provided
  roi: number;
  transactionId: string;
}

export interface Withdrawal {
  _id: string;
  amount: number;
  createdAt: Date; // Explicitly string
  status: 'pending' | 'failed' | 'successful';
  bankAccount?: string; // Instead of companyName
  type: 'withdrawal';
}

export interface PaymentDetail {
  type: 'fiat' | 'crypto';
  currency: 'usd' | 'cad' | 'eur' | 'gbp' | 'btc' | 'eth' | 'usdt';
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    address?: string;
    network?: 'erc20' | 'trc20' | 'bep20' | 'polygon' | 'solana';
  };
}

interface TwoFA {
  enabled: boolean;
  secret: string;
}

interface KYC {
  status: 'pending' | 'approved' | 'rejected';
  documentType: 'passport' | 'driver_license' | 'national_id';
  documentFront?: string;
  documentBack?: string;
  addressProof?: string;
}

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
  investments?: Investment[]; // Added investments array
}

export type User = UserInfo | null;

export interface Transaction {
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
  createdAt?: Date;
  updatedAt?: Date;
  __v: number;
}