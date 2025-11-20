// lib/api/beer.ts
import fallbackBeersData from '@/data/fallbackBeers.json';
import { AppError, handleApiError } from '@/lib/errorHandler';

export interface Beer {
  id: number;
  name: string;
  tagline: string;
  first_brewed: string;
  description: string;
  image_url: string;
  abv: number;
  ibu: number;
  food_pairing: string[];
}

// Use the fallback data from JSON
const fallbackBeers: Beer[] = fallbackBeersData.beers;

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// CORRECTED: Using the proper Punk API base URL
const PUNK_API_BASE = 'https://api.punkapi.com/v2';

export const searchBeers = async (beerName: string): Promise<Beer[]> => {
  try {
    // CORRECTED: Using proper Punk API URL structure with beer_name parameter
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `${PUNK_API_BASE}/beers?beer_name=${encodeURIComponent(beerName)}`,
      { 
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new AppError(
        `HTTP error! status: ${response.status}`,
        'HTTP_ERROR',
        'Failed to fetch beer data from Punk API.'
      );
    }
    
    const beers: Beer[] = await response.json();
    
    if (beers.length === 0) {
      // If no results from API, try fallback data
      const filteredFallback = fallbackBeers.filter(beer => 
        beer.name.toLowerCase().includes(beerName.toLowerCase())
      );
      return filteredFallback;
    }
    
    return beers;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    
    // Handle network errors specifically
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      console.log('Punk API unavailable, using fallback data');
      
      // Use fallback data that matches the search
      await delay(500); // Simulate network delay
      const filteredFallback = fallbackBeers.filter(beer => 
        beer.name.toLowerCase().includes(beerName.toLowerCase())
      );
      
      if (filteredFallback.length > 0) {
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
  try {
    // CORRECTED: Using proper Punk API URL for random beer
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${PUNK_API_BASE}/beers/random`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new AppError(`HTTP error! status: ${response.status}`, 'HTTP_ERROR');
    }
    
    const beers: Beer[] = await response.json();
    return beers[0] || null;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    
    // Handle network errors specifically
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      console.log('Punk API unavailable, using random fallback beer');
      
      // Use random fallback beer
      await delay(500); // Simulate network delay
      const randomIndex = Math.floor(Math.random() * fallbackBeers.length);
      return fallbackBeers[randomIndex];
    }
    
    throw handleApiError(error);
  }
};

// NEW: Get beer by ID (useful for future features)
export const getBeerById = async (id: number): Promise<Beer | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${PUNK_API_BASE}/beers/${id}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new AppError(`HTTP error! status: ${response.status}`, 'HTTP_ERROR');
    }
    
    const beers: Beer[] = await response.json();
    return beers[0] || null;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    
    // Handle network errors by returning fallback
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      const fallbackBeer = fallbackBeers.find(beer => beer.id === id);
      return fallbackBeer || null;
    }
    
    throw handleApiError(error);
  }
};

// NEW: Get all beers (for browsing)
export const getAllBeers = async (page: number = 1, perPage: number = 25): Promise<Beer[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `${PUNK_API_BASE}/beers?page=${page}&per_page=${perPage}`,
      {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new AppError(`HTTP error! status: ${response.status}`, 'HTTP_ERROR');
    }
    
    const beers: Beer[] = await response.json();
    return beers;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    
    // Handle network errors by returning all fallback beers
    if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
      return fallbackBeers;
    }
    
    throw handleApiError(error);
  }
};