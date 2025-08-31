'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos,
  PlayArrow,
  LocationOn,
  Schedule,
  Visibility,
} from '@mui/icons-material';
import { useApp } from '../context/AppProvider';

const HeroSection = ({ featuredArticles = [], onReadMore }) => {
  const { location } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Auto-rotate slides
  useEffect(() => {
    if (!autoPlay || featuredArticles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => 
        prev === featuredArticles.length - 1 ? 0 : prev + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [autoPlay, featuredArticles.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === featuredArticles.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? featuredArticles.length - 1 : prev - 1
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!featuredArticles.length) {
    return null;
  }

  const currentArticle = featuredArticles[currentSlide];

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 300, md: 500 },
        overflow: 'hidden',
        borderRadius: 2,
        mb: 4,
      }}
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${currentArticle.imageUrl || '/api/placeholder/800/500'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
          },
        }}
      />

      {/* Content Overlay */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: { xs: 2, md: 4 },
          color: 'white',
        }}
      >
        {/* Category and Location */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={currentArticle.category}
            size="small"
            sx={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          {currentArticle.location && (
            <Chip
              icon={<LocationOn />}
              label={currentArticle.location.city || currentArticle.location.country}
              size="small"
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
              }}
            />
          )}
          <Chip
            label="BREAKING"
            size="small"
            sx={{
              backgroundColor: '#ff4444',
              color: 'white',
              fontWeight: 'bold',
              animation: 'pulse 2s infinite',
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant={isMobile ? 'h5' : 'h3'}
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            lineHeight: 1.2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {currentArticle.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            display: { xs: 'none', sm: 'block' },
            maxWidth: '70%',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {currentArticle.description}
        </Typography>

        {/* Meta Information */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 16 }} />
            <Typography variant="caption">
              {formatDate(currentArticle.publishedAt)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Visibility sx={{ fontSize: 16 }} />
            <Typography variant="caption">
              {currentArticle.views || 0} views
            </Typography>
          </Box>
          {currentArticle.source && (
            <Typography variant="caption">
              by {currentArticle.source.name}
            </Typography>
          )}
        </Box>

        {/* Action Button */}
        <Button
          variant="contained"
          size="large"
          onClick={(e) => {
            e.stopPropagation();
            onReadMore?.(currentArticle);
          }}
          sx={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            alignSelf: 'flex-start',
            '&:hover': {
              backgroundColor: '#1B6AD9',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Read Full Story
        </Button>
      </Box>

      {/* Navigation Arrows */}
      {featuredArticles.length > 1 && (
        <>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <ArrowBackIos />
          </IconButton>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </>
      )}

      {/* Slide Indicators */}
      {featuredArticles.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 3,
            display: 'flex',
            gap: 1,
          }}
        >
          {featuredArticles.map((_, index) => (
            <Box
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(index);
              }}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: 'white',
                  transform: 'scale(1.2)',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HeroSection;