// hooks/useAuth.ts
import { useEffect, useState } from 'react';

// Temporary user object - replace with real auth later
const temporaryUser = {
  uid: 'temp-user-123',
  email: 'temp@user.com',
  displayName: 'Temporary User'
};

export const useAuth = () => {
  const [user, setUser] = useState<any>(temporaryUser);
  const [loading, setLoading] = useState(false);

  // Simulate async auth initialization
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUser(temporaryUser);
      setLoading(false);
    }, 500);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};