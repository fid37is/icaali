'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  TrendingUp,
} from '@mui/icons-material';
import { BannerAd } from '../AdComponents';
import { useApp } from '../../context/AppProvider';

const AppFooter = () => {
  const { isAuthenticated } = useApp();
  const [email, setEmail] = React.useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const footerLinks = {
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
    features: [
      { label: 'Revenue Sharing', href: '/revenue' },
      { label: 'Categories', href: '/categories' },
      { label: 'Local News', href: '/local' },
      { label: 'Trending', href: '/trending' },
    ],
    community: [
      { label: 'Guidelines', href: '/guidelines' },
      { label: 'Feedback', href: '/feedback' },
      { label: 'Blog', href: '/blog' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook />, href: 'https://facebook.com/icaali', label: 'Facebook' },
    { icon: <Twitter />, href: 'https://twitter.com/icaali', label: 'Twitter' },
    { icon: <Instagram />, href: 'https://instagram.com/icaali', label: 'Instagram' },
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/icaali', label: 'LinkedIn' },
    { icon: <YouTube />, href: 'https://youtube.com/icaali', label: 'YouTube' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#fff',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        mt: 'auto',
      }}
    >
      {/* Footer Ad */}
      {isAuthenticated && (
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <BannerAd position="footer" size="leaderboard" />
        </Container>
      )}

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Brand and Newsletter */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUp sx={{ color: '#2FACFE', fontSize: 24 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: '#1a1a1a',
                }}
              >
                iCaali
              </Typography>
            </Box>
            
            <Typography variant="body2" color="#666" sx={{ mb: 3, lineHeight: 1.5, fontSize: '0.875rem' }}>
              Stay informed with location-based news and earn rewards through our 
              innovative ad revenue sharing program.
            </Typography>

            {/* Newsletter Signup */}
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
              Newsletter
            </Typography>
            <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.875rem',
                    height: 36,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#2FACFE',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2,
                  minHeight: 36,
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#1E8FE0',
                    boxShadow: 'none',
                  },
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>

          {/* Footer Links */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {Object.entries(footerLinks).map(([category, links]) => (
                <Grid item xs={6} sm={3} key={category}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      fontWeight: 600,
                      color: '#1a1a1a',
                      textTransform: 'capitalize',
                      fontSize: '0.875rem',
                    }}
                  >
                    {category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        underline="none"
                        sx={{
                          color: '#666',
                          fontSize: '0.8125rem',
                          py: 0.25,
                          '&:hover': {
                            color: '#2FACFE',
                          },
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Copyright */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="body2" color="#666" sx={{ fontSize: '0.8125rem' }}>
              © {new Date().getFullYear()} iCaali. All rights reserved.
            </Typography>
            {isAuthenticated && (
              <Typography variant="caption" sx={{ color: '#2FACFE', fontSize: '0.75rem', display: 'block', mt: 0.25 }}>
                Revenue sharing active
              </Typography>
            )}
          </Box>

          {/* Social Links */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {socialLinks.map((social) => (
              <IconButton
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                size="small"
                sx={{
                  color: '#666',
                  '&:hover': {
                    color: '#2FACFE',
                    backgroundColor: 'rgba(47, 172, 254, 0.08)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {React.cloneElement(social.icon, { fontSize: 'small' })}
              </IconButton>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AppFooter;