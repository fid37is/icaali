'use client';

import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Menu,
    MenuItem,
    Avatar,
    Box,
    TextField,
    InputAdornment,
    Chip,
    useMediaQuery,
    useTheme,
    CircularProgress,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    AccountCircle,
    Brightness4,
    Brightness7,
    Menu as MenuIcon,
    LocationOn,
    Notifications,
    TrendingUp,
    Public,
    MyLocation,
    Check,
    KeyboardArrowDown,
} from '@mui/icons-material';
import { useApp } from '../../context/AppProvider';
import authService from '../../services/authService';
import locationService from '../../services/LocationService';
import { SignInDialog, SignUpDialog } from '../AuthDialogs';

const AppHeader = () => {
    const {
        user,
        isAuthenticated,
        location,
        locationLoading,
        preferences,
        theme,
        adRevenue,
        toggleTheme,
        setError,
        updateLocationPreference,
        setCustomLocation,
        requestLocation,
    } = useApp();

    const [anchorEl, setAnchorEl] = useState(null);
    const [locationMenuAnchor, setLocationMenuAnchor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [customLocationInput, setCustomLocationInput] = useState('');
    const [customLocationMode, setCustomLocationMode] = useState(false);
    const [customLocationLoading, setCustomLocationLoading] = useState(false);

    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLocationMenuOpen = (event) => {
        setLocationMenuAnchor(event.currentTarget);
    };

    const handleLocationMenuClose = () => {
        setLocationMenuAnchor(null);
        setCustomLocationMode(false);
        setCustomLocationInput('');
    };

    const handleSignOut = async () => {
        try {
            await authService.signOut();
            handleMenuClose();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        if (searchTerm.trim()) {
            console.log('Searching for:', searchTerm);
        }
    };

    const formatEarnings = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handleSwitchToSignUp = () => {
        setShowSignIn(false);
        setShowSignUp(true);
    };

    const handleSwitchToSignIn = () => {
        setShowSignUp(false);
        setShowSignIn(true);
    };

    // Location preference handlers
    const handleLocationPreferenceChange = async (newPreference) => {
        try {
            if (newPreference === 'current' && !location) {
                await requestLocation();
            } else {
                await updateLocationPreference(newPreference);
            }
            handleLocationMenuClose();
        } catch (error) {
            console.error('Failed to change location preference:', error);
        }
    };

    const handleCustomLocationSubmit = async (e) => {
        e.preventDefault();
        if (!customLocationInput.trim()) return;

        try {
            setCustomLocationLoading(true);
            await setCustomLocation(customLocationInput.trim());
            handleLocationMenuClose();
        } catch (error) {
            // Error is already handled in setCustomLocation
        } finally {
            setCustomLocationLoading(false);
        }
    };

    const handlePopularLocationClick = async (locationString) => {
        try {
            setCustomLocationLoading(true);
            await setCustomLocation(locationString);
            handleLocationMenuClose();
        } catch (error) {
            // Error is already handled in setCustomLocation
        } finally {
            setCustomLocationLoading(false);
        }
    };

    const getCurrentLocationLabel = () => {
        switch (preferences.locationPreference) {
            case 'global':
                return 'Global News';
            case 'current':
                return location ? 
                    `${location.city || location.formatted || 'Current Location'}` : 
                    'Use My Location';
            case 'custom':
                return preferences.selectedLocation ? 
                    `${preferences.selectedLocation.city || preferences.selectedLocation.formatted}` :
                    'Custom Location';
            default:
                return 'Select Location';
        }
    };

    const popularLocations = locationService.getPopularLocations();

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: '#fff',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    color: '#1a1a1a',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', gap: 2, py: 0.5, minHeight: '64px' }}>
                    {/* Logo and Brand */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp sx={{ color: '#2FACFE', fontSize: 24 }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                color: '#1a1a1a',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            iCaali
                        </Typography>
                    </Box>

                    {/* Search Bar - Desktop */}
                    {!isMobile && (
                        <Box
                            component="form"
                            onSubmit={handleSearch}
                            sx={{ flexGrow: 1, maxWidth: 400, mx: 3 }}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search headlines..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#666', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        borderRadius: 1.5,
                                        border: '1px solid rgba(0, 0, 0, 0.12)',
                                        '&:hover': {
                                            borderColor: 'rgba(0, 0, 0, 0.2)',
                                        },
                                        '&.Mui-focused': {
                                            borderColor: '#2FACFE',
                                        },
                                        '& input': {
                                            fontSize: '0.875rem',
                                        },
                                        height: 36,
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Location Selector - Replaces the old location chip */}
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLocationMenuOpen}
                        endIcon={<KeyboardArrowDown />}
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            color: '#666',
                            textTransform: 'none',
                            minWidth: 150,
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            height: 28,
                            '&:hover': {
                                borderColor: '#2FACFE',
                                backgroundColor: 'rgba(47, 172, 254, 0.04)',
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {preferences.locationPreference === 'global' ? (
                                <Public sx={{ fontSize: 14 }} />
                            ) : (
                                <LocationOn sx={{ fontSize: 14 }} />
                            )}
                            {getCurrentLocationLabel()}
                        </Box>
                    </Button>

                    {/* Right Side Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Theme Toggle */}
                        <IconButton
                            onClick={toggleTheme}
                            size="small"
                            sx={{
                                color: '#666',
                                '&:hover': {
                                    color: '#1a1a1a',
                                },
                            }}
                        >
                            {theme === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                        </IconButton>

                        {/* Mobile Search */}
                        {isMobile && (
                            <IconButton
                                size="small"
                                sx={{
                                    color: '#666',
                                    '&:hover': {
                                        backgroundColor: '#f1f3f4',
                                    },
                                }}
                            >
                                <SearchIcon fontSize="small" />
                            </IconButton>
                        )}

                        {/* Notifications */}
                        {isAuthenticated && (
                            <IconButton
                                size="small"
                                sx={{
                                    color: '#666',
                                    position: 'relative',
                                    '&:hover': {
                                        backgroundColor: '#f1f3f4',
                                    },
                                }}
                            >
                                <Notifications fontSize="small" />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 6,
                                        right: 6,
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: '#2FACFE',
                                    }}
                                />
                            </IconButton>
                        )}

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {/* Earnings Display */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        display: { xs: 'none', sm: 'block' },
                                        fontSize: '0.75rem',
                                        color: '#2FACFE',
                                        fontWeight: 600,
                                    }}
                                >
                                    {formatEarnings(adRevenue.todayEarnings)}
                                </Typography>

                                <IconButton
                                    onClick={handleProfileMenuOpen}
                                    size="small"
                                    sx={{ p: 0 }}
                                >
                                    <Avatar
                                        src={user?.photoURL}
                                        alt={user?.displayName}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            backgroundColor: '#f1f3f4',
                                            color: '#666',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                                    </Avatar>
                                </IconButton>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => setShowSignIn(true)}
                                    sx={{
                                        color: '#666',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        textTransform: 'none',
                                        px: 2,
                                        py: 0.5,
                                        minHeight: 32,
                                        '&:hover': {
                                            backgroundColor: '#f1f3f4',
                                            color: '#1a1a1a',
                                        },
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setShowSignUp(true)}
                                    sx={{
                                        backgroundColor: '#2FACFE',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        textTransform: 'none',
                                        px: 2,
                                        py: 0.5,
                                        minHeight: 32,
                                        boxShadow: 'none',
                                        '&:hover': {
                                            backgroundColor: '#1E8FE0',
                                            boxShadow: 'none',
                                        },
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}

                        {/* Mobile Menu */}
                        <IconButton
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            size="small"
                            sx={{
                                display: { md: 'none' },
                                color: '#666',
                                '&:hover': {
                                    backgroundColor: '#f1f3f4',
                                },
                            }}
                        >
                            <MenuIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Toolbar>

                {/* Mobile Search */}
                {isMobile && (
                    <Box sx={{ px: 2, pb: 1.5 }}>
                        <form onSubmit={handleSearch}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search headlines..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#666', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        borderRadius: 1.5,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(0, 0, 0, 0.12)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(0, 0, 0, 0.2)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#2FACFE',
                                        },
                                        height: 36,
                                    }
                                }}
                            />
                        </form>
                    </Box>
                )}
            </AppBar>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        backgroundColor: '#fff',
                        minWidth: 200,
                        borderRadius: 2,
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        mt: 0.5,
                    }
                }}
            >
                <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                            {user?.displayName || 'User'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                            {formatEarnings(adRevenue.totalEarnings)} earned
                        </Typography>
                    </Box>
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ py: 1, fontSize: '0.875rem', color: '#1a1a1a' }}>
                    Profile
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ py: 1, fontSize: '0.875rem', color: '#1a1a1a' }}>
                    Preferences
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ py: 1, fontSize: '0.875rem', color: '#1a1a1a' }}>
                    Earnings
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ py: 1, fontSize: '0.875rem', color: '#1a1a1a' }}>
                    Settings
                </MenuItem>
                <MenuItem
                    onClick={handleSignOut}
                    sx={{
                        py: 1,
                        fontSize: '0.875rem',
                        color: '#dc3545',
                        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                        mt: 0.5,
                    }}
                >
                    Sign Out
                </MenuItem>
            </Menu>

            {/* Location Selector Menu */}
            <Menu
                anchorEl={locationMenuAnchor}
                open={Boolean(locationMenuAnchor)}
                onClose={handleLocationMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        minWidth: 280,
                        maxWidth: 400,
                        borderRadius: 2,
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }
                }}
            >
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="#1a1a1a">
                        Choose News Location
                    </Typography>
                    <Typography variant="caption" color="#666">
                        Select where you want to see news from
                    </Typography>
                </Box>

                {/* Global News Option */}
                <MenuItem
                    onClick={() => handleLocationPreferenceChange('global')}
                    sx={{ py: 1.5 }}
                >
                    <ListItemIcon>
                        <Public sx={{ color: preferences.locationPreference === 'global' ? '#2FACFE' : 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    Global News
                                </Typography>
                                <Typography variant="caption" color="#666">
                                    News from around the world
                                </Typography>
                            </Box>
                            {preferences.locationPreference === 'global' && (
                                <Check sx={{ color: '#2FACFE', fontSize: 20 }} />
                            )}
                        </Box>
                    </ListItemText>
                </MenuItem>

                {/* Current Location Option */}
                <MenuItem
                    onClick={() => handleLocationPreferenceChange('current')}
                    sx={{ py: 1.5 }}
                    disabled={locationLoading}
                >
                    <ListItemIcon>
                        {locationLoading ? (
                            <CircularProgress size={20} />
                        ) : (
                            <MyLocation sx={{ color: preferences.locationPreference === 'current' ? '#2FACFE' : 'inherit' }} />
                        )}
                    </ListItemIcon>
                    <ListItemText>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    Use My Location
                                </Typography>
                                <Typography variant="caption" color="#666">
                                    {location ? location.formatted : 'Detect your current location'}
                                </Typography>
                            </Box>
                            {preferences.locationPreference === 'current' && (
                                <Check sx={{ color: '#2FACFE', fontSize: 20 }} />
                            )}
                        </Box>
                    </ListItemText>
                </MenuItem>

                <Divider />

                {/* Custom Location Section */}
                {!customLocationMode ? (
                    <MenuItem
                        onClick={() => setCustomLocationMode(true)}
                        sx={{ py: 1.5 }}
                    >
                        <ListItemIcon>
                            <SearchIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body2" fontWeight="medium">
                                Choose Specific Location
                            </Typography>
                            <Typography variant="caption" color="#666">
                                Search for any city or country
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                ) : (
                    <Box sx={{ p: 2 }}>
                        <form onSubmit={handleCustomLocationSubmit}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Enter city, state, or country..."
                                value={customLocationInput}
                                onChange={(e) => setCustomLocationInput(e.target.value)}
                                disabled={customLocationLoading}
                                InputProps={{
                                    endAdornment: customLocationLoading ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <IconButton type="submit" size="small">
                                            <SearchIcon />
                                        </IconButton>
                                    ),
                                }}
                                sx={{ mb: 1 }}
                            />
                        </form>
                        <Button
                            size="small"
                            onClick={() => setCustomLocationMode(false)}
                            sx={{ color: '#666' }}
                        >
                            Cancel
                        </Button>
                    </Box>
                )}

                {/* Popular Locations */}
                {!customLocationMode && (
                    <>
                        <Divider />
                        <Box sx={{ p: 2 }}>
                            <Typography variant="caption" color="#666" sx={{ mb: 1, display: 'block' }}>
                                Popular Locations
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {popularLocations.slice(0, 3).map((locationGroup) =>
                                    locationGroup.cities.slice(0, 2).map((city) => (
                                        <Chip
                                            key={`${city}-${locationGroup.countryCode}`}
                                            label={`${city}, ${locationGroup.countryCode}`}
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handlePopularLocationClick(`${city}, ${locationGroup.country}`)}
                                            sx={{
                                                fontSize: '0.75rem',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(47, 172, 254, 0.1)',
                                                    borderColor: '#2FACFE',
                                                },
                                            }}
                                        />
                                    ))
                                )}
                            </Box>
                        </Box>
                    </>
                )}

                {/* Current Selection Indicator */}
                {preferences.selectedLocation && preferences.locationPreference === 'custom' && (
                    <>
                        <Divider />
                        <Box sx={{ p: 2, backgroundColor: 'rgba(47, 172, 254, 0.04)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn sx={{ color: '#2FACFE', fontSize: 16 }} />
                                <Typography variant="caption" color="#2FACFE" fontWeight="medium">
                                    Currently showing news for: {preferences.selectedLocation.formatted}
                                </Typography>
                            </Box>
                        </Box>
                    </>
                )}
            </Menu>

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
        </>
    );
};

export default AppHeader;