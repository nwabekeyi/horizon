const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined in your environment variables.");
}

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  USERS: `${API_BASE_URL}/users`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REGISTRATION_PIN: `${API_BASE_URL}/auth/register`,
  FORGETPASSWORD: `${API_BASE_URL}/auth/send-password-reset-link`,
  RESETPASSWORD: `${API_BASE_URL}/auth/reset-password`
}