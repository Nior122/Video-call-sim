import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  createdAt?: any;
  lastLoginAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: "signin" | "signup";
  settingsModalOpen: boolean;
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserDisplayName: (name: string) => Promise<void>;
  updateUserProfile: (name: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Sync user doc in Firestore
  const syncUserProfile = async (currentUser: User) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);

      let savedData: Partial<UserProfile> = {};
      if (snap.exists()) {
        savedData = snap.data() as UserProfile;
      }

      const profileData: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: savedData.displayName || currentUser.displayName || (currentUser.isAnonymous ? "Guest Member" : "Dream Girl Member"),
        photoURL: savedData.photoURL || currentUser.photoURL || null,
        isAnonymous: currentUser.isAnonymous,
        lastLoginAt: serverTimestamp(),
      };

      if (!snap.exists()) {
        profileData.createdAt = serverTimestamp();
        await setDoc(userRef, profileData, { merge: true });
      } else {
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      }

      setProfile({
        ...profileData,
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
      });
    } catch (err) {
      console.warn("Could not sync profile to firestore (offline or permissions):", err);
      setProfile({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || (currentUser.isAnonymous ? "Guest Member" : "Dream Girl Member"),
        photoURL: currentUser.photoURL || null,
        isAnonymous: currentUser.isAnonymous,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openSettingsModal = () => {
    setSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setSettingsModalOpen(false);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await syncUserProfile(cred.user);
    }
    setAuthModalOpen(false);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    if (cred.user) {
      await syncUserProfile(cred.user);
    }
    setAuthModalOpen(false);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    if (cred.user) {
      await syncUserProfile(cred.user);
    }
    setAuthModalOpen(false);
  };

  const signInAsGuest = async () => {
    const cred = await signInAnonymously(auth);
    if (cred.user) {
      await syncUserProfile(cred.user);
    }
    setAuthModalOpen(false);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const updateUserDisplayName = async (name: string) => {
    await updateUserProfile(name, profile?.photoURL || undefined);
  };

  const updateUserProfile = async (name: string, photoURL?: string) => {
    if (!auth.currentUser) return;
    const cleanName = name.trim() || (auth.currentUser.isAnonymous ? "Guest Member" : "Dream Girl Member");
    const cleanPhoto = photoURL || null;

    await updateProfile(auth.currentUser, {
      displayName: cleanName,
      photoURL: cleanPhoto,
    });

    setUser({ ...auth.currentUser, displayName: cleanName, photoURL: cleanPhoto });
    
    setProfile((prev) => ({
      uid: auth.currentUser!.uid,
      email: auth.currentUser!.email,
      isAnonymous: auth.currentUser!.isAnonymous,
      displayName: cleanName,
      photoURL: cleanPhoto,
      createdAt: prev?.createdAt,
      lastLoginAt: prev?.lastLoginAt,
    }));

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        displayName: cleanName,
        photoURL: cleanPhoto,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn("Could not persist profile changes to firestore:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authModalOpen,
        authModalMode,
        settingsModalOpen,
        openAuthModal,
        closeAuthModal,
        openSettingsModal,
        closeSettingsModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        updateUserDisplayName,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
