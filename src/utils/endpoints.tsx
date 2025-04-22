const API_BASE_URL = import.meta.env.VITE_API_URL;
const companiesUrl = `${API_BASE_URL}/companies`;
const usersUrl = `${API_BASE_URL}/users`;
const transactionsUrl = `${API_BASE_URL}/transactions`;
const paymentDetails = `${API_BASE_URL}/payment-details`;
const withdrawalsUrl = `${API_BASE_URL}/withdrawals`;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined in your environment variables.");
}

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  ALL_INDUSTRIES_CATEGORIES: `${API_BASE_URL}/industries`, // Adjusted for clarity
  USERS: usersUrl,
  COMPANIES: companiesUrl,
  COMPANY_BY_INDUSTRIES: `${companiesUrl}/industries`, // Adjusted to match backend route
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REGISTRATION_PIN: `${API_BASE_URL}/auth/register`,
  FORGETPASSWORD: `${API_BASE_URL}/auth/send-password-reset-link`,
  RESETPASSWORD: `${API_BASE_URL}/auth/reset-password`,
  VERIFICATION_SUBMISSION: `${API_BASE_URL}/kyc/submit`,
  TRANSACTIONS: transactionsUrl,
  addPaymentDetails: `${paymentDetails}/add`,
  WITHDRAWALS: withdrawalsUrl,
  BROKER_FEE: `${API_BASE_URL}/broker-fee`
};