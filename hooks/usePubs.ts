// hooks/usePubs.ts
import { searchAllPubsNearby } from '@/lib/api/places';
import { Pub, addCheckin, addPub, getPubByPlaceId, getPubCheckins, getPubs } from '@/lib/api/pubs';
import { AppError } from '@/lib/errorHandler';
import { MapMarker } from '@/types/map';
import { useEffect, useState } from 'react';


export const usePubs = () => {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null); // Change to AppError | null
  const [pubCheckins, setPubCheckins] = useState<{[key: string]: any[]}>({});

  const loadPubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const pubsData = await getPubs();
      setPubs(pubsData);
    } catch (error: any) {
      console.error('Error loading pubs:', error);
      if (error instanceof AppError) {
        setError(error);
      } else {
        setError(new AppError(error.message, 'UNKNOWN_ERROR', 'Failed to load pubs'));
      }
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyPubs = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);
    try {
      // Use the new paginated search function
      const places = await searchAllPubsNearby(latitude, longitude);
      
      if (places.length === 0) {
        setError(new AppError('No pubs found', 'NO_RESULTS', 'No pubs found in this area'));
        return;
      }
      
      const newPubs: Pub[] = [];
      
      // Process ALL pubs found, not just first 5
      for (const place of places) {
        if (!place.name || !place.geometry?.location) continue;

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
          if (error.code === 'permission-denied') {
            setError(new AppError(
              error.message, 
              'PERMISSION_DENIED', 
              'Authentication required to save pubs'
            ));
          }
        }
      }
      
      if (newPubs.length > 0) {
        setPubs(newPubs);
        console.log(`Loaded ${newPubs.length} pubs in the area`);
      } else {
        setError(new AppError(
          'No pubs saved', 
          'SAVE_FAILED', 
          'Could not save any pubs to database'
        ));
      }
    } catch (error: any) {
      console.error('Error searching nearby pubs:', error);
      if (error instanceof AppError) {
        setError(error);
      } else {
        setError(new AppError(
          error.message, 
          'SEARCH_ERROR', 
          'Failed to search for pubs'
        ));
      }
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
      if (error instanceof AppError) {
        setError(error);
      } else {
        setError(new AppError(
          error.message, 
          'CHECKIN_ERROR', 
          'Failed to create checkin'
        ));
      }
      throw error;
    }
  };

  const loadPubCheckins = async (pubId: string) => {
    try {
      const checkins = await getPubCheckins(pubId);
      setPubCheckins(prev => ({
        ...prev,
        [pubId]: checkins
      }));
    } catch (error) {
      console.error('Error loading pub checkins:', error);
    }
  };  

  const convertPubsToMarkers = (pubs: Pub[]): MapMarker[] => {
  return pubs.map(pub => ({
    id: pub.id,
    coordinate: {
      latitude: pub.location.latitude,
      longitude: pub.location.longitude,
    },
    title: pub.name,
    description: pub.location.address,
    pinColor: '#8B5CF6',
  }));
};

  useEffect(() => {
    loadPubs();
  }, []);

  return {
    pubs,
    loading,
    error,
    pubCheckins,
    loadPubs,
    searchNearbyPubs,
    createCheckin,
    markers: convertPubsToMarkers(pubs),
    loadPubCheckins,
  };
};