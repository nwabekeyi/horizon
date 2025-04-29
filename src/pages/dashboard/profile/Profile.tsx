import { Box, Card, Divider, Grid, Typography, styled } from "@mui/material";
import { FC, useState } from "react";
import PaymentCard from "./PaymentCard";
import MoreOptions from "./MoreOptions";
import {User} from '../../../utils/interfaces'
import NotLoggedIn from "pages/errors/notLoggedIn";

// Styled components
const ProfileCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));
const InfoRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  marginTop: 12,
}));

// Profile component
const Profile: FC<{ user: User }> = ({ user }) => {
  const [moreEl, setMoreEl] = useState<null | HTMLElement>(null);


  const handleMoreClose = () => setMoreEl(null);

  // Format dateJoined
  const formattedDateJoined = user && new Date(user.dateJoined).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format address
  const formattedAddress = user && `${user.address.street}, ${user.address.city}, ${user.address.state}, ${user.address.country}`;

  if(!user) return <NotLoggedIn />

  return (
    <Grid container spacing={3}>
      <Grid item md={5} xs={12}>
        <ProfileCard>
          <Typography variant="h6" fontWeight={600}>
            Profile
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box>
            <InfoRow>
              <Typography variant="body2" color="text.secondary" minWidth={120}>
                Full Name:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.firstName} {user.lastName}
              </Typography>
            </InfoRow>
            <InfoRow>
              <Typography variant="body2" color="text.secondary" minWidth={120}>
                Email:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.email}
              </Typography>
            </InfoRow>
            <InfoRow>
              <Typography variant="body2" color="text.secondary" minWidth={120}>
                Phone:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.phone}
              </Typography>
            </InfoRow>
            <InfoRow>
              <Typography variant="body2" color="text.secondary" minWidth={120}>
                Gender:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.gender}
              </Typography>
            </InfoRow>
            <InfoRow>
              <Typography variant="body2" color="text.secondary" minWidth={120}>
                Status:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.status}
              </Typography>
            </InfoRow>
            <InfoRow>
              <Typography variant="body2" color="text.secondary" minWidth={120}>
                Date Joined:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formattedDateJoined}
              </Typography>
            </InfoRow>
            <InfoRow>
              <Typography variant="body2" color="text.secondary" minWidth={120}>
                Address:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formattedAddress}
              </Typography>
            </InfoRow>
          </Box>
        </ProfileCard>
      </Grid>

      <Grid item md={7} xs={12}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Payment Accounts
        </Typography>
        {user.paymentDetails.map((paymentDetail, index) => (
          <PaymentCard
            key={paymentDetail._id || `${user._id}-payment-${index}`}
            paymentDetail={paymentDetail}
            userId={user._id}
          />
        ))}



        {/* More options menu */}
        <MoreOptions anchorEl={moreEl} handleMoreClose={handleMoreClose} />
      </Grid>
    </Grid>
  );
};



export default Profile;