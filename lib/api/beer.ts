// lib/api/beer.ts
import fallbackBeersData from '@/data/fallbackBeers.json';
import { CacheManager } from '@/lib/cache';
import { AppError } from '@/lib/errorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseBeerCache } from './beerCache';

export interface Beer {
  id: string;
  name: string;
  tagline: string;
  first_brewed: string;
  description: string;
  image_url: string;
  abv: number;
  ibu: number;
  food_pairing: string[];
}

// Transform fallback data
const transformFallbackBeer = (beer: any): Beer => ({
  ...beer,
  id: beer.id.toString(),
});

const fallbackBeers: Beer[] = fallbackBeersData.beers.map(transformFallbackBeer);

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// RapidAPI configuration
const RAPID_API_BASE = 'https://beer9.p.rapidapi.com';
const RAPID_API_KEY = process.env.EXPO_PUBLIC_RAPID_API_KEY;
const RAPID_API_HOST = 'beer9.p.rapidapi.com';

// Generate cache key for beer searches
const getBeerCacheKey = (query: string, type: 'search' | 'random' | 'all' = 'search') => {
  return `beer_${type}_${query.toLowerCase().trim()}`;
};

// Request Budget Tracker
class RequestBudget {
  private static readonly MONTHLY_LIMIT = 450;
  private static readonly STORAGE_KEY = 'beer_api_request_count';
  private static currentMonth: string = this.getCurrentMonth();
  
  private static getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
  }
  
  static async canMakeRequest(): Promise<boolean> {
    const currentMonth = this.getCurrentMonth();
    if (currentMonth !== this.currentMonth) {
      this.currentMonth = currentMonth;
      await this.resetCount();
      return true;
    }
    
    const count = await this.getCount();
    return count < this.MONTHLY_LIMIT;
  }
  
  static async recordRequest(): Promise<void> {
    const count = await this.getCount();
    await AsyncStorage.setItem(this.STORAGE_KEY, (count + 1).toString());
    console.log(`📊 API Request Count: ${count + 1}/${this.MONTHLY_LIMIT}`);
  }
  
  static async getCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(this.STORAGE_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  }
  
  static async resetCount(): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY, '0');
  }
}

// API Request Function
const makeRapidApiRequest = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  if (!RAPID_API_KEY) {
    throw new AppError(
      'RapidAPI key not configured',
      'CONFIG_ERROR',
      'Service configuration error. Please try again later.'
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  
  const queryParams = new URLSearchParams(params).toString();
  const url = `${RAPID_API_BASE}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
  console.log('🔍 Making API request to:', url);
  
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': RAPID_API_HOST,
      'Content-Type': 'application/json'
    }
  });
  
  clearTimeout(timeoutId);
  
  // Handle rate limiting
  if (response.status === 429) {
    throw new AppError(
      'Rate limit exceeded',
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please wait a moment and try again.'
    );
  }
  
  const data = await response.json();
  console.log('📦 API Response:', { 
    url, 
    status: data.code, 
    error: data.error, 
    dataCount: Array.isArray(data.data) ? data.data.length : data.data ? 1 : 0,
    httpStatus: response.status
  });
  
  // Check for API errors
  if (data.error || data.code === 404 || response.status !== 200) {
    throw new AppError(
      data.message || `HTTP error! status: ${response.status}`,
      response.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'API_ERROR',
      response.status === 429 
        ? 'Too many requests. Please wait a moment and try again.'
        : 'Failed to fetch beer data.'
    );
  }
  
  return data;
};

// Transform RapidAPI response
const transformBeerData = (rapidApiBeer: any): Beer => {
  const abv = parseFloat(rapidApiBeer.abv?.replace('%', '')) || 0;
  const ibu = parseInt(rapidApiBeer.ibu) || 0;
  
  let foodPairing: string[] = [];
  if (typeof rapidApiBeer.food_pairing === 'string' && rapidApiBeer.food_pairing.trim()) {
    foodPairing = rapidApiBeer.food_pairing.split(',').map((item: string) => item.trim());
  } else if (Array.isArray(rapidApiBeer.food_pairing)) {
    foodPairing = rapidApiBeer.food_pairing;
  }
  
  const tagline = rapidApiBeer.sub_category_3 || rapidApiBeer.sub_category_2 || rapidApiBeer.sub_category_1 || 'Craft Beer';
  const description = rapidApiBeer.description || 
    `${rapidApiBeer.name} by ${rapidApiBeer.brewery}. ${tagline} from ${rapidApiBeer.region || rapidApiBeer.country || ''}.`;
  
  return {
    id: rapidApiBeer.sku || rapidApiBeer.name || Math.random().toString(),
    name: rapidApiBeer.name || 'Unknown Beer',
    tagline: tagline,
    first_brewed: '',
    description: description,
    image_url: '',
    abv: abv,
    ibu: ibu,
    food_pairing: foodPairing
  };
};

// Enhanced fallback system
const getFallbackBeers = (searchTerm: string): Beer[] => {
  const exactMatches = fallbackBeers.filter(beer => 
    beer.name.toLowerCase().includes(searchTerm)
  );
  
  if (exactMatches.length > 0) return exactMatches;
  
  const commonTerms: { [key: string]: string[] } = {
    'ipa': ['ipa', 'india pale ale', 'pale ale'],
    'lager': ['lager', 'pilsner', 'helles'],
    'ale': ['ale', 'pale ale', 'bitter'],
    'stout': ['stout', 'porter', 'imperial stout'],
    'pilsner': ['pilsner', 'lager', 'pils'],
    'wheat': ['wheat', 'weizen', 'witbier'],
    'sour': ['sour', 'gose', 'lambic'],
  };
  
  for (const [term, variations] of Object.entries(commonTerms)) {
    if (variations.some(v => searchTerm.includes(v))) {
      return fallbackBeers.filter(beer => 
        beer.name.toLowerCase().includes(term) || 
        beer.tagline.toLowerCase().includes(term)
      ).slice(0, 5);
    }
  }
  
  return [];
};

// MAIN SEARCH FUNCTION WITH TRIPLE CACHING
export const searchBeers = async (beerName: string): Promise<Beer[]> => {
  const searchTerm = beerName.trim().toLowerCase();
  if (!searchTerm) return [];
  
  // Record this search for analytics
  await FirebaseBeerCache.recordSearch(searchTerm);
  
  const cacheKey = getBeerCacheKey(searchTerm, 'search');
  
  // 1. CHECK LOCAL CACHE (Fastest)
  const localCached = await CacheManager.get<Beer[]>(cacheKey);
  if (localCached) {
    console.log('📦 Local cache hit for:', searchTerm);
    return localCached;
  }
  
  // 2. CHECK FIREBASE CACHE (Shared across users)
  const firebaseCached = await FirebaseBeerCache.getCachedBeers(searchTerm);
  if (firebaseCached) {
    console.log('🔥 Firebase cache hit for:', searchTerm);
    // Also store in local cache for faster future access
    await CacheManager.set(cacheKey, firebaseCached);
    return firebaseCached;
  }
  
  // 3. CHECK API BUDGET
  const canMakeRequest = await RequestBudget.canMakeRequest();
  if (!canMakeRequest) {
    console.log('🚫 Monthly API limit reached, using fallback');
    const fallbackResults = getFallbackBeers(searchTerm);
    // Cache fallback results at both levels
    await CacheManager.set(cacheKey, fallbackResults);
    await FirebaseBeerCache.cacheBeers(searchTerm, fallbackResults);
    return fallbackResults;
  }
  
  console.log('🌐 Making API call for:', searchTerm);
  
  try {
    // 4. CALL RAPIDAPI (Source of truth)
    const data = await makeRapidApiRequest('/', { name: searchTerm });
    await RequestBudget.recordRequest();
    
    let beers: Beer[] = [];
    
    // Parse response
    if (data?.data) {
      if (Array.isArray(data.data)) {
        beers = data.data.map(transformBeerData);
      } else if (data.data.name) {
        beers = [transformBeerData(data.data)];
      }
    }
    
    let finalResults: Beer[];
    
    if (beers.length > 0) {
      finalResults = beers;
    } else {
      // Use fallback if API returns no results
      finalResults = getFallbackBeers(searchTerm);
    }
    
    // 5. CACHE AT ALL LEVELS
    await CacheManager.set(cacheKey, finalResults); // Local cache
    await FirebaseBeerCache.cacheBeers(searchTerm, finalResults); // Firebase cache
    
    console.log(`✅ Cached ${finalResults.length} beers at all levels`);
    return finalResults;
    
  } catch (error) {
    console.log('💥 API call failed:', error);
    
    // Use fallback on any error
    const fallbackResults = getFallbackBeers(searchTerm);
    
    // Cache fallback results
    await CacheManager.set(cacheKey, fallbackResults);
    await FirebaseBeerCache.cacheBeers(searchTerm, fallbackResults);
    
    return fallbackResults;
  }
};

// Enhanced Random Beer with Caching
export const getRandomBeer = async (): Promise<Beer | null> => {
  console.log('🎲 Getting random beer');
  
  // Use cached random beers first
  const cacheKey = 'random_beer_cache';
  const cachedRandom = await CacheManager.get<Beer>(cacheKey);
  if (cachedRandom) {
    console.log('📦 Using cached random beer');
    return cachedRandom;
  }
  
  // Only use API if we have budget
  const canMakeRequest = await RequestBudget.canMakeRequest();
  if (!canMakeRequest) {
    console.log('🚫 Using fallback random beer (budget limit)');
    const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
    return fallbackBeers[randomIndex];
  }
  
  try {
    const commonTerms = ['ipa', 'lager', 'ale', 'stout'];
    const randomTerm = commonTerms[Math.floor(Math.random() * commonTerms.length)];
    
    console.log(`🔍 Searching for random beer with term: ${randomTerm}`);
    const data = await makeRapidApiRequest('/', { name: randomTerm });
    await RequestBudget.recordRequest();
    
    let beers: any[] = [];
    
    if (data && data.data) {
      if (Array.isArray(data.data)) {
        beers = data.data;
      } else if (data.data.name) {
        beers = [data.data];
      }
    }
    
    let randomBeer: Beer;
    
    if (beers.length > 0) {
      const randomIndex = Math.floor(Math.random() * beers.length);
      randomBeer = transformBeerData(beers[randomIndex]);
    } else {
      const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
      randomBeer = fallbackBeers[randomIndex];
    }
    
    // Cache this random beer
    await CacheManager.set(cacheKey, randomBeer);
    console.log(`✅ Selected random beer: ${randomBeer.name}`);
    return randomBeer;
    
  } catch (error) {
    console.log('💥 Error in getRandomBeer:', error);
    
    const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
    const fallbackBeer = fallbackBeers[randomIndex];
    await CacheManager.set(cacheKey, fallbackBeer);
    return fallbackBeer;
  }
};

// Other functions remain similar but use the caching system
export const getBeerById = async (id: string): Promise<Beer | null> => {
  // Implementation using the caching system
  const results = await searchBeers(id);
  return results.length > 0 ? results[0] : null;
};

export const getAllBeers = async (page: number = 1, perPage: number = 10): Promise<Beer[]> => {
  // Use common search terms with caching
  const commonTerms = ['beer', 'ale', 'lager'];
  const allResults: Beer[] = [];
  
  for (const term of commonTerms) {
    if (allResults.length >= perPage) break;
    const results = await searchBeers(term);
    allResults.push(...results.slice(0, perPage - allResults.length));
  }
  
  return allResults.slice(0, perPage);
};

// Export budget functions for the UI
export { RequestBudget };
