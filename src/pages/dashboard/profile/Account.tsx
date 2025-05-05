import {
  Box,
  Button,
  Card,
  IconButton,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { FC, useReducer } from "react";
import { FaEye, FaEdit, FaTrash, FaEyeSlash } from "react-icons/fa";
import PaymentDetailsModal from "./modals/PaymentDetailsModal"; // Adjust path
import DeleteConfirmationModal from "./modals/DeleteComfirmationModal"; // Adjust path
import KycDetailsModal from "./modals/KycDetailsModal"; // Adjust path
import TwoFAModal from "./modals/TwoFAModal"; // Adjust path
import RecoveryEmailModal from "./modals/RecoveryEmailModal"; // Adjust path
import CustomModal, { ChildrenBox } from "components/base/modal"; // Adjust path
import { User, PaymentDetail } from "utils/interfaces"; // Adjust path
import { useApiRequest } from "hooks/useApi"; // Adjust path
import { ENDPOINTS, twoFA } from "utils/endpoints"; // Adjust path
import { useDispatch } from "react-redux";
import { addPaymentDetail, updateTwoFA, deletePaymentDetail } from "store/slices/userSlice"; // Adjust path

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

interface DeletePaymentDetailResponse {
  success: boolean;
  message: string;
  paymentDetail?: PaymentDetail;
}

interface TwoFASetupPayload {
  userId: string;
  secret?: string; // For enable
  password?: string; // For password confirmation
}

interface TwoFASetupResponse {
  success: boolean;
  message: string;
}

interface PasswordConfirmPayload {
  userId: string;
  password: string;
}

interface PasswordConfirmResponse {
  success: boolean;
  message: string;
}

// Component props
interface AccountProps {
  user: User | null;
}

// State interface
interface State {
  isPaymentModalOpen: boolean;
  isKycModalOpen: boolean;
  isTwoFAModalOpen: boolean;
  isTwoFAConfirmationModalOpen: boolean;
  isRecoveryEmailModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isPasswordConfirmModalOpen: boolean; // For password confirmation
  twoFAUpdateRequested: boolean;
  passwordConfirmed: boolean; // Tracks if password is confirmed
  password: string; // Password input for confirmation
  passwordError: string; // Password confirmation error
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
  twoFAResponseMessage: string;
  recoveryEmail: string;
  recoveryEmailError: string;
  editingPaymentDetail: PaymentDetail | null;
  deletingPaymentDetailId: string | null;
  showPassword: boolean; // Toggle password visibility
}

// Action types
export type Action =
  | { type: "SET_PAYMENT_MODAL_OPEN"; payload: boolean }
  | { type: "SET_KYC_MODAL_OPEN"; payload: boolean }
  | { type: "SET_TWO_FA_MODAL_OPEN"; payload: boolean }
  | { type: "SET_TWO_FA_CONFIRMATION_MODAL_OPEN"; payload: boolean }
  | { type: "SET_RECOVERY_EMAIL_MODAL_OPEN"; payload: boolean }
  | { type: "SET_DELETE_MODAL_OPEN"; payload: boolean }
  | { type: "SET_PASSWORD_CONFIRM_MODAL_OPEN"; payload: boolean }
  | { type: "SET_TWO_FA_UPDATE_REQUESTED"; payload: boolean }
  | { type: "SET_PASSWORD_CONFIRMED"; payload: boolean }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_PASSWORD_ERROR"; payload: string }
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
  | { type: "SET_TWO_FA_RESPONSE_MESSAGE"; payload: string }
  | { type: "SET_RECOVERY_EMAIL"; payload: string }
  | { type: "SET_RECOVERY_EMAIL_ERROR"; payload: string }
  | { type: "SET_EDITING_PAYMENT_DETAIL"; payload: PaymentDetail | null }
  | { type: "SET_DELETING_PAYMENT_DETAIL_ID"; payload: string | null }
  | { type: "SET_SHOW_PASSWORD"; payload: boolean }
  | { type: "RESET_PAYMENT_FORM" }
  | { type: "RESET_KYC_FORM" }
  | { type: "RESET_TWO_FA_FORM" }
  | { type: "RESET_RECOVERY_EMAIL_FORM" }
  | { type: "RESET_PASSWORD_FORM" };

// Initial state
const initialState: State = {
  isPaymentModalOpen: false,
  isKycModalOpen: false,
  isTwoFAModalOpen: false,
  isTwoFAConfirmationModalOpen: false,
  isRecoveryEmailModalOpen: false,
  isDeleteModalOpen: false,
  isPasswordConfirmModalOpen: false,
  twoFAUpdateRequested: false,
  passwordConfirmed: false,
  password: "",
  passwordError: "",
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
  twoFAResponseMessage: "",
  recoveryEmail: "",
  recoveryEmailError: "",
  editingPaymentDetail: null,
  deletingPaymentDetailId: null,
  showPassword: false,
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
    case "SET_TWO_FA_CONFIRMATION_MODAL_OPEN":
      return { ...state, isTwoFAConfirmationModalOpen: action.payload };
    case "SET_RECOVERY_EMAIL_MODAL_OPEN":
      return { ...state, isRecoveryEmailModalOpen: action.payload };
    case "SET_DELETE_MODAL_OPEN":
      return { ...state, isDeleteModalOpen: action.payload };
    case "SET_PASSWORD_CONFIRM_MODAL_OPEN":
      return { ...state, isPasswordConfirmModalOpen: action.payload };
    case "SET_TWO_FA_UPDATE_REQUESTED":
      return { ...state, twoFAUpdateRequested: action.payload };
    case "SET_PASSWORD_CONFIRMED":
      return { ...state, passwordConfirmed: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_PASSWORD_ERROR":
      return { ...state, passwordError: action.payload };
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
    case "SET_TWO_FA_RESPONSE_MESSAGE":
      return { ...state, twoFAResponseMessage: action.payload };
    case "SET_RECOVERY_EMAIL":
      return { ...state, recoveryEmail: action.payload };
    case "SET_RECOVERY_EMAIL_ERROR":
      return { ...state, recoveryEmailError: action.payload };
    case "SET_EDITING_PAYMENT_DETAIL":
      return { ...state, editingPaymentDetail: action.payload };
    case "SET_DELETING_PAYMENT_DETAIL_ID":
      return { ...state, deletingPaymentDetailId: action.payload };
    case "SET_SHOW_PASSWORD":
      return { ...state, showPassword: action.payload };
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
        editingPaymentDetail: null,
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
        twoFAResponseMessage: "",
        isTwoFAConfirmationModalOpen: false,
      };
    case "RESET_RECOVERY_EMAIL_FORM":
      return {
        ...state,
        recoveryEmail: "",
        recoveryEmailError: "",
      };
    case "RESET_PASSWORD_FORM":
      return {
        ...state,
        password: "",
        passwordError: "",
        showPassword: false,
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
  const {
    callApi: callPaymentApi,
    loading: paymentLoading,
    error: paymentApiError,
  } = useApiRequest<PaymentDetailResponse | DeletePaymentDetailResponse, PaymentDetailPayload>();

  // API hook for 2FA setup
  const {
    callApi: callTwoFAApi,
    loading: twoFALoading,
    error: twoFAApiError,
  } = useApiRequest<TwoFASetupResponse, TwoFASetupPayload>();

  // API hook for password confirmation
  const {
    callApi: callPasswordApi,
    loading: passwordLoading,
  } = useApiRequest<PasswordConfirmResponse, PasswordConfirmPayload>();

  // Pre-fill payment modal when editing
  const handleEditPaymentDetail = (detail: PaymentDetail) => {
    dispatch({ type: "SET_EDITING_PAYMENT_DETAIL", payload: detail });
    dispatch({ type: "SET_PAYMENT_TYPE", payload: detail.type });
    dispatch({ type: "SET_PAYMENT_CURRENCY", payload: detail.currency });
    if (detail.type === "fiat" && detail.accountDetails) {
      dispatch({ type: "SET_BANK_NAME", payload: detail.accountDetails.bankName || "" });
      dispatch({ type: "SET_ACCOUNT_NUMBER", payload: detail.accountDetails.accountNumber || "" });
      dispatch({ type: "SET_ACCOUNT_NAME", payload: detail.accountDetails.accountName || "" });
    } else if (detail.type === "crypto" && detail.accountDetails) {
      dispatch({ type: "SET_CRYPTO_ADDRESS", payload: detail.accountDetails.address || "" });
      dispatch({ type: "SET_NETWORK", payload: detail.accountDetails.network || "" });
    }
    dispatch({ type: "SET_PAYMENT_MODAL_OPEN", payload: true });
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (paymentDetailId: string) => {
    dispatch({ type: "SET_DELETING_PAYMENT_DETAIL_ID", payload: paymentDetailId });
    dispatch({ type: "SET_DELETE_MODAL_OPEN", payload: true });
  };

  // Close delete confirmation modal
  const handleCloseDeleteModal = () => {
    dispatch({ type: "SET_DELETING_PAYMENT_DETAIL_ID", payload: null });
    dispatch({ type: "SET_DELETE_MODAL_OPEN", payload: false });
  };

  // Delete payment detail
  const handleDeletePaymentDetail = async () => {
    if (!state.deletingPaymentDetailId) return;
    try {
      const response = await callPaymentApi({
        url: `${ENDPOINTS.PAYMENT_DETAILS}/delete/${state.deletingPaymentDetailId}`,
        method: "DELETE",
      });
      if (response.success) {
        reduxDispatch(deletePaymentDetail(state.deletingPaymentDetailId));
        handleCloseDeleteModal();
      } else {
        dispatch({ type: "SET_PAYMENT_ERROR", payload: response.message || "Failed to delete payment detail" });
      }
    } catch (err: unknown) {
      const errorMessage = paymentApiError?.message || "Failed to delete payment detail";
      dispatch({ type: "SET_PAYMENT_ERROR", payload: errorMessage });
    }
  };

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

  const handleTwoFAConfirmationClose = () => {
    dispatch({ type: "SET_TWO_FA_CONFIRMATION_MODAL_OPEN", payload: false });
    dispatch({ type: "SET_TWO_FA_MODAL_OPEN", payload: false });
    dispatch({ type: "RESET_TWO_FA_FORM" });
  };

  const handleRecoveryEmailModalOpen = () => dispatch({ type: "SET_RECOVERY_EMAIL_MODAL_OPEN", payload: true });
  const handleRecoveryEmailModalClose = () => {
    dispatch({ type: "SET_RECOVERY_EMAIL_MODAL_OPEN", payload: false });
    dispatch({ type: "RESET_RECOVERY_EMAIL_FORM" });
  };

  const handlePasswordConfirmModalOpen = () => dispatch({ type: "SET_PASSWORD_CONFIRM_MODAL_OPEN", payload: true });
  const handlePasswordConfirmModalClose = () => {
    dispatch({ type: "SET_PASSWORD_CONFIRM_MODAL_OPEN", payload: false });
    dispatch({ type: "RESET_PASSWORD_FORM" });
  };

  // Update 2FA secret handler
  const handleTwoFAUpdateOpen = () => {
    handlePasswordConfirmModalOpen();
  };

  // Password confirmation handler
  const handlePasswordConfirm = async () => {
    if (!state.password) {
      dispatch({ type: "SET_PASSWORD_ERROR", payload: "Please enter your password" });
      return;
    }
    if (!user?._id) {
      dispatch({ type: "SET_PASSWORD_ERROR", payload: "User ID is not available" });
      handlePasswordConfirmModalClose();
      return;
    }

    try {
      const response = await callPasswordApi({
        url: ENDPOINTS.CONFIRM_PASSWORD,
        method: "POST",
        body: { userId: user._id, password: state.password },
      });

      if (response.success) {
        dispatch({ type: "SET_PASSWORD_CONFIRMED", payload: true });
        dispatch({ type: "SET_TWO_FA_MODAL_OPEN", payload: true });
        dispatch({ type: "SET_TWO_FA_UPDATE_REQUESTED", payload: true });
        handlePasswordConfirmModalClose();
      } else {
        dispatch({ type: "SET_PASSWORD_ERROR", payload: response.message || "Invalid password" });
      }
    } catch (err: unknown) {
      const errorMessage = paymentApiError?.message || "Failed to confirm password";
      dispatch({ type: "SET_PASSWORD_ERROR", payload: errorMessage });
    }
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    dispatch({ type: "SET_SHOW_PASSWORD", payload: !state.showPassword });
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

  const validateTwoFAInput = (isEnabling: boolean): boolean => {
    if (isEnabling && !state.twoFASecret) {
      dispatch({ type: "SET_TWO_FA_ERROR", payload: "Please enter a 2FA secret" });
      return false;
    }
    if (!isEnabling && !state.twoFASecret) {
      dispatch({ type: "SET_TWO_FA_ERROR", payload: "Please enter your password" });
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
    if (paymentLoading) return;
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
      const isEditing = !!state.editingPaymentDetail;
      const url = isEditing
        ? `${ENDPOINTS.PAYMENT_DETAILS}/update/${state.editingPaymentDetail?._id}`
        : ENDPOINTS.addPaymentDetails;
      const method = isEditing ? "PUT" : "POST";

      const response = await callPaymentApi({
        url,
        method,
        body: payload,
      });
      if (response.success && response.paymentDetail) {
        reduxDispatch(addPaymentDetail(response.paymentDetail));
        handlePaymentModalClose();
      } else {
        dispatch({ type: "SET_PAYMENT_ERROR", payload: response.message || "Failed to save payment details" });
      }
    } catch (err: unknown) {
      const errorMessage = paymentApiError?.message || "Failed to save payment details";
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

  const handleTwoFASubmit = async (): Promise<void> => {
    if (twoFALoading) return;
    if (!user?._id) {
      dispatch({ type: "SET_TWO_FA_ERROR", payload: "User ID is not available" });
      return;
    }

    const isEnabling = !(user && user.twoFA && user.twoFA.enabled);
    if (!validateTwoFAInput(isEnabling)) return;

    try {
      let response: TwoFASetupResponse;

      if (isEnabling) {
        // Enable 2FA
        const payload: TwoFASetupPayload = {
          userId: user._id,
          secret: state.twoFASecret,
        };
        response = await callTwoFAApi({
          url: `${twoFA}/enable`,
          method: "POST",
          body: payload,
        });
        if (response.success) {
          reduxDispatch(updateTwoFA({
            enabled: true,
            secret: state.twoFASecret,
          }));
        }
      } else {
        // Disable 2FA: Confirm password first
        const confirmPayload: TwoFASetupPayload = {
          userId: user._id,
          password: state.twoFASecret, // Using twoFASecret for password
        };
        const confirmResponse = await callTwoFAApi({
          url: ENDPOINTS.CONFIRM_PASSWORD,
          method: "POST",
          body: confirmPayload,
        });
        if (!confirmResponse.success) {
          dispatch({ type: "SET_TWO_FA_ERROR", payload: confirmResponse.message || "Invalid password" });
          return;
        }

        // Password confirmed, disable 2FA
        const disablePayload: TwoFASetupPayload = {
          userId: user._id,
        };
        response = await callTwoFAApi({
          url: `${twoFA}/disable`,
          method: "DELETE",
          body: disablePayload,
        });
        if (response.success) {
          reduxDispatch(updateTwoFA({
            enabled: false,
            secret: "",
          }));
        }
      }

      dispatch({
        type: "SET_TWO_FA_RESPONSE_MESSAGE",
        payload: response.message || (isEnabling ? "2FA enabled successfully" : "2FA disabled successfully"),
      });
      dispatch({ type: "SET_TWO_FA_CONFIRMATION_MODAL_OPEN", payload: true });
    } catch (err: unknown) {
      const errorMessage = twoFAApiError?.message || `Failed to ${isEnabling ? "enable" : "disable"} 2FA`;
      dispatch({ type: "SET_TWO_FA_ERROR", payload: errorMessage });
    }
  };

  const handleRecoveryEmailSubmit = (): void => {
    if (!validateRecoveryEmail()) return;
    console.log("Recovery Email:", state.recoveryEmail);
    handleRecoveryEmailModalClose();
  };

  return (
    <Card
      sx={{
        padding: 3,
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      {/* Payment Details */}
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "1 1 45%" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          textAlign: "left",
        }}
      >
        <Typography variant="h6" fontWeight="medium" color="text.primary">
          Payment Details
        </Typography>
        {user?.paymentDetails && user.paymentDetails.length > 0 ? (
          user.paymentDetails.map((detail, index) => (
            <Box
              key={detail._id || index}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 1,
                backgroundColor: "background.default",
                position: "relative",
              }}
            >
              <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
                <IconButton
                  onClick={() => handleEditPaymentDetail(detail)}
                  aria-label="Edit payment detail"
                  sx={{
                    bgcolor: "grey.100",
                    "&:hover": { bgcolor: "grey.200" },
                    p: 0.5,
                  }}
                >
                  <FaEdit size={16} style={{ color: "grey.700" }} />
                </IconButton>
                <IconButton
                  onClick={() => handleOpenDeleteModal(detail._id)}
                  aria-label="Delete payment detail"
                  sx={{
                    bgcolor: "grey.100",
                    "&:hover": { bgcolor: "grey.200" },
                    p: 0.5,
                  }}
                >
                  <FaTrash size={16} style={{ color: "grey.700" }} />
                </IconButton>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                <strong>Type:</strong>{" "}
                {detail.type ? detail.type.charAt(0).toUpperCase() + detail.type.slice(1) : "N/A"}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                <strong>Currency:</strong> {detail.currency ? detail.currency.toUpperCase() : "N/A"}
              </Typography>
              {detail.type === "fiat" && detail.accountDetails ? (
                <>
                  <Typography variant="body2" fontWeight="medium">
                    <strong>Bank:</strong> {detail.accountDetails.bankName || "N/A"}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    <strong>Account Number:</strong> {detail.accountDetails.accountNumber || "N/A"}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    <strong>Account Name:</strong> {detail.accountDetails.accountName || "N/A"}
                  </Typography>
                </>
              ) : detail.type === "crypto" && detail.accountDetails ? (
                <>
                  <Typography variant="body2" fontWeight="medium">
                    <strong>Address:</strong> {detail.accountDetails.address || "N/A"}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    <strong>Network:</strong> {detail.accountDetails.network || "N/A"}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" fontWeight="medium">
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
              sx={{
                alignSelf: "flex-start",
                textTransform: "none",
                fontWeight: "medium",
                px: 3,
                py: 1,
              }}
              aria-label="Add payment details"
            >
              Add Payment Details
            </Button>
          </Box>
        )}
        {user?.paymentDetails && user.paymentDetails.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handlePaymentModalOpen}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              fontWeight: "medium",
              px: 3,
              py: 1,
            }}
            aria-label="Add payment details"
          >
            Add Payment Details
          </Button>
        )}
      </Box>

      {/* Two-Factor Authentication */}
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "1 1 45%" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          textAlign: "left",
        }}
      >
        <Typography variant="h6" fontWeight="medium" color="text.primary">
          Two-Factor Authentication
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          <strong>Status:</strong>{" "}
          {user?.twoFA?.enabled ? "Enabled" : "Disabled"}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTwoFAModalOpen}
            sx={{
              textTransform: "none",
              fontWeight: "medium",
              px: 3,
              py: 1,
            }}
            aria-label={user?.twoFA?.enabled ? "Disable 2FA" : "Enable 2FA"}
          >
            {user?.twoFA?.enabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
          {user?.twoFA?.enabled && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleTwoFAUpdateOpen}
              sx={{
                textTransform: "none",
                fontWeight: "medium",
                px: 3,
                py: 1,
                color: 'blue'
              }}
              aria-label="Update 2FA Secret"
            >
              Update 2FA Secret
            </Button>
          )}
        </Box>
      </Box>

      {/* KYC Details */}
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "1 1 45%" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          textAlign: "left",
        }}
      >
        <Typography variant="h6" fontWeight="medium" color="text.primary">
          KYC Details
        </Typography>
        {user?.kyc?.status ? (
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 1,
              backgroundColor: "background.default",
            }}
          >
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              <strong>Status:</strong>{" "}
              {user.kyc.status ? user.kyc.status.charAt(0).toUpperCase() + user.kyc.status.slice(1) : "N/A"}
            </Typography>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              <strong>Document Type:</strong> {user.kyc.documentType || "N/A"}
            </Typography>
            {user.kyc.documentFront && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  <strong>Document Front:</strong>
                </Typography>
                <IconButton
                  href={user.kyc.documentFront}
                  target="_blank"
                  aria-label="View document front"
                  sx={{
                    bgcolor: "grey.100",
                    "&:hover": { bgcolor: "grey.200" },
                    p: 0.5,
                  }}
                >
                  <FaEye size={16} style={{ color: "grey.700" }} />
                </IconButton>
              </Box>
            )}
            {user.kyc.documentBack && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  <strong>Document Back:</strong>
                </Typography>
                <IconButton
                  href={user.kyc.documentBack}
                  target="_blank"
                  aria-label="View document back"
                  sx={{
                    bgcolor: "grey.100",
                    "&:hover": { bgcolor: "grey.200" },
                    p: 0.5,
                  }}
                >
                  <FaEye size={16} style={{ color: "grey.700" }} />
                </IconButton>
              </Box>
            )}
            {user.kyc.addressProof && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  <strong>Address Proof:</strong>
                </Typography>
                <IconButton
                  href={user.kyc.addressProof}
                  target="_blank"
                  aria-label="View address proof"
                  sx={{
                    bgcolor: "grey.100",
                    "&:hover": { bgcolor: "grey.200" },
                    p: 0.5,
                  }}
                >
                  <FaEye size={16} style={{ color: "grey.700" }} />
                </IconButton>
              </Box>
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
              sx={{
                alignSelf: "flex-start",
                textTransform: "none",
                fontWeight: "medium",
                px: 3,
                py: 1,
              }}
              aria-label="Add KYC details"
            >
              Add KYC Details
            </Button>
          </Box>
        )}
      </Box>

      {/* Recovery Email */}
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "1 1 45%" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          textAlign: "left",
        }}
      >
        <Typography variant="h6" fontWeight="medium" color="text.primary">
          Recovery Email
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No recovery email set.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRecoveryEmailModalOpen}
          sx={{
            alignSelf: "flex-start",
            textTransform: "none",
            fontWeight: "medium",
            px: 3,
            py: 1,
          }}
          aria-label="Add recovery email"
        >
          Add Recovery Email
        </Button>
      </Box>

      {/* Modals */}
      <PaymentDetailsModal
        open={state.isPaymentModalOpen}
        editingPaymentDetail={state.editingPaymentDetail}
        paymentType={state.paymentType}
        paymentCurrency={state.paymentCurrency}
        bankName={state.bankName}
        accountNumber={state.accountNumber}
        accountName={state.accountName}
        cryptoAddress={state.cryptoAddress}
        network={state.network}
        paymentError={state.paymentError}
        loading={paymentLoading}
        apiError={paymentApiError}
        dispatch={dispatch}
        onCancel={handlePaymentModalClose}
        onConfirm={handlePaymentSubmit}
      />

      <DeleteConfirmationModal
        open={state.isDeleteModalOpen}
        paymentError={state.paymentError}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleDeletePaymentDetail}
      />

      <KycDetailsModal
        open={state.isKycModalOpen}
        kycDocumentType={state.kycDocumentType}
        kycError={state.kycError}
        dispatch={dispatch}
        onCancel={handleKycModalClose}
        onConfirm={handleKycSubmit}
      />

      <TwoFAModal
        open={state.isTwoFAModalOpen}
        user={user}
        twoFASecret={state.twoFASecret}
        twoFAError={state.twoFAError}
        showConfirmation={state.isTwoFAConfirmationModalOpen}
        responseMessage={state.twoFAResponseMessage}
        loading={twoFALoading}
        apiError={twoFAApiError}
        showUpdateFlow={state.twoFAUpdateRequested}
        passwordConfirmed={state.passwordConfirmed}
        dispatch={dispatch}
        onCancel={handleTwoFAModalClose}
        onConfirm={handleTwoFASubmit}
        onConfirmationClose={handleTwoFAConfirmationClose}
      />

      <RecoveryEmailModal
        open={state.isRecoveryEmailModalOpen}
        recoveryEmail={state.recoveryEmail}
        recoveryEmailError={state.recoveryEmailError}
        dispatch={dispatch}
        onCancel={handleRecoveryEmailModalClose}
        onConfirm={handleRecoveryEmailSubmit}
      />

      <CustomModal
        open={state.isPasswordConfirmModalOpen}
        title="Confirm Password"
        onCancel={handlePasswordConfirmModalClose}
        onConfirm={handlePasswordConfirm}
      >
        <ChildrenBox>
          <Typography variant="body1" color="text.primary">
            Please enter your password to proceed with updating your 2FA secret.
          </Typography>
          <TextField
            fullWidth
            label="Password"
            type={state.showPassword ? "text" : "password"}
            value={state.password}
            onChange={(e) => dispatch({ type: "SET_PASSWORD", payload: e.target.value })}
            aria-label="Confirm password"
            disabled={passwordLoading}
            error={!!state.passwordError}
            helperText={state.passwordError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    aria-label={state.showPassword ? "Hide password" : "Show password"}
                    edge="end"
                  >
                    {state.showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {passwordLoading && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
              Verifying password...
            </Typography>
          )}
        </ChildrenBox>
      </CustomModal>
    </Card>
  );
};

export default Account;