import { Box, Button, Card, IconButton, Typography, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { FC, useState } from "react";
import { FaEye } from "react-icons/fa";
import CustomModal from "components/base/modal"; // Adjust path to your CustomModal component
import { User, PaymentDetail } from "utils/interfaces"; // Import existing User and PaymentDetail interfaces

// Component props
interface AccountProps {
  user: User | null; // Allow null for user
}

const Account: FC<AccountProps> = ({ user }) => {
  // Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isTwoFAModalOpen, setIsTwoFAModalOpen] = useState(false);
  const [isRecoveryPasswordModalOpen, setIsRecoveryPasswordModalOpen] = useState(false);

  // Payment form state
  const [paymentType, setPaymentType] = useState<"fiat" | "crypto">("fiat");
  const [paymentCurrency, setPaymentCurrency] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // KYC form state
  const [kycDocumentType, setKycDocumentType] = useState("");
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [kycError, setKycError] = useState("");

  // 2FA form state
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFAError, setTwoFAError] = useState("");

  // Recovery Password form state
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryPasswordError, setRecoveryPasswordError] = useState("");

  // Modal handlers
  const handlePaymentModalOpen = () => setIsPaymentModalOpen(true);
  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setPaymentType("fiat");
    setPaymentCurrency("");
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setCryptoAddress("");
    setPaymentError("");
  };

  const handleKycModalOpen = () => setIsKycModalOpen(true);
  const handleKycModalClose = () => {
    setIsKycModalOpen(false);
    setKycDocumentType("");
    setDocumentFront(null);
    setDocumentBack(null);
    setAddressProof(null);
    setKycError("");
  };

  const handleTwoFAModalOpen = () => setIsTwoFAModalOpen(true);
  const handleTwoFAModalClose = () => {
    setIsTwoFAModalOpen(false);
    setTwoFASecret("");
    setTwoFAError("");
  };

  const handleRecoveryPasswordModalOpen = () => setIsRecoveryPasswordModalOpen(true);
  const handleRecoveryPasswordModalClose = () => {
    setIsRecoveryPasswordModalOpen(false);
    setRecoveryPassword("");
    setRecoveryPasswordError("");
  };

  // Validation functions
  const validatePaymentDetails = () => {
    if (!paymentCurrency) {
      setPaymentError("Please select a currency");
      return false;
    }
    if (paymentType === "fiat") {
      if (!bankName || !accountNumber || !accountName) {
        setPaymentError("Please fill in all bank details");
        return false;
      }
    } else if (paymentType === "crypto" && !cryptoAddress) {
      setPaymentError("Please provide a crypto address");
      return false;
    }
    setPaymentError("");
    return true;
  };

  const validateKycDetails = () => {
    if (!kycDocumentType) {
      setKycError("Please select a document type");
      return false;
    }
    if (!documentFront || !documentBack || !addressProof) {
      setKycError("Please upload all required documents");
      return false;
    }
    setKycError("");
    return true;
  };

  const validateTwoFASecret = () => {
    if (!twoFASecret) {
      setTwoFAError("Please enter a 2FA secret");
      return false;
    }
    setTwoFAError("");
    return true;
  };

  const validateRecoveryPassword = () => {
    if (!recoveryPassword) {
      setRecoveryPasswordError("Please enter a recovery password");
      return false;
    }
    setRecoveryPasswordError("");
    return true;
  };

  // Form submission handlers
  const handlePaymentSubmit = () => {
    if (!validatePaymentDetails()) return;
    const newPaymentDetail: PaymentDetail = {
      type: paymentType,
      currency: paymentCurrency as PaymentDetail["currency"],
      accountDetails:
        paymentType === "fiat"
          ? { bankName, accountNumber, accountName }
          : { address: cryptoAddress },
    };
    console.log("New Payment Detail:", newPaymentDetail);
    handlePaymentModalClose();
  };

  const handleKycSubmit = () => {
    if (!validateKycDetails()) return;
    console.log("KYC Submission:", {
      documentType: kycDocumentType,
      documentFront,
      documentBack,
      addressProof,
    });
    handleKycModalClose();
  };

  const handleTwoFASubmit = () => {
    if (!validateTwoFASecret()) return;
    console.log("2FA Secret:", twoFASecret);
    handleTwoFAModalClose();
  };

  const handleRecoveryPasswordSubmit = () => {
    if (!validateRecoveryPassword()) return;
    console.log("Recovery Password:", recoveryPassword);
    handleRecoveryPasswordModalClose();
  };

  return (
    <Card sx={{ padding: 3, display: "flex", flexWrap: "wrap", gap: 4 }}>
      {/* First Row: Payment Details and Two-Factor Authentication */}
      {/* Payment Details */}
      <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 45%" }, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
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
                <Typography variant="body2">
                  <strong>Address:</strong> {detail.accountDetails.address || "N/A"}
                </Typography>
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
      <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 45%" }, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
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

      {/* Second Row: KYC Details and Recovery Password */}
      {/* KYC Details */}
      <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 45%" }, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
        <Typography variant="h6">KYC Details</Typography>
        {user && user.kyc && user.kyc.status ? (
          <Box sx={{ p: 2, border: "1px solid", borderColor: "grey.200", borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Status:</strong> {user.kyc.status ? user.kyc.status.charAt(0).toUpperCase() + user.kyc.status.slice(1) : "N/A"}
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

      {/* Recovery Password */}
      <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 45%" }, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
        <Typography variant="h6">Recovery Password</Typography>
        <Typography variant="body2" color="text.secondary">
          No recovery password set.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRecoveryPasswordModalOpen}
          sx={{ alignSelf: "flex-start" }}
          aria-label="Add recovery password"
        >
          Add Recovery Password
        </Button>
      </Box>

      {/* Modals */}
      {/* Payment Details Modal */}
      <CustomModal
        open={isPaymentModalOpen}
        title="Add Payment Details"
        onCancel={handlePaymentModalClose}
        onConfirm={handlePaymentSubmit}
      >
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="payment-type-label">Payment Type</InputLabel>
            <Select
              labelId="payment-type-label"
              value={paymentType}
              label="Payment Type"
              onChange={(e) => setPaymentType(e.target.value as "fiat" | "crypto")}
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
              value={paymentCurrency}
              label="Currency"
              onChange={(e) => setPaymentCurrency(e.target.value)}
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
                onChange={(e) => setBankName(e.target.value)}
                sx={{ mb: 2 }}
                aria-label="Bank name"
              />
              <TextField
                fullWidth
                label="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                sx={{ mb: 2 }}
                aria-label="Account number"
              />
              <TextField
                fullWidth
                label="Account Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                sx={{ mb: 2 }}
                aria-label="Account name"
              />
            </>
          ) : (
            <TextField
              fullWidth
              label="Crypto Address"
              value={cryptoAddress}
              onChange={(e) => setCryptoAddress(e.target.value)}
              sx={{ mb: 2 }}
              aria-label="Crypto address"
            />
          )}
          {paymentError && (
            <Typography variant="caption" color="error">
              {paymentError}
            </Typography>
          )}
        </Box>
      </CustomModal>

      {/* KYC Details Modal */}
      <CustomModal
        open={isKycModalOpen}
        title="Add KYC Details"
        onCancel={handleKycModalClose}
        onConfirm={handleKycSubmit}
      >
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="document-type-label">Document Type</InputLabel>
            <Select
              labelId="document-type-label"
              value={kycDocumentType}
              label="Document Type"
              onChange={(e) => setKycDocumentType(e.target.value)}
              aria-label="Select document type"
            >
              <MenuItem value="driver_license">Driver's License</MenuItem>
              <MenuItem value="passport">Passport</MenuItem>
              <MenuItem value="id_card">National ID Card</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" mb={1}>Document Front</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDocumentFront(e.target.files?.[0] || null)}
            style={{ marginBottom: 16 }}
            aria-label="Upload document front"
          />
          <Typography variant="body2" mb={1}>Document Back</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDocumentBack(e.target.files?.[0] || null)}
            style={{ marginBottom: 16 }}
            aria-label="Upload document back"
          />
          <Typography variant="body2" mb={1}>Address Proof</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAddressProof(e.target.files?.[0] || null)}
            style={{ marginBottom: 16 }}
            aria-label="Upload address proof"
          />
          {kycError && (
            <Typography variant="caption" color="error">
              {kycError}
            </Typography>
          )}
        </Box>
      </CustomModal>

      {/* 2FA Modal */}
      <CustomModal
        open={isTwoFAModalOpen}
        title={user && user.twoFA && user.twoFA.enabled ? "Disable 2FA" : "Enable 2FA"}
        onCancel={handleTwoFAModalClose}
        onConfirm={handleTwoFASubmit}
      >
        <Box>
          <TextField
            fullWidth
            label="2FA Secret"
            value={twoFASecret}
            onChange={(e) => setTwoFASecret(e.target.value)}
            sx={{ mb: 2 }}
            aria-label="2FA secret"
          />
          {twoFAError && (
            <Typography variant="caption" color="error">
              {twoFAError}
            </Typography>
          )}
        </Box>
      </CustomModal>

      {/* Recovery Password Modal */}
      <CustomModal
        open={isRecoveryPasswordModalOpen}
        title="Add Recovery Password"
        onCancel={handleRecoveryPasswordModalClose}
        onConfirm={handleRecoveryPasswordSubmit}
      >
        <Box>
          <TextField
            fullWidth
            label="Recovery Password"
            type="password"
            value={recoveryPassword}
            onChange={(e) => setRecoveryPassword(e.target.value)}
            sx={{ mb: 2 }}
            aria-label="Recovery password"
          />
          {recoveryPasswordError && (
            <Typography variant="caption" color="error">
              {recoveryPasswordError}
            </Typography>
          )}
        </Box>
      </CustomModal>
    </Card>
  );
};

export default Account;