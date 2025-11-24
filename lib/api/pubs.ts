// lib/api/pubs.ts - UPDATED FOR NEW PLACES API
import { handleFirebaseError } from '@/lib/errorHandler';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { getPlacePhotoUrl } from './places';

// Collection references
export const pubsRef = collection(db, 'pubs');
export const checkinsRef = collection(db, 'checkins');

// Types
export interface Pub {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  placeId?: string;
  totalCheckins: number;
  averageRating: number;
  createdAt: Timestamp;
  imageUrl?: string;
  distance?: number;
  googleRating?: number;
  userRatingCount?: number;
  openingHours?: {
    openNow: boolean;
    weekdayDescriptions?: string[];
  };
  phone?: string;
  website?: string;
}

export interface Checkin {
  id: string;
  userId: string;
  pubId: string;
  pubName: string;
  drink: string;
  rating: number;
  note?: string;
  createdAt: Timestamp;
}

// Helper function to calculate distance
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'miles' | 'kilometers' = 'miles'
): number => {
  const R = unit === 'miles' ? 3959 : 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

// Enhanced pub creation with new Places API v1 data
export const addPub = async (
  pubData: Omit<Pub, 'id' | 'createdAt' | 'totalCheckins' | 'averageRating'>,
  placeData?: any
): Promise<string> => {
  try {
    // Check if pub already exists by placeId
    if (pubData.placeId) {
      const existingPub = await getPubByPlaceId(pubData.placeId);
      if (existingPub) {
        console.log('🏪 Pub already exists:', existingPub.name);
        return existingPub.id;
      }
    }

    // Build enhanced data
    const enhancedData: any = {
      ...pubData,
      totalCheckins: 0,
      averageRating: 0,
      createdAt: Timestamp.now(),
    };

    // Add Google Places data if available
    if (placeData) {
      console.log('🔍 Processing new API place data for:', pubData.name);
      console.log('📸 Available photos:', placeData.photos?.length);
      
      if (placeData.rating) enhancedData.googleRating = placeData.rating;
      if (placeData.userRatingCount) enhancedData.userRatingCount = placeData.userRatingCount;
      if (placeData.currentOpeningHours) enhancedData.openingHours = placeData.currentOpeningHours;
      if (placeData.internationalPhoneNumber) enhancedData.phone = placeData.internationalPhoneNumber;
      if (placeData.websiteUri) enhancedData.website = placeData.websiteUri;
      
      // Add image URL if photos available - use the first photo with new API
      if (placeData.photos?.[0]?.name) {
        const photoUrl = getPlacePhotoUrl(placeData.photos[0].name, 400, 400);
        enhancedData.imageUrl = photoUrl;
        console.log('✅ Generated new API photo URL:', photoUrl);
      } else {
        console.log('❌ No photos available for:', pubData.name);
      }
    }

    const docRef = await addDoc(pubsRef, enhancedData);
    console.log('💾 Saved pub to Firebase:', pubData.name);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding pub:', error);
    throw handleFirebaseError(error);
  }
};

// Check if pub already exists by placeId
export const getPubByPlaceId = async (placeId: string): Promise<Pub | null> => {
  const q = query(pubsRef, where('placeId', '==', placeId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Pub;
  }
  return null;
};

// Get pubs with distance calculation
export const getPubs = async (userLat?: number, userLng?: number): Promise<Pub[]> => {
  try {
    const querySnapshot = await getDocs(pubsRef);
    const pubs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Pub));

    // Calculate distances if user coordinates provided
    if (userLat && userLng) {
      return pubs.map(pub => ({
        ...pub,
        distance: calculateDistance(userLat, userLng, pub.location.latitude, pub.location.longitude, 'miles')
      })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    return pubs;
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
};

// Rest of the functions remain similar but use the updated Pub interface
export const getPubById = async (pubId: string): Promise<Pub | null> => {
  try {
    const docRef = doc(db, 'pubs', pubId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Pub;
    }
    return null;
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
};

export const addCheckin = async (checkinData: Omit<Checkin, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(checkinsRef, {
      ...checkinData,
      createdAt: Timestamp.now(),
    });

    const pubRef = doc(db, 'pubs', checkinData.pubId);
    const pubDoc = await getDoc(pubRef);
    
    if (pubDoc.exists()) {
      const pubData = pubDoc.data();
      const newTotalCheckins = (pubData.totalCheckins || 0) + 1;
      const newAverageRating = ((pubData.averageRating || 0) * (newTotalCheckins - 1) + checkinData.rating) / newTotalCheckins;

      await updateDoc(pubRef, {
        totalCheckins: newTotalCheckins,
        averageRating: Math.round(newAverageRating * 10) / 10,
      });
    }

    return docRef.id;
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
};

export const getUserCheckins = async (userId: string): Promise<Checkin[]> => {
  try {
    const q = query(checkinsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkin));
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
};

export const getPubCheckins = async (pubId: string): Promise<Checkin[]> => {
  try {
    const q = query(checkinsRef, where('pubId', '==', pubId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkin));
  } catch (error: any) {
    console.error('Error loading pub checkins:', error);
    return [];
  }
};

export const updatePubWithImage = async (pubId: string, imageUrl: string): Promise<void> => {
  try {
    const pubRef = doc(db, 'pubs', pubId);
    await updateDoc(pubRef, {
      imageUrl: imageUrl
    });
    console.log('✅ Updated pub with image:', pubId);
  } catch (error: any) {
    console.error('Error updating pub with image:', error);
    throw handleFirebaseError(error);
  }
};