// hooks/usePubs.ts
import { useEffect, useState } from 'react';
import { searchPubsNearby } from '../lib/api/places';
import { Pub, addCheckin, addPub, getPubs } from '../lib/api/pubs';

export const usePubs = () => {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPubs = async () => {
    setLoading(true);
    try {
      const pubsData = await getPubs();
      setPubs(pubsData);
    } catch (error) {
      console.error('Error loading pubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyPubs = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const places = await searchPubsNearby(latitude, longitude);
      
      // Convert PlaceResults to Pub format and save to Firestore
      const newPubs = await Promise.all(
        places.map(async (place) => {
          const pubData = {
            name: place.name,
            location: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              address: place.formatted_address,
            },
            placeId: place.place_id,
          };
          
          const pubId = await addPub(pubData);
          return { id: pubId, ...pubData, totalCheckins: 0, averageRating: 0 } as Pub;
        })
      );
      
      setPubs(newPubs);
    } catch (error) {
      console.error('Error searching nearby pubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckin = async (checkinData: Omit<Parameters<typeof addCheckin>[0], 'userId'> & { userId: string }) => {
    try {
      await addCheckin(checkinData);
      // Reload pubs to update checkin counts
      await loadPubs();
    } catch (error) {
      console.error('Error creating checkin:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadPubs();
  }, []);

  return {
    pubs,
    loading,
    loadPubs,
    searchNearbyPubs,
    createCheckin,
  };
};