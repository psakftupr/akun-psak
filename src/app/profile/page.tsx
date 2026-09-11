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
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-5">
        <div>
          {formData.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formData.photoURL}
              alt={formData.displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-2xl border border-slate-200 dark:border-slate-700">
              {formData.displayName ? formData.displayName[0].toUpperCase() : "U"}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {formData.displayName || "Mahasiswa PSAK"}
            </h1>
            <span className="inline-flex self-center sm:self-auto text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize">
              {profile.role}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {profile.email} • Terdaftar sejak {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("id-ID") : "-"}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              NIM: {profile.nim}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {profile.prodi} ({profile.angkatan})
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* Error & Success alerts */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>Profil berhasil diperbarui dan disinkronkan.</span>
        </div>
      )}

      {/* Form Settings */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Informasi Pribadi & Kontak
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Data ini digunakan untuk sinkronisasi akun dan integrasi SSO PSAK FT UPR.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Mahasiswa
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Foto Profil URL */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              URL Foto Profil
            </label>
            <input
              type="url"
              value={formData.photoURL}
              onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Denominasi Gereja */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Denominasi Gereja
            </label>
            <input
              type="text"
              value={formData.denominasiGereja}
              onChange={(e) => setFormData({ ...formData, denominasiGereja: e.target.value })}
              placeholder="Contoh: GKE, HKBP, GPdI, GBI"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tanggal Lahir */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={formData.tanggalLahir}
              onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Akun Instagram
            </label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="@username"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tautan LinkedIn
            </label>
            <input
              type="text"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Minat & Bakat */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Minat & Bakat / Bidang Pelayanan
            </label>
            <input
              type="text"
              value={formData.minatBakat}
              onChange={(e) => setFormData({ ...formData, minatBakat: e.target.value })}
              placeholder="Contoh: Musik / Worship, Multimedia, Pemrograman, Olahraga"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Locked Akademik Section */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            Data Akademik Terverifikasi (Terkunci)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">NIM</span>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{profile.nim}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Prodi</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{profile.prodi}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Angkatan</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{profile.angkatan}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Jalur Masuk</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{profile.jalurMasuk}</p>
            </div>
          </div>
        </div>

        {/* Privasi Direktori */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pengaturan Privasi Direktori
          </h3>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.hidePhotoInDirectory}
                onChange={(e) => setFormData({ ...formData, hidePhotoInDirectory: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Sembunyikan foto profil saya di Direktori Anggota Publik (tampilkan inisial huruf).
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.hideProfileInDirectory}
                onChange={(e) => setFormData({ ...formData, hideProfileInDirectory: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Sembunyikan profil saya dari daftar Direktori Anggota Publik.
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
