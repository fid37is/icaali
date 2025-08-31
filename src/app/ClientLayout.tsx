// src/app/ClientLayout.tsx (Client Component)
'use client'

import { AppProvider } from '@/context/AppContext'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SnackbarProvider } from 'notistack'
import { useState, useEffect } from 'react'
import { Button } from '@mui/material'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2F89FC' }, // Bright Blue
    secondary: { main: '#30E3CA' }, // Cyan
    text: { primary: '#40514E' }, // Dark Teal
    background: { default: '#FFFFFF', paper: '#F5F5F5' },
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2F89FC' },
    secondary: { main: '#30E3CA' },
    text: { primary: '#E2E8F0' },
    background: { default: '#1A202C', paper: '#2D3748' },
  },
})

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AppProvider>
          <Button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            sx={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}
          >
            Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
          {children}
        </AppProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}