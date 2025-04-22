// src/pages/dashboard/profile/InvestmentCard.types.ts

// Define Transaction type
export interface Transaction {
    _id: string;
    transactionId: string;
    companyName: string;
    userId: string;
    status: "pending" | "completed" | "failed";
    amount: number;
    currencyType: "fiat" | "crypto";
    cryptoCurrency?: "usdt" | "btc" | "eth";
    proofUrl: string;
    createdAt: string;
    updatedAt: string;
    transactionDetails: Record<string, string>;
    __v: number;
  }
  
  // Define API response type for transactions
  export interface TransactionResponse {
    success: boolean;
    transactions: Transaction[];
  }
  
  // Define CoinGecko API response type
  export interface ExchangeRateResponse {
    bitcoin?: { usd: number };
    ethereum?: { usd: number };
    tether?: { usd: number };
  }
  
  // Define Broker Fee API response type
  export interface BrokerFeeResponse {
    brokerFee: {
      fee: number;
      createdAt: string;
      updatedAt: string;
    };
  }
  
  // Define total investment breakdown
  export interface InvestmentTotals {
    fiat: number;
    btc: number;
    eth: number;
    usdt: number;
    totalUsd: number;
  }