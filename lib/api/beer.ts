// lib/api/beer.ts
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
      throw new Error('Failed to fetch beers');
    }
    
    const beers: Beer[] = await response.json();
    return beers;
  } catch (error) {
    console.error('Error fetching beers:', error);
    return [];
  }
};

export const getRandomBeer = async (): Promise<Beer | null> => {
  try {
    const response = await fetch('https://api.punkapi.com/v2/beers/random');
    
    if (!response.ok) {
      throw new Error('Failed to fetch random beer');
    }
    
    const beers: Beer[] = await response.json();
    return beers[0] || null;
  } catch (error) {
    console.error('Error fetching random beer:', error);
    return null;
  }
};