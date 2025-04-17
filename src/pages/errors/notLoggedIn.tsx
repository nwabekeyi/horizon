import { Box, Typography, useTheme } from "@mui/material";
import { FC } from "react";
import { NavLink } from "react-router-dom";

const NotLoggedIn: FC = () => {
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
      <Box maxWidth={350}>
        <img
          src="/static/illustration/error-page.svg"
          width="100%"
          alt="Not logged In"
        />
      </Box>
      <Typography variant="h2" fontWeight={700} color="primary.main" mt={3}>
        Ooops... You are not logged in
      </Typography>
      <Typography color="text.disabled" fontWeight={500}>
        The page you requested could not be found.
      </Typography>

      <NavLink
        to="/authentication/sign-in"
        style={{
          display: "block",
          marginTop: "1.5rem",
          fontWeight: 600,
          textDecoration: "underline",
          color: theme.palette.primary.main,
        }}
      >
        Go to Login Page
      </NavLink>
    </Box>
  );
};

export default NotLoggedIn;
