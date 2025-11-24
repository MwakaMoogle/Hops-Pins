// hooks/usePubs.ts - UPDATED FOR NEW PLACES API
import { searchAllPubsNearby, testPlacesApiAccess } from '@/lib/api/places';
import { Pub, addCheckin, addPub, calculateDistance, getPubByPlaceId, getPubCheckins, getPubs } from '@/lib/api/pubs';
import { AppError } from '@/lib/errorHandler';
import { MapMarker } from '@/types/map';
import { useEffect, useState } from 'react';

export const usePubs = () => {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [pubCheckins, setPubCheckins] = useState<{[key: string]: any[]}>({});
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);

  const loadPubs = async (lat?: number, lng?: number) => {
    setLoading(true);
    setError(null);
    try {
      if (lat && lng) {
        setUserLocation({ latitude: lat, longitude: lng });
      }
      
      const pubsData = await getPubs(lat, lng);
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
      // Test API access first
      console.log('🧪 Testing Places API access...');
      const apiAccess = await testPlacesApiAccess(latitude, longitude);
      
      if (!apiAccess) {
        throw new AppError(
          'Places API access failed',
          'API_ACCESS_ERROR',
          'Unable to connect to location services. Please try again.'
        );
      }

      // Use the new API search function
      const places = await searchAllPubsNearby(latitude, longitude);
      
      if (places.length === 0) {
        setError(new AppError('No pubs found', 'NO_RESULTS', 'No pubs found in this area'));
        return;
      }
      
      const newPubs: Pub[] = [];
      
      // Process places with new API structure
      for (const place of places) {
        if (!place.displayName?.text || !place.location) continue;

        try {
          console.log('🔍 Processing place:', place.displayName.text);
          console.log('📸 Photos available:', place.photos?.length);

          const pubData = {
            name: place.displayName.text,
            location: {
              latitude: place.location.latitude,
              longitude: place.location.longitude,
              address: place.formattedAddress || 'Address not available',
            },
            placeId: place.id,
          };

          // Use the place data directly from search (no need for additional details call)
          const pubId = await addPub(pubData, place);
          const newPub = await getPubByPlaceId(place.id);
          
          if (newPub) {
            console.log('🏪 Pub saved:', newPub.name);
            console.log('🖼️  Has image:', !!newPub.imageUrl);
            console.log('🖼️  Image URL:', newPub.imageUrl);
            
            // Calculate distance for this pub
            const pubWithDistance = {
              ...newPub,
              distance: calculateDistance(
                latitude,
                longitude,
                newPub.location.latitude,
                newPub.location.longitude,
                'miles'
              )
            };
            newPubs.push(pubWithDistance);
          }
        } catch (error: any) {
          console.error('Error adding pub:', error);
          // Continue with next pub even if one fails
        }
      }
      
      // Sort by distance
      const sortedPubs = newPubs.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      
      if (sortedPubs.length > 0) {
        setPubs(sortedPubs);
        setUserLocation({ latitude, longitude });
        const pubsWithImages = sortedPubs.filter(p => p.imageUrl).length;
        console.log(`✅ Loaded ${sortedPubs.length} pubs, ${pubsWithImages} with images`);
      } else {
        setError(new AppError('No pubs saved', 'SAVE_FAILED', 'Could not save any pubs to database'));
      }
    } catch (error: any) {
      console.error('Error searching nearby pubs:', error);
      if (error instanceof AppError) {
        setError(error);
      } else {
        setError(new AppError(error.message, 'SEARCH_ERROR', 'Failed to search for pubs'));
      }
    } finally {
      setLoading(false);
    }
  };

  const createCheckin = async (checkinData: Omit<Parameters<typeof addCheckin>[0], 'userId'> & { userId: string }) => {
    setError(null);
    try {
      await addCheckin(checkinData);
      if (userLocation) {
        await loadPubs(userLocation.latitude, userLocation.longitude);
      } else {
        await loadPubs();
      }
    } catch (error: any) {
      console.error('Error creating checkin:', error);
      if (error instanceof AppError) {
        setError(error);
      } else {
        setError(new AppError(error.message, 'CHECKIN_ERROR', 'Failed to create checkin'));
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
      imageUrl: pub.imageUrl,
      distance: pub.distance,
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
    userLocation,
    loadPubs,
    searchNearbyPubs,
    createCheckin,
    markers: convertPubsToMarkers(pubs),
    loadPubCheckins,
    refreshPubs: () => userLocation ? loadPubs(userLocation.latitude, userLocation.longitude) : loadPubs(),
  };
};