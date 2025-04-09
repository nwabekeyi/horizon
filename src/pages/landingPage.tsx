import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Box,
} from "@mui/material";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/authentication/sign-up");
  };

  const handleLoginClick = () => {
    navigate("/authentication/sign-in");
  };

  return (
    <Box sx={{ flexGrow: 1, height: '10vh' }}>
      {/* Navigation Bar */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{minHeight: '50px'}}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            247AT
          </Typography>
          <Button color="inherit" onClick={handleRegisterClick}>
            Register
          </Button>
          <Button color="inherit" onClick={handleLoginClick}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Grid display="grid" sx={{textAlign: "center", placeContent: 'center', height: '90vh' }}>
        <Typography variant="h1" component="h1" gutterBottom>
          Sample Landing Page
        </Typography>
      </Grid>
    </Box>
  );
};

export default Home;