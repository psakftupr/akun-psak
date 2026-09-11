"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { UserProfile } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isSuperadmin: false,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          uid,
          email: data.email || "",
          displayName: data.displayName || "",
          photoURL: data.photoURL || "",
          role: data.role || "anggota",
          status: data.status || "aktif",
          nim: data.nim || "",
          gender: data.gender || "Laki-laki",
          prodi: data.prodi || "Teknik Informatika",
          angkatan: typeof data.angkatan === "number" ? data.angkatan : parseInt(data.angkatan) || new Date().getFullYear(),
          jalurMasuk: data.jalurMasuk || "SNBP",
          whatsapp: data.whatsapp || "",
          statusKeanggotaan: data.statusKeanggotaan || "Mahasiswa Aktif",
          denominasiGereja: data.denominasiGereja || "",
          tanggalLahir: data.tanggalLahir || "",
          instagram: data.instagram || "",
          linkedin: data.linkedin || "",
          minatBakat: data.minatBakat || "",
          hidePhotoInDirectory: data.hidePhotoInDirectory || false,
          hideProfileInDirectory: data.hideProfileInDirectory || false,
          customToken: data.customToken,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !auth || !auth.app) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  }, [user, fetchProfile]);

  const logout = useCallback(async () => {
    if (auth && auth.app) {
      await signOut(auth);
    }
    setUser(null);
    setProfile(null);
  }, []);

  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";
  const isSuperadmin = profile?.role === "superadmin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isSuperadmin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
