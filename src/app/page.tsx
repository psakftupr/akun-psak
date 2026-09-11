"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  ShieldCheck, 
  Sparkles, 
  Users, 
  KeyRound, 
  GraduationCap, 
  UserCheck, 
  ArrowRight,
  ExternalLink,
  Lock,
  BadgeCheck,
  Building2,
  Calendar
} from "lucide-react";

export default function HomePage() {
  const { user, profile, loading } = useAuth();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/20 via-transparent to-transparent dark:from-indigo-900/20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Satu Akun Untuk Seluruh Ekosistem Digital PSAK FT UPR</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Identitas Tunggal & Layanan Digital{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                PSAK FT UPR
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Platform Single Sign-On (SSO) resmi untuk sivitas akademika kristen Fakultas Teknik Universitas Palangka Raya. Mendaftar, kelola profil mahasiswa, dan akses semua aplikasi organisasi dengan mudah.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {loading ? (
                <div className="h-12 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
              ) : user ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/profile"
                    className="px-6 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center gap-2 text-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    Buka Profil Anggota
                  </Link>
                  <Link
                    href="/directory"
                    className="px-6 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center gap-2 text-sm shadow-xs"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    Lihat Direktori Anggota
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/register"
                    className="px-6 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center gap-2 text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Daftar Sebagai Anggota
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center gap-2 text-sm shadow-xs"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    Masuk ke Akun
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Logged in User ID Card Preview */}
      {user && profile && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full -mt-6 mb-12 relative z-10">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                {profile.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                    {profile.displayName ? profile.displayName[0].toUpperCase() : "U"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {profile.displayName}
                    </h2>
                    <BadgeCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400">
                    NIM: <span className="font-semibold text-slate-900 dark:text-white">{profile.nim || "-"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize">
                      Status: {profile.status}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize">
                      Role: {profile.role}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/profile"
                className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                Pengaturan Akun Lengkap
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Profile Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  Program Studi
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile.prodi || "-"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Angkatan
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile.angkatan || "-"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  Jalur Masuk
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile.jalurMasuk || "-"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-violet-500" />
                  Keanggotaan
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile.statusKeanggotaan || "Mahasiswa Aktif"}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Mengapa Platform SSO PSAK?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Meningkatkan efisiensi kolaborasi digital antar bidang, kepanitiaan, dan aplikasi mahasiswa di Fakultas Teknik UPR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Single Sign-On (SSO)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Cukup satu akun untuk masuk ke seluruh aplikasi resmi PSAK FT UPR tanpa perlu mendaftar ulang berulang kali.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Proteksi Data & Integritas NIM
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Data divalidasi dengan aturan keamanan database mutlak. NIM permanen menjamin keaslian identitas anggota.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Katalog & Direktori Terpusat
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Mengenal rekan satu persekutuan lintas jurusan (Arsitektur, Sipil, Informatika, Pertambangan) dengan privasi terjamin.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
