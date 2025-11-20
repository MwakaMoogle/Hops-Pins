// lib/api/pubs.ts
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';

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

// Pub operations
export const addPub = async (pubData: Omit<Pub, 'id' | 'createdAt' | 'totalCheckins' | 'averageRating'>) => {
  const docRef = await addDoc(pubsRef, {
    ...pubData,
    totalCheckins: 0,
    averageRating: 0,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getPubs = async (): Promise<Pub[]> => {
  const querySnapshot = await getDocs(pubsRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Pub));
};

export const getPubById = async (pubId: string): Promise<Pub | null> => {
  const docRef = doc(db, 'pubs', pubId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Pub;
  }
  return null;
};

// Checkin operations
export const addCheckin = async (checkinData: Omit<Checkin, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(checkinsRef, {
    ...checkinData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserCheckins = async (userId: string): Promise<Checkin[]> => {
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
};