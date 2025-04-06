import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const AvatarGroup: Components<Omit<Theme, 'components'>>['MuiAvatarGroup'] = {
  styleOverrides: {
    root: {},
    avatar: ({ theme }) => ({
      border: 3,
      marginLeft: theme.spacing(-2),
      borderStyle: 'solid',
      borderColor: theme.palette.info.lighter,
      fontSize: theme.typography.body2.fontSize,
      '&:nth-of-type(1)': {
        zIndex: 99,
        backgroundColor: theme.palette.info.dark,
      },
    }),
  },
};

export default AvatarGroup;
