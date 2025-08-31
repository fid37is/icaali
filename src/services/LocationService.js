// services/locationService.js
class LocationService {
  // Get user's current location using browser geolocation API
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            
            // Get location details from coordinates
            const locationDetails = await this.reverseGeocode(coords);
            resolve({
              ...coords,
              ...locationDetails,
            });
          } catch (error) {
            console.warn('Reverse geocoding failed, returning coordinates only:', error);
            resolve(coords); // Return just coordinates if reverse geocoding fails
          }
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        options
      );
    });
  }

  // Get location with user permission handling
  async requestLocationPermission() {
    try {
      const permission = await this.checkLocationPermission();
      
      if (permission === 'denied') {
        throw new Error('Location permission denied');
      }
      
      if (permission === 'granted') {
        return this.getCurrentLocation();
      }
      
      // If prompt or unsupported, try to get location anyway
      return this.getCurrentLocation();
    } catch (error) {
      console.warn('Could not get user location:', error.message);
      throw error;
    }
  }

  // Reverse geocoding to get location details from coordinates
  async reverseGeocode(coords) {
    try {
      // Using a free geocoding service (you might want to use Google Maps API for production)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service error');
      }
      
      const data = await response.json();
      
      return {
        city: data.city || data.locality || '',
        state: data.principalSubdivision || '',
        country: data.countryName || '',
        countryCode: data.countryCode || '',
        formatted: this.formatLocation(data),
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        city: '',
        state: '',
        country: '',
        countryCode: '',
        formatted: 'Location unavailable',
      };
    }
  }

  // Format location for display
  formatLocation(locationData) {
    const parts = [];
    
    if (locationData.city || locationData.locality) {
      parts.push(locationData.city || locationData.locality);
    }
    
    if (locationData.principalSubdivision) {
      parts.push(locationData.principalSubdivision);
    }
    
    if (locationData.countryName) {
      parts.push(locationData.countryName);
    }
    
    return parts.join(', ') || 'Unknown Location';
  }

  // Get location from user input (city, state, country)
  async geocodeLocation(locationString) {
    try {
      // Note: You'll need an API key for production use
      // For now, this will work for testing but you should get an OpenCage API key
      const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo_key';
      
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationString)}&key=${apiKey}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service error');
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          city: result.components.city || result.components.town || '',
          state: result.components.state || result.components.province || '',
          country: result.components.country || '',
          countryCode: result.components.country_code || '',
          formatted: result.formatted,
        };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw new Error('Failed to geocode location: ' + error.message);
    }
  }

  // Check if location permissions are granted
  async checkLocationPermission() {
    if (!navigator.permissions) {
      return 'unsupported';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      return 'unsupported';
    }
  }

  // Get location from IP (fallback method)
  async getLocationFromIP() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('IP geolocation service error');
      }
      
      const data = await response.json();
      
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || '',
        state: data.region || '',
        country: data.country_name || '',
        countryCode: data.country_code || '',
        formatted: `${data.city}, ${data.region}, ${data.country_name}`,
      };
    } catch (error) {
      console.error('IP geolocation failed:', error);
      throw new Error('Failed to get location from IP: ' + error.message);
    }
  }

  // Calculate distance between two coordinates (in km)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get news radius based on location type
  getNewsRadius(locationType = 'city') {
    const radiusMap = {
      neighborhood: 5,    // 5km
      city: 50,          // 50km
      state: 200,        // 200km
      country: 1000,     // 1000km
      global: null,      // No radius limit
    };
    
    return radiusMap[locationType] || radiusMap.city;
  }

  // Get available locations for selection
  getLocationOptions() {
    return [
      { value: 'global', label: 'Global News', type: 'global' },
      { value: 'current', label: 'Use My Location', type: 'current' },
      { value: 'custom', label: 'Choose Location...', type: 'custom' },
    ];
  }

  // Popular cities/countries for manual selection
  getPopularLocations() {
    return [
      { country: 'United States', countryCode: 'US', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston'] },
      { country: 'United Kingdom', countryCode: 'GB', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool'] },
      { country: 'Nigeria', countryCode: 'NG', cities: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano'] },
      { country: 'Canada', countryCode: 'CA', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'] },
      { country: 'Australia', countryCode: 'AU', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'] },
      { country: 'India', countryCode: 'IN', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'] },
    ];
  }
}

export default new LocationService();