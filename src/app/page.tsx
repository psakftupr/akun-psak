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
      {/* Hero / Main Header */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Platform Akun & Single Sign-On <span className="text-indigo-600 dark:text-indigo-400">PSAK FT UPR</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Pusat autentikasi dan manajemen data sivitas akademika Kristen Fakultas Teknik Universitas Palangka Raya.
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {loading ? (
              <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md" />
            ) : user ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/profile"
                  className="px-5 py-2.5 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Buka Profil Saya
                </Link>
                <Link
                  href="/directory"
                  className="px-5 py-2.5 rounded-md font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  Direktori Anggota
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  Masuk ke Akun
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-md font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  Daftar Anggota Baru
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Logged in User ID Card Preview */}
      {user && profile && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                {profile.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xl border border-slate-200 dark:border-slate-700">
                    {profile.displayName ? profile.displayName[0].toUpperCase() : "U"}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {profile.displayName}
                  </h2>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    NIM: <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.nim || "-"}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize">
                      {profile.status}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/profile"
                className="w-full sm:w-auto text-center px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-xs text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                Kelola Profil
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Profile Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Program Studi</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {profile.prodi || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Angkatan</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {profile.angkatan || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Jalur Masuk</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {profile.jalurMasuk || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Status Keanggotaan</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {profile.statusKeanggotaan || "Mahasiswa Aktif"}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Single Sign-On (SSO)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Satu akun untuk masuk ke seluruh aplikasi resmi PSAK FT UPR tanpa registrasi ulang.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Integritas & Keamanan NIM
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              NIM terverifikasi permanen untuk menjaga keaslian identitas anggota persekutuan.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Direktori & Statistik
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Katalog mahasiswa 4 jurusan (Arsitektur, Sipil, Informatika, Pertambangan) dengan privasi terjamin.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
