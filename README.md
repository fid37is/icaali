# iCaali - Earn While You Read

A modern news reading application with geolocation-based news filtering and ad revenue sharing. Built with Next.js, Firebase, and Material-UI.

## Features

- 🌍 **Location-based News**: Get personalized news based on your location
- 💰 **Revenue Sharing**: Earn money through ad interactions
- 🔐 **Firebase Authentication**: Secure sign-up/sign-in with email or Google
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI**: Beautiful interface with dark/light theme support
- ⚡ **Real-time Updates**: Live news feed with automatic refresh
- 📊 **Analytics Dashboard**: Track your earnings and interactions
- 🔍 **Search & Filter**: Find news by categories, location, and keywords

## Tech Stack

- **Frontend**: Next.js 14, React 18, Material-UI 5, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Functions, Storage)
- **Monetization**: Google AdSense integration
- **Location Services**: Browser Geolocation API, IP Geolocation
- **News APIs**: NewsAPI, ContextualWeb
- **Deployment**: Vercel (recommended)

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Homepage
├── components/            # React components
│   ├── AdComponents.js    # Ad-related components
│   ├── Header.js          # Navigation header
│   ├── Footer.js          # Site footer
│   ├── Homepage.js        # Main homepage component
│   ├── NewsCard.js        # Individual news item
│   ├── HeroSection.js     # Featured news carousel
│   ├── CategoriesSection.js # News categories
│   ├── MainLayout.js      # Main app layout wrapper
│   └── AuthComponents.js  # Sign in/up dialogs
├── context/
│   └── AppProvider.js     # Global state management
├── services/              # API and business logic
│   ├── authService.js     # Authentication
│   ├── newsService.js     # News data management
│   ├── locationService.js # Location services
│   └── adService.js       # Ad tracking and revenue
├── lib/
│   └── firebase.js        # Firebase configuration
└── utils/                 # Utility functions
```

## Key Components

### 1. AppProvider Context
Manages global application state including user authentication, location data, news articles, and ad revenue tracking.

### 2. Authentication System
- Email/password and Google OAuth sign-in
- Automatic user document creation in Firestore
- Location detection and storage

### 3. News Management
- Fetches news from multiple APIs
- Filters by user location and preferences
- Caches articles in Firestore
- Supports categories, trending, and search

### 4. Ad Revenue System
- Tracks ad views and clicks
- Calculates user earnings
- Supports multiple ad types (banner, native, video)
- Real-time revenue updates

### 5. Location Services
- Browser geolocation API
- IP-based fallback location
- Reverse geocoding for readable addresses
- Location-based news filtering

## Configuration

### Environment Variables

Required environment variables (see `.env.local.example`):

- `NEXT_PUBLIC_FIREBASE_*` - Firebase configuration
- `NEXT_PUBLIC_NEWS_API_KEY` - NewsAPI.org API key
- `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID` - AdSense publisher ID
- `NEXT_PUBLIC_OPENCAGE_API_KEY` - Location geocoding service

### Firebase Setup

1. **Authentication Providers**:
   - Email/Password
   - Google OAuth

2. **Firestore Collections**:
   - `users` - User profiles and preferences
   - `news` - Cached news articles
   - `adInteractions` - User ad interaction history
   - `payoutRequests` - Revenue payout requests

3. **Cloud Functions** (optional):
   - News aggregation from external APIs
   - Ad revenue calculations
   - Notification sending

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

## Ad Revenue Model

### Revenue Rates (Configurable)

- **Display Ads**: $0.001 per view, $0.05 per click
- **Video Ads**: $0.005 per view, $0.10 per click
- **Native Ads**: $0.002 per view, $0.08 per click

### Payout System

Users can request payouts when they reach minimum thresholds:
- Minimum payout: $10
- Payment methods: PayPal, Bank Transfer
- Processing time: 5-7 business days

## API Integration

### News Sources

- **NewsAPI.org**: Global news from thousands of sources
- **ContextualWeb**: Real-time news aggregation
- Custom RSS feed parsers (future enhancement)

### Location Services

- **Browser Geolocation**: Primary location detection
- **IP Geolocation**: Fallback location service
- **OpenCage**: Reverse geocoding for addresses
