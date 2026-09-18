"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  Shield, 
  ShieldCheck, 
  Crown, 
  Users, 
  AppWindow, 
  Settings, 
  ArrowLeft, 
  LogOut, 
  Loader2,
  Activity,
  Database,
  KeyRound
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, isSuperadmin, loading: authLoading, logout } = useAuth();

  // Auth Guard: Hanya boleh diakses oleh Admin & Super Admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [user, isAdmin, authLoading, router]);

  if (authLoading || !isAdmin) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center p-4">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isCurrent = (path: string) => {
    if (path === "/admin" && (pathname === "/admin" || pathname === "/admin/users")) return true;
    return pathname.startsWith(path);
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 md:pb-8">
      {/* 1. TOP NAVBAR PORTAL ADMIN (DESKTOP & TABLET) */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo & Role Badge */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2 hover:opacity-90">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  Portal Admin PSAK
                </span>
              </Link>

              {/* Distinction: PENGURUS INTI (PI) vs PENGURUS KOORDINATOR (PK) */}
              {isSuperadmin ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800 tracking-wide">
                  <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Pengurus Inti (PI)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 tracking-wide">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  Pengurus Koordinator (PK)
                </span>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/admin/users"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === "/admin/users" || pathname === "/admin"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Pengguna
              </Link>

              <Link
                href="/admin/apps"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === "/admin/apps"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <AppWindow className="w-3.5 h-3.5" />
                Aplikasi SSO
              </Link>

              <Link
                href="/admin/logs"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === "/admin/logs"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Log Sistem
              </Link>

              <Link
                href="/admin/roles"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === "/admin/roles"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Hak Akses
              </Link>

              <Link
                href="/admin/backup"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === "/admin/backup"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Backup Data
              </Link>

              <Link
                href="/admin/config"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === "/admin/config"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Konfigurasi
              </Link>
            </div>

            {/* Right Action Links */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Beranda Akun</span>
              </Link>

              <button
                onClick={() => logout()}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1"
                title="Keluar dari Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {children}
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
        <Link
          href="/admin/users"
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors ${
            pathname === "/admin/users" || pathname === "/admin"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500"
          }`}
        >
          <Users className="w-4 h-4" />
          Pengguna
        </Link>

        <Link
          href="/admin/apps"
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors ${
            pathname === "/admin/apps"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500"
          }`}
        >
          <AppWindow className="w-4 h-4" />
          Aplikasi
        </Link>

        <Link
          href="/admin/logs"
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors ${
            pathname === "/admin/logs"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500"
          }`}
        >
          <Activity className="w-4 h-4" />
          Log
        </Link>

        <Link
          href="/admin/backup"
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors ${
            pathname === "/admin/backup"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500"
          }`}
        >
          <Database className="w-4 h-4" />
          Backup
        </Link>

        <Link
          href="/admin/config"
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors ${
            pathname === "/admin/config"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500"
          }`}
        >
          <Settings className="w-4 h-4" />
          Sistem
        </Link>

        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-[9px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Beranda
        </Link>
      </nav>
    </div>
  );
}
