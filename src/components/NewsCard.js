'use client';

import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Chip,
  Box,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  Comment,
  Visibility,
  Schedule,
  LocationOn,
  MoreVert,
} from '@mui/icons-material';
import { useApp } from '../context/AppProvider';
import newsService from '../services/newsService';

const NewsCard = ({ article, variant = 'default', onReadMore, index }) => {
  const { user, isAuthenticated, setError } = useApp();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(article.likes || 0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setError('Please sign in to like articles');
      return;
    }

    setLoading(true);
    try {
      const isLiked = await newsService.toggleArticleLike(article.id, user.uid);
      setLiked(isLiked);
      setLikes(prev => isLiked ? prev + 1 : prev - 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/article/${article.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Show success feedback (you could implement a toast here)
        console.log('Link copied to clipboard');
      } catch (error) {
        console.log('Failed to copy link');
      }
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    onReadMore?.(article);
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

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Responsive card dimensions and layout
  const getCardConfig = () => {
    const configs = {
      featured: {
        height: isMobile ? 350 : 450,
        imageHeight: isMobile ? 150 : 200,
        titleVariant: isMobile ? 'h6' : 'h5',
        titleLines: 3,
        descriptionLines: isMobile ? 2 : 3,
        showFullDescription: true,
      },
      trending: {
        height: isMobile ? 280 : 320,
        imageHeight: isMobile ? 120 : 140,
        titleVariant: 'body1',
        titleLines: 2,
        descriptionLines: 2,
        showFullDescription: !isMobile,
      },
      compact: {
        height: isMobile ? 200 : 220,
        imageHeight: isMobile ? 80 : 100,
        titleVariant: 'body2',
        titleLines: 2,
        descriptionLines: 1,
        showFullDescription: false,
      },
      list: {
        height: 'auto',
        imageHeight: isMobile ? 80 : 100,
        titleVariant: 'body1',
        titleLines: isMobile ? 2 : 3,
        descriptionLines: isMobile ? 1 : 2,
        showFullDescription: !isMobile,
        horizontal: true,
      },
      default: {
        height: isMobile ? 300 : 360,
        imageHeight: isMobile ? 120 : 160,
        titleVariant: isMobile ? 'body1' : 'h6',
        titleLines: 2,
        descriptionLines: 2,
        showFullDescription: true,
      },
    };
    return configs[variant] || configs.default;
  };

  const config = getCardConfig();

  // List/horizontal layout for mobile
  if (config.horizontal && isMobile) {
    return (
      <Card
        sx={{
          display: 'flex',
          backgroundColor: 'var(--surface)',
          mb: 2,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
          cursor: 'pointer',
        }}
        onClick={() => onReadMore?.(article)}
      >
        {/* Image */}
        <CardMedia
          component="img"
          sx={{ width: 100, height: config.imageHeight, objectFit: 'cover' }}
          image={article.imageUrl || '/api/placeholder/200/150'}
          alt={article.title}
        />

        {/* Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <CardContent sx={{ flex: 1, p: 1.5, pb: 0 }}>
            {/* Category */}
            <Chip
              label={article.category}
              size="small"
              sx={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '0.625rem',
                height: 20,
                mb: 1,
              }}
            />

            {/* Title */}
            <Typography
              variant="body2"
              component="h3"
              sx={{
                fontWeight: 'bold',
                mb: 0.5,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: 'var(--text)',
                fontSize: '0.875rem',
              }}
            >
              {article.title}
            </Typography>

            {/* Meta */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {formatDate(article.publishedAt)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {formatNumber(article.views || 0)} views
              </Typography>
            </Box>
          </CardContent>

          {/* Actions */}
          <CardActions sx={{ p: 1, pt: 0, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={handleLike} disabled={loading}>
                {liked ? 
                  <Favorite sx={{ fontSize: 16, color: '#e91e63' }} /> : 
                  <FavoriteBorder sx={{ fontSize: 16 }} />
                }
              </IconButton>
              <IconButton size="small" onClick={handleShare}>
                <Share sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" onClick={handleComment}>
                <Comment sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {formatNumber(likes)}
            </Typography>
          </CardActions>
        </Box>
      </Card>
    );
  }

  // Standard card layout
  return (
    <Card
      sx={{
        height: config.height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--surface)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
        cursor: 'pointer',
        borderRadius: 2,
        overflow: 'hidden',
      }}
      onClick={() => onReadMore?.(article)}
    >
      {/* Article Image */}
      <CardMedia
        component="img"
        height={config.imageHeight}
        image={article.imageUrl || '/api/placeholder/400/200'}
        alt={article.title}
        sx={{
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
        }}
      />

      {/* Card Content */}
      <CardContent sx={{ 
        flexGrow: 1, 
        p: isMobile ? 1.5 : 2,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Category and Location */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1,
          gap: 1,
        }}>
          <Chip
            label={article.category}
            size="small"
            sx={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              height: isMobile ? 20 : 24,
              fontWeight: 500,
            }}
          />
          {article.location && !isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 12, color: 'var(--secondary)' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {article.location.city || article.location.country}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Title */}
        <Typography
          variant={config.titleVariant}
          component="h3"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: config.titleLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'var(--text)',
            fontSize: isMobile ? '0.875rem' : undefined,
            flex: variant === 'compact' ? 1 : 'none',
          }}
        >
          {article.title}
        </Typography>

        {/* Description */}
        {config.showFullDescription && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: config.descriptionLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1,
              lineHeight: 1.4,
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              flex: 1,
            }}
          >
            {article.description}
          </Typography>
        )}

        {/* Source and Date */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 1,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <Avatar
              src={article.source?.logo}
              sx={{ width: isMobile ? 16 : 20, height: isMobile ? 16 : 20 }}
            >
              {article.source?.name?.charAt(0)}
            </Avatar>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: { xs: '80px', sm: '120px' },
              }}
            >
              {article.source?.name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: isMobile ? 10 : 12, color: 'text.secondary' }} />
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
            >
              {formatDate(article.publishedAt)}
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? 1 : 2,
          justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ fontSize: isMobile ? 12 : 14, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
              >
                {formatNumber(article.views || 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Favorite sx={{ fontSize: isMobile ? 12 : 14, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
              >
                {formatNumber(likes)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Comment sx={{ fontSize: isMobile ? 12 : 14, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
              >
                {formatNumber(article.comments || 0)}
              </Typography>
            </Box>
          </Box>
          
          {/* Reading time estimate */}
          {!isMobile && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.7rem' }}
            >
              {Math.max(1, Math.ceil((article.content?.length || 0) / 1000))} min read
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Card Actions */}
      <CardActions sx={{ 
        justifyContent: 'space-between', 
        px: isMobile ? 1.5 : 2, 
        pb: isMobile ? 1.5 : 2,
        pt: 0,
      }}>
        <Box sx={{ display: 'flex', gap: isMobile ? 0.25 : 0.5 }}>
          <Tooltip title={liked ? 'Unlike' : 'Like'}>
            <IconButton
              onClick={handleLike}
              disabled={loading}
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                color: liked ? '#e91e63' : 'var(--text)',
                '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.1)' },
                p: isMobile ? 0.5 : 1,
              }}
            >
              {liked ? 
                <Favorite sx={{ fontSize: isMobile ? 16 : 20 }} /> : 
                <FavoriteBorder sx={{ fontSize: isMobile ? 16 : 20 }} />
              }
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton
              onClick={handleShare}
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                color: 'var(--text)',
                '&:hover': { backgroundColor: 'rgba(47, 137, 252, 0.1)' },
                p: isMobile ? 0.5 : 1,
              }}
            >
              <Share sx={{ fontSize: isMobile ? 16 : 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Comments">
            <IconButton
              onClick={handleComment}
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                color: 'var(--text)',
                '&:hover': { backgroundColor: 'rgba(48, 227, 202, 0.1)' },
                p: isMobile ? 0.5 : 1,
              }}
            >
              <Comment sx={{ fontSize: isMobile ? 16 : 20 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          size={isMobile ? 'small' : 'medium'}
          variant="text"
          onClick={(e) => {
            e.stopPropagation();
            onReadMore?.(article);
          }}
          sx={{
            color: 'var(--primary)',
            fontWeight: 'bold',
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            textTransform: 'none',
            px: isMobile ? 1 : 2,
            '&:hover': {
              backgroundColor: 'rgba(47, 137, 252, 0.1)',
            }
          }}
        >
          Read More
        </Button>
      </CardActions>
    </Card>
  );
};

export default NewsCard;