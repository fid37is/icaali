// services/newsService.js
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

class NewsService {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  // Fetch news from external API
  async fetchFromExternalAPI(options = {}) {
    try {
      if (!this.apiKey) {
        console.warn('No external API key found, skipping external news fetch');
        return [];
      }

      const {
        location = null,
        category = null,
        searchTerm = null,
        trending = false,
        limit: limitCount = 20
      } = options;

      let endpoint = trending ? '/top-headlines' : '/everything';
      const params = new URLSearchParams();

      // Set basic parameters
      params.append('apiKey', this.apiKey);
      params.append('pageSize', Math.min(limitCount, 100).toString());
      params.append('sortBy', trending ? 'popularity' : 'publishedAt');

      // Handle search term
      if (searchTerm) {
        if (endpoint === '/top-headlines') {
          params.append('q', searchTerm);
        } else {
          params.append('q', searchTerm);
        }
      }

      // Handle category
      if (category && endpoint === '/top-headlines') {
        params.append('category', category.toLowerCase());
      }

      // Handle location
      if (location && location.countryCode) {
        params.append('country', location.countryCode.toLowerCase());
      } else if (!location && endpoint === '/top-headlines') {
        // Default to all countries for top headlines
        params.append('language', 'en');
      }

      // If using /everything endpoint without search, add some default query
      if (endpoint === '/everything' && !searchTerm) {
        params.append('q', category || 'news');
        params.append('language', 'en');
        params.append('sortBy', 'publishedAt');
      }

      const url = `${this.baseUrl}${endpoint}?${params.toString()}`;
      console.log('Fetching from external API:', url.replace(this.apiKey, 'HIDDEN_KEY'));

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`API Error: ${data.message || 'Unknown error'}`);
      }

      // Transform external API data to match our internal format
      return data.articles.map(article => ({
        id: this.generateId(article.url),
        title: article.title,
        description: article.description,
        content: article.content,
        imageUrl: article.urlToImage,
        publishedAt: new Date(article.publishedAt),
        source: {
          name: article.source?.name || 'Unknown',
          url: article.source?.url || article.url,
        },
        category: category || this.inferCategory(article),
        location: location || { country: 'Global' },
        url: article.url,
        views: 0,
        likes: 0,
        comments: 0,
        isExternal: true, // Flag to identify external articles
      })).filter(article => 
        article.title && 
        article.title !== '[Removed]' && 
        article.description
      );
    } catch (error) {
      console.error('Error fetching from external API:', error);
      return [];
    }
  }

  // Fetch news from Firestore
  async fetchFromFirestore(options = {}) {
    try {
      const {
        location = null,
        category = null,
        trending = false,
        limit: limitCount = 20
      } = options;

      const newsRef = collection(db, 'news');
      let newsQuery;
      
      if (trending) {
        newsQuery = query(
          newsRef,
          orderBy('publishedAt', 'desc'),
          limit(limitCount)
        );
      } else if (category) {
        newsQuery = query(
          newsRef,
          where('category', '==', category),
          orderBy('publishedAt', 'desc'),
          limit(limitCount)
        );
      } else if (location && location.country && location.country !== 'Global') {
        newsQuery = query(
          newsRef,
          where('location.country', '==', location.country),
          orderBy('publishedAt', 'desc'),
          limit(limitCount)
        );
      } else {
        // Global news from Firestore
        newsQuery = query(
          newsRef,
          orderBy('publishedAt', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(newsQuery);
      const articles = [];
      
      querySnapshot.forEach((doc) => {
        articles.push({
          id: doc.id,
          ...doc.data(),
          isExternal: false, // Flag to identify Firestore articles
        });
      });

      console.log(`Fetched ${articles.length} articles from Firestore`);
      return articles;
    } catch (error) {
      console.error('Error fetching from Firestore:', error);
      return [];
    }
  }

  // Main method to get news from both sources
  async getNews(options = {}) {
    try {
      const { limit: limitCount = 20 } = options;
      
      console.log('Fetching news with options:', options);

      // Fetch from both sources simultaneously
      const [firestoreArticles, externalArticles] = await Promise.allSettled([
        this.fetchFromFirestore(options),
        this.fetchFromExternalAPI(options)
      ]);

      // Process results
      const firestoreNews = firestoreArticles.status === 'fulfilled' ? firestoreArticles.value : [];
      const externalNews = externalArticles.status === 'fulfilled' ? externalArticles.value : [];

      console.log(`Found ${firestoreNews.length} Firestore articles, ${externalNews.length} external articles`);

      // Combine and deduplicate articles
      const combinedArticles = [
        ...firestoreNews,
        ...externalNews
      ];

      // Remove duplicates based on title similarity
      const uniqueArticles = this.removeDuplicates(combinedArticles);

      // Sort by publication date (most recent first)
      uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      // Return requested number of articles
      const finalArticles = uniqueArticles.slice(0, limitCount);
      console.log(`Returning ${finalArticles.length} combined articles`);

      return finalArticles;
    } catch (error) {
      console.error('Error in getNews:', error);
      throw new Error('Failed to fetch news: ' + error.message);
    }
  }

  // Search across both sources
  async searchNews(searchTerm, options = {}) {
    try {
      const { limit: limitCount = 20 } = options;
      
      if (!searchTerm || searchTerm.trim() === '') {
        return this.getNews({ limit: limitCount });
      }

      console.log('Searching for:', searchTerm);

      // Search both sources
      const [firestoreResults, externalResults] = await Promise.allSettled([
        this.searchFirestore(searchTerm, limitCount),
        this.fetchFromExternalAPI({ ...options, searchTerm, limit: limitCount })
      ]);

      const firestoreArticles = firestoreResults.status === 'fulfilled' ? firestoreResults.value : [];
      const externalArticles = externalResults.status === 'fulfilled' ? externalResults.value : [];

      // Combine and deduplicate
      const combinedResults = [...firestoreArticles, ...externalArticles];
      const uniqueResults = this.removeDuplicates(combinedResults);

      // Sort by relevance/date
      uniqueResults.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      return uniqueResults.slice(0, limitCount);
    } catch (error) {
      console.error('Error searching news:', error);
      throw new Error('Failed to search news: ' + error.message);
    }
  }

  // Search Firestore specifically
  async searchFirestore(searchTerm, limitCount = 20) {
    try {
      const newsRef = collection(db, 'news');
      const searchQuery = query(
        newsRef,
        orderBy('publishedAt', 'desc'),
        limit(limitCount * 2)
      );

      const querySnapshot = await getDocs(searchQuery);
      const articles = [];
      const searchTermLower = searchTerm.toLowerCase();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          (data.title && data.title.toLowerCase().includes(searchTermLower)) ||
          (data.description && data.description.toLowerCase().includes(searchTermLower)) ||
          (data.content && data.content.toLowerCase().includes(searchTermLower))
        ) {
          articles.push({
            id: doc.id,
            ...data,
            isExternal: false,
          });
        }
      });

      return articles.slice(0, limitCount);
    } catch (error) {
      console.error('Error searching Firestore:', error);
      return [];
    }
  }

  // Remove duplicate articles based on title similarity
  removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const normalizedTitle = article.title?.toLowerCase().replace(/[^\w\s]/g, '').trim();
      if (!normalizedTitle || seen.has(normalizedTitle)) {
        return false;
      }
      seen.add(normalizedTitle);
      return true;
    });
  }

  // Generate consistent ID for external articles
  generateId(url) {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  }

  // Infer category from article content
  inferCategory(article) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = title + ' ' + description;

    const categories = {
      'business': ['business', 'economy', 'market', 'finance', 'stock', 'company'],
      'technology': ['technology', 'tech', 'ai', 'software', 'digital', 'cyber'],
      'health': ['health', 'medical', 'medicine', 'healthcare', 'disease', 'vaccine'],
      'sports': ['sports', 'football', 'basketball', 'soccer', 'olympics', 'game'],
      'entertainment': ['entertainment', 'movie', 'music', 'celebrity', 'film', 'show'],
      'science': ['science', 'research', 'study', 'discovery', 'space', 'climate'],
      'politics': ['politics', 'government', 'election', 'policy', 'president', 'minister']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  // Existing Firestore-specific methods remain the same
  async getArticleById(articleId) {
    try {
      const articleRef = doc(db, 'news', articleId);
      const articleSnap = await getDoc(articleRef);
      
      if (articleSnap.exists()) {
        const articleData = articleSnap.data();
        
        // Increment view count
        try {
          await updateDoc(articleRef, {
            views: (articleData.views || 0) + 1,
          });
        } catch (updateError) {
          console.warn('Failed to update view count:', updateError);
        }
        
        return {
          id: articleSnap.id,
          ...articleData,
          views: (articleData.views || 0) + 1,
        };
      } else {
        throw new Error('Article not found');
      }
    } catch (error) {
      console.error('Error getting article:', error);
      throw new Error('Failed to get article: ' + error.message);
    }
  }

  async toggleArticleLike(articleId, userId) {
    try {
      const articleRef = doc(db, 'news', articleId);
      const userLikeRef = doc(db, 'news', articleId, 'likes', userId);
      
      const userLikeSnap = await getDoc(userLikeRef);
      const articleSnap = await getDoc(articleRef);
      
      if (!articleSnap.exists()) {
        throw new Error('Article not found');
      }

      const currentLikes = articleSnap.data().likes || 0;
      
      if (userLikeSnap.exists()) {
        await deleteDoc(userLikeRef);
        await updateDoc(articleRef, {
          likes: Math.max(0, currentLikes - 1),
        });
        return false;
      } else {
        await setDoc(userLikeRef, {
          userId,
          createdAt: serverTimestamp(),
        });
        await updateDoc(articleRef, {
          likes: currentLikes + 1,
        });
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw new Error('Failed to toggle like: ' + error.message);
    }
  }

  async hasUserLiked(articleId, userId) {
    try {
      if (!userId) return false;
      
      const userLikeRef = doc(db, 'news', articleId, 'likes', userId);
      const userLikeSnap = await getDoc(userLikeRef);
      return userLikeSnap.exists();
    } catch (error) {
      console.error('Failed to check like status:', error);
      return false;
    }
  }

  async addComment(articleId, userId, comment) {
    try {
      const commentsRef = collection(db, 'news', articleId, 'comments');
      const commentData = {
        userId,
        comment,
        createdAt: serverTimestamp(),
        likes: 0,
      };
      
      const docRef = await addDoc(commentsRef, commentData);
      return { id: docRef.id, ...commentData };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment: ' + error.message);
    }
  }

  async getComments(articleId, limitCount = 50) {
    try {
      const commentsRef = collection(db, 'news', articleId, 'comments');
      const commentsQuery = query(
        commentsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(commentsQuery);
      const comments = [];
      
      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return comments;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw new Error('Failed to get comments: ' + error.message);
    }
  }

  // Get related articles (Firestore only for now)
  async getRelatedArticles(articleId, category, limitCount = 5) {
    try {
      const newsRef = collection(db, 'news');
      
      if (category) {
        const relatedQuery = query(
          newsRef,
          where('category', '==', category),
          orderBy('publishedAt', 'desc'),
          limit(limitCount + 5)
        );

        const querySnapshot = await getDocs(relatedQuery);
        const articles = [];
        
        querySnapshot.forEach((doc) => {
          if (doc.id !== articleId) {
            articles.push({
              id: doc.id,
              ...doc.data(),
            });
          }
        });

        return articles.slice(0, limitCount);
      }
      return [];
    } catch (error) {
      console.error('Error getting related articles:', error);
      return [];
    }
  }

  // Legacy method wrappers for backward compatibility
  async fetchGlobalNews(limitCount = 20) {
    return this.getNews({ limit: limitCount });
  }

  async fetchLocationBasedNews(userLocation, preferences = {}, limitCount = 20) {
    return this.getNews({ 
      location: userLocation, 
      category: preferences.categories?.[0], 
      limit: limitCount 
    });
  }

  async fetchTrendingNews(limitCount = 10) {
    return this.getNews({ trending: true, limit: limitCount });
  }

  async fetchNewsByCategory(category, limitCount = 20) {
    return this.getNews({ category, limit: limitCount });
  }

  // Save external article to Firestore for future reference
  async saveExternalArticle(article) {
    try {
      if (article.isExternal) {
        const newsRef = collection(db, 'news');
        const articleData = { ...article };
        delete articleData.id;
        delete articleData.isExternal;
        
        await addDoc(newsRef, {
          ...articleData,
          savedAt: serverTimestamp(),
          originallyExternal: true,
        });
      }
    } catch (error) {
      console.error('Error saving external article:', error);
      // Don't throw - this is a background operation
    }
  }
}

export default new NewsService();