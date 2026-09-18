"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  User, 
  LogOut, 
  Shield, 
  Users, 
  Loader2, 
  ArrowRight, 
  Mail, 
  Lock, 
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Phone
} from "lucide-react";
import { formatRoleName } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading, logout, isAdmin } = useAuth();

  // State untuk form login langsung bagi yang belum masuk
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setLoginError("Email atau kata sandi tidak valid.");
      } else if (err.code === "auth/too-many-requests") {
        setLoginError("Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.");
      } else {
        setLoginError("Gagal masuk: " + (err.message || "Terjadi kesalahan."));
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // 1. Loading State (Sederhana & Terpusat)
  if (loading) {
    return (
      <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500">Memuat profil akun...</p>
        </div>
      </div>
    );
  }

  // 2. User Sedang Login -> Tampilkan Profil Bersih, Sederhana & Ramah Layar HP
  if (user && profile) {
    return (
      <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
        <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header Kartu: Identitas Platform & Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                P
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                Akun PSAK FT UPR
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Terhubung
            </div>
          </div>

          {/* Profil Utama */}
          <div className="flex items-center gap-3.5">
            {profile.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoURL}
                alt={profile.displayName || "Avatar"}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center flex-shrink-0">
                {(profile.displayName || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {profile.displayName || "Pengguna PSAK"}
              </h1>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {profile.email}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {formatRoleName(profile.role)}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 capitalize">
                  {profile.status || "Aktif"}
                </span>
              </div>
            </div>
          </div>

          {/* Data Akademik & Kontak (Ringkas & Mudah Dibaca di Layar HP) */}
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <span className="text-slate-500 dark:text-slate-400">NIM Mahasiswa</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tracking-wide">
                {profile.nim || "-"}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Program Studi</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                {profile.prodi || "-"}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Angkatan</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {profile.angkatan || "-"}
              </span>
            </div>

            {profile.whatsapp && (
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  WhatsApp
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {profile.whatsapp}
                </span>
              </div>
            )}
          </div>

          {/* Tombol Aksi Fungsional (Mobile-First Touch Target) */}
          <div className="space-y-2 pt-1">
            <Link
              href="/profile"
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 text-xs transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Kelola Biodata & Sandi
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/directory"
                className="py-2.5 px-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
              >
                <Users className="w-3.5 h-3.5" />
                Direktori
              </Link>

              {isAdmin ? (
                <Link
                  href="/admin"
                  className="py-2.5 px-3 rounded-xl font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs transition-colors flex items-center justify-center gap-1.5 text-center border border-amber-200 dark:border-amber-800"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              ) : (
                <Link
                  href="/stats"
                  className="py-2.5 px-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
                >
                  Statistik
                </Link>
              )}
            </div>

            <button
              onClick={() => logout()}
              className="w-full py-2 px-4 rounded-xl font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs transition-colors flex items-center justify-center gap-1.5 pt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar dari Akun
            </button>
          </div>

          {/* Tautan Layanan Ekosistem PSAK */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <a
              href="https://link.psak.my.id"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Ekosistem PSAK: link.psak.my.id
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. User Belum Login -> Form Masuk Simpel, Bersih, dan Langsung Siap Pakai di Layar HP
  return (
    <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        {/* Identitas Sederhana */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base mx-auto mb-2">
            P
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Akun PSAK FT UPR
          </h1>
          <p className="text-xs text-slate-500">
            Masuk untuk mengakses layanan terpadu dan identitas anggota.
          </p>
        </div>

        {/* Error Alert */}
        {loginError && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Form Login Ringkas Langsung */}
        <form onSubmit={handleInlineLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Email Akun
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            {loginLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Masuk ke Akun
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Link Pendaftaran Baru */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Belum terdaftar?{" "}
            <Link
              href="/register"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Daftar Mahasiswa Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
