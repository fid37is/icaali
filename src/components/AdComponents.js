'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useApp } from '../context/AppProvider';
import adService from '../services/AdService';

// Banner Ad Component
export const BannerAd = ({ 
  position = 'top', 
  size = 'leaderboard', // 'leaderboard', 'banner', 'rectangle'
  className = '' 
}) => {
  const { user, isAuthenticated, location } = useApp();
  const adRef = useRef(null);
  const adId = useRef(adService.generateAdId());

  const sizeMap = {
    leaderboard: { width: '728px', height: '90px' },
    banner: { width: '468px', height: '60px' },
    rectangle: { width: '300px', height: '250px' },
    mobile: { width: '320px', height: '50px' },
  };

  const adSize = sizeMap[size] || sizeMap.leaderboard;

  useEffect(() => {
    if (adRef.current && isAuthenticated) {
      // Track ad view when component mounts and is visible
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            adService.trackAdView(user.uid, adId.current, 'banner', location);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(adRef.current);
      return () => observer.disconnect();
    }
  }, [user, isAuthenticated, location]);

  const handleAdClick = () => {
    if (isAuthenticated && user) {
      adService.trackAdClick(user.uid, adId.current, 'banner', location);
    }
  };

  return (
    <Box
      ref={adRef}
      data-ad-id={adId.current}
      data-ad-type="banner"
      onClick={handleAdClick}
      className={`adsbygoogle ${className}`}
      sx={{
        width: '100%',
        maxWidth: adSize.width,
        height: adSize.height,
        backgroundColor: 'var(--surface)',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        margin: '16px auto',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          Sponsored Content
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: '200px',
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Ad Image
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'var(--primary)' }}>
          Premium Product
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Discover amazing deals and services tailored for your location.
        </Typography>
        {isAuthenticated && (
          <Chip
            label="Earn $0.002"
            size="small"
            sx={{
              backgroundColor: 'var(--secondary)',
              color: 'white',
              fontSize: '0.7rem',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

// Native Ad Component (appears within news feed)
export const NativeAd = ({ className = '' }) => {
  const { user, isAuthenticated, location } = useApp();
  const adRef = useRef(null);
  const adId = useRef(adService.generateAdId());

  useEffect(() => {
    if (adRef.current && isAuthenticated) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            adService.trackAdView(user.uid, adId.current, 'native', location);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(adRef.current);
      return () => observer.disconnect();
    }
  }, [user, isAuthenticated, location]);

  const handleAdClick = () => {
    if (isAuthenticated && user) {
      adService.trackAdClick(user.uid, adId.current, 'native', location);
    }
  };

  return (
    <Box
      ref={adRef}
      data-ad-id={adId.current}
      data-ad-type="native"
      onClick={handleAdClick}
      className={`adsbygoogle ${className}`}
      sx={{
        backgroundColor: 'var(--surface)',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        mb: 3,
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Sponsored Label */}
      <Chip
        label="Sponsored"
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: '#ffa726',
          color: 'white',
          fontSize: '0.7rem',
        }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Ad Image */}
        <Box
          sx={{
            width: 120,
            height: 80,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Ad
          </Typography>
        </Box>

        {/* Ad Content */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight="bold" sx={{ mb: 1, color: 'var(--primary)' }}>
            Special Offer: Get 50% Off Today!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Don't miss out on this limited-time offer. Click to learn more about our exclusive deals.
          </Typography>
          {isAuthenticated && (
            <Chip
              label="Earn $0.003"
              size="small"
              sx={{
                backgroundColor: 'var(--secondary)',
                color: 'white',
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Video Ad Component
export const VideoAd = ({ className = '' }) => {
  const { user, isAuthenticated, location } = useApp();
  const adRef = useRef(null);
  const adId = useRef(adService.generateAdId());

  useEffect(() => {
    if (adRef.current && isAuthenticated) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            adService.trackAdView(user.uid, adId.current, 'video', location);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(adRef.current);
      return () => observer.disconnect();
    }
  }, [user, isAuthenticated, location]);

  const handleAdClick = () => {
    if (isAuthenticated && user) {
      adService.trackAdClick(user.uid, adId.current, 'video', location);
    }
  };

  return (
    <Box
      ref={adRef}
      data-ad-id={adId.current}
      data-ad-type="video"
      onClick={handleAdClick}
      className={`adsbygoogle ${className}`}
      sx={{
        width: '100%',
        maxWidth: '600px',
        backgroundColor: 'var(--surface)',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        margin: '16px auto',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Video Container */}
      <Box
        sx={{
          width: '100%',
          height: '300px',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Typography variant="h4" sx={{ color: 'white' }}>
          ▶
        </Typography>
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          Video Ad
        </Typography>
      </Box>

      {/* Ad Info */}
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" fontWeight="bold" sx={{ mb: 1, color: 'var(--primary)' }}>
          Watch and Earn - Premium Content
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Watch this short video advertisement and earn rewards!
        </Typography>
        {isAuthenticated && (
          <Chip
            label="Earn $0.005"
            size="small"
            sx={{
              mt: 1,
              backgroundColor: 'var(--secondary)',
              color: 'white',
              fontSize: '0.7rem',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

// Floating Ad Component
export const FloatingAd = ({ className = '' }) => {
  const { user, isAuthenticated, location } = useApp();
  const [isVisible, setIsVisible] = React.useState(true);
  const adRef = useRef(null);
  const adId = useRef(adService.generateAdId());

  useEffect(() => {
    if (adRef.current && isAuthenticated && isVisible) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            adService.trackAdView(user.uid, adId.current, 'floating', location);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(adRef.current);
      return () => observer.disconnect();
    }
  }, [user, isAuthenticated, location, isVisible]);

  const handleAdClick = () => {
    if (isAuthenticated && user) {
      adService.trackAdClick(user.uid, adId.current, 'floating', location);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Box
      ref={adRef}
      data-ad-id={adId.current}
      data-ad-type="floating"
      onClick={handleAdClick}
      className={`adsbygoogle ${className}`}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: '320px',
        backgroundColor: 'var(--surface)',
        border: '2px solid var(--primary)',
        borderRadius: 2,
        p: 2,
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        animation: 'slideInUp 0.5s ease-out',
        '@keyframes slideInUp': {
          from: {
            transform: 'translateY(100%)',
            opacity: 0,
          },
          to: {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
      }}
    >
      {/* Close Button */}
      <Box
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#ff4444',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        ×
      </Box>

      <Typography variant="body1" fontWeight="bold" sx={{ mb: 1, color: 'var(--primary)' }}>
        Limited Time Offer!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click here for exclusive deals in your area.
      </Typography>
      {isAuthenticated && (
        <Chip
          label="Earn $0.004"
          size="small"
          sx={{
            backgroundColor: 'var(--secondary)',
            color: 'white',
            fontSize: '0.7rem',
          }}
        />
      )}
    </Box>
  );
};

// Sidebar Ad Component
export const SidebarAd = ({ className = '' }) => {
  const { user, isAuthenticated, location } = useApp();
  const adRef = useRef(null);
  const adId = useRef(adService.generateAdId());

  useEffect(() => {
    if (adRef.current && isAuthenticated) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            adService.trackAdView(user.uid, adId.current, 'sidebar', location);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(adRef.current);
      return () => observer.disconnect();
    }
  }, [user, isAuthenticated, location]);

  const handleAdClick = () => {
    if (isAuthenticated && user) {
      adService.trackAdClick(user.uid, adId.current, 'sidebar', location);
    }
  };

  return (
    <Box
      ref={adRef}
      data-ad-id={adId.current}
      data-ad-type="sidebar"
      onClick={handleAdClick}
      className={`adsbygoogle ${className}`}
      sx={{
        width: '300px',
        height: '600px',
        backgroundColor: 'var(--surface)',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        cursor: 'pointer',
        position: 'sticky',
        top: 20,
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Ad Content */}
      <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Sponsored Content
          </Typography>
          
          {/* Ad Image */}
          <Box
            sx={{
              width: '100%',
              height: '200px',
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Sidebar Ad
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mb: 1, color: 'var(--primary)' }}>
            Discover Local Services
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Find the best services and deals in your area. Limited time offers available now!
          </Typography>
        </Box>

        <Box>
          {/* Additional content sections */}
          <Box
            sx={{
              width: '100%',
              height: '120px',
              backgroundColor: '#f9f9f9',
              borderRadius: 1,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed #ccc',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Featured Content
            </Typography>
          </Box>

          {isAuthenticated && (
            <Chip
              label="Earn $0.003"
              size="small"
              sx={{
                backgroundColor: 'var(--secondary)',
                color: 'white',
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Ad Slot Component - Generic container for Google AdSense
export const AdSlot = ({ 
  slot, 
  format = 'auto',
  responsive = true,
  style = {},
  className = ''
}) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        ...style,
      }}
      data-ad-client="ca-pub-xxxxxxxxxx" // Replace with your AdSense ID
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
};