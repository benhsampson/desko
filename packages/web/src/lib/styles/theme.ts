import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    palette2: {
      highlight: string;
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
