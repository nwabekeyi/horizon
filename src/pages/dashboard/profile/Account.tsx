import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { FC, useReducer } from "react";
import { FaEye } from "react-icons/fa";
import CustomModal from "components/base/modal"; // Adjust path to your CustomModal component
import { User, PaymentDetail } from "utils/interfaces"; // Import existing User and PaymentDetail interfaces
import { useApiRequest } from "hooks/useApi"; // Import the useApiRequest hook
import { ENDPOINTS } from "utils/endpoints"; // Import the ENDPOINTS object
import { useDispatch } from "react-redux";
import { addPaymentDetail } from "store/slices/userSlice"; // Adjust path to your userSlice

// Define interfaces for API request and response
interface PaymentDetailPayload {
  userId: string;
  type: "fiat" | "crypto";
  currency: "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt";
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    address?: string;
    network?: "erc20" | "trc20" | "bep20" | "polygon" | "solana";
  };
}

interface PaymentDetailResponse {
  success: boolean;
  message: string;
  paymentDetail?: PaymentDetail;
}

// Component props
interface AccountProps {
  user: User | null; // Allow null for user
}

// State interface
interface State {
  isPaymentModalOpen: boolean;
  isKycModalOpen: boolean;
  isTwoFAModalOpen: boolean;
  isRecoveryEmailModalOpen: boolean;
  paymentType: "fiat" | "crypto";
  paymentCurrency: "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt" | "";
  bankName: string;
  accountNumber: string;
  accountName: string;
  cryptoAddress: string;
  network: "erc20" | "trc20" | "bep20" | "polygon" | "solana" | "";
  paymentError: string;
  kycDocumentType: string;
  documentFront: File | null;
  documentBack: File | null;
  addressProof: File | null;
  kycError: string;
  twoFASecret: string;
  twoFAError: string;
  recoveryEmail: string;
  recoveryEmailError: string;
}

// Action types
type Action =
  | { type: "SET_PAYMENT_MODAL_OPEN"; payload: boolean }
  | { type: "SET_KYC_MODAL_OPEN"; payload: boolean }
  | { type: "SET_TWO_FA_MODAL_OPEN"; payload: boolean }
  | { type: "SET_RECOVERY_EMAIL_MODAL_OPEN"; payload: boolean }
  | { type: "SET_PAYMENT_TYPE"; payload: "fiat" | "crypto" }
  | { type: "SET_PAYMENT_CURRENCY"; payload: "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt" | "" }
  | { type: "SET_BANK_NAME"; payload: string }
  | { type: "SET_ACCOUNT_NUMBER"; payload: string }
  | { type: "SET_ACCOUNT_NAME"; payload: string }
  | { type: "SET_CRYPTO_ADDRESS"; payload: string }
  | { type: "SET_NETWORK"; payload: "erc20" | "trc20" | "bep20" | "polygon" | "solana" | "" }
  | { type: "SET_PAYMENT_ERROR"; payload: string }
  | { type: "SET_KYC_DOCUMENT_TYPE"; payload: string }
  | { type: "SET_DOCUMENT_FRONT"; payload: File | null }
  | { type: "SET_DOCUMENT_BACK"; payload: File | null }
  | { type: "SET_ADDRESS_PROOF"; payload: File | null }
  | { type: "SET_KYC_ERROR"; payload: string }
  | { type: "SET_TWO_FA_SECRET"; payload: string }
  | { type: "SET_TWO_FA_ERROR"; payload: string }
  | { type: "SET_RECOVERY_EMAIL"; payload: string }
  | { type: "SET_RECOVERY_EMAIL_ERROR"; payload: string }
  | { type: "RESET_PAYMENT_FORM" }
  | { type: "RESET_KYC_FORM" }
  | { type: "RESET_TWO_FA_FORM" }
  | { type: "RESET_RECOVERY_EMAIL_FORM" };

// Initial state
const initialState: State = {
  isPaymentModalOpen: false,
  isKycModalOpen: false,
  isTwoFAModalOpen: false,
  isRecoveryEmailModalOpen: false,
  paymentType: "fiat",
  paymentCurrency: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  cryptoAddress: "",
  network: "",
  paymentError: "",
  kycDocumentType: "",
  documentFront: null,
  documentBack: null,
  addressProof: null,
  kycError: "",
  twoFASecret: "",
  twoFAError: "",
  recoveryEmail: "",
  recoveryEmailError: "",
};

// Reducer function
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PAYMENT_MODAL_OPEN":
      return { ...state, isPaymentModalOpen: action.payload };
    case "SET_KYC_MODAL_OPEN":
      return { ...state, isKycModalOpen: action.payload };
    case "SET_TWO_FA_MODAL_OPEN":
      return { ...state, isTwoFAModalOpen: action.payload };
    case "SET_RECOVERY_EMAIL_MODAL_OPEN":
      return { ...state, isRecoveryEmailModalOpen: action.payload };
    case "SET_PAYMENT_TYPE":
      return { ...state, paymentType: action.payload };
    case "SET_PAYMENT_CURRENCY":
      return { ...state, paymentCurrency: action.payload };
    case "SET_BANK_NAME":
      return { ...state, bankName: action.payload };
    case "SET_ACCOUNT_NUMBER":
      return { ...state, accountNumber: action.payload };
    case "SET_ACCOUNT_NAME":
      return { ...state, accountName: action.payload };
    case "SET_CRYPTO_ADDRESS":
      return { ...state, cryptoAddress: action.payload };
    case "SET_NETWORK":
      return { ...state, network: action.payload };
    case "SET_PAYMENT_ERROR":
      return { ...state, paymentError: action.payload };
    case "SET_KYC_DOCUMENT_TYPE":
      return { ...state, kycDocumentType: action.payload };
    case "SET_DOCUMENT_FRONT":
      return { ...state, documentFront: action.payload };
    case "SET_DOCUMENT_BACK":
      return { ...state, documentBack: action.payload };
    case "SET_ADDRESS_PROOF":
      return { ...state, addressProof: action.payload };
    case "SET_KYC_ERROR":
      return { ...state, kycError: action.payload };
    case "SET_TWO_FA_SECRET":
      return { ...state, twoFASecret: action.payload };
    case "SET_TWO_FA_ERROR":
      return { ...state, twoFAError: action.payload };
    case "SET_RECOVERY_EMAIL":
      return { ...state, recoveryEmail: action.payload };
    case "SET_RECOVERY_EMAIL_ERROR":
      return { ...state, recoveryEmailError: action.payload };
    case "RESET_PAYMENT_FORM":
      return {
        ...state,
        paymentType: "fiat",
        paymentCurrency: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        cryptoAddress: "",
        network: "",
        paymentError: "",
      };
    case "RESET_KYC_FORM":
      return {
        ...state,
        kycDocumentType: "",
        documentFront: null,
        documentBack: null,
        addressProof: null,
        kycError: "",
      };
    case "RESET_TWO_FA_FORM":
      return {
        ...state,
        twoFASecret: "",
        twoFAError: "",
      };
    case "RESET_RECOVERY_EMAIL_FORM":
      return {
        ...state,
        recoveryEmail: "",
        recoveryEmailError: "",
      };
    default:
      return state;
  }
};

const Account: FC<AccountProps> = ({ user }) => {
  // Redux dispatch
  const reduxDispatch = useDispatch();

  // Reducer
  const [state, dispatch] = useReducer(reducer, initialState);

  // API hook for payment details
  const { callApi, loading, error: apiError } = useApiRequest<PaymentDetailResponse, PaymentDetailPayload>();

  // Modal handlers
  const handlePaymentModalOpen = () => dispatch({ type: "SET_PAYMENT_MODAL_OPEN", payload: true });
  const handlePaymentModalClose = () => {
    dispatch({ type: "SET_PAYMENT_MODAL_OPEN", payload: false });
    dispatch({ type: "RESET_PAYMENT_FORM" });
  };

  const handleKycModalOpen = () => dispatch({ type: "SET_KYC_MODAL_OPEN", payload: true });
  const handleKycModalClose = () => {
    dispatch({ type: "SET_KYC_MODAL_OPEN", payload: false });
    dispatch({ type: "RESET_KYC_FORM" });
  };

  const handleTwoFAModalOpen = () => dispatch({ type: "SET_TWO_FA_MODAL_OPEN", payload: true });
  const handleTwoFAModalClose = () => {
    dispatch({ type: "SET_TWO_FA_MODAL_OPEN", payload: false });
    dispatch({ type: "RESET_TWO_FA_FORM" });
  };

  const handleRecoveryEmailModalOpen = () => dispatch({ type: "SET_RECOVERY_EMAIL_MODAL_OPEN", payload: true });
  const handleRecoveryEmailModalClose = () => {
    dispatch({ type: "SET_RECOVERY_EMAIL_MODAL_OPEN", payload: false });
    dispatch({ type: "RESET_RECOVERY_EMAIL_FORM" });
  };

  // Validation functions
  const validatePaymentDetails = (): boolean => {
    if (!state.paymentCurrency) {
      dispatch({ type: "SET_PAYMENT_ERROR", payload: "Please select a currency" });
      return false;
    }
    if (!state.paymentType) {
      dispatch({ type: "SET_PAYMENT_ERROR", payload: "Please select a payment type" });
      return false;
    }
    if (state.paymentType === "fiat") {
      if (!state.bankName || !state.accountNumber || !state.accountName) {
        dispatch({ type: "SET_PAYMENT_ERROR", payload: "Please fill in all bank details" });
        return false;
      }
    } else if (state.paymentType === "crypto" && !state.cryptoAddress) {
      dispatch({ type: "SET_PAYMENT_ERROR", payload: "Please provide a crypto address" });
      return false;
    }
    dispatch({ type: "SET_PAYMENT_ERROR", payload: "" });
    return true;
  };

  const validateKycDetails = (): boolean => {
    if (!state.kycDocumentType) {
      dispatch({ type: "SET_KYC_ERROR", payload: "Please select a document type" });
      return false;
    }
    if (!state.documentFront || !state.documentBack || !state.addressProof) {
      dispatch({ type: "SET_KYC_ERROR", payload: "Please upload all required documents" });
      return false;
    }
    dispatch({ type: "SET_KYC_ERROR", payload: "" });
    return true;
  };

  const validateTwoFASecret = (): boolean => {
    if (!state.twoFASecret) {
      dispatch({ type: "SET_TWO_FA_ERROR", payload: "Please enter a 2FA secret" });
      return false;
    }
    dispatch({ type: "SET_TWO_FA_ERROR", payload: "" });
    return true;
  };

  const validateRecoveryEmail = (): boolean => {
    if (!state.recoveryEmail) {
      dispatch({ type: "SET_RECOVERY_EMAIL_ERROR", payload: "Please enter a recovery email" });
      return false;
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.recoveryEmail)) {
      dispatch({ type: "SET_RECOVERY_EMAIL_ERROR", payload: "Please enter a valid email address" });
      return false;
    }
    dispatch({ type: "SET_RECOVERY_EMAIL_ERROR", payload: "" });
    return true;
  };

  // Form submission handlers
  const handlePaymentSubmit = async (): Promise<void> => {
    if (loading) return;
    if (!validatePaymentDetails()) return;
    if (!user?._id) {
      dispatch({ type: "SET_PAYMENT_ERROR", payload: "User ID is not available" });
      return;
    }

    const payload: PaymentDetailPayload = {
      userId: user._id,
      type: state.paymentType,
      currency: state.paymentCurrency as "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt",
      accountDetails:
        state.paymentType === "fiat"
          ? {
              bankName: state.bankName,
              accountNumber: state.accountNumber,
              accountName: state.accountName,
              address: "",
            }
          : {
              address: state.cryptoAddress,
              network: state.network === "" ? undefined : state.network,
            },
    };

    try {
      const response = await callApi({
        url: ENDPOINTS.addPaymentDetails,
        method: "POST",
        body: payload,
      });
      if (response.success && response.paymentDetail) {
        reduxDispatch(addPaymentDetail(response.paymentDetail));
        handlePaymentModalClose();
      } else {
        dispatch({ type: "SET_PAYMENT_ERROR", payload: response.message || "Failed to add payment details" });
      }
    } catch (err: unknown) {
      const errorMessage = apiError?.message || "Failed to add payment details";
      dispatch({ type: "SET_PAYMENT_ERROR", payload: errorMessage });
    }
  };

  const handleKycSubmit = (): void => {
    if (!validateKycDetails()) return;
    console.log("KYC Submission:", {
      documentType: state.kycDocumentType,
      documentFront: state.documentFront,
      documentBack: state.documentBack,
      addressProof: state.addressProof,
    });
    handleKycModalClose();
  };

  const handleTwoFASubmit = (): void => {
    if (!validateTwoFASecret()) return;
    console.log("2FA Secret:", state.twoFASecret);
    handleTwoFAModalClose();
  };

  const handleRecoveryEmailSubmit = (): void => {
    if (!validateRecoveryEmail()) return;
    console.log("Recovery Email:", state.recoveryEmail);
    handleRecoveryEmailModalClose();
  };

  return (
    <Card sx={{ padding: 3, display: "flex", flexWrap: "wrap", gap: 4 }}>
      {/* First Row: Payment Details and Two-Factor Authentication */}
      {/* Payment Details */}
      <Box
        sx={{ flex: { xs: "1 1 100%", md: "1 1 45%" }, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}
      >
        <Typography variant="h6">Payment Details</Typography>
        {user && user.paymentDetails && user.paymentDetails.length > 0 ? (
          user.paymentDetails.map((detail, index) => (
            <Box key={index} sx={{ p: 2, border: "1px solid", borderColor: "grey.200", borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Type:</strong> {detail.type ? detail.type.charAt(0).toUpperCase() + detail.type.slice(1) : "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Currency:</strong> {detail.currency ? detail.currency.toUpperCase() : "N/A"}
              </Typography>
              {detail.type === "fiat" && detail.accountDetails ? (
                <>
                  <Typography variant="body2">
                    <strong>Bank:</strong> {detail.accountDetails.bankName || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Account Number:</strong> {detail.accountDetails.accountNumber || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Account Name:</strong> {detail.accountDetails.accountName || "N/A"}
                  </Typography>
                </>
              ) : detail.type === "crypto" && detail.accountDetails ? (
                <>
                  <Typography variant="body2">
                    <strong>Address:</strong> {detail.accountDetails.address || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Network:</strong> {detail.accountDetails.network || "N/A"}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2">
                  <strong>Details:</strong> N/A
                </Typography>
              )}
            </Box>
          ))
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No payment details provided yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePaymentModalOpen}
              sx={{ alignSelf: "flex-start" }}
              aria-label="Add payment details"
            >
              Add Payment Details
            </Button>
          </Box>
        )}
        {user && user.paymentDetails && user.paymentDetails.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handlePaymentModalOpen}
            sx={{ alignSelf: "flex-start" }}
            aria-label="Add payment details"
          >
            Add Payment Details
          </Button>
        )}
      </Box>

      {/* Two-Factor Authentication */}
      <Box
        sx={{ flex: { xs: "1 1 100%", md: "1 1 45%" }, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}
      >
        <Typography variant="h6">Two-Factor Authentication</Typography>
        <Typography variant="body2">
          <strong>Status:</strong> {user && user.twoFA && user.twoFA.enabled ? "Enabled" : "Disabled"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleTwoFAModalOpen}
          sx={{ alignSelf: "flex-start" }}
          aria-label={user && user.twoFA && user.twoFA.enabled ? "Disable 2FA" : "Enable 2FA"}
        >
          {user && user.twoFA && user.twoFA.enabled ? "Disable 2FA" : "Enable 2FA"}
        </Button>
      </Box>

      {/* Second Row: KYC Details and Recovery Email */}
      {/* KYC Details */}
      <Box
        sx={{ flex: { xs: "1 1 100%", md: "1 1 45%" }, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}
      >
        <Typography variant="h6">KYC Details</Typography>
        {user && user.kyc && user.kyc.status ? (
          <Box sx={{ p: 2, border: "1px solid", borderColor: "grey.200", borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Status:</strong>{" "}
              {user.kyc.status ? user.kyc.status.charAt(0).toUpperCase() + user.kyc.status.slice(1) : "N/A"}
            </Typography>
            <Typography variant="body2">
              <strong>Document Type:</strong> {user.kyc.documentType || "N/A"}
            </Typography>
            {user.kyc.documentFront && (
              <Typography variant="body2">
                <strong>Document Front:</strong>{" "}
                <IconButton href={user.kyc.documentFront} target="_blank" aria-label="View document front">
                  <FaEye />
                </IconButton>
              </Typography>
            )}
            {user.kyc.documentBack && (
              <Typography variant="body2">
                <strong>Document Back:</strong>{" "}
                <IconButton href={user.kyc.documentBack} target="_blank" aria-label="View document back">
                  <FaEye />
                </IconButton>
              </Typography>
            )}
            {user.kyc.addressProof && (
              <Typography variant="body2">
                <strong>Address Proof:</strong>{" "}
                <IconButton href={user.kyc.addressProof} target="_blank" aria-label="View address proof">
                  <FaEye />
                </IconButton>
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No KYC details provided.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleKycModalOpen}
              sx={{ alignSelf: "flex-start" }}
              aria-label="Add KYC details"
            >
              Add KYC Details
            </Button>
          </Box>
        )}
      </Box>

      {/* Recovery Email */}
      <Box
        sx={{ flex: { xs: "1 1 100%", md: "1 1 45%" }, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}
      >
        <Typography variant="h6">Recovery Email</Typography>
        <Typography variant="body2" color="text.secondary">
          No recovery email set.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRecoveryEmailModalOpen}
          sx={{ alignSelf: "flex-start" }}
          aria-label="Add recovery email"
        >
          Add Recovery Email
        </Button>
      </Box>

      {/* Modals */}
      {/* Payment Details Modal */}
      <CustomModal
        open={state.isPaymentModalOpen}
        title="Add Payment Details"
        onCancel={handlePaymentModalClose}
        onConfirm={handlePaymentSubmit}
      >
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="payment-type-label">Payment Type</InputLabel>
            <Select
              labelId="payment-type-label"
              value={state.paymentType}
              label="Payment Type"
              onChange={(e) => dispatch({ type: "SET_PAYMENT_TYPE", payload: e.target.value as "fiat" | "crypto" })}
              aria-label="Select payment type"
            >
              <MenuItem value="fiat">Fiat</MenuItem>
              <MenuItem value="crypto">Crypto</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="currency-label">Currency</InputLabel>
            <Select
              labelId="currency-label"
              value={state.paymentCurrency}
              label="Currency"
              onChange={(e) =>
                dispatch({
                  type: "SET_PAYMENT_CURRENCY",
                  payload: e.target.value as "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt" | "",
                })
              }
              aria-label="Select currency"
            >
              {state.paymentType === "fiat"
                ? ["usd", "cad", "eur", "gbp"].map((curr) => (
                    <MenuItem key={curr} value={curr}>
                      {curr.toUpperCase()}
                    </MenuItem>
                  ))
                : ["btc", "eth", "usdt"].map((curr) => (
                    <MenuItem key={curr} value={curr}>
                      {curr.toUpperCase()}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
          {state.paymentType === "fiat" ? (
            <>
              <TextField
                fullWidth
                label="Bank Name"
                value={state.bankName}
                onChange={(e) => dispatch({ type: "SET_BANK_NAME", payload: e.target.value })}
                sx={{ mb: 2 }}
                aria-label="Bank name"
              />
              <TextField
                fullWidth
                label="Account Number"
                value={state.accountNumber}
                onChange={(e) => dispatch({ type: "SET_ACCOUNT_NUMBER", payload: e.target.value })}
                sx={{ mb: 2 }}
                aria-label="Account number"
              />
              <TextField
                fullWidth
                label="Account Name"
                value={state.accountName}
                onChange={(e) => dispatch({ type: "SET_ACCOUNT_NAME", payload: e.target.value })}
                sx={{ mb: 2 }}
                aria-label="Account name"
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Crypto Address"
                value={state.cryptoAddress}
                onChange={(e) => dispatch({ type: "SET_CRYPTO_ADDRESS", payload: e.target.value })}
                sx={{ mb: 2 }}
                aria-label="Crypto address"
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="network-label">Network (Optional)</InputLabel>
                <Select
                  labelId="network-label"
                  value={state.network}
                  label="Network (Optional)"
                  onChange={(e) =>
                    dispatch({
                      type: "SET_NETWORK",
                      payload: e.target.value as "erc20" | "trc20" | "bep20" | "polygon" | "solana" | "",
                    })
                  }
                  aria-label="Select network"
                >
                  <MenuItem value="">None</MenuItem>
                  {["erc20", "trc20", "bep20", "polygon", "solana"].map((net) => (
                    <MenuItem key={net} value={net}>
                      {net.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          {(state.paymentError || apiError) && (
            <Typography variant="caption" color="error">
              {state.paymentError || apiError?.message}
            </Typography>
          )}
          {loading && (
            <Typography variant="caption" color="text.secondary">
              Submitting...
            </Typography>
          )}
        </Box>
      </CustomModal>

      {/* KYC Details Modal */}
      <CustomModal
        open={state.isKycModalOpen}
        title="Add KYC Details"
        onCancel={handleKycModalClose}
        onConfirm={handleKycSubmit}
      >
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="document-type-label">Document Type</InputLabel>
            <Select
              labelId="document-type-label"
              value={state.kycDocumentType}
              label="Document Type"
              onChange={(e) => dispatch({ type: "SET_KYC_DOCUMENT_TYPE", payload: e.target.value })}
              aria-label="Select document type"
            >
              <MenuItem value="driver_license">Driver's License</MenuItem>
              <MenuItem value="passport">Passport</MenuItem>
              <MenuItem value="national_id">National ID Card</MenuItem> {/* Fixed to match schema */}
            </Select>
          </FormControl>
          <Typography variant="body2" mb={1}>
            Document Front
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => dispatch({ type: "SET_DOCUMENT_FRONT", payload: e.target.files?.[0] || null })}
            style={{ marginBottom: 16 }}
            aria-label="Upload document front"
          />
          <Typography variant="body2" mb={1}>
            Document Back
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => dispatch({ type: "SET_DOCUMENT_BACK", payload: e.target.files?.[0] || null })}
            style={{ marginBottom: 16 }}
            aria-label="Upload document back"
          />
          <Typography variant="body2" mb={1}>
            Address Proof
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => dispatch({ type: "SET_ADDRESS_PROOF", payload: e.target.files?.[0] || null })}
            style={{ marginBottom: 16 }}
            aria-label="Upload address proof"
          />
          {state.kycError && (
            <Typography variant="caption" color="error">
              {state.kycError}
            </Typography>
          )}
        </Box>
      </CustomModal>

      {/* 2FA Modal */}
      <CustomModal
        open={state.isTwoFAModalOpen}
        title={user && user.twoFA && user.twoFA.enabled ? "Disable 2FA" : "Enable 2FA"}
        onCancel={handleTwoFAModalClose}
        onConfirm={handleTwoFASubmit}
      >
        <Box>
          <TextField
            fullWidth
            label="2FA Secret"
            value={state.twoFASecret}
            onChange={(e) => dispatch({ type: "SET_TWO_FA_SECRET", payload: e.target.value })}
            sx={{ mb: 2 }}
            aria-label="2FA secret"
          />
          {state.twoFAError && (
            <Typography variant="caption" color="error">
              {state.twoFAError}
            </Typography>
          )}
        </Box>
      </CustomModal>

      {/* Recovery Email Modal */}
      <CustomModal
        open={state.isRecoveryEmailModalOpen}
        title="Add Recovery Email"
        onCancel={handleRecoveryEmailModalClose}
        onConfirm={handleRecoveryEmailSubmit}
      >
        <Box>
          <TextField
            fullWidth
            label="Recovery Email"
            type="email"
            value={state.recoveryEmail}
            onChange={(e) => dispatch({ type: "SET_RECOVERY_EMAIL", payload: e.target.value })}
            sx={{ mb: 2 }}
            aria-label="Recovery email"
          />
          {state.recoveryEmailError && (
            <Typography variant="caption" color="error">
              {state.recoveryEmailError}
            </Typography>
          )}
        </Box>
      </CustomModal>
    </Card>
  );
};

export default Account;