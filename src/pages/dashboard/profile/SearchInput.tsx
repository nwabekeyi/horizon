import { InputBase, InputBaseProps, styled } from "@mui/material";
import { FaSearch } from "react-icons/fa"; // Importing the FaSearch icon from react-icons
import { FC } from "react";

// Importing the color constants
import { gray } from "theme/colors"; // Adjust the path according to your project structure

// styled component
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  height: 45,
  fontSize: 13,
  width: "100%",
  maxWidth: 270,
  fontWeight: 500,
  padding: "0 1rem",
  borderRadius: "8px",
  border: "1px solid ",
  borderColor: gray[300],  // Using gray[300] from the constants as the border color
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down(500)]: { maxWidth: "100%" },
}));

const SearchInput: FC<InputBaseProps> = (props) => {
  return (
    <StyledInputBase
      {...props}
      startAdornment={
        <FaSearch
          style={{
            fontSize: 16,
            marginRight: 8,
            color: gray[500], // Using gray[500] for the search icon color
          }}
        />
      }
    />
  );
};

export default SearchInput;
