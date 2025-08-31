'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
} from '@mui/material';
import {
  Close,
  Google,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { useApp } from '../context/AppProvider';
import authService from '../services/authService';
import locationService from '../services/LocationService';

// Sign In Dialog Component
export const SignInDialog = ({ open, onClose, onSwitchToSignUp }) => {
  const { setUser, setError, setLocation } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    try {
      const user = await authService.signIn(email, password);
      const userData = await authService.getUserDocument(user.uid);
      setUser({ ...user, ...userData });
      
      // Get user location if not available
      if (!userData.location) {
        try {
          const location = await locationService.getCurrentLocation();
          await authService.updateUserLocation(user.uid, location);
          setLocation(location);
        } catch (locationError) {
          console.log('Could not get location:', locationError);
        }
      }
      
      onClose();
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLocalError('');

    try {
      const user = await authService.signInWithGoogle();
      const userData = await authService.getUserDocument(user.uid);
      setUser({ ...user, ...userData });
      onClose();
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.125rem' }}>
            Sign In
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#666' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
            {error}
          </Alert>
        )}

        {/* Google Sign In */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google sx={{ fontSize: 18 }} />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{
            mb: 2,
            py: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            borderColor: 'rgba(0, 0, 0, 0.12)',
            color: '#1a1a1a',
            borderRadius: 1.5,
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          Continue with Google
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="#666" sx={{ fontSize: '0.75rem' }}>
            or
          </Typography>
        </Divider>

        {/* Email Sign In Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            size="small"
            sx={{ 
              mb: 1.5,
              '& .MuiInputLabel-root': { fontSize: '0.875rem' },
              '& .MuiInputBase-input': { fontSize: '0.875rem' },
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="small"
            sx={{ 
              mb: 2,
              '& .MuiInputLabel-root': { fontSize: '0.875rem' },
              '& .MuiInputBase-input': { fontSize: '0.875rem' },
            }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mb: 2,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              backgroundColor: '#2FACFE',
              borderRadius: 1.5,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#1E8FE0',
                boxShadow: 'none',
              },
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Link href="#" variant="body2" sx={{ color: '#2FACFE', fontSize: '0.8125rem', textDecoration: 'none' }}>
            Forgot Password?
          </Link>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Typography variant="body2" color="#666" sx={{ fontSize: '0.8125rem' }}>
          Don't have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToSignUp}
            sx={{ color: '#2FACFE', textDecoration: 'none', fontSize: '0.8125rem' }}
          >
            Sign Up
          </Link>
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

// Sign Up Dialog Component
export const SignUpDialog = ({ open, onClose, onSwitchToSignIn }) => {
  const { setUser, setError, setLocation } = useApp();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setLocalError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      // Get user location first
      let location = null;
      try {
        location = await locationService.getCurrentLocation();
      } catch (locationError) {
        // Try IP-based location as fallback
        try {
          location = await locationService.getLocationFromIP();
        } catch (ipError) {
          console.log('Could not get location');
        }
      }

      const user = await authService.signUp(formData.email, formData.password, {
        displayName: formData.displayName,
        location: location,
        categories: [], // Default empty preferences
      });

      const userData = await authService.getUserDocument(user.uid);
      setUser({ ...user, ...userData });
      setLocation(location);
      onClose();
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setLocalError('');

    try {
      const user = await authService.signInWithGoogle();
      const userData = await authService.getUserDocument(user.uid);
      setUser({ ...user, ...userData });
      onClose();
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.125rem' }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="#666" sx={{ fontSize: '0.8125rem', mt: 0.25 }}>
              Start earning while staying informed
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#666' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
            {error}
          </Alert>
        )}

        {/* Google Sign Up */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google sx={{ fontSize: 18 }} />}
          onClick={handleGoogleSignUp}
          disabled={loading}
          sx={{
            mb: 2,
            py: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            borderColor: 'rgba(0, 0, 0, 0.12)',
            color: '#1a1a1a',
            borderRadius: 1.5,
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          Sign up with Google
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="#666" sx={{ fontSize: '0.75rem' }}>
            or
          </Typography>
        </Divider>

        {/* Email Sign Up Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.displayName}
            onChange={handleChange('displayName')}
            required
            size="small"
            sx={{ 
              mb: 1.5,
              '& .MuiInputLabel-root': { fontSize: '0.875rem' },
              '& .MuiInputBase-input': { fontSize: '0.875rem' },
            }}
          />

          <TextField
            fullWidth
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange('email')}
            required
            size="small"
            sx={{ 
              mb: 1.5,
              '& .MuiInputLabel-root': { fontSize: '0.875rem' },
              '& .MuiInputBase-input': { fontSize: '0.875rem' },
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={formData.password}
            onChange={handleChange('password')}
            required
            size="small"
            sx={{ 
              mb: 1.5,
              '& .MuiInputLabel-root': { fontSize: '0.875rem' },
              '& .MuiInputBase-input': { fontSize: '0.875rem' },
            }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              ),
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            required
            size="small"
            sx={{ 
              mb: 2,
              '& .MuiInputLabel-root': { fontSize: '0.875rem' },
              '& .MuiInputBase-input': { fontSize: '0.875rem' },
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                size="small"
                sx={{ color: '#2FACFE', p: 0.5 }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#666', lineHeight: 1.4 }}>
                I agree to the{' '}
                <Link href="/terms" sx={{ color: '#2FACFE', textDecoration: 'none' }}>
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" sx={{ color: '#2FACFE', textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </Typography>
            }
            sx={{ 
              mb: 2, 
              alignItems: 'flex-start',
              ml: 0,
              '& .MuiFormControlLabel-label': {
                pl: 1,
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mb: 1,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              backgroundColor: '#2FACFE',
              borderRadius: 1.5,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#1E8FE0',
                boxShadow: 'none',
              },
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Typography variant="body2" color="#666" sx={{ fontSize: '0.8125rem' }}>
          Already have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToSignIn}
            sx={{ color: '#2FACFE', textDecoration: 'none', fontSize: '0.8125rem' }}
          >
            Sign In
          </Link>
        </Typography>
      </DialogActions>
    </Dialog>
  );
};