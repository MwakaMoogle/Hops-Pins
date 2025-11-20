// lib/api/pubs.ts
import { handleFirebaseError } from '@/lib/errorHandler';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';

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

// Helper function to safely get address
const getSafeAddress = (place: any): string => {
  return place.formatted_address || place.vicinity || 'Address not available';
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

// Pub operations - UPDATED to handle duplicate pubs and safe data
export const addPub = async (pubData: Omit<Pub, 'id' | 'createdAt' | 'totalCheckins' | 'averageRating'>): Promise<string> => {
  try {
    // Check if pub already exists by placeId
    if (pubData.placeId) {
      const existingPub = await getPubByPlaceId(pubData.placeId);
      if (existingPub) {
        return existingPub.id;
      }
    }

    const docRef = await addDoc(pubsRef, {
      ...pubData,
      totalCheckins: 0,
      averageRating: 0,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
};

export const getPubs = async (): Promise<Pub[]> => {
  try {
    const querySnapshot = await getDocs(pubsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Pub));
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
};

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

    // Update pub's checkin count and average rating
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
    const q = query(
      checkinsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Checkin));
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
};