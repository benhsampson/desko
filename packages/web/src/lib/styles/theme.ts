import { createTheme } from '@mui/material';
import { yellow } from '@mui/material/colors';

declare module '@mui/material/styles' {
  interface Theme {
    palette2: {
      highlight: yellow[100];
    };
  }

  interface ThemeOptions {
    palette2?: {
      highlight?: string;
    };
  }
}

const theme = createTheme();

export default theme;
