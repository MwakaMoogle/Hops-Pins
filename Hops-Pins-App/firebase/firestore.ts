// firebase/firestore.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';

// Collection references
export const pubsRef = collection(db, 'pubs');
export const checkinsRef = collection(db, 'checkins');
export const usersRef = collection(db, 'users');

// ===== PUB OPERATIONS =====
export const addPub = async (pubData: {
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  placeId?: string;
}) => {
  try {
    const docRef = await addDoc(pubsRef, {
      ...pubData,
      createdAt: Timestamp.now(),
      totalCheckins: 0,
      averageRating: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding pub:', error);
    throw error;
  }
};

export const getPubs = async () => {
  const querySnapshot = await getDocs(pubsRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getPubById = async (pubId: string) => {
  const docRef = doc(db, 'pubs', pubId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error('Pub not found');
  }
};

// ===== CHECKIN OPERATIONS =====
export const addCheckin = async (checkinData: {
  userId: string;
  pubId: string;
  pubName: string;
  drink: string;
  rating: number;
  note?: string;
}) => {
  try {
    const docRef = await addDoc(checkinsRef, {
      ...checkinData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding checkin:', error);
    throw error;
  }
};

export const getUserCheckins = async (userId: string) => {
  const q = query(
    checkinsRef, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getPubCheckins = async (pubId: string) => {
  const q = query(
    checkinsRef, 
    where('pubId', '==', pubId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// ===== USER PROFILE OPERATIONS =====
export const createUserProfile = async (userId: string, userData: {
  email: string;
  displayName?: string;
}) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await setDoc(userDoc, {
      ...userData,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    // If document doesn't exist, create it
    const userDoc = doc(db, 'users', userId);
    await setDoc(userDoc, {
      ...userData,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      totalCheckins: 0
    }, { merge: true });
  }
};

export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};