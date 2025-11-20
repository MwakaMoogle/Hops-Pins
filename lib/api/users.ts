// lib/api/users.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  totalCheckins: number;
  favoriteBeer?: string;
  bio?: string;
}

export const createUserProfile = async (userId: string, userData: {
  email: string;
  displayName: string;
  photoURL?: string;
}) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      uid: userId,
      totalCheckins: 0,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      lastLogin: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const incrementUserCheckins = async (userId: string) => {
  try {
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalCheckins: (userProfile.totalCheckins || 0) + 1,
        lastLogin: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error incrementing user checkins:', error);
  }
}; 