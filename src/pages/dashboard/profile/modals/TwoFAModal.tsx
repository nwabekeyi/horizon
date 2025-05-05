import { Box, TextField, Typography, InputAdornment, IconButton } from "@mui/material";
import { FC, useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import CustomModal, { ChildrenBox } from "components/base/modal"; // Adjust path
import { User } from "utils/interfaces"; // Adjust path
import { Action } from "../Account"; // Import Action type from Account.tsx
import { useApiRequest } from "../../../../hooks/useApi"; // Adjust path
import { twoFA } from "utils/endpoints"; // Adjust path

interface TwoFAModalProps {
  open: boolean;
  user: User | null;
  twoFASecret: string;
  twoFAError: string;
  showConfirmation: boolean;
  responseMessage: string;
  loading: boolean;
  apiError: { message: string } | null;
  showUpdateFlow: boolean;
  passwordConfirmed: boolean; // Indicates if password is confirmed
  dispatch: React.Dispatch<Action>;
  onCancel: () => void;
  onConfirm: () => void;
  onConfirmationClose: () => void;
}

interface TwoFAUpdateRequestBody {
  userId: string;
}

interface TwoFAUpdateResponse {
  success: boolean;
  message: string;
}

const TwoFAModal: FC<TwoFAModalProps> = ({
  open,
  user,
  twoFASecret,
  twoFAError,
  showConfirmation,
  responseMessage,
  loading,
  apiError,
  showUpdateFlow,
  passwordConfirmed,
  dispatch,
  onCancel,
  onConfirm,
  onConfirmationClose,
}) => {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // State to manage update 2FA secret confirmation modal
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState<boolean>(false);
  // State to manage response message for update request
  const [updateResponseMessage, setUpdateResponseMessage] = useState<string>("");
  // State to manage update response modal
  const [showUpdateResponse, setShowUpdateResponse] = useState<boolean>(false);

  const { error: updateApiError, loading: updateLoading, callApi: callUpdateApi } =
    useApiRequest<TwoFAUpdateResponse, TwoFAUpdateRequestBody>();

  // Effect to handle update flow
  useEffect(() => {
    if (showUpdateFlow) {
      if (passwordConfirmed && user?._id) {
        // Directly call the update API
        callUpdateApi({
          url: `${twoFA}/request-update`,
          method: "POST",
          body: { userId: user._id },
        })
          .then((response) => {
            setUpdateResponseMessage(response.message);
            setShowUpdateResponse(true);
          })
          .catch((err) => {
            console.error("Error updating 2FA secret:", err);
            setUpdateResponseMessage(updateApiError?.message || "Failed to request 2FA update");
            setShowUpdateResponse(true);
          });
      } else {
        setShowUpdateConfirmation(true); // Show confirmation modal
      }
      // Reset showUpdateFlow to prevent re-triggering
      dispatch({ type: "SET_TWO_FA_UPDATE_REQUESTED", payload: false });
      dispatch({ type: "SET_PASSWORD_CONFIRMED", payload: false });
    }
  }, [showUpdateFlow, passwordConfirmed, user, callUpdateApi, updateApiError, dispatch]);

  // Handler to toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handler to cancel update confirmation
  const handleUpdateCancel = () => {
    setShowUpdateConfirmation(false);
    onCancel();
  };

  // Handler to confirm update (closes modal as password confirmation is handled in Account.tsx)
  const handleUpdateConfirm = () => {
    setShowUpdateConfirmation(false);
    onCancel();
  };

  // Handler to close update response modal
  const handleUpdateResponseClose = () => {
    setShowUpdateResponse(false);
    setUpdateResponseMessage("");
    onCancel();
  };

  return (
    <>
      {/* Main 2FA Modal (Enable/Disable) */}
      <CustomModal
        open={open}
        title={
          showConfirmation
            ? "2FA Setup Confirmation"
            : user && user.twoFA && user.twoFA.enabled
            ? "Disable 2FA"
            : "Enable 2FA"
        }
        onCancel={showConfirmation ? onConfirmationClose : onCancel}
        onConfirm={showConfirmation ? onConfirmationClose : onConfirm}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {showConfirmation ? (
            <Typography variant="body1" color="text.primary">
              {responseMessage}
            </Typography>
          ) : (
            <>
              {user && user.twoFA && user.twoFA.enabled ? (
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  value={twoFASecret}
                  onChange={(e) =>
                    dispatch({ type: "SET_TWO_FA_SECRET", payload: e.target.value })
                  }
                  aria-label="Confirm password"
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          edge="end"
                        >
                          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  label="2FA Secret"
                  type={showPassword ? "text" : "password"}
                  value={twoFASecret}
                  onChange={(e) =>
                    dispatch({ type: "SET_TWO_FA_SECRET", payload: e.target.value })
                  }
                  aria-label="2FA secret"
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          aria-label={showPassword ? "Hide 2FA secret" : "Show 2FA secret"}
                          edge="end"
                        >
                          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              {(twoFAError || apiError) && (
                <Typography variant="caption" color="error">
                  {twoFAError || apiError?.message}
                </Typography>
              )}
              {loading && (
                <Typography variant="caption" color="text.secondary">
                  Submitting...
                </Typography>
              )}
            </>
          )}
        </Box>
      </CustomModal>

      {/* Modal for confirming 2FA secret update request */}
      <CustomModal
        open={showUpdateConfirmation}
        title="Confirm 2FA Secret Update"
        onCancel={handleUpdateCancel}
        onConfirm={handleUpdateConfirm}
      >
        <ChildrenBox>
          <Typography variant="body1" color="text.primary">
            Are you sure you want to update your 2FA secret? You will need to confirm your password.
          </Typography>
        </ChildrenBox>
      </CustomModal>

      {/* Modal for displaying response from update request */}
      <CustomModal
        open={showUpdateResponse}
        title="2FA Update Request"
        onCancel={handleUpdateResponseClose}
        onConfirm={handleUpdateResponseClose}
      >
        <ChildrenBox>
          <Typography variant="body1" color="text.primary">
            {updateResponseMessage}
          </Typography>
          {updateLoading && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
              Requesting 2FA update...
            </Typography>
          )}
        </ChildrenBox>
      </CustomModal>
    </>
  );
};

export default TwoFAModal;