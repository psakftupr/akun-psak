"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  User, 
  Mail, 
  GraduationCap, 
  Phone, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Building2, 
  Calendar,
  Lock,
  Globe,
  Link2,
  EyeOff,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();

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
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?returnUrl=/profile");
    } else if (profile) {
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
      });
    }
  }, [user, profile, authLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      // 1. Update Firebase Auth Profile (displayName & photoURL)
      await updateProfile(user, {
        displayName: formData.displayName.trim(),
        photoURL: formData.photoURL.trim() || undefined,
      });

      // 2. Update Firestore user document (protecting role, status, nim by preserving resource rules)
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
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError("Gagal menyimpan profil: " + (err.message || "Terjadi kesalahan."));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          {formData.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formData.photoURL}
              alt={formData.displayName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-indigo-500/30 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-3xl shadow-lg">
              {formData.displayName ? formData.displayName[0].toUpperCase() : "U"}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formData.displayName || "Mahasiswa PSAK"}
            </h1>
            <span className="inline-flex self-center sm:self-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize">
              Role: {profile.role}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {profile.email} • Terdaftar sejak {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("id-ID") : "-"}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              NIM: {profile.nim}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {profile.prodi} ({profile.angkatan})
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Status Akun: {profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* Error & Success alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>Profil berhasil diperbarui dan disinkronkan secara aman!</span>
        </div>
      )}

      {/* Form Settings */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Informasi Pribadi & Kontak
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data pribadi ini digunakan untuk sinkronisasi akun, integrasi SSO, dan kegiatan PSAK FT UPR.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Lengkap Mahasiswa
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp Aktif
            </label>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Foto Profil URL */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              URL Foto Profil / GIF
            </label>
            <input
              type="url"
              value={formData.photoURL}
              onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Denominasi Gereja */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Denominasi Gereja
            </label>
            <input
              type="text"
              value={formData.denominasiGereja}
              onChange={(e) => setFormData({ ...formData, denominasiGereja: e.target.value })}
              placeholder="Contoh: GKE, HKBP, GPdI, GBI"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tanggal Lahir */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tanggal Lahir (Untuk Ucapan Ulang Tahun)
            </label>
            <input
              type="date"
              value={formData.tanggalLahir}
              onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Akun Instagram
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              LinkedIn
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Minat & Bakat */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Minat & Bakat / Bidang Pelayanan
            </label>
            <input
              type="text"
              value={formData.minatBakat}
              onChange={(e) => setFormData({ ...formData, minatBakat: e.target.value })}
              placeholder="Contoh: Musik / Praise & Worship, Multimedia, Web Development, Olahraga"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Locked Akademik Section */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Data Akademik Terkunci (Dilindungi Database)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bidang berikut dilindungi aturan Firestore Security Rules dan hanya dapat diubah oleh Administrator.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">NIM</span>
              <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{profile.nim}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Prodi</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile.prodi}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Angkatan</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile.angkatan}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Jalur Masuk</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile.jalurMasuk}</p>
            </div>
          </div>
        </div>

        {/* Privasi Direktori */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-indigo-500" />
            Pengaturan Privasi Direktori Publik
          </h3>

          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.hidePhotoInDirectory}
                onChange={(e) => setFormData({ ...formData, hidePhotoInDirectory: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Sembunyikan foto profil saya di halaman Direktori Anggota Publik (tampilkan avatar generik).
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.hideProfileInDirectory}
                onChange={(e) => setFormData({ ...formData, hideProfileInDirectory: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Sembunyikan detail profil saya sepenuhnya dari Direktori Anggota Publik.
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan Perubahan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Perubahan Profil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
