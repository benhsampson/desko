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

const theme = createTheme({
  typography: {
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '1rem',
    },
  },
});

export default theme;
