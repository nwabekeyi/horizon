import {
  Box,
  Card,
  IconButton,
  Typography,
  styled,
  Avatar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { FC, useReducer } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import CustomModal from "components/base/modal"; // Adjust path to your CustomModal component
import { useApiRequest } from "hooks/useApi"; // Import the useApiRequest hook
import { ENDPOINTS } from "utils/endpoints"; // Import the ENDPOINTS object
import { useDispatch } from "react-redux";
import { addPaymentDetail } from "store/slices/userSlice"; // Adjust path to your userSlice

// component props interface
interface PaymentDetailProps {
  paymentDetail: {
    _id: string;
    type: "fiat" | "crypto";
    currency: "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt";
    accountDetails: {
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      address?: string;
      network?: "erc20" | "trc20" | "bep20" | "polygon" | "solana";
    };
  };
  userId: string; // Required for API payload
}


interface DeletePaymentDetailPayload {
  userId: string;
}


// Interfaces for API request and response
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
  paymentDetail?: PaymentDetailProps["paymentDetail"];
}

interface DeletePaymentDetailResponse {
  success: boolean;
  message: string;
  paymentDetail?: PaymentDetailProps["paymentDetail"];
}

type CombinedPayload = PaymentDetailPayload | DeletePaymentDetailPayload;



// State interface
interface State {
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  paymentType: "fiat" | "crypto";
  paymentCurrency: "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt" | "";
  bankName: string;
  accountNumber: string;
  accountName: string;
  cryptoAddress: string;
  network: "erc20" | "trc20" | "bep20" | "polygon" | "solana" | "";
  paymentError: string;
  deletingPaymentDetailId: string | null;
}

// Action types
type Action =
  | { type: "SET_EDIT_MODAL_OPEN"; payload: boolean }
  | { type: "SET_DELETE_MODAL_OPEN"; payload: boolean }
  | { type: "SET_PAYMENT_TYPE"; payload: "fiat" | "crypto" }
  | { type: "SET_PAYMENT_CURRENCY"; payload: "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt" | "" }
  | { type: "SET_BANK_NAME"; payload: string }
  | { type: "SET_ACCOUNT_NUMBER"; payload: string }
  | { type: "SET_ACCOUNT_NAME"; payload: string }
  | { type: "SET_CRYPTO_ADDRESS"; payload: string }
  | { type: "SET_NETWORK"; payload: "erc20" | "trc20" | "bep20" | "polygon" | "solana" | "" }
  | { type: "SET_PAYMENT_ERROR"; payload: string }
  | { type: "SET_DELETING_PAYMENT_DETAIL_ID"; payload: string | null }
  | { type: "RESET_EDIT_FORM" };

// Initial state
const initialState: State = {
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  paymentType: "fiat",
  paymentCurrency: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  cryptoAddress: "",
  network: "",
  paymentError: "",
  deletingPaymentDetailId: null,
};

// Reducer function
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_EDIT_MODAL_OPEN":
      return { ...state, isEditModalOpen: action.payload };
    case "SET_DELETE_MODAL_OPEN":
      return { ...state, isDeleteModalOpen: action.payload };
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
    case "SET_DELETING_PAYMENT_DETAIL_ID":
      return { ...state, deletingPaymentDetailId: action.payload };
    case "RESET_EDIT_FORM":
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
    default:
      return state;
  }
};

// styled components
const SymbolAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  fontSize: 24,
  fontWeight: 700,
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.text.primary,
}));

const InfoRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  marginTop: 12,
}));

// Currency symbols
const currencySymbols: { [key: string]: string } = {
  usd: "$",
  cad: "C$",
  eur: "€",
  gbp: "£",
  btc: "₿",
  eth: "Ξ",
  usdt: "₮",
};

const PaymentCard: FC<PaymentDetailProps> = ({ paymentDetail, userId }) => {
  const reduxDispatch = useDispatch();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { callApi, loading, error: apiError } = useApiRequest<
    PaymentDetailResponse | DeletePaymentDetailResponse,
    CombinedPayload
  >();

  const currencySymbol = currencySymbols[paymentDetail.currency] || "?";

  // Open edit modal and pre-fill form
  const handleEditPaymentDetail = () => {
    dispatch({ type: "SET_PAYMENT_TYPE", payload: paymentDetail.type });
    dispatch({ type: "SET_PAYMENT_CURRENCY", payload: paymentDetail.currency });
    if (paymentDetail.type === "fiat" && paymentDetail.accountDetails) {
      dispatch({ type: "SET_BANK_NAME", payload: paymentDetail.accountDetails.bankName || "" });
      dispatch({ type: "SET_ACCOUNT_NUMBER", payload: paymentDetail.accountDetails.accountNumber || "" });
      dispatch({ type: "SET_ACCOUNT_NAME", payload: paymentDetail.accountDetails.accountName || "" });
    } else if (paymentDetail.type === "crypto" && paymentDetail.accountDetails) {
      dispatch({ type: "SET_CRYPTO_ADDRESS", payload: paymentDetail.accountDetails.address || "" });
      dispatch({ type: "SET_NETWORK", payload: paymentDetail.accountDetails.network || "" });
    }
    dispatch({ type: "SET_EDIT_MODAL_OPEN", payload: true });
  };

  // Close edit modal
  const handleEditModalClose = () => {
    dispatch({ type: "SET_EDIT_MODAL_OPEN", payload: false });
    dispatch({ type: "RESET_EDIT_FORM" });
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = () => {
    dispatch({ type: "SET_DELETING_PAYMENT_DETAIL_ID", payload: paymentDetail._id });
    dispatch({ type: "SET_DELETE_MODAL_OPEN", payload: true });
  };

  // Close delete confirmation modal
  const handleCloseDeleteModal = () => {
    dispatch({ type: "SET_DELETE_MODAL_OPEN", payload: false });
    dispatch({ type: "SET_DELETING_PAYMENT_DETAIL_ID", payload: null });
  };

  // Validate payment details
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

  // Edit payment detail API call
  const handleEditSubmit = async (): Promise<void> => {
    if (loading) return;
    if (!validatePaymentDetails()) return;

    const payload: PaymentDetailPayload = {
      userId,
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
        url: `${ENDPOINTS.PAYMENT_DETAILS}/update/${paymentDetail._id}`,
        method: "PUT",
        body: payload,
      });
      if (response.success && response.paymentDetail) {
        reduxDispatch(addPaymentDetail(response.paymentDetail));
        handleEditModalClose();
      } else {
        dispatch({ type: "SET_PAYMENT_ERROR", payload: response.message || "Failed to update payment details" });
      }
    } catch (err: unknown) {
      const errorMessage = apiError?.message || "Failed to update payment details";
      dispatch({ type: "SET_PAYMENT_ERROR", payload: errorMessage });
    }
  };

  // Delete payment detail API call
  const handleDeletePaymentDetail = async () => {
    if (!state.deletingPaymentDetailId) return;
    try {
      const response = await callApi({
        url: `${ENDPOINTS.PAYMENT_DETAILS}/delete/${state.deletingPaymentDetailId}`,
        method: "DELETE",
        body:{userId}
      });
      if (response.success) {
        reduxDispatch({
          type: "user/deletePaymentDetail",
          payload: state.deletingPaymentDetailId,
        });
        handleCloseDeleteModal();
      } else {
        dispatch({ type: "SET_PAYMENT_ERROR", payload: response.message || "Failed to delete payment detail" });
      }
    } catch (err: unknown) {
      const errorMessage = apiError?.message || "Failed to delete payment detail";
      dispatch({ type: "SET_PAYMENT_ERROR", payload: errorMessage });
    }
  };

  return (
    <>
      <Card sx={{ padding: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <SymbolAvatar>{currencySymbol}</SymbolAvatar>
            <Box ml={1}>
              <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                {paymentDetail.type.toUpperCase()} Payment
              </Typography>
              <Typography variant="caption" color="text.disabled" fontWeight={500}>
                {paymentDetail.currency.toUpperCase()}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton
              onClick={handleEditPaymentDetail}
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
              onClick={handleOpenDeleteModal}
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
        </Box>
        <Box mt={3}>
          {paymentDetail.type === "fiat" ? (
            <>
              <InfoRow>
                <Typography variant="body2" color="text.secondary" minWidth={120}>
                  Bank Name:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {paymentDetail.accountDetails.bankName || "N/A"}
                </Typography>
              </InfoRow>
              <InfoRow>
                <Typography variant="body2" color="text.secondary" minWidth={120}>
                  Account Name:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {paymentDetail.accountDetails.accountName || "N/A"}
                </Typography>
              </InfoRow>
              <InfoRow>
                <Typography variant="body2" color="text.secondary" minWidth={120}>
                  Account Number:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {paymentDetail.accountDetails.accountNumber || "N/A"}
                </Typography>
              </InfoRow>
            </>
          ) : (
            <>
              <InfoRow>
                <Typography variant="body2" color="text.secondary" minWidth={120}>
                  Address:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {paymentDetail.accountDetails.address || "N/A"}
                </Typography>
              </InfoRow>
              {paymentDetail.accountDetails.network && (
                <InfoRow>
                  <Typography variant="body2" color="text.secondary" minWidth={120}>
                    Network:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {paymentDetail.accountDetails.network.toUpperCase()}
                  </Typography>
                </InfoRow>
              )}
            </>
          )}
        </Box>
      </Card>

      {/* Edit Payment Details Modal */}
      <CustomModal
        open={state.isEditModalOpen}
        title="Edit Payment Details"
        onCancel={handleEditModalClose}
        onConfirm={handleEditSubmit}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth>
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
          <FormControl fullWidth>
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
                aria-label="Bank name"
              />
              <TextField
                fullWidth
                label="Account Number"
                value={state.accountNumber}
                onChange={(e) => dispatch({ type: "SET_ACCOUNT_NUMBER", payload: e.target.value })}
                aria-label="Account number"
              />
              <TextField
                fullWidth
                label="Account Name"
                value={state.accountName}
                onChange={(e) => dispatch({ type: "SET_ACCOUNT_NAME", payload: e.target.value })}
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
                aria-label="Crypto address"
              />
              <FormControl fullWidth>
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

      {/* Delete Confirmation Modal */}
      <CustomModal
        open={state.isDeleteModalOpen}
        title="Confirm Delete"
        onCancel={handleCloseDeleteModal}
        onConfirm={handleDeletePaymentDetail}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1" color="text.primary">
            Are you sure you want to delete this payment detail? This action cannot be undone.
          </Typography>
          {state.paymentError && (
            <Typography variant="caption" color="error">
              {state.paymentError}
            </Typography>
          )}
        </Box>
      </CustomModal>
    </>
  );
};

export default PaymentCard;