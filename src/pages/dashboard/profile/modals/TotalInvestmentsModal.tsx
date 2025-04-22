// src/pages/dashboard/profile/modals/TotalInvestmentModal.tsx

import { FC } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import CustomModal from "components/base/modal";
import { ExchangeRateResponse, InvestmentTotals } from "../Interfaces";

interface TotalInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeLoading: boolean;
  exchangeError: { message: string } | null;
  exchangeData: ExchangeRateResponse | null;
  calculateTotals: () => InvestmentTotals;
}

export const TotalInvestmentModal: FC<TotalInvestmentModalProps> = ({
  isOpen,
  onClose,
  exchangeLoading,
  exchangeError,
  exchangeData,
  calculateTotals,
}) => (
  <CustomModal open={isOpen} title="Total Investment" onCancel={onClose} noConfirm>
    {exchangeLoading && (
      <Box display="flex" justifyContent="center" my={2}>
        <CircularProgress size={24} />
      </Box>
    )}
    {exchangeError && (
      <Typography color="error" variant="body2" mb={2}>
        Error fetching exchange rates: {exchangeError.message}
      </Typography>
    )}
    {!exchangeLoading && !exchangeError && (
      <Box>
        {(() => {
          const totals = calculateTotals();
          return (
            <>
              <Typography variant="body2" mb={1}>
                <strong>Total Fiat (USD):</strong> ${totals.fiat.toFixed(2)}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Total BTC:</strong> {totals.btc.toFixed(8)} (~$
                {(totals.btc * (exchangeData?.bitcoin?.usd || 0)).toFixed(2)})
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Total ETH:</strong> {totals.eth.toFixed(8)} (~$
                {(totals.eth * (exchangeData?.ethereum?.usd || 0)).toFixed(2)})
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Total USDT:</strong> {totals.usdt.toFixed(2)} (~$
                {(totals.usdt * (exchangeData?.tether?.usd || 0)).toFixed(2)})
              </Typography>
              <Typography variant="body2" fontWeight={600} mt={2}>
                <strong>Total in USD:</strong> ${totals.totalUsd.toFixed(2)}
              </Typography>
            </>
          );
        })()}
      </Box>
    )}
  </CustomModal>
);