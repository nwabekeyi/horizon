import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Typography,
  } from "@mui/material";
  import { FC } from "react";
  import CustomModal from "components/base/modal"; 
  import { PaymentDetail } from "utils/interfaces"; 
  import { Action } from "../Account";
  
  interface PaymentDetailsModalProps {
    open: boolean;
    editingPaymentDetail: PaymentDetail | null;
    paymentType: "fiat" | "crypto";
    paymentCurrency: "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt" | "";
    bankName: string;
    accountNumber: string;
    accountName: string;
    cryptoAddress: string;
    network: "erc20" | "trc20" | "bep20" | "polygon" | "solana" | "";
    paymentError: string;
    loading: boolean;
    apiError: { message: string } | null; // Specific type for apiError
    dispatch: React.Dispatch<Action>;
    onCancel: () => void;
    onConfirm: () => void;
  }
  
  const PaymentDetailsModal: FC<PaymentDetailsModalProps> = ({
    open,
    editingPaymentDetail,
    paymentType,
    paymentCurrency,
    bankName,
    accountNumber,
    accountName,
    cryptoAddress,
    network,
    paymentError,
    loading,
    apiError,
    dispatch,
    onCancel,
    onConfirm,
  }) => {
    return (
      <CustomModal
        open={open}
        title={editingPaymentDetail ? "Edit Payment Details" : "Add Payment Details"}
        onCancel={onCancel}
        onConfirm={onConfirm}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="payment-type-label">Payment Type</InputLabel>
            <Select
              labelId="payment-type-label"
              value={paymentType}
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
              value={paymentCurrency}
              label="Currency"
              onChange={(e) =>
                dispatch({
                  type: "SET_PAYMENT_CURRENCY",
                  payload: e.target.value as "usd" | "cad" | "eur" | "gbp" | "btc" | "eth" | "usdt" | "",
                })
              }
              aria-label="Select currency"
            >
              {paymentType === "fiat"
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
          {paymentType === "fiat" ? (
            <>
              <TextField
                fullWidth
                label="Bank Name"
                value={bankName}
                onChange={(e) => dispatch({ type: "SET_BANK_NAME", payload: e.target.value })}
                aria-label="Bank name"
              />
              <TextField
                fullWidth
                label="Account Number"
                value={accountNumber}
                onChange={(e) => dispatch({ type: "SET_ACCOUNT_NUMBER", payload: e.target.value })}
                aria-label="Account number"
              />
              <TextField
                fullWidth
                label="Account Name"
                value={accountName}
                onChange={(e) => dispatch({ type: "SET_ACCOUNT_NAME", payload: e.target.value })}
                aria-label="Account name"
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Crypto Address"
                value={cryptoAddress}
                onChange={(e) => dispatch({ type: "SET_CRYPTO_ADDRESS", payload: e.target.value })}
                aria-label="Crypto address"
              />
              <FormControl fullWidth>
                <InputLabel id="network-label">Network (Optional)</InputLabel>
                <Select
                  labelId="network-label"
                  value={network}
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
          {(paymentError || apiError) && (
            <Typography variant="caption" color="error">
              {paymentError || apiError?.message}
            </Typography>
          )}
          {loading && (
            <Typography variant="caption" color="text.secondary">
              Submitting...
            </Typography>
          )}
        </Box>
      </CustomModal>
    );
  };
  
  export default PaymentDetailsModal;