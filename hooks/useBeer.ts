// hooks/useBeer.ts
import { AppError } from '@/lib/errorHandler';
import { useState } from 'react';
import { Beer, getRandomBeer, searchBeers } from '../lib/api/beer';

export const useBeer = () => {
  const [beers, setBeers] = useState<Beer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null); // Add error state

  const searchBeer = async (beerName: string) => {
    if (!beerName.trim()) return;
    
    setLoading(true);
    setError(null); // Reset error
    try {
      const results = await searchBeers(beerName);
      setBeers(results);
    } catch (error: any) {
      console.error('Error searching beers:', error);
      setError(error); // Set error
    } finally {
      setLoading(false);
    }
  };

  const loadRandomBeer = async () => {
    setLoading(true);
    setError(null); // Reset error
    try {
      const randomBeer = await getRandomBeer();
      if (randomBeer) {
        setBeers([randomBeer]);
      }
    } catch (error: any) {
      console.error('Error loading random beer:', error);
      setError(error); // Set error
    } finally {
      setLoading(false);
    }
  };

  return {
    beers,
    loading,
    error, // Make sure error is returned
    searchBeer,
    loadRandomBeer,
  };
};