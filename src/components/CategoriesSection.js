'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos,
  LocationOn,  
  TrendingUp,
  Gavel,
  Memory,
  Movie,
  LocalHospital,
  SportsSoccer,
  Sports,
  Business,
  Science,
  Theaters,
  HealthAndSafety,
  Computer,
  HowToVote,
  Schedule,
  Visibility,
} from '@mui/icons-material';
import { useApp } from '../context/AppProvider';

const CategoriesSection = ({ categoryNews = {}, onCategorySelect, onReadMore }) => {
  const { preferences } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const scrollRef = useRef(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const categories = [
    { id: 'all', label: 'All News', icon: <TrendingUp />, color: '#2F89FC' },
    { id: 'local', label: 'Local', icon: <LocationOn />, color: '#30E3CA' },
    { id: 'politics', label: 'Politics', icon: <Gavel />, color: '#FF6B6B' },
    { id: 'business', label: 'Business', icon: <Business />, color: '#4ECDC4' },
    { id: 'technology', label: 'Technology', icon: <Memory />, color: '#45B7D1' },
    { id: 'sports', label: 'Sports', icon: <SportsSoccer />, color: '#96CEB4' },
    { id: 'entertainment', label: 'Entertainment', icon: <Movie />, color: '#FFEAA7' },
    { id: 'health', label: 'Health', icon: <LocalHospital />, color: '#DDA0DD' },
    { id: 'science', label: 'Science', icon: <Science />, color: '#98D8C8' },
  ];

  // Check if scrolling is needed
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (scrollRef.current && !isMobile) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      } else {
        setShowScrollButtons(false);
      }
    };

    checkScrollNeeded();
    window.addEventListener('resize', checkScrollNeeded);
    
    return () => window.removeEventListener('resize', checkScrollNeeded);
  }, [isMobile]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    onCategorySelect?.(categoryId);
  };

  const scrollCategories = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getCategoryArticles = (categoryId) => {
    if (categoryId === 'all') {
      return Object.values(categoryNews).flat().slice(0, 4);
    }
    return categoryNews[categoryId] || [];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Categories Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative' }}>
        {/* Scroll Left Button */}
        {showScrollButtons && (
          <IconButton
            onClick={() => scrollCategories('left')}
            sx={{ 
              position: 'absolute',
              left: -10,
              zIndex: 2,
              backgroundColor: 'var(--surface)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': { 
                backgroundColor: 'var(--primary)', 
                color: 'white' 
              }
            }}
          >
            <ArrowBackIos />
          </IconButton>
        )}

        {/* Category Chips */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            mx: showScrollButtons ? 5 : 0,
            '&::-webkit-scrollbar': {
              height: 4,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'var(--surface)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'var(--primary)',
              borderRadius: 2,
            },
          }}
        >
          {categories.map((category) => (
            <Chip
              key={category.id}
              icon={category.icon}
              label={category.label}
              onClick={() => handleCategoryClick(category.id)}
              variant={selectedCategory === category.id ? 'filled' : 'outlined'}
              sx={{
                minWidth: 'fit-content',
                fontWeight: 'bold',
                backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                color: selectedCategory === category.id ? 'white' : 'var(--text)',
                borderColor: category.color,
                '&:hover': {
                  backgroundColor: category.color,
                  color: 'white',
                },
                '& .MuiChip-icon': {
                  color: selectedCategory === category.id ? 'white' : category.color,
                },
              }}
            />
          ))}
        </Box>

        {/* Scroll Right Button */}
        {showScrollButtons && (
          <IconButton
            onClick={() => scrollCategories('right')}
            sx={{ 
              position: 'absolute',
              right: -10,
              zIndex: 2,
              backgroundColor: 'var(--surface)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': { 
                backgroundColor: 'var(--primary)', 
                color: 'white' 
              }
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        )}
      </Box>

      {/* Category News Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {getCategoryArticles(selectedCategory).map((article, index) => (
          <Card
            key={article.id}
            onClick={() => onReadMore?.(article)}
            sx={{
              height: 280,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--surface)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              },
            }}
          >
            <CardMedia
              component="img"
              height="140"
              image={article.imageUrl || '/api/placeholder/300/140'}
              alt={article.title}
              sx={{ objectFit: 'cover' }}
            />
            
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography
                variant="body2"
                component="h3"
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  color: 'var(--text)',
                  lineHeight: 1.3,
                }}
              >
                {article.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                <Schedule sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(article.publishedAt)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                  <Visibility sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {article.views || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Show more button */}
      {getCategoryArticles(selectedCategory).length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => onCategorySelect?.(selectedCategory)}
            sx={{
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              fontWeight: 'bold',
              '&:hover': {
                borderColor: 'var(--primary)',
                backgroundColor: 'rgba(47, 137, 252, 0.1)',
              }
            }}
          >
            View All {categories.find(c => c.id === selectedCategory)?.label} News
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CategoriesSection;