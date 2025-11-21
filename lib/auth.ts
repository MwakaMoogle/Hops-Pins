// lib/auth.ts
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { createUserProfile } from './api/users';
import { auth } from './firebase';

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    console.log('Attempting to sign up user:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('User created successfully:', user.uid);

    // Update profile with display name
    await updateProfile(user, {
      displayName: displayName
    });

    // Create user profile in Firestore
    await createUserProfile(user.uid, {
      email: email,
      displayName: displayName,
    });

    console.log('User profile created successfully');
    return { user, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // Handle specific Firebase auth errors
    let errorMessage = error.message;
    
    if (error.code === 'auth/configuration-not-found') {
      errorMessage = 'Firebase configuration error. Please check your environment variables.';
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    }
    
    return { user: null, error: errorMessage };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in user:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log('User signed in successfully:', userCredential.user.uid);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Handle specific Firebase auth errors
    let errorMessage = error.message;
    
    if (error.code === 'auth/configuration-not-found') {
      errorMessage = 'Firebase configuration error. Please check your environment variables.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email. Please sign up first.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    return { user: null, error: errorMessage };
  }
};

// ... rest of the file remains the same
export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};