// lib/api/beer.ts
import fallbackBeersData from '@/data/fallbackBeers.json';
import { AppError, handleApiError } from '@/lib/errorHandler';

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

// Helper function to make RapidAPI requests
const makeRapidApiRequest = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  if (!RAPID_API_KEY) {
    throw new AppError(
      'RapidAPI key not configured',
      'CONFIG_ERROR',
      'Service configuration error. Please try again later.'
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for RapidAPI
  
  // Build query string from params
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
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new AppError(
        'Beer not found',
        'NOT_FOUND',
        'No beers found matching your search.'
      );
    }
    throw new AppError(
      `HTTP error! status: ${response.status}`,
      'HTTP_ERROR',
      'Failed to fetch beer data from Beer API.'
    );
  }
  
  const data = await response.json();
  console.log('📦 API Response:', { 
    url, 
    status: data.code, 
    error: data.error, 
    dataCount: Array.isArray(data.data) ? data.data.length : data.data ? 1 : 0 
  });
  
  // Check RapidAPI response structure
  if (data.error) {
    throw new AppError(
      data.message || 'API returned error',
      'API_ERROR',
      'Failed to fetch beer data.'
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
      console.log(`✅ Successfully transformed ${transformedBeers.length} beers`);
      return transformedBeers;
    }
    
    console.log('❌ No beers found in API response, trying fallback data');
    
    // If no results from API, try fallback data
    const filteredFallback = fallbackBeers.filter(beer => 
      beer.name.toLowerCase().includes(beerName.toLowerCase())
    );
    
    if (filteredFallback.length > 0) {
      console.log(`🔄 Using ${filteredFallback.length} fallback beers`);
      return filteredFallback;
    }
    
    console.log('❌ No beers found in fallback data either');
    return [];
  } catch (error: any) {
    console.log('💥 Error in searchBeers:', error.message);
    
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
  
  try {
    // For random beer, search for common beer terms
    const commonTerms = ['ipa', 'lager', 'ale', 'stout', 'pilsner', 'wheat'];
    const randomTerm = commonTerms[Math.floor(Math.random() * commonTerms.length)];
    
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
      console.log(`✅ Selected random beer: ${beers[randomIndex].name}`);
      return transformBeerData(beers[randomIndex]);
    }
    
    // Fallback to random beer from our fallback data
    const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
    console.log(`🔄 Using fallback random beer: ${fallbackBeers[randomIndex].name}`);
    return fallbackBeers[randomIndex];
  } catch (error: any) {
    console.log('💥 Error in getRandomBeer:', error.message);
    
    if (error instanceof AppError && error.code === 'NOT_FOUND') {
      // Random search didn't find anything, use fallback
      const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
      console.log(`🔄 Using fallback random beer due to NOT_FOUND: ${fallbackBeers[randomIndex].name}`);
      return fallbackBeers[randomIndex];
    }
    
    if (error instanceof AppError) throw error;
    
    // Handle network errors specifically
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      console.log('🌐 RapidAPI unavailable, using random fallback beer');
      
      // Use random fallback beer
      await delay(500);
      const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
      console.log(`🔄 Using fallback random beer: ${fallbackBeers[randomIndex].name}`);
      return fallbackBeers[randomIndex];
    }
    
    throw handleApiError(error);
  }
};

// Updated: Get beer by ID (using SKU or name)
export const getBeerById = async (id: string): Promise<Beer | null> => {
  console.log(`🔍 Getting beer by ID: ${id}`);
  
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
      console.log(`✅ Found beer by ID: ${beers[0].name}`);
      return transformBeerData(beers[0]);
    }
    
    // Fallback to our fallback data
    const fallbackBeer = fallbackBeers.find(beer => beer.id === id);
    if (fallbackBeer) {
      console.log(`🔄 Using fallback beer for ID: ${fallbackBeer.name}`);
    }
    return fallbackBeer || null;
  } catch (error: any) {
    console.log('💥 Error in getBeerById:', error.message);
    
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
    
    console.log(`📦 Returning ${allResults.length} beers total`);
    return allResults.slice(0, perPage);
  } catch (error: any) {
    console.log('💥 Error in getAllBeers:', error.message);
    
    if (error instanceof AppError) throw error;
    
    // Handle network errors by returning all fallback beers
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      return fallbackBeers.slice(0, perPage);
    }
    
    throw handleApiError(error);
  }
};