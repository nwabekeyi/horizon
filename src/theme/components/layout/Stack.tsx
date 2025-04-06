import { Theme } from '@mui/material/styles'; // Corrected import path for Theme
import { Components } from '@mui/material/styles';

const Stack: Components<Omit<Theme, 'components'>>['MuiStack'] = {
  defaultProps: {
    useFlexGap: true,
    direction: 'row',
  },
};

export default Stack;
