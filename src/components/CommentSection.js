'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Collapse,
} from '@mui/material';
import {
  Send,
  ThumbUp,
  ThumbUpOutlined,
  Reply,
  MoreVert,
  Flag,
  Delete,
  Edit,
  ExpandMore,
  ExpandLess,
  Sort,
} from '@mui/icons-material';
import { useApp } from '../context/AppProvider';
import newsService from '../services/newsService';

const CommentsSection = ({ articleId, commentsCount }) => {
  const { user, isAuthenticated, setError } = useApp();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, popular
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadComments();
  }, [articleId, sortBy]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsData = await newsService.fetchArticleComments(articleId, sortBy);
      setComments(commentsData);
    } catch (error) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await newsService.submitComment(articleId, newComment, user);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      setError('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      setError('Please sign in to like comments');
      return;
    }

    try {
      const isLiked = await newsService.toggleCommentLike(commentId, user.uid);
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: isLiked,
            likes: isLiked ? comment.likes + 1 : comment.likes - 1,
          };
        }
        return comment;
      }));
    } catch (error) {
      setError('Failed to like comment');
    }
  };

  const handleReply = async (parentId) => {
    if (!isAuthenticated || !replyText.trim()) return;

    setSubmitting(true);
    try {
      const reply = await newsService.submitReply(articleId, parentId, replyText, user);
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
            replyCount: (comment.replyCount || 0) + 1,
          };
        }
        return comment;
      }));
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      setError('Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await newsService.editComment(commentId, editText);
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: editText, edited: true };
        }
        return comment;
      }));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      setError('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await newsService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      setError('Failed to delete comment');
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);

    return (
      <Box sx={{ mb: isReply ? 1 : 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Avatar
            src={comment.user?.photoURL}
            sx={{ width: isReply ? 28 : 36, height: isReply ? 28 : 36 }}
          >
            {comment.user?.displayName?.charAt(0) || 'U'}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Comment Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', fontSize: isReply ? '0.8rem' : '0.875rem' }}
              >
                {comment.user?.displayName || 'Anonymous'}
              </Typography>
              {comment.user?.verified && (
                <Chip
                  label="Verified"
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.65rem',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                  }}
                />
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                {formatDate(comment.createdAt)}
              </Typography>
              {comment.edited && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.65rem', fontStyle: 'italic' }}
                >
                  (edited)
                </Typography>
              )}
            </Box>

            {/* Comment Content */}
            {editingComment === comment.id ? (
              <Box sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Edit your comment..."
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleEditComment(comment.id)}
                    disabled={!editText.trim()}
                    sx={{ textTransform: 'none' }}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingComment(null);
                      setEditText('');
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  lineHeight: 1.5,
                  fontSize: isReply ? '0.8rem' : '0.875rem',
                  wordBreak: 'break-word',
                }}
              >
                {comment.content}
              </Typography>
            )}

            {/* Comment Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => handleLikeComment(comment.id)}
                disabled={!isAuthenticated}
                sx={{
                  color: comment.liked ? 'var(--primary)' : 'text.secondary',
                  p: 0.5,
                }}
              >
                {comment.liked ? <ThumbUp sx={{ fontSize: 16 }} /> : <ThumbUpOutlined sx={{ fontSize: 16 }} />}
              </IconButton>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {comment.likes || 0}
              </Typography>

              {!isReply && (
                <Button
                  size="small"
                  startIcon={<Reply sx={{ fontSize: 14 }} />}
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    p: 0.5,
                  }}
                >
                  Reply
                </Button>
              )}

              {/* Comment menu */}
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ p: 0.5, ml: 'auto' }}
              >
                <MoreVert sx={{ fontSize: 16 }} />
              </IconButton>

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                {user?.uid === comment.user?.uid ? (
                  [
                    <MenuItem
                      key="edit"
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditText(comment.content);
                        setMenuAnchor(null);
                      }}
                    >
                      <Edit sx={{ mr: 1, fontSize: 16 }} />
                      Edit
                    </MenuItem>,
                    <MenuItem
                      key="delete"
                      onClick={() => {
                        handleDeleteComment(comment.id);
                        setMenuAnchor(null);
                      }}
                    >
                      <Delete sx={{ mr: 1, fontSize: 16 }} />
                      Delete
                    </MenuItem>
                  ]
                ) : (
                  <MenuItem
                    onClick={() => {
                      // Report comment functionality
                      setMenuAnchor(null);
                    }}
                  >
                    <Flag sx={{ mr: 1, fontSize: 16 }} />
                    Report
                  </MenuItem>
                )}
              </Menu>
            </Box>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid rgba(0,0,0,0.1)' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user?.displayName || 'this comment'}...`}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyText.trim() || submitting}
                    sx={{ textTransform: 'none' }}
                  >
                    {submitting ? <CircularProgress size={16} /> : 'Reply'}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  onClick={() => toggleReplies(comment.id)}
                  startIcon={expandedComments.has(comment.id) ? <ExpandLess /> : <ExpandMore />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                  }}
                >
                  {expandedComments.has(comment.id) ? 'Hide' : 'Show'} {comment.replies.length} 
                  {comment.replies.length === 1 ? ' reply' : ' replies'}
                </Button>

                <Collapse in={expandedComments.has(comment.id)}>
                  <Box sx={{ mt: 1, pl: 2, borderLeft: '2px solid rgba(0,0,0,0.1)' }}>
                    {comment.replies.map((reply) => (
                      <CommentItem key={reply.id} comment={reply} isReply={true} />
                    ))}
                  </Box>
                </Collapse>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mt: 3 }}>
      {/* Comments Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
          Comments ({commentsCount})
        </Typography>

        {/* Sort Options */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sort sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {['newest', 'oldest', 'popular'].map((sort) => (
              <Button
                key={sort}
                size="small"
                variant={sortBy === sort ? 'contained' : 'text'}
                onClick={() => setSortBy(sort)}
                sx={{
                  textTransform: 'capitalize',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: sortBy === sort ? 'var(--primary)' : 'transparent',
                  '&:hover': {
                    backgroundColor: sortBy === sort ? '#1E8FE0' : 'rgba(47, 172, 254, 0.05)',
                  },
                }}
              >
                {sort}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Comment Form */}
      {isAuthenticated ? (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar
              src={user?.photoURL}
              sx={{ width: 36, height: 36 }}
            >
              {user?.displayName?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this article..."
                variant="outlined"
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {newComment.length}/500 characters
                </Typography>
                <Button
                  variant="contained"
                  endIcon={submitting ? <CircularProgress size={16} /> : <Send />}
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting || newComment.length > 500}
                  sx={{
                    backgroundColor: 'var(--primary)',
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                  }}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: 'rgba(47, 172, 254, 0.05)',
            border: '1px solid rgba(47, 172, 254, 0.2)',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            Join the conversation! Sign in to comment and engage with other readers.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              // Trigger sign in dialog
              window.location.href = '/signin';
            }}
            sx={{
              backgroundColor: 'var(--primary)',
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Sign In to Comment
          </Button>
        </Paper>
      )}

      {/* Comments List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            No comments yet. Be the first to share your thoughts!
          </Typography>
          {!isAuthenticated && (
            <Button
              variant="outlined"
              onClick={() => {
                window.location.href = '/signin';
              }}
              sx={{ textTransform: 'none' }}
            >
              Sign In to Comment
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <CommentItem comment={comment} />
              {/* Native ad every 5 comments for authenticated users */}
              {(index + 1) % 5 === 0 && isAuthenticated && index < comments.length - 1 && (
                <Box sx={{ my: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <NativeAd size="small" />
                  <Divider sx={{ mt: 2 }} />
                </Box>
              )}
              {index < comments.length - 1 && <Divider sx={{ my: 2 }} />}
            </React.Fragment>
          ))}

          {/* Load More Comments */}
          {comments.length >= 10 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  // Load more comments
                  console.log('Load more comments');
                }}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Load More Comments
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Comment Guidelines */}
      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          Community Guidelines: Please keep comments respectful and on-topic. 
          Personal attacks, spam, and off-topic discussions may be removed.
        </Typography>
      </Box>
    </Paper>
  );
};

export default CommentsSection;