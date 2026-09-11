"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  Users, 
  AppWindow, 
  Settings, 
  ArrowRight, 
  ShieldCheck, 
  Crown,
  Loader2
} from "lucide-react";

export default function AdminDashboardOverview() {
  const { profile, isSuperadmin } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCounts() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        setUserCount(usersSnap.size);
        const appsSnap = await getDocs(collection(db, "applications"));
        setAppCount(appsSnap.size);
      } catch (err) {
        console.error("Error loading counts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCounts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Selamat Datang, {profile?.displayName || "Administrator"}
            </h1>
            {isSuperadmin ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800 uppercase">
                <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                Super Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pilih menu administrasi di bawah ini untuk mengelola akun mahasiswa, aplikasi SSO, atau pengaturan platform.
          </p>
        </div>
      </div>

      {/* Grid Menu Portal Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Menu 1: Pengguna */}
        <Link
          href="/admin/users"
          className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Manajemen Pengguna
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola status akun, hak akses role, serta pencarian biodata mahasiswa.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {loading ? "..." : `${userCount} Pengguna`}
            </span>
            <span className="text-indigo-600 font-medium flex items-center gap-1">
              Buka <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Menu 2: Aplikasi SSO */}
        <Link
          href="/admin/apps"
          className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <AppWindow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Aplikasi Klien SSO
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Integrasi OAuth/SSO dan pendaftaran callback URL aplikasi eksternal.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {loading ? "..." : `${appCount} Klien`}
            </span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              Buka <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Menu 3: Konfigurasi */}
        <Link
          href="/admin/config"
          className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                Konfigurasi Sistem
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengaturan mode pemeliharaan, izin edit profil, dan audit keamanan.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {isSuperadmin ? "Akses Penuh" : "Mode Baca"}
            </span>
            <span className="text-amber-600 font-medium flex items-center gap-1">
              Buka <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
