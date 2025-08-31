'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import newsService from '../services/newsService';
import locationService from '../services/LocationService';

// Initial state - defaults to global news
const initialState = {
  user: null,
  isAuthenticated: false,
  location: null,
  locationLoading: false,
  preferences: {
    categories: [],
    locationPreference: 'global', // Default to global news
    selectedLocation: null,
  },
  news: [],
  newsLoading: false,
  error: null,
  adRevenue: {
    totalEarnings: 0,
    todayEarnings: 0,
    interactionHistory: [],
  },
  theme: 'light',
  initialized: false,
};

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_NEWS_LOADING: 'SET_NEWS_LOADING',
  SET_LOCATION_LOADING: 'SET_LOCATION_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_LOCATION: 'SET_LOCATION',
  SET_PREFERENCES: 'SET_PREFERENCES',
  SET_NEWS: 'SET_NEWS',
  UPDATE_AD_REVENUE: 'UPDATE_AD_REVENUE',
  ADD_AD_INTERACTION: 'ADD_AD_INTERACTION',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_INITIALIZED: 'SET_INITIALIZED',
  LOGOUT: 'LOGOUT',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ActionTypes.SET_NEWS_LOADING:
      return {
        ...state,
        newsLoading: action.payload,
      };
    case ActionTypes.SET_LOCATION_LOADING:
      return {
        ...state,
        locationLoading: action.payload,
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case ActionTypes.SET_LOCATION:
      return {
        ...state,
        location: action.payload,
      };
    case ActionTypes.SET_PREFERENCES:
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    case ActionTypes.SET_NEWS:
      return {
        ...state,
        news: action.payload,
      };
    case ActionTypes.UPDATE_AD_REVENUE:
      return {
        ...state,
        adRevenue: {
          ...state.adRevenue,
          ...action.payload,
        },
      };
    case ActionTypes.ADD_AD_INTERACTION:
      return {
        ...state,
        adRevenue: {
          ...state.adRevenue,
          interactionHistory: [
            ...state.adRevenue.interactionHistory,
            action.payload,
          ],
        },
      };
    case ActionTypes.TOGGLE_THEME:
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light',
      };
    case ActionTypes.SET_INITIALIZED:
      return {
        ...state,
        initialized: action.payload,
      };
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        theme: state.theme, // Preserve theme preference
        initialized: true, // Keep initialized status
      };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Initialize app - load global news first, get location in background
  useEffect(() => {
    if (!state.initialized) {
      initializeApp();
    }
  }, [state.initialized]);

  // Actions
  const setUser = (user) => dispatch({ type: ActionTypes.SET_USER, payload: user });
  const setLoading = (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  const setNewsLoading = (loading) => dispatch({ type: ActionTypes.SET_NEWS_LOADING, payload: loading });
  const setLocationLoading = (loading) => dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: loading });
  const setError = (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  const setLocation = (location) => dispatch({ type: ActionTypes.SET_LOCATION, payload: location });
  const setPreferences = (preferences) => dispatch({ type: ActionTypes.SET_PREFERENCES, payload: preferences });
  const setNews = (news) => dispatch({ type: ActionTypes.SET_NEWS, payload: news });
  const updateAdRevenue = (revenue) => dispatch({ type: ActionTypes.UPDATE_AD_REVENUE, payload: revenue });
  const addAdInteraction = (interaction) => dispatch({ type: ActionTypes.ADD_AD_INTERACTION, payload: interaction });
  const toggleTheme = () => dispatch({ type: ActionTypes.TOGGLE_THEME });
  const setInitialized = (initialized) => dispatch({ type: ActionTypes.SET_INITIALIZED, payload: initialized });
  const logout = () => dispatch({ type: ActionTypes.LOGOUT });

  // Initialize the app
  const initializeApp = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load global news immediately - don't wait for location
      await loadNews({ location: null }); // Explicitly pass null for global news
      
      // Get user location in background without blocking the UI
      getLocationInBackground();
      
      setInitialized(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  // Get location in background without affecting news loading
  const getLocationInBackground = async () => {
    try {
      // Check if we can get location from IP first (faster, no permission needed)
      const ipLocation = await locationService.getLocationFromIP();
      setLocation(ipLocation);
    } catch (error) {
      console.log('Could not get IP location, will offer manual location selection');
      // Don't set error here - location is optional
    }
  };

  // Load news based on current preferences
  const loadNews = async (options = {}) => {
    try {
      setNewsLoading(true);
      setError(null);

      // Determine which location to use based on preference
      let newsLocation = null;
      
      if (options.location !== undefined) {
        // Explicit location override (used for global news on init)
        newsLocation = options.location;
      } else {
        // Use preference-based location
        switch (state.preferences.locationPreference) {
          case 'current':
            newsLocation = state.location;
            break;
          case 'custom':
            newsLocation = state.preferences.selectedLocation;
            break;
          case 'global':
          default:
            newsLocation = null; // Global news
            break;
        }
      }

      const newsOptions = {
        location: newsLocation,
        category: options.category || null,
        trending: options.trending || false,
        limit: options.limit || 20,
        searchTerm: options.searchTerm || null,
        ...options
      };

      const articles = await newsService.getNews(newsOptions);
      setNews(articles);
    } catch (error) {
      console.error('Failed to load news:', error);
      setError('Failed to load news. Please try again.');
    } finally {
      setNewsLoading(false);
    }
  };

  // Request user location (only when user explicitly wants it)
  const requestLocation = async () => {
    try {
      setLocationLoading(true);
      setError(null);
      
      const userLocation = await locationService.requestLocationPermission();
      setLocation(userLocation);
      
      // Only reload news if user has location preference set to current
      if (state.preferences.locationPreference === 'current') {
        await loadNews();
      }
      
      return userLocation;
    } catch (error) {
      console.error('Failed to get location:', error);
      setError('Could not access your location. You can still browse global news or manually select a location.');
      
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // Set custom location
  const setCustomLocation = async (locationString) => {
    try {
      setLocationLoading(true);
      setError(null);
      
      const customLocation = await locationService.geocodeLocation(locationString);
      setPreferences({ 
        locationPreference: 'custom',
        selectedLocation: customLocation 
      });
      
      // Reload news with new location
      await loadNews();
      
      return customLocation;
    } catch (error) {
      console.error('Failed to set custom location:', error);
      setError('Could not find the specified location. Please try again.');
      throw error;
    } finally {
      setLocationLoading(false);
    }
  };

  // Update location preference
  const updateLocationPreference = async (preference) => {
    try {
      setPreferences({ locationPreference: preference });
      
      // Handle different preference types
      if (preference === 'global') {
        // Load global news
        await loadNews({ location: null });
      } else if (preference === 'current') {
        // Request location if not available, then load location-based news
        if (!state.location) {
          await requestLocation();
        } else {
          await loadNews();
        }
      } else if (preference === 'custom' && state.preferences.selectedLocation) {
        // Load news for custom location
        await loadNews();
      }
    } catch (error) {
      console.error('Failed to update location preference:', error);
      setError('Failed to update location preference');
    }
  };

  // Search news (always global search unless user has location preference)
  const searchNews = async (searchTerm) => {
    try {
      setNewsLoading(true);
      setError(null);
      
      const articles = await newsService.searchNews(searchTerm, {
        location: state.preferences.locationPreference === 'global' ? null : 
                 state.preferences.locationPreference === 'current' ? state.location :
                 state.preferences.selectedLocation
      });
      setNews(articles);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setNewsLoading(false);
    }
  };

  // Load news by category
  const loadNewsByCategory = async (category) => {
    try {
      setNewsLoading(true);
      setError(null);
      
      await loadNews({ category });
    } catch (error) {
      console.error('Failed to load category news:', error);
      setError('Failed to load news for this category');
    }
  };

  // Load trending news
  const loadTrendingNews = async () => {
    try {
      setNewsLoading(true);
      setError(null);
      
      await loadNews({ trending: true });
    } catch (error) {
      console.error('Failed to load trending news:', error);
      setError('Failed to load trending news');
    }
  };

  // Refresh news
  const refreshNews = async () => {
    await loadNews();
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    // State
    ...state,
    
    // Basic actions
    setUser,
    setLoading,
    setNewsLoading,
    setLocationLoading,
    setError,
    clearError,
    setLocation,
    setPreferences,
    setNews,
    updateAdRevenue,
    addAdInteraction,
    toggleTheme,
    logout,
    
    // Complex actions
    loadNews,
    requestLocation,
    setCustomLocation,
    updateLocationPreference,
    searchNews,
    loadNewsByCategory,
    loadTrendingNews,
    refreshNews,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};