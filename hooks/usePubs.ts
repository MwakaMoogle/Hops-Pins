// hooks/usePubs.ts
import { searchPubsNearby } from '@/lib/api/places';
import { Pub, addCheckin, addPub, getPubByPlaceId, getPubs } from '@/lib/api/pubs';
import { useEffect, useState } from 'react';

export const usePubs = () => {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const pubsData = await getPubs();
      setPubs(pubsData);
    } catch (error: any) {
      console.error('Error loading pubs:', error);
      setError(error.message || 'Failed to load pubs');
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyPubs = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);
    try {
      const places = await searchPubsNearby(latitude, longitude);
      
      if (places.length === 0) {
        setError('No pubs found in this area');
        return;
      }
      
      // Convert PlaceResults to Pub format and save to Firestore
      const newPubs: Pub[] = [];
      
      for (const place of places.slice(0, 5)) { // Limit to 5 pubs for testing
        // Skip if place doesn't have required data
        if (!place.name || !place.geometry?.location) {
          continue;
        }

        const pubData = {
          name: place.name,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            address: place.formatted_address || place.vicinity || 'Address not available',
          },
          placeId: place.place_id,
        };

        try {
          const pubId = await addPub(pubData);
          const newPub = await getPubByPlaceId(place.place_id);
          if (newPub) {
            newPubs.push(newPub);
          }
        } catch (error: any) {
          console.error('Error adding pub:', error);
          // Don't stop the whole process if one pub fails
          if (error.code === 'permission-denied') {
            setError('Permission denied: Check Firestore rules');
          }
        }
      }
      
      if (newPubs.length > 0) {
        setPubs(newPubs);
      } else {
        setError('Could not save any pubs to database');
      }
    } catch (error: any) {
      console.error('Error searching nearby pubs:', error);
      setError(error.message || 'Failed to search for pubs');
    } finally {
      setLoading(false);
    }
  };

  const createCheckin = async (checkinData: Omit<Parameters<typeof addCheckin>[0], 'userId'> & { userId: string }) => {
    setError(null);
    try {
      await addCheckin(checkinData);
      await loadPubs();
    } catch (error: any) {
      console.error('Error creating checkin:', error);
      setError(error.message || 'Failed to create checkin');
      throw error;
    }
  };

  useEffect(() => {
    loadPubs();
  }, []);

  return {
    pubs,
    loading,
    error,
    loadPubs,
    searchNearbyPubs,
    createCheckin,
  };
};