"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  Shield, 
  EyeOff, 
  ArrowLeft,
  KeyRound,
  LogOut,
  ExternalLink,
  Globe
} from "lucide-react";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUid = searchParams.get("uid");
  const { user, profile, loading: authLoading, refreshProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"detail" | "privacy" | "account">("detail");

  // State untuk form edit profil pengguna login
  const [formData, setFormData] = useState({
    displayName: "",
    photoURL: "",
    whatsapp: "",
    statusKeanggotaan: "Mahasiswa Aktif",
    denominasiGereja: "",
    tanggalLahir: "",
    instagram: "",
    linkedin: "",
    minatBakat: "",
    hidePhotoInDirectory: false,
    hideProfileInDirectory: false,
    maskNameInDirectory: false,
  });

  // State untuk melihat profil publik anggota lain jika ada targetUid
  const [publicProfile, setPublicProfile] = useState<any>(null);
  const [loadingPublic, setLoadingPublic] = useState(false);

  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load public profile if targetUid is provided and not current user
  useEffect(() => {
    async function loadPublicProfile() {
      if (targetUid && targetUid !== user?.uid) {
        setLoadingPublic(true);
        try {
          const snap = await getDoc(doc(db, "users", targetUid));
          if (snap.exists()) {
            setPublicProfile(snap.data());
          } else {
            setError("Profil anggota tidak ditemukan.");
          }
        } catch (err: any) {
          setError("Gagal memuat profil: " + err.message);
        } finally {
          setLoadingPublic(false);
        }
      }
    }
    loadPublicProfile();
  }, [targetUid, user]);

  // Sync state with logged in profile
  useEffect(() => {
    if (profile && (!targetUid || targetUid === user?.uid)) {
      setFormData({
        displayName: profile.displayName || "",
        photoURL: profile.photoURL || "",
        whatsapp: profile.whatsapp || "",
        statusKeanggotaan: profile.statusKeanggotaan || "Mahasiswa Aktif",
        denominasiGereja: profile.denominasiGereja || "",
        tanggalLahir: profile.tanggalLahir || "",
        instagram: profile.instagram || "",
        linkedin: profile.linkedin || "",
        minatBakat: profile.minatBakat || "",
        hidePhotoInDirectory: profile.hidePhotoInDirectory || false,
        hideProfileInDirectory: profile.hideProfileInDirectory || false,
        maskNameInDirectory: profile.maskNameInDirectory || false,
      });
    }
  }, [profile, targetUid, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // 1. Update Auth profile
      await updateProfile(user, {
        displayName: formData.displayName.trim(),
        photoURL: formData.photoURL.trim() || undefined,
      });

      // 2. Update Firestore profile
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          displayName: formData.displayName.trim(),
          photoURL: formData.photoURL.trim(),
          whatsapp: formData.whatsapp.trim(),
          statusKeanggotaan: formData.statusKeanggotaan,
          denominasiGereja: formData.denominasiGereja.trim(),
          tanggalLahir: formData.tanggalLahir,
          instagram: formData.instagram.trim(),
          linkedin: formData.linkedin.trim(),
          minatBakat: formData.minatBakat.trim(),
          hidePhotoInDirectory: formData.hidePhotoInDirectory,
          hideProfileInDirectory: formData.hideProfileInDirectory,
          maskNameInDirectory: formData.maskNameInDirectory,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await refreshProfile();
      setSuccess("Profil berhasil diperbarui.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResettingPassword(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setSuccess("Tautan reset kata sandi telah dikirimkan ke email Anda.");
    } catch (err: any) {
      setError("Gagal mengirim email reset: " + err.message);
    } finally {
      setResettingPassword(false);
    }
  };

  if (authLoading || loadingPublic) {
    return (
      <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  // JIKA MELIHAT PROFIL ANGGOTA LAIN (PUBLIK)
  if (targetUid && targetUid !== user?.uid && publicProfile) {
    if (publicProfile.hideProfileInDirectory) {
      return (
        <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-center space-y-4">
            <EyeOff className="w-8 h-8 text-slate-400 mx-auto" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Profil Bersifat Privat</h2>
            <p className="text-xs text-slate-500">Mahasiswa ini memilih untuk menyembunyikan profil publiknya.</p>
            <Link href="/directory" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">
              <ArrowLeft className="w-3 h-3" /> Kembali ke Direktori
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
        <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">P</div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Akun PSAK FT UPR</span>
            </Link>
            <span className="text-[11px] text-slate-400 font-medium">Profil Publik</span>
          </div>

          <div className="flex items-center gap-3.5">
            {publicProfile.photoURL && !publicProfile.hidePhotoInDirectory ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={publicProfile.photoURL} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center">
                {(publicProfile.displayName || "U")[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">{publicProfile.displayName}</h1>
              <p className="text-xs font-mono text-slate-500">NIM: {publicProfile.nim || "-"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {publicProfile.prodi}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                  {publicProfile.angkatan}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-500">Jurusan</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{publicProfile.prodi}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-500">Angkatan</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{publicProfile.angkatan}</span>
            </div>
            {publicProfile.minatBakat && (
              <div className="py-1">
                <span className="text-slate-500 block mb-0.5">Minat & Bakat:</span>
                <p className="text-slate-700 dark:text-slate-300">{publicProfile.minatBakat}</p>
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <Link href="/directory" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Direktori
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // JIKA BELUM LOGIN DAN TIDAK ADA TARGET UID
  if (!user) {
    return (
      <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base mx-auto mb-2">
            P
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Detail Profil Anggota</h1>
            <p className="text-xs text-slate-500">Silakan masuk untuk mengelola profil dan privasi akun Anda.</p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/login?returnUrl=/profile"
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 text-xs transition-colors flex items-center justify-center gap-2"
            >
              Masuk Sekarang
            </Link>
            <Link
              href="/directory"
              className="w-full py-2.5 px-4 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs transition-colors flex items-center justify-center gap-2"
            >
              Lihat Direktori Publik
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PROFIL PENGGUNA YANG SEDANG LOGIN (SUB-TAB BERSIH)
  return (
    <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
      <div className="w-full max-w-md sm:max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header Platform */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              Akun PSAK FT UPR
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <ArrowLeft className="w-3 h-3" />
            Kembali
          </Link>
        </div>

        {/* Sub / Tab Navigasi Bersih */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("detail")}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors text-center ${
              activeTab === "detail"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Detail Profil
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors text-center ${
              activeTab === "privacy"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Privasi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors text-center ${
              activeTab === "account"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Akun & Sandi
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* TAB 1: DETAIL PROFIL */}
        {activeTab === "detail" && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  URL Foto Profil
                </label>
                <input
                  type="url"
                  value={formData.photoURL}
                  onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Denominasi Gereja
                  </label>
                  <input
                    type="text"
                    value={formData.denominasiGereja}
                    onChange={(e) => setFormData({ ...formData, denominasiGereja: e.target.value })}
                    placeholder="Contoh: GKE, HKBP, GPdI"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Minat & Bakat Pelayanan / Karir
                </label>
                <input
                  type="text"
                  value={formData.minatBakat}
                  onChange={(e) => setFormData({ ...formData, minatBakat: e.target.value })}
                  placeholder="Contoh: Musik / Worship, IT, Desain Grafis, Logistik"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Data Akademik Terkunci */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <Lock className="w-3 h-3 text-amber-600" />
                  Data Akademik Permanen
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">NIM</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{profile?.nim || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jurusan</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{profile?.prodi || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Angkatan</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{profile?.angkatan || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jalur Masuk</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{profile?.jalurMasuk || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Simpan Perubahan
            </button>
          </form>
        )}

        {/* TAB 2: PRIVASI DIREKTORI */}
        {activeTab === "privacy" && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">
                    Sembunyikan Profil di Direktori
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nama dan info Anda tidak akan muncul dalam daftar pencarian mahasiswa publik.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.hideProfileInDirectory}
                  onChange={(e) => setFormData({ ...formData, hideProfileInDirectory: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">
                    Sembunyikan Foto Profil
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Direktori publik hanya akan menampilkan avatar inisial nama tanpa foto asli Anda.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.hidePhotoInDirectory}
                  onChange={(e) => setFormData({ ...formData, hidePhotoInDirectory: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">
                    Samarkan Nama Lengkap di Direktori
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Menampilkan nama depan dan inisial belakang (Contoh: "Agus P.") untuk menjaga privasi di pencarian publik.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.maskNameInDirectory}
                  onChange={(e) => setFormData({ ...formData, maskNameInDirectory: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Simpan Pengaturan Privasi
            </button>
          </form>
        )}

        {/* TAB 3: AKUN & KEAMANAN */}
        {activeTab === "account" && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
                <span className="text-slate-500">Email Akun</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
                <span className="text-slate-500">Peran Sistem</span>
                <span className="font-bold text-indigo-600 capitalize">{profile?.role || "Anggota"}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Status Akun</span>
                <span className="font-bold text-emerald-600 capitalize">{profile?.status || "Aktif"}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resettingPassword}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors flex items-center justify-center gap-2"
              >
                {resettingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                Kirim Tautan Ubah Kata Sandi
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-2 px-4 rounded-xl font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar dari Akun Ini
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex-1 min-h-[85vh] flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
