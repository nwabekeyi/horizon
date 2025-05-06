// src/pages/dashboard/investments/interfaces.ts
export interface InvestmentState {
  investmentType: string;
  industry: string;
  selectedCompany: string; // Company name for display
  selectedCompanyId: string; // Company _id for submission
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

export interface Company {
  _id: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  logoUrl: string;
  establishedYear: number;
  totalFiatInvestment: number;
  totalCryptoInvestment: number;
  subscribers: {
    userId: string;
    fiatAmount: number;
    cryptoAmount: number;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface User {
  _id: string;
  investments: {
    id: number;
    companyName: string;
    amountInvested: number;
    currencyType: string;
    investmentDate: string;
    roi: number;
  }[];
  // Add other user fields as needed
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
  company?: Company;
  user?: User;
}


// src/types/paymentAccount.ts
export interface UserId {
  _id: string;
  email: string;
}

export interface PaymentAccount {
  _id: string;
  userId: UserId;
  currency: 'usd' | 'usdt';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  bankSwiftCode?: string;
  walletAddress?: string;
  network?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}