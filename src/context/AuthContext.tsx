import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAILS = ['islammunjurul468@gmail.com', 'munjurul41104@gmail.com'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          let currentProfile: UserProfile;

          if (userDoc.exists()) {
            currentProfile = userDoc.data() as UserProfile;

            const isHardcodedAdmin =
              firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email);

            if (isHardcodedAdmin && currentProfile.role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin' });
              currentProfile.role = 'admin';
            }

            setProfile(currentProfile);
          } else {
            const isInitialAdmin =
              firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email);

            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous',
              photoURL: firebaseUser.photoURL || '',
              role: isInitialAdmin ? 'admin' : 'user',
              createdAt: serverTimestamp(),
            };

            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }

          // 🔥 SAFE backend call (optional)
          try {
            const res = await fetch("http://localhost:5000/api/auth/google");
            // optional, ignore if fails
          } catch (err) {
            console.log("Backend optional error:", err);
          }

        } catch (err) {
          console.log("Auth error:", err);
        }
      } else {
        setProfile(null);
      }

      setLoading(false); // 🔥 MOST IMPORTANT
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin:
          profile?.role === 'admin' ||
          (!!user?.email && ADMIN_EMAILS.includes(user.email)),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);