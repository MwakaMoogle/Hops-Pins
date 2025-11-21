// hooks/useAuth.ts
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/api/users';
import { getCurrentUser, logout, onAuthStateChange, signIn, signUp } from '@/lib/auth';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load user profile when auth state changes
  useEffect(() => {
    const loadUserProfile = async (user: User) => {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        
        // Update last login
        if (profile) {
          await updateUserProfile(user.uid, { lastLogin: new Date() as any });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    // Check for existing user immediately
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserProfile(currentUser);
      setLoading(false);
    }
    
    setInitialized(true);

    return unsubscribe;
  }, []);

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user, error } = await signUp(email, password, displayName);
      if (error) {
        setError(error);
        return { success: false, error };
      }
      return { success: true, error: null };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user, error } = await signIn(email, password);
      if (error) {
        setError(error);
        return { success: false, error };
      }
      return { success: true, error: null };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await logout();
      if (error) {
        setError(error);
        return { success: false, error };
      }
      setUserProfile(null);
      return { success: true, error: null };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // State
    user,
    userProfile,
    loading,
    error,
    initialized,
    isAuthenticated: !!user,
    
    // Actions
    signUp: handleSignUp,
    signIn: handleSignIn,
    logout: handleLogout,
    clearError,
    
    // Convenience
    userId: user?.uid,
    displayName: user?.displayName || userProfile?.displayName,
    email: user?.email,
  };
};