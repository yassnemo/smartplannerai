import { useFirebaseAuth } from './useFirebaseAuth';

export function useAuth() {
  const {
    user,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithGoogleRedirect,
    logout,
    getAuthToken
  } = useFirebaseAuth();

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithGoogleRedirect,
    logout,
    getAuthToken
  };
}
