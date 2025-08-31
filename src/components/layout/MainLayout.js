'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import { SidebarAd, FloatingAd } from '../AdComponents';
import { useApp } from '../../context/AppProvider';

const MainLayout = ({ children }) => {
  const { isAuthenticated } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Main Content Area */}
            <Grid item xs={12} lg={isMobile ? 12 : 9}>
              {children}
            </Grid>

            {/* Sidebar - Desktop Only */}
            {!isMobile && (
              <Grid item lg={3}>
                <Box
                  sx={{
                    position: 'sticky',
                    top: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  {/* Sidebar Ad */}
                  {isAuthenticated && <SidebarAd />}
                  
                  {/* Additional sidebar content can go here */}
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <AppFooter />

      {/* Floating Ad - Mobile Only */}
      {isMobile && isAuthenticated && <FloatingAd />}
    </Box>
  );
};

export default MainLayout;