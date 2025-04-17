import { FaFacebook, FaInstagram, FaTwitter, FaDribbble } from "react-icons/fa";
import { Card, IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { FC } from "react";

// component props interface
interface FriendCardProps {
  friend: {
    name: string;
    image: string;
    profession: string;
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    dribbleUrl?: string;
  };
}

const FriendCard: FC<FriendCardProps> = ({ friend }) => {
  return (
    <Card sx={{ textAlign: "center", padding: 3 }}>
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: "primary.100",
          overflow: "hidden",
          margin: "auto",
        }}
      >
        <img src={friend.image} alt="User" width="100%" />
      </Box>
      <Typography variant="h6" mt={2}>
        {friend.name}
      </Typography>
      <Typography variant="body2" color="text.disabled">
        {friend.profession}
      </Typography>
      <Box marginTop={2}>
        {friend.facebookUrl && (
          <IconButton href={friend.facebookUrl} target="_blank">
            <FaFacebook size={20} color="#3b5998" />
          </IconButton>
        )}
        {friend.twitterUrl && (
          <IconButton href={friend.twitterUrl} target="_blank">
            <FaTwitter size={20} color="#1da1f2" />
          </IconButton>
        )}
        {friend.instagramUrl && (
          <IconButton href={friend.instagramUrl} target="_blank">
            <FaInstagram size={20} color="#e4405f" />
          </IconButton>
        )}
        {friend.dribbleUrl && (
          <IconButton href={friend.dribbleUrl} target="_blank">
            <FaDribbble size={20} color="#ea4c89" />
          </IconButton>
        )}
      </Box>
    </Card>
  );
};

export default FriendCard;
