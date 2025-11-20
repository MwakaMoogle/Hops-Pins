// hooks/useBeer.ts
import { useState } from 'react';
import { Beer, getRandomBeer, searchBeers } from '../lib/api/beer';

export const useBeer = () => {
  const [beers, setBeers] = useState<Beer[]>([]);
  const [loading, setLoading] = useState(false);

  const searchBeer = async (beerName: string) => {
    if (!beerName.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchBeers(beerName);
      setBeers(results);
    } catch (error) {
      console.error('Error searching beers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRandomBeer = async () => {
    setLoading(true);
    try {
      const randomBeer = await getRandomBeer();
      if (randomBeer) {
        setBeers([randomBeer]);
      }
    } catch (error) {
      console.error('Error loading random beer:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    beers,
    loading,
    searchBeer,
    loadRandomBeer,
  };
};