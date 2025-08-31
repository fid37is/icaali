// services/adService.js
import { 
  doc, 
  updateDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

class AdService {
  // Track ad view interaction
  async trackAdView(userId, adId, adType = 'display', location = null) {
    try {
      const interaction = {
        userId,
        adId,
        type: 'view',
        adType, // 'display', 'video', 'native', etc.
        location,
        timestamp: serverTimestamp(),
        revenue: this.calculateViewRevenue(adType),
      };

      // Add interaction to collection
      await addDoc(collection(db, 'adInteractions'), interaction);

      // Update user's ad revenue
      await this.updateUserAdRevenue(userId, interaction.revenue, 'view');

      return interaction;
    } catch (error) {
      throw new Error('Failed to track ad view: ' + error.message);
    }
  }

  // Track ad click interaction
  async trackAdClick(userId, adId, adType = 'display', location = null) {
    try {
      const interaction = {
        userId,
        adId,
        type: 'click',
        adType,
        location,
        timestamp: serverTimestamp(),
        revenue: this.calculateClickRevenue(adType),
      };

      // Add interaction to collection
      await addDoc(collection(db, 'adInteractions'), interaction);

      // Update user's ad revenue
      await this.updateUserAdRevenue(userId, interaction.revenue, 'click');

      return interaction;
    } catch (error) {
      throw new Error('Failed to track ad click: ' + error.message);
    }
  }

  // Update user's ad revenue
  async updateUserAdRevenue(userId, amount, interactionType) {
    try {
      const userRef = doc(db, 'users', userId);
      const today = new Date().toISOString().split('T')[0];

      await updateDoc(userRef, {
        'adRevenue.totalEarnings': increment(amount),
        'adRevenue.todayEarnings': increment(amount),
        [`adRevenue.dailyStats.${today}.${interactionType}`]: increment(1),
        [`adRevenue.dailyStats.${today}.revenue`]: increment(amount),
        lastAdInteraction: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to update ad revenue: ' + error.message);
    }
  }

  // Calculate revenue for ad view
  calculateViewRevenue(adType) {
    const rates = {
      display: 0.001,    // $0.001 per view
      video: 0.005,      // $0.005 per view
      native: 0.002,     // $0.002 per view
      banner: 0.0005,    // $0.0005 per view
    };
    
    return rates[adType] || rates.display;
  }

  // Calculate revenue for ad click
  calculateClickRevenue(adType) {
    const rates = {
      display: 0.05,     // $0.05 per click
      video: 0.10,       // $0.10 per click
      native: 0.08,      // $0.08 per click
      banner: 0.03,      // $0.03 per click
    };
    
    return rates[adType] || rates.display;
  }

  // Get user's ad interaction history
  async getUserAdHistory(userId, limitCount = 100) {
    try {
      const interactionsRef = collection(db, 'adInteractions');
      const historyQuery = query(
        interactionsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(historyQuery);
      const interactions = [];
      
      querySnapshot.forEach((doc) => {
        interactions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return interactions;
    } catch (error) {
      throw new Error('Failed to get ad history: ' + error.message);
    }
  }

  // Get user's daily earnings
  async getDailyEarnings(userId, date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const interactionsRef = collection(db, 'adInteractions');
      
      const dailyQuery = query(
        interactionsRef,
        where('userId', '==', userId),
        where('timestamp', '>=', new Date(targetDate + 'T00:00:00')),
        where('timestamp', '<', new Date(targetDate + 'T23:59:59'))
      );

      const querySnapshot = await getDocs(dailyQuery);
      let totalEarnings = 0;
      let interactions = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalEarnings += data.revenue || 0;
        interactions++;
      });

      return {
        date: targetDate,
        earnings: totalEarnings,
        interactions,
      };
    } catch (error) {
      throw new Error('Failed to get daily earnings: ' + error.message);
    }
  }

  // Get top earning users (leaderboard)
  async getTopEarners(limitCount = 10) {
    try {
      const usersRef = collection(db, 'users');
      const topEarnersQuery = query(
        usersRef,
        orderBy('adRevenue.totalEarnings', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(topEarnersQuery);
      const topEarners = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        topEarners.push({
          id: doc.id,
          displayName: data.displayName || 'Anonymous',
          totalEarnings: data.adRevenue?.totalEarnings || 0,
          location: data.location?.formatted || 'Unknown',
        });
      });

      return topEarners;
    } catch (error) {
      throw new Error('Failed to get top earners: ' + error.message);
    }
  }

  // Initialize ad tracking for the session
  initializeAdTracking() {
    // Track when ads come into view
    this.setupIntersectionObserver();
    
    // Track ad clicks
    this.setupClickTracking();
  }

  // Setup intersection observer for ad views
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const adElement = entry.target;
          const adId = adElement.dataset.adId;
          const adType = adElement.dataset.adType || 'display';
          
          if (adId && !adElement.dataset.viewed) {
            // Mark as viewed to prevent multiple tracking
            adElement.dataset.viewed = 'true';
            
            // Dispatch custom event for ad view
            window.dispatchEvent(new CustomEvent('adView', {
              detail: { adId, adType }
            }));
          }
        }
      });
    }, {
      threshold: 0.5, // Ad must be 50% visible
      rootMargin: '0px'
    });

    // Observe all ad elements
    document.querySelectorAll('[data-ad-id]').forEach((ad) => {
      observer.observe(ad);
    });

    return observer;
  }

  // Setup click tracking for ads
  setupClickTracking() {
    document.addEventListener('click', (event) => {
      const adElement = event.target.closest('[data-ad-id]');
      if (adElement) {
        const adId = adElement.dataset.adId;
        const adType = adElement.dataset.adType || 'display';
        
        // Dispatch custom event for ad click
        window.dispatchEvent(new CustomEvent('adClick', {
          detail: { adId, adType }
        }));
      }
    });
  }

  // Generate unique ad ID
  generateAdId() {
    return `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get ad configuration based on user location and preferences
  getAdConfig(userLocation, userPreferences) {
    const config = {
      targeting: {
        geo: {
          country: userLocation?.countryCode || 'US',
          region: userLocation?.state || '',
          city: userLocation?.city || '',
        },
        interests: userPreferences?.categories || [],
        demographic: {
          language: 'en',
        },
      },
      formats: ['display', 'native', 'video'],
      positions: ['header', 'sidebar', 'inline', 'footer'],
    };

    return config;
  }

  // Request ad payout
  async requestPayout(userId, amount, paymentMethod) {
    try {
      const payoutRequest = {
        userId,
        amount,
        paymentMethod, // 'paypal', 'bank', 'crypto', etc.
        status: 'pending',
        requestedAt: serverTimestamp(),
        processedAt: null,
      };

      const docRef = await addDoc(collection(db, 'payoutRequests'), payoutRequest);
      
      return {
        id: docRef.id,
        ...payoutRequest,
      };
    } catch (error) {
      throw new Error('Failed to request payout: ' + error.message);
    }
  }

  // Get payout history
  async getPayoutHistory(userId, limitCount = 20) {
    try {
      const payoutsRef = collection(db, 'payoutRequests');
      const historyQuery = query(
        payoutsRef,
        where('userId', '==', userId),
        orderBy('requestedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(historyQuery);
      const payouts = [];
      
      querySnapshot.forEach((doc) => {
        payouts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return payouts;
    } catch (error) {
      throw new Error('Failed to get payout history: ' + error.message);
    }
  }
}

export default new AdService();