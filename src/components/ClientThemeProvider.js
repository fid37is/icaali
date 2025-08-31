// components/ClientThemeProvider.js
'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

export function ClientThemeProvider({ children, fontFamily }) {
  const theme = createTheme({
    palette: {
      mode: 'light', // This will be controlled by CSS variables
    },
    typography: {
      fontFamily: fontFamily,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollBehavior: 'smooth',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}