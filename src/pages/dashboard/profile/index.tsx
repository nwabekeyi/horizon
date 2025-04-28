import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Card,
  Grid,
  styled,
  Tab,
  Typography,
} from "@mui/material";
import SearchInput from "pages/dashboard/profile/SearchInput";
import UkoAvatar from "pages/dashboard/profile/UkoAvatar";
import InvestmentCard from "pages/dashboard/profile/InvestmentCard";
import Account from "pages/dashboard/profile/Account";
import Profile from "pages/dashboard/profile/Profile"; // Make sure the Profile component is imported
import { FC, SyntheticEvent, useState } from "react";
import profileBanner from 'assets/images/profileBanner.jpg';
import { useUserDetails } from "hooks/useUserdetails";
import NotLoggedIn from "pages/errors/notLoggedIn";


// styled components
const StyledCard = styled(Card)(() => ({
  position: "relative",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
}));

const ContentWrapper = styled(Box)(() => ({
  top: -20,
  alignItems: "center",
  position: "relative",
  display: "flex",
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.primary,
}));

const StyledTabList = styled(TabList)(({ theme }) => ({
  [theme.breakpoints.down(780)]: {
    width: "100%",
    "& .MuiTabs-flexContainer": {
      justifyContent: "space-between",
    },
    marginBottom: 20,
  },
  [theme.breakpoints.up("sm")]: {
    "& .MuiTabs-flexContainer": {
      minWidth: 400,
      justifyContent: "space-between",
    },
  },
}));

const StyledTabPanel = styled(TabPanel)(() => ({
  padding: 0,
}));

const UserProfile: FC = () => {
  // Custom title logic for the page
  document.title = "User Profile";

  const [value, setValue] = useState("1");
  const user = useUserDetails();

  const handleChange = (_: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  if(!user) return <NotLoggedIn />

  return (
    <Box pt={2} pb={4}>
      <TabContext value={value}>
        <StyledCard>
          <Box sx={{ height: 200, width: "100%", overflow: "hidden" }}>
            <img
              src={profileBanner}
              alt="User Cover"
              height="100%"
              width="100%"
              style={{ objectFit: "cover" }}
            />
          </Box>

          <Box
            display="flex"
            flexWrap="wrap"
            px={4}
            alignItems="center"
            justifyContent="space-between"
          >
            <ContentWrapper>
              <UkoAvatar
                src={user?.profilePicture}
                sx={{
                  border: 4,
                  width: 100,
                  height: 100,
                  borderColor: "background.paper",
                }}
              />

              <Box ml={3} mt={3}>
                <Typography variant="h5" lineHeight={1.2}>
                  {user?.firstName}  {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  {user?.role === 'user' ? 'Investor' : "Company"}
                </Typography>
              </Box>
            </ContentWrapper>

            <StyledTabList onChange={handleChange}>
              <StyledTab label="Profile" value="1" />
              <StyledTab label="Investments" value="2" />
              <StyledTab label="Account" value="3" />
            </StyledTabList>
          </Box>
        </StyledCard>

        <Box mt={3}>
        <StyledTabPanel value="1">
          {/* Check if user is null before passing to Profile */}
          {user ? <Profile user={user} /> : <Typography>No user data available</Typography>}
        </StyledTabPanel>


          <StyledTabPanel value="2">

            <InvestmentCard user={user} />

          </StyledTabPanel>

          <StyledTabPanel value="3">
            <Typography variant="h6">Account settings</Typography>
            <SearchInput placeholder="Search Friends..." sx={{ my: 2 }} />

                <Grid item lg={4} sm={6} xs={12}>
                  <Account user={user} />
                </Grid>
          </StyledTabPanel>

          <StyledTabPanel value="4">
            <Typography variant="h6">Gallery</Typography>
            {/* Add gallery content here */}
          </StyledTabPanel>
        </Box>
      </TabContext>
    </Box>
  );
};


export default UserProfile;
