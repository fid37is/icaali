'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  LocationOn,
  Refresh,
  Public,
} from '@mui/icons-material';
import { useApp } from '../context/AppProvider';
import newsService from '../services/newsService';
import locationService from '../services/LocationService';
import HeroSection from './HeroSection';
import CategoriesSection from './CategoriesSection';
import NewsCard from './NewsCard';
import { BannerAd, NativeAd } from './AdComponents';
import { SignInDialog, SignUpDialog } from './AuthDialogs';

const Homepage = () => {
  const {
    user,
    isAuthenticated,
    location,
    preferences,
    news,
    loading,
    error,
    setNews,
    setLoading,
    setError,
    setLocation,
  } = useApp();

  const [featuredNews, setFeaturedNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [categoryNews, setCategoryNews] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [preferences?.locationPreference, preferences?.selectedLocation, location]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Get user location if not available and location preference is 'current'
      if (!location && preferences?.locationPreference === 'current') {
        await getUserLocation();
      }

      // Load different types of news based on location preference
      await Promise.all([
        loadFeaturedNews(),
        loadTrendingNews(),
        loadLocationBasedNews(),
        loadCategoryNews(),
      ]);
    } catch (error) {
      setError('Failed to load news data');
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const userLocation = await locationService.getCurrentLocation();
      setLocation(userLocation);
    } catch (error) {
      // Try IP-based location as fallback
      try {
        const ipLocation = await locationService.getLocationFromIP();
        setLocation(ipLocation);
      } catch (ipError) {
        console.error('Failed to get location:', error, ipError);
      }
    }
  };

  const getEffectiveLocation = () => {
    switch (preferences?.locationPreference) {
      case 'global':
        return null; // No location filter for global news
      case 'current':
        return location;
      case 'custom':
        return preferences?.selectedLocation;
      default:
        return location; // Default fallback
    }
  };

  const loadFeaturedNews = async () => {
    try {
      const effectiveLocation = getEffectiveLocation();
      let featured;
      
      if (effectiveLocation) {
        featured = await newsService.fetchLocationBasedNews(effectiveLocation, preferences, 5);
      } else {
        // For global news, get top headlines without location filter
        featured = await newsService.fetchTrendingNews(5);
      }
      
      setFeaturedNews(featured.slice(0, 3)); // Top 3 for hero section
    } catch (error) {
      console.error('Failed to load featured news:', error);
    }
  };

  const loadTrendingNews = async () => {
    try {
      const trending = await newsService.fetchTrendingNews(8);
      setTrendingNews(trending);
    } catch (error) {
      console.error('Failed to load trending news:', error);
    }
  };

  const loadLocationBasedNews = async () => {
    try {
      const effectiveLocation = getEffectiveLocation();
      let locationNews;
      
      if (effectiveLocation) {
        locationNews = await newsService.fetchLocationBasedNews(effectiveLocation, preferences, 12);
      } else {
        // For global news, fetch general news without location filter
        locationNews = await newsService.fetchTrendingNews(12);
      }
      
      setNews(locationNews);
    } catch (error) {
      console.error('Failed to load location news:', error);
    }
  };

  const loadCategoryNews = async () => {
    try {
      const categories = ['politics', 'business', 'technology', 'sports', 'entertainment', 'health'];
      const effectiveLocation = getEffectiveLocation();
      
      const categoryPromises = categories.map(async (category) => {
        let categoryArticles;
        if (effectiveLocation) {
          // Try to get location-based category news first
          try {
            categoryArticles = await newsService.fetchLocationBasedCategoryNews(category, effectiveLocation, 4);
          } catch (error) {
            // Fallback to general category news
            categoryArticles = await newsService.fetchNewsByCategory(category, 4);
          }
        } else {
          categoryArticles = await newsService.fetchNewsByCategory(category, 4);
        }
        return { category, articles: categoryArticles };
      });

      const results = await Promise.all(categoryPromises);
      const categoryData = {};
      results.forEach(({ category, articles }) => {
        categoryData[category] = articles;
      });
      setCategoryNews(categoryData);
    } catch (error) {
      console.error('Failed to load category news:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleReadMore = (article) => {
    // Navigate to article page
    window.location.href = `/article/${article.id}`;
  };

  const handleCategorySelect = (categoryId) => {
    // Navigate to category page or filter news
    window.location.href = `/category/${categoryId}`;
  };

  const handleSwitchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const getLocationDisplayText = () => {
    switch (preferences?.locationPreference) {
      case 'global':
        return 'Global News';
      case 'current':
        return location ? `${location.city || location.formatted || 'Current Location'}` : 'Current Location';
      case 'custom':
        return preferences?.selectedLocation ? 
          `${preferences.selectedLocation.city || preferences.selectedLocation.formatted}` : 
          'Custom Location';
      default:
        return location ? `${location.city || location.formatted}` : 'Latest News';
    }
  };

  const getNewsHeaderText = () => {
    switch (preferences?.locationPreference) {
      case 'global':
        return 'Global News';
      case 'current':
        return location ? `News for ${location.city || location.country}` : 'Latest News';
      case 'custom':
        return preferences?.selectedLocation ? 
          `News for ${preferences.selectedLocation.city || preferences.selectedLocation.country}` : 
          'Latest News';
      default:
        return location ? `News for ${location.city || location.country}` : 'Latest News';
    }
  };

  if (loading && !news.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress size={40} sx={{ color: '#2FACFE' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 1.5 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Welcome Message for Authenticated Users */}
      {isAuthenticated && (
        <Box
          sx={{
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 2,
            p: 3,
            mb: 4,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1, fontSize: '1.125rem' }}>
            Welcome back, {user?.displayName || 'Reader'}
          </Typography>
          <Typography variant="body2" color="#666" sx={{ mb: 2, fontSize: '0.875rem' }}>
            You're earning with every ad interaction. Keep reading to increase your revenue.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={preferences?.locationPreference === 'global' ? <Public sx={{ fontSize: 16 }} /> : <LocationOn sx={{ fontSize: 16 }} />}
              label={getLocationDisplayText()}
              size="small"
              sx={{ 
                backgroundColor: '#f8f9fa', 
                color: '#666',
                fontSize: '0.75rem',
                height: 24,
              }}
            />
            <Chip
              label="Revenue Sharing Active"
              size="small"
              sx={{ 
                backgroundColor: '#2FACFE', 
                color: 'white',
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          </Box>
        </Box>
      )}

      {/* Top Banner Ad */}
      {isAuthenticated && <BannerAd position="top" size="leaderboard" />}

      {/* Hero Section */}
      <HeroSection 
        featuredArticles={featuredNews} 
        onReadMore={handleReadMore}
      />

      {/* Page Header with Location and Refresh */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 600,
              color: '#1a1a1a',
              mb: 0.5,
              fontSize: '1.5rem',
            }}
          >
            Latest News
          </Typography>
          <Typography variant="body2" color="#666" sx={{ fontSize: '0.875rem' }}>
            {preferences?.locationPreference === 'global' ? 
              'From around the world' : 
              `Personalized for ${getLocationDisplayText()}`
            }
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh sx={{ fontSize: 18 }} />}
          onClick={handleRefresh}
          disabled={refreshing}
          size="small"
          sx={{
            borderColor: 'rgba(0, 0, 0, 0.12)',
            color: '#666',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            py: 0.75,
            px: 2,
            borderRadius: 1.5,
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.2)',
              color: '#1a1a1a',
            },
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Categories Section */}
      <CategoriesSection
        categoryNews={categoryNews}
        onCategorySelect={handleCategorySelect}
        onReadMore={handleReadMore}
      />

      {/* Trending Section */}
      {trendingNews.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <TrendingUp sx={{ color: '#2FACFE', fontSize: 24 }} />
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '1.25rem' }}
            >
              Trending Now
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {trendingNews.map((article, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={article.id}>
                <NewsCard
                  article={article}
                  variant="trending"
                  onReadMore={handleReadMore}
                />
                {/* Insert native ad after every 4th trending article */}
                {(index + 1) % 4 === 0 && isAuthenticated && (
                  <Box sx={{ mt: 3 }}>
                    <NativeAd />
                  </Box>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Main News Grid */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            color: '#1a1a1a',
            mb: 3,
            fontSize: '1.25rem',
          }}
        >
          {getNewsHeaderText()}
        </Typography>

        <Grid container spacing={3}>
          {news.map((article, index) => (
            <React.Fragment key={article.id}>
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <NewsCard
                  article={article}
                  variant="default"
                  onReadMore={handleReadMore}
                />
              </Grid>
              
              {/* Insert native ad after every 6th article */}
              {(index + 1) % 6 === 0 && isAuthenticated && (
                <Grid item xs={12}>
                  <NativeAd />
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Grid>

        {/* Load More Button */}
        {news.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => {
                // Implement load more functionality
                console.log('Load more articles');
              }}
              sx={{
                backgroundColor: '#2FACFE',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 1.5,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1E8FE0',
                  boxShadow: 'none',
                },
              }}
            >
              Load More Articles
            </Button>
          </Box>
        )}
      </Box>

      {/* Bottom Banner Ad */}
      {isAuthenticated && <BannerAd position="bottom" size="leaderboard" />}

      {/* Call to Action for Non-Authenticated Users */}
      {!isAuthenticated && (
        <Box
          sx={{
            border: '1px solid #2FACFE',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1a1a1a',
              mb: 2,
              fontSize: '1.5rem',
            }}
          >
            Start Earning While You Read
          </Typography>
          <Typography
            variant="body1"
            color="#666"
            sx={{ mb: 3, maxWidth: 600, mx: 'auto', fontSize: '0.9375rem', lineHeight: 1.5 }}
          >
            Join our community and earn money from ad interactions while staying informed 
            with personalized, location-based news. It's free and takes less than a minute.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => setShowSignUp(true)}
              sx={{
                backgroundColor: '#2FACFE',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 1.5,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1E8FE0',
                  boxShadow: 'none',
                },
              }}
            >
              Sign Up Free
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                // Navigate to about/features page or show more info
                window.location.href = '/about';
              }}
              sx={{
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: '#666',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 1.5,
                '&:hover': {
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                  color: '#1a1a1a',
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      )}

      {/* Auth Dialogs */}
      <SignInDialog
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      <SignUpDialog
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </Box>
  );
};

export default Homepage;