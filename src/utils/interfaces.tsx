// Interface for Payment Account Details, including account details and currency
export interface PaymentAccountDetails {
  type: 'fiat' | 'crypto'; // Type of payment (either fiat or cryptocurrency)
  currency: 'usd' | 'cad' | 'eur' | 'gbp' | 'btc' | 'eth' | 'usdt'; // Currency type (fiat or crypto)
  accountDetails: {
    bankName?: string; // Optional bank name (for fiat payments)
    accountNumber?: string; // Optional account number (for fiat payments)
    accountName?: string; // Optional account name (for fiat payments)
    address?: string; // Address for crypto payments (can be wallet address)
    network?: 'erc20' | 'trc20' | 'bep20' | 'polygon' | 'solana'; // Network type for crypto (for crypto payments)
  };
}

// Interface for Investment record
export interface Investment {
  _id: string;
  amountInvested: number;
  companyName: string;
  currencyType: 'fiat' | 'crypto'; // Investment type (fiat or crypto)
  investmentDate: string; // Date of investment
  roi: number; // Return on investment
  transactionId: string; // Unique transaction ID for the investment
}

// Interface for PaymentDetail used in User's payment information
export interface PaymentDetail {
  _id: string;
  type: 'fiat' | 'crypto'; // Type of payment (either fiat or crypto)
  currency: 'usd' | 'cad' | 'eur' | 'gbp' | 'btc' | 'eth' | 'usdt'; // Currency type (fiat or crypto)
  accountDetails: {
    bankName?: string; // Optional bank name (for fiat payments)
    accountNumber?: string; // Optional account number (for fiat payments)
    accountName?: string; // Optional account name (for fiat payments)
    address?: string; // Address for crypto payments (can be wallet address)
    network?: 'erc20' | 'trc20' | 'bep20' | 'polygon' | 'solana'; // Network type for crypto (for crypto payments)
  };
}

// Interface for Withdrawal with optional payment account details and currency
export interface Withdrawal {
  _id: string;
  user: string;
  amount: number;
  status: 'pending' | 'approved' | 'failed' | 'processing' | 'successful'; // Withdrawal status
  paymentAccountDetails?: PaymentAccountDetails; // Optional array of payment account details for the withdrawal
  withdrawalPin?: string; // Optional withdrawal pin (if needed for security)
  brokerFee: number; // Broker fee for the withdrawal
  brokerFeeProof: string; // Proof for the broker fee (e.g., screenshot)
  remarks?: string; // Optional remarks or comments for the withdrawal
  createdAt: Date; // Date when the withdrawal was created
  updatedAt: Date; // Date when the withdrawal was last updated
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
  profilePicture?: string; // Optional profile picture
  createdAt?: string; // Date when the user was created
  updatedAt?: string; // Date when the user was last updated
  accountBalance: number; // User's current account balance
  totalROI: number; // Total return on investment
  totalInvestment: number; // Total amount invested by the user
  paymentDetails: PaymentDetail[]; // User's payment details
  twoFA: TwoFA; // Two-factor authentication status
  kyc?: KYC; // KYC details (optional)
  investments?: Investment[]; // User's investments (optional)
}

// Main User interface (could be null or contain the UserInfo)
export type User = UserInfo | null;

// Transaction Interface for managing transactions
export interface Transaction {
  _id: string;
  companyName: string;
  transactionId: string;
  userId: string;
  status: 'completed' | 'pending' | 'failed'; // Status of the transaction
  amount: number; // Amount for the transaction
  currencyType: 'fiat' | 'crypto'; // Currency type (fiat or crypto)
  cryptoCurrency?: 'usdt' | 'btc' | 'eth'; // Crypto currency used in the transaction
  transactionDetails?: string; // Optional transaction details (could include proof, description, etc.)
  proofUrl: string; // URL for proof of transaction
  createdAt?: Date; // Date when the transaction was created
  updatedAt?: Date; // Date when the transaction was last updated
  __v: number; // Version of the transaction record
}

// Display Transaction Interface (for showing transactions in the UI)
export interface DisplayTransaction {
  _id: string;
  amount: number;
  createdAt: Date;
  status: 'pending' | 'approved' | 'failed' | 'processing' | 'successful'; // Status of the transaction
  companyName: string;
  type: 'transaction' | 'withdrawal'; // Type of the transaction (either a general transaction or a withdrawal)
  currency?: 'usd' | 'cad' | 'eur' | 'gbp' | 'btc' | 'eth' | 'usdt'; // Optional currency field
}

