import { useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        setUser(user);

        // Send token to backend for session management
        try {
          const idToken = await firebaseUser.getIdToken();
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
          });
        } catch (error) {
          console.error('Error sending token to backend:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Check for redirect result when component mounts
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('Google redirect login successful:', result.user);
        }
      })
      .catch((error) => {
        console.error('Google redirect login error:', error);
      });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };  const loginWithGoogle = async () => {
    try {
      console.log('Attempting Google login...');
      const provider = new GoogleAuthProvider();
      
      // Add scopes for better user info
      provider.addScope('email');
      provider.addScope('profile');
      
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Try popup first, fallback to redirect if popup fails
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('Google popup login successful:', result.user);
        return { user: result.user, error: null };
      } catch (popupError: any) {
        console.log('Popup failed, trying redirect:', popupError.code);
        
        // If popup fails, use redirect method
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          
          console.log('Using redirect method for Google login...');
          await signInWithRedirect(auth, provider);
          // Redirect will handle the rest, so we return a pending state
          return { user: null, error: null };
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Handle specific error codes
      let errorMessage = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Redirecting to Google...';
        // Try redirect as fallback
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
          return { user: null, error: null };
        } catch (redirectError) {
          errorMessage = 'Unable to sign in with Google. Please try again.';
        }
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Only one login request is allowed at a time.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled. Please contact support.';
      }
      
      return { user: null, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const getAuthToken = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  };
  const loginWithGoogleRedirect = async () => {
    try {
      console.log('Using Google redirect login...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithRedirect(auth, provider);
      // The redirect will handle the authentication
      return { user: null, error: null };
    } catch (error: any) {
      console.error('Google redirect login error:', error);
      return { user: null, error: error.message };
    }
  };

  return {
    user,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithGoogleRedirect,
    logout,
    getAuthToken
  };
}
