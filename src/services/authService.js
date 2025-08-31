// services/authService.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const googleProvider = new GoogleAuthProvider();

class AuthService {
  // Sign up with email and password
  async signUp(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      if (userData.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }

      // Create user document in Firestore
      await this.createUserDocument(user.uid, {
        email: user.email,
        displayName: userData.displayName || '',
        location: userData.location || null,
        preferences: {
          categories: userData.categories || [],
          locationPreference: userData.locationPreference || null,
        },
        adRevenue: {
          totalEarnings: 0,
          todayEarnings: 0,
          interactionHistory: [],
        },
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last active
      await this.updateLastActive(userCredential.user.uid);
      
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user document exists
      const userDoc = await this.getUserDocument(user.uid);
      
      if (!userDoc) {
        // Create new user document for Google sign-in
        await this.createUserDocument(user.uid, {
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          location: null,
          preferences: {
            categories: [],
            locationPreference: null,
          },
          adRevenue: {
            totalEarnings: 0,
            todayEarnings: 0,
            interactionHistory: [],
          },
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        });
      } else {
        // Update last active
        await this.updateLastActive(user.uid);
      }

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Create user document in Firestore
  async createUserDocument(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, userData);
      return userData;
    } catch (error) {
      throw new Error('Failed to create user document: ' + error.message);
    }
  }

  // Get user document from Firestore
  async getUserDocument(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      throw new Error('Failed to get user document: ' + error.message);
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        preferences: preferences,
        lastActive: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error('Failed to update preferences: ' + error.message);
    }
  }

  // Update user location
  async updateUserLocation(userId, location) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        location: location,
        lastActive: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error('Failed to update location: ' + error.message);
    }
  }

  // Update last active timestamp
  async updateLastActive(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastActive: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update last active:', error);
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService();