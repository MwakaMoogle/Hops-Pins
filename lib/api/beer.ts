// lib/api/beer.ts
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

export const searchBeers = async (beerName: string): Promise<Beer[]> => {
  try {
    const response = await fetch(
      `https://api.punkapi.com/v2/beers?beer_name=${encodeURIComponent(beerName)}`
    );
    
    if (!response.ok) {
      throw new AppError(
        `HTTP error! status: ${response.status}`,
        'HTTP_ERROR',
        'Failed to fetch beer data.'
      );
    }
    
    const beers: Beer[] = await response.json();
    return beers;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw handleApiError(error);
  }
};

export const getRandomBeer = async (): Promise<Beer | null> => {
  try {
    const response = await fetch('https://api.punkapi.com/v2/beers/random');
    
    if (!response.ok) {
      throw new AppError(`HTTP error! status: ${response.status}`, 'HTTP_ERROR');
    }
    
    const beers: Beer[] = await response.json();
    return beers[0] || null;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw handleApiError(error);
  }
};