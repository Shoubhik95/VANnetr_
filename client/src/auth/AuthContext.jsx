import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db,
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc
} from '../firebase/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [officerProfile, setOfficerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('vannetr_officer_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Helper: Save profile locally only (no database creation)
  const saveOfficerProfile = async (profile) => {
    const data = {
      uid: profile.uid,
      fullName: profile.fullName || 'Officer',
      officerId: profile.officerId || 'FRA-OFF-' + profile.uid.substring(0, 6).toUpperCase(),
      email: profile.email,
      role: 'OFFICER',
      emailVerified: true,
      updatedAt: new Date().toISOString()
    };

    setOfficerProfile(data);
    localStorage.setItem('vannetr_officer_profile', JSON.stringify(data));
    return data;
  };

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let profileData = null;
        const saved = localStorage.getItem('vannetr_officer_profile');
        if (saved) {
          try { profileData = JSON.parse(saved); } catch {}
        }

        const updated = await saveOfficerProfile({
          uid: currentUser.uid,
          fullName: profileData?.fullName || currentUser.displayName || 'Officer ' + (currentUser.email ? currentUser.email.split('@')[0] : 'User'),
          officerId: profileData?.officerId || 'FRA-OFF-' + currentUser.uid.substring(0, 6).toUpperCase(),
          email: currentUser.email
        });

        setOfficerProfile(updated);
      } else {
        const saved = localStorage.getItem('vannetr_officer_profile');
        if (saved) {
          try {
            setOfficerProfile(JSON.parse(saved));
          } catch {
            setOfficerProfile(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign In with Email/Password
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      const profile = await saveOfficerProfile({
        uid: result.user.uid,
        fullName: result.user.displayName || email.split('@')[0],
        officerId: 'FRA-OFF-' + result.user.uid.substring(0, 6).toUpperCase(),
        email: result.user.email
      });
      return { success: true, user: result.user, profile };
    } catch (err) {
      console.error("Firebase Login Error:", err.code, err.message);
      let userMsg = "Invalid email or password.";
      if (err.code === 'auth/user-not-found') userMsg = "No officer account found with this email.";
      if (err.code === 'auth/wrong-password') userMsg = "Incorrect password. Please try again.";
      if (err.code === 'auth/invalid-email') userMsg = "Invalid email address format.";
      if (err.code === 'auth/invalid-credential') userMsg = "Invalid official email or password credentials.";
      
      return { success: false, message: userMsg, errorCode: err.code };
    }
  };

  // Sign Up with Email/Password -> CREATES REAL USER IN FIREBASE AUTHENTICATION
  const signupWithFirebase = async (email, password, { fullName, officerId }) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      const profile = await saveOfficerProfile({
        uid: result.user.uid,
        fullName: fullName || email.split('@')[0],
        officerId: officerId || 'FRA-OFF-' + result.user.uid.substring(0, 6).toUpperCase(),
        email: result.user.email
      });
      console.log("✅ Firebase Real Account Created:", result.user.email, "UID:", result.user.uid);
      return { success: true, user: result.user, profile };
    } catch (err) {
      console.error("Firebase Signup Error:", err.code, err.message);
      let userMsg = "Failed to create Firebase officer account: " + err.message;
      if (err.code === 'auth/email-already-in-use') userMsg = "An officer account already exists with this email address. Please Sign In.";
      if (err.code === 'auth/weak-password') userMsg = "Password is too weak. Please use at least 8 characters.";
      if (err.code === 'auth/invalid-email') userMsg = "Invalid email address format.";
      if (err.code === 'auth/operation-not-allowed') userMsg = "Email/Password is disabled in Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method -> Enable Email/Password.";

      return { success: false, message: userMsg, errorCode: err.code };
    }
  };

  // Google Sign-In -> CREATES REAL USER IN FIREBASE AUTHENTICATION
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      const profile = await saveOfficerProfile({
        uid: result.user.uid,
        fullName: result.user.displayName || 'Officer ' + result.user.email.split('@')[0],
        officerId: 'FRA-GOV-' + result.user.uid.substring(0, 6).toUpperCase(),
        email: result.user.email
      });
      console.log("✅ Firebase Google Real Account Created/Authenticated:", result.user.email);
      return { success: true, user: result.user, profile };
    } catch (err) {
      console.error("Google Sign-In Error:", err.code, err.message);
      return { success: false, message: "Google Authentication failed: " + err.message };
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Signout error:", err);
    }
    setUser(null);
    setOfficerProfile(null);
    localStorage.removeItem('vannetr_officer_profile');
  };

  const value = {
    user,
    officerProfile,
    isAuthenticated: !!(user || officerProfile),
    loading,
    loginWithEmail,
    signupWithFirebase,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
