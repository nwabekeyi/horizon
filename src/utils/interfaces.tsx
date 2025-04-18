export interface PaymentDetail {
  type: 'fiat' | 'crypto';
  currency: 'usd' | 'cad' | 'eur' | 'gbp' | 'btc' | 'eth' | 'usdt';
  accountDetails: {
    bankName?: string; // Required if fiat
    accountNumber?: string;
    accountName?: string;
    address?: string; // Required if crypto
  };
}

interface TwoFA {
  enabled: boolean;
  secret: string;
}

// KYC Interface
interface KYC {
  status: 'pending' | 'approved' | 'rejected'; // Status can be one of these values
  documentType: 'passport' | 'driver_license' | 'national_id'; // Type of document
  documentFront?: string; // URL or path to the front of the document
  documentBack?: string; // URL or path to the back of the document
  addressProof?: string; // URL or path to the address proof
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
  kyc?: KYC; // Optional KYC details for the user
}

// Allow User to be null
export type User = UserInfo | null;
