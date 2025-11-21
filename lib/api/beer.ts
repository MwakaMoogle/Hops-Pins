// lib/api/beer.ts
import fallbackBeersData from '@/data/fallbackBeers.json';
import { CacheManager } from '@/lib/cache';
import { AppError, handleApiError } from '@/lib/errorHandler';

class RateLimiter {
  private static requests: number[] = [];
  private static readonly MAX_REQUESTS_PER_MINUTE = 50; // Conservative limit
  
  static canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    // Check if we're under the limit
    return this.requests.length < this.MAX_REQUESTS_PER_MINUTE;
  }
  
  static recordRequest(): void {
    this.requests.push(Date.now());
  }
  
  static getWaitTime(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length === 0) return 0;
    
    // Return time until the oldest request is 1 minute old
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, (oldestRequest + 60000) - now);
  }
}

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

// Transform fallback data to match the new Beer interface
const transformFallbackBeer = (beer: any): Beer => ({
  ...beer,
  id: beer.id.toString(), // Convert number ID to string
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

// Helper function to make RapidAPI requests
const makeRapidApiRequest = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  if (!RAPID_API_KEY) {
    throw new AppError(
      'RapidAPI key not configured',
      'CONFIG_ERROR',
      'Service configuration error. Please try again later.'
    );
  }

  // Check rate limit
  if (!RateLimiter.canMakeRequest()) {
    const waitTime = RateLimiter.getWaitTime();
    throw new AppError(
      `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds`,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please wait a moment and try again.'
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  
  const queryParams = new URLSearchParams(params).toString();
  const url = `${RAPID_API_BASE}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
  console.log('🔍 Making API request to:', url);
  
  RateLimiter.recordRequest(); // Record this request
  
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': RAPID_API_HOST,
      'Content-Type': 'application/json'
    }
  });
  
  clearTimeout(timeoutId);
  
  // Handle rate limiting (429 status)
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
  
  // Check for API errors in response body
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

// Transform RapidAPI response to our Beer interface
const transformBeerData = (rapidApiBeer: any): Beer => {
  // Extract ABV as number (remove % and convert)
  const abv = parseFloat(rapidApiBeer.abv?.replace('%', '')) || 0;
  
  // Extract IBU as number
  const ibu = parseInt(rapidApiBeer.ibu) || 0;
  
  // Handle food pairing - could be string or array
  let foodPairing: string[] = [];
  if (typeof rapidApiBeer.food_pairing === 'string' && rapidApiBeer.food_pairing.trim()) {
    foodPairing = rapidApiBeer.food_pairing.split(',').map((item: string) => item.trim());
  } else if (Array.isArray(rapidApiBeer.food_pairing)) {
    foodPairing = rapidApiBeer.food_pairing;
  }
  
  // Create a tagline from available data
  const tagline = rapidApiBeer.sub_category_3 || rapidApiBeer.sub_category_2 || rapidApiBeer.sub_category_1 || 'Craft Beer';
  
  // Create description from available data
  const description = rapidApiBeer.description || 
    `${rapidApiBeer.name} by ${rapidApiBeer.brewery}. ${tagline} from ${rapidApiBeer.region || rapidApiBeer.country || ''}.`;
  
  return {
    id: rapidApiBeer.sku || rapidApiBeer.name || Math.random().toString(),
    name: rapidApiBeer.name || 'Unknown Beer',
    tagline: tagline,
    first_brewed: '', // Not available in RapidAPI
    description: description,
    image_url: '', // RapidAPI doesn't provide images
    abv: abv,
    ibu: ibu,
    food_pairing: foodPairing
  };
};

export const searchBeers = async (beerName: string): Promise<Beer[]> => {
  console.log('🍺 Searching beers for:', beerName);
  
  // Check cache first
  const cacheKey = getBeerCacheKey(beerName, 'search');
  const cached = await CacheManager.get<Beer[]>(cacheKey);
  
  if (cached) {
    console.log('📦 Using cached beer results for:', beerName);
    return cached;
  }

  try {
    // Use query parameters as shown in the documentation
    const data = await makeRapidApiRequest('/', { name: beerName });
    
    // Handle both array and single object responses
    let beers: any[] = [];
    
    if (data && data.data) {
      if (Array.isArray(data.data)) {
        beers = data.data;
        console.log(`🎯 Found ${beers.length} beers in array response`);
      } else if (data.data.name) {
        beers = [data.data];
        console.log(`🎯 Found 1 beer in object response`);
      }
    }
    
    if (beers.length > 0) {
      const transformedBeers = beers.map(transformBeerData);
      
      // Cache the results
      await CacheManager.set(cacheKey, transformedBeers);
      console.log(`✅ Successfully transformed and cached ${transformedBeers.length} beers`);
      return transformedBeers;
    }
    
    console.log('❌ No beers found in API response, trying fallback data');
    
    // If no results from API, try fallback data
    const filteredFallback = fallbackBeers.filter(beer => 
      beer.name.toLowerCase().includes(beerName.toLowerCase())
    );
    
    if (filteredFallback.length > 0) {
      // Cache fallback results too
      await CacheManager.set(cacheKey, filteredFallback);
      console.log(`🔄 Using ${filteredFallback.length} fallback beers`);
      return filteredFallback;
    }
    
    console.log('❌ No beers found in fallback data either');
    return [];
  } catch (error: any) {
    console.log('💥 Error in searchBeers:', error.message);
    
    // Try to return cached data even if API fails
    const cached = await CacheManager.get<Beer[]>(cacheKey);
    if (cached) {
      console.log('🔄 Using cached data due to API error');
      return cached;
    }

    if (error instanceof AppError && error.code === 'NOT_FOUND') {
      // Beer not found in API, try fallback
      console.log('🔄 Beer not found in API, trying fallback data');
      const filteredFallback = fallbackBeers.filter(beer => 
        beer.name.toLowerCase().includes(beerName.toLowerCase())
      );
      return filteredFallback;
    }
    
    if (error instanceof AppError) throw error;
    
    // Handle network errors specifically
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      console.log('🌐 RapidAPI unavailable, using fallback data');
      
      // Use fallback data that matches the search
      await delay(500);
      const filteredFallback = fallbackBeers.filter(beer => 
        beer.name.toLowerCase().includes(beerName.toLowerCase())
      );
      
      if (filteredFallback.length > 0) {
        console.log(`🔄 Using ${filteredFallback.length} fallback beers due to network error`);
        return filteredFallback;
      }
      
      throw new AppError(
        'Network connection failed',
        'NETWORK_ERROR',
        'Please check your internet connection and try again.'
      );
    }
    
    throw handleApiError(error);
  }
};

export const getRandomBeer = async (): Promise<Beer | null> => {
  console.log('🎲 Getting random beer');
  
  // For random beers, we'll cache by the search term used
  const commonTerms = ['ipa', 'lager', 'ale', 'stout', 'pilsner', 'wheat'];
  const randomTerm = commonTerms[Math.floor(Math.random() * commonTerms.length)];
  const cacheKey = getBeerCacheKey(randomTerm, 'random');

  // Check cache first - this is crucial to avoid API calls
  const cached = await CacheManager.get<Beer>(cacheKey);
  if (cached) {
    console.log('📦 Using cached random beer');
    return cached;
  }

  try {
    console.log(`🔍 Searching for random beer with term: ${randomTerm}`);
    const data = await makeRapidApiRequest('/', { name: randomTerm });
    
    // Handle both array and single object responses
    let beers: any[] = [];
    
    if (data && data.data) {
      if (Array.isArray(data.data)) {
        beers = data.data;
      } else if (data.data.name) {
        beers = [data.data];
      }
    }
    
    if (beers.length > 0) {
      const randomIndex = Math.floor(Math.random() * beers.length);
      const randomBeer = transformBeerData(beers[randomIndex]);
      
      // Cache the random beer
      await CacheManager.set(cacheKey, randomBeer);
      console.log(`✅ Selected and cached random beer: ${randomBeer.name}`);
      return randomBeer;
    }
    
    // Fallback to random beer from our fallback data
    const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
    const fallbackBeer = fallbackBeers[randomIndex];
    
    // Cache the fallback beer too
    await CacheManager.set(cacheKey, fallbackBeer);
    console.log(`🔄 Using and caching fallback random beer: ${fallbackBeer.name}`);
    return fallbackBeer;
  } catch (error: any) {
    console.log('💥 Error in getRandomBeer:', error.message);
    
    // If it's a rate limit error, immediately use fallback without retry
    if (error instanceof AppError && error.code === 'RATE_LIMIT_EXCEEDED') {
      console.log('🚫 Rate limit hit, using fallback data');
      const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
      const fallbackBeer = fallbackBeers[randomIndex];
      
      // Still cache the fallback to avoid repeated API calls
      await CacheManager.set(cacheKey, fallbackBeer);
      console.log(`🔄 Using fallback due to rate limit: ${fallbackBeer.name}`);
      return fallbackBeer;
    }
    
    // Try to return cached data for other errors
    const cached = await CacheManager.get<Beer>(cacheKey);
    if (cached) {
      console.log('🔄 Using cached random beer due to API error');
      return cached;
    }

    if (error instanceof AppError && error.code === 'NOT_FOUND') {
      // Random search didn't find anything, use fallback
      const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
      const fallbackBeer = fallbackBeers[randomIndex];
      
      // Cache the fallback
      await CacheManager.set(cacheKey, fallbackBeer);
      console.log(`🔄 Using fallback random beer due to NOT_FOUND: ${fallbackBeer.name}`);
      return fallbackBeer;
    }
    
    if (error instanceof AppError) throw error;
    
    // Handle network errors specifically
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      console.log('🌐 RapidAPI unavailable, using random fallback beer');
      
      // Use random fallback beer
      await delay(500);
      const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
      const fallbackBeer = fallbackBeers[randomIndex];
      
      // Cache the fallback
      await CacheManager.set(cacheKey, fallbackBeer);
      console.log(`🔄 Using and caching fallback random beer: ${fallbackBeer.name}`);
      return fallbackBeer;
    }
    
    throw handleApiError(error);
  }
};

// Updated: Get beer by ID (using SKU or name)
export const getBeerById = async (id: string): Promise<Beer | null> => {
  console.log(`🔍 Getting beer by ID: ${id}`);
  
  // Check cache first
  const cacheKey = getBeerCacheKey(id, 'search');
  const cached = await CacheManager.get<Beer>(cacheKey);
  if (cached) {
    console.log('📦 Using cached beer by ID');
    return cached;
  }

  try {
    // Try searching by name first, then by SKU
    let data;
    try {
      data = await makeRapidApiRequest('/', { name: id });
    } catch (error) {
      // If name search fails, try SKU search
      data = await makeRapidApiRequest('/', { sku: id });
    }
    
    // Handle both array and single object responses
    let beers: any[] = [];
    
    if (data && data.data) {
      if (Array.isArray(data.data)) {
        beers = data.data;
      } else if (data.data.name) {
        beers = [data.data];
      }
    }
    
    if (beers.length > 0) {
      const beer = transformBeerData(beers[0]);
      // Cache the result
      await CacheManager.set(cacheKey, beer);
      console.log(`✅ Found and cached beer by ID: ${beer.name}`);
      return beer;
    }
    
    // Fallback to our fallback data
    const fallbackBeer = fallbackBeers.find(beer => beer.id === id);
    if (fallbackBeer) {
      // Cache the fallback
      await CacheManager.set(cacheKey, fallbackBeer);
      console.log(`🔄 Using and caching fallback beer for ID: ${fallbackBeer.name}`);
    }
    return fallbackBeer || null;
  } catch (error: any) {
    console.log('💥 Error in getBeerById:', error.message);
    
    // Try to return cached data
    const cached = await CacheManager.get<Beer>(cacheKey);
    if (cached) {
      console.log('🔄 Using cached beer by ID due to API error');
      return cached;
    }

    if (error instanceof AppError) throw error;
    
    // Handle network errors by returning fallback
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      const fallbackBeer = fallbackBeers.find(beer => beer.id === id);
      return fallbackBeer || null;
    }
    
    throw handleApiError(error);
  }
};

// Updated: Get all beers (for browsing - limited results)
export const getAllBeers = async (page: number = 1, perPage: number = 10): Promise<Beer[]> => {
  console.log(`📚 Getting all beers, page ${page}, perPage ${perPage}`);
  
  // Check cache first
  const cacheKey = getBeerCacheKey(`all_${page}_${perPage}`, 'all');
  const cached = await CacheManager.get<Beer[]>(cacheKey);
  if (cached) {
    console.log('📦 Using cached all beers');
    return cached;
  }

  try {
    // Since RapidAPI doesn't have a "get all" endpoint, we'll search for common terms
    const commonTerms = ['beer', 'ale', 'lager', 'ipa'];
    const allResults: Beer[] = [];
    
    for (const term of commonTerms) {
      if (allResults.length >= perPage) break;
      
      try {
        const data = await makeRapidApiRequest('/', { name: term });
        
        // Handle both array and single object responses
        let beers: any[] = [];
        
        if (data && data.data) {
          if (Array.isArray(data.data)) {
            beers = data.data;
          } else if (data.data.name) {
            beers = [data.data];
          }
        }
        
        if (beers.length > 0) {
          const transformed = beers.map(transformBeerData);
          allResults.push(...transformed.slice(0, perPage - allResults.length));
          console.log(`✅ Added ${transformed.length} beers for term: ${term}`);
        }
      } catch (error) {
        console.log(`❌ Failed to fetch beer for term: ${term}`);
        // Continue with next term
      }
    }
    
    // Cache the results
    await CacheManager.set(cacheKey, allResults);
    console.log(`📦 Returning and caching ${allResults.length} beers total`);
    return allResults.slice(0, perPage);
  } catch (error: any) {
    console.log('💥 Error in getAllBeers:', error.message);
    
    // Try to return cached data
    const cached = await CacheManager.get<Beer[]>(cacheKey);
    if (cached) {
      console.log('🔄 Using cached all beers due to API error');
      return cached;
    }

    if (error instanceof AppError) throw error;
    
    // Handle network errors by returning all fallback beers
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      return fallbackBeers.slice(0, perPage);
    }
    
    throw handleApiError(error);
  }
};