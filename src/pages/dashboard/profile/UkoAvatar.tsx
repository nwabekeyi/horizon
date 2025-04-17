import { Avatar, AvatarProps, styled } from "@mui/material";
import { FC } from "react";

// Importing the color constants
import { gray, white} from "theme/colors"; // Adjust the path according to your project structure

const StyledAvatar = styled(Avatar)(() => ({
  borderColor: gray[300], // Using gray[300] for the border color
  backgroundColor: white[500], // Using white[500] for the background color
}));

const UkoAvatar: FC<AvatarProps> = (props) => {
  return <StyledAvatar {...props} />;
};

export default UkoAvatar;
