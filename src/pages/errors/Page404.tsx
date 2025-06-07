import { Box, Typography, useTheme } from "@mui/material";
import { FC } from "react";
import { FiAlertTriangle } from "react-icons/fi"; // Import a suitable icon

const Page404: FC = () => {
  const theme = useTheme();

  return (
    <Box
      p={4}
      height="100vh"
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
    >
      <Box color={theme.palette.error.main}>
        <FiAlertTriangle size={100} />
      </Box>

      <Typography variant="h2" fontWeight={700} color="primary.main" mt={3}>
        Ooops... 404!
      </Typography>
      <Typography color="text.disabled" fontWeight={500}>
        The page you requested could not be found.
      </Typography>

      <a
        href="https://247activetrading.com"
        style={{
          display: "block",
          marginTop: "1.5rem",
          fontWeight: 600,
          textDecoration: "underline",
          color: theme.palette.primary.main,
        }}
      >
        Back to Home
      </a>
    </Box>
  );
};

export default Page404;
