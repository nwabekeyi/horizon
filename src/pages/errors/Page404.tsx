import { Box, Typography, useTheme } from "@mui/material";
import { FC } from "react";
import { NavLink } from "react-router-dom";

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
      <Box maxWidth={350}>
        <img
          src="/static/illustration/error-page.svg"
          width="100%"
          alt="Error 404"
        />
      </Box>
      <Typography variant="h2" fontWeight={700} color="primary.main" mt={3}>
        Ooops... 404!
      </Typography>
      <Typography color="text.disabled" fontWeight={500}>
        The page you requested could not be found.
      </Typography>

      <NavLink
        to="/dashboard"
        style={{
          display: "block",
          marginTop: "1.5rem",
          fontWeight: 600,
          textDecoration: "underline",
          color: theme.palette.primary.main,
        }}
      >
        Back to Dashboard
      </NavLink>
    </Box>
  );
};

export default Page404;
