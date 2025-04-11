// Define the state shape
export interface InvestmentState {
    investmentType: string;
    industry: string;
    selectedCompany: string; // Company name for display
    selectedCompanyId: string; // Company _id for submission
    amount: string;
    fiatCurrency: string;
    cryptoType: 'BTC' | 'ETH' | 'USDT' | '';
    industries: { _id: string; name: string; industry: string }[];
  }

// Define types for API responses
export interface Company {
    _id: string;
    name: string;
    description?: string;
    industry: string;
    location?: string;
    logoUrl?: string;
    establishedYear?: number;
    totalFiatInvestment: number;
    totalCryptoInvestment: number;
    subscribers: {
      userId: string;
      fiatAmount: number;
      cryptoAmount: number;
      _id: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
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
    message: string;
    company: Company;
    user: User;
  }

