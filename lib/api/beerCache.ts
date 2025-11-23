// lib/api/beerCache.ts
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { Beer } from './beer';

const BEER_CACHE_COLLECTION = 'beerCache';
const POPULAR_SEARCHES_COLLECTION = 'popularSearches';

export interface CachedBeerResult {
  searchTerm: string;
  beers: Beer[];
  timestamp: Date;
  hitCount: number;
  lastAccessed?: Date;
}

export class FirebaseBeerCache {
  // Get cached beer results from Firebase
  static async getCachedBeers(searchTerm: string): Promise<Beer[] | null> {
    try {
      const searchKey = searchTerm.trim().toLowerCase();
      const docRef = doc(db, BEER_CACHE_COLLECTION, searchKey);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as CachedBeerResult;
        console.log('🔥 Firebase cache hit for:', searchTerm);
        
        // Update hit count and last accessed
        try {
          await setDoc(docRef, {
            ...data,
            hitCount: (data.hitCount || 0) + 1,
            lastAccessed: new Date()
          }, { merge: true });
        } catch (updateError) {
          console.log('⚠️ Could not update cache stats, but returning cached data');
        }
        
        return data.beers;
      }
      
      return null;
    } catch (error) {
      console.error('Firebase cache get error:', error);
      return null;
    }
  }

  // Cache beer results in Firebase
  static async cacheBeers(searchTerm: string, beers: Beer[]): Promise<boolean> {
    try {
      const searchKey = searchTerm.trim().toLowerCase();
      const cacheData: CachedBeerResult = {
        searchTerm: searchKey,
        beers,
        timestamp: new Date(),
        hitCount: 1
      };
      
      await setDoc(doc(db, BEER_CACHE_COLLECTION, searchKey), cacheData);
      console.log('🔥 Cached beers in Firebase for:', searchTerm);
      return true;
    } catch (error: any) {
      console.error('Firebase cache set error:', error);
      
      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        console.log('🔒 Firebase permissions not set up for beer cache');
      }
      
      return false;
    }
  }

  // Get popular searches to pre-cache common terms
  static async getPopularSearches(limitCount: number = 10): Promise<string[]> {
    try {
      const q = query(
        collection(db, BEER_CACHE_COLLECTION),
        orderBy('hitCount', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data().searchTerm);
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  // Record a search (for analytics and popular searches)
  static async recordSearch(searchTerm: string): Promise<boolean> {
    try {
      const searchKey = searchTerm.trim().toLowerCase();
      const docRef = doc(db, POPULAR_SEARCHES_COLLECTION, searchKey);
      
      await setDoc(docRef, {
        searchTerm: searchKey,
        lastSearched: new Date(),
        searchCount: 1
      }, { merge: true });
      
      return true;
    } catch (error: any) {
      console.error('Error recording search:', error);
      return false;
    }
  }
}