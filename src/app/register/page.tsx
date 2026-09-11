"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { 
  PRODI_OPTIONS, 
  JALUR_MASUK_OPTIONS, 
  GENDER_OPTIONS 
} from "@/lib/constants";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Phone, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  Image as ImageIcon
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    nim: "",
    gender: "Laki-laki",
    prodi: "Teknik Informatika",
    angkatan: new Date().getFullYear(),
    jalurMasuk: "SNBT",
    whatsapp: "",
    photoURL: "",
    statementAgreement: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Kata sandi dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Kata sandi minimal harus 6 karakter.");
      return;
    }

    if (!formData.nim.trim()) {
      setError("Nomor Induk Mahasiswa (NIM) wajib diisi.");
      return;
    }

    if (!formData.whatsapp.trim()) {
      setError("Nomor WhatsApp aktif wajib diisi untuk koordinasi organisasi.");
      return;
    }

    if (!formData.statementAgreement) {
      setError("Anda wajib mencentang pernyataan kebenaran data untuk melanjutkan.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      const user = userCredential.user;

      // 2. Set profile picture fallback if empty
      const defaultPhoto = formData.photoURL.trim() 
        ? formData.photoURL.trim() 
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.displayName)}`;

      await updateProfile(user, {
        displayName: formData.displayName.trim(),
        photoURL: defaultPhoto,
      });

      // 3. Save profile to Firestore users/{uid}
      const userDocRef = doc(db, "users", user.uid);
      const userProfilePayload = {
        uid: user.uid,
        email: formData.email.trim(),
        displayName: formData.displayName.trim(),
        photoURL: defaultPhoto,
        role: "anggota",
        status: "aktif",
        nim: formData.nim.trim(),
        gender: formData.gender,
        prodi: formData.prodi,
        angkatan: Number(formData.angkatan),
        jalurMasuk: formData.jalurMasuk,
        whatsapp: formData.whatsapp.trim(),
        statusKeanggotaan: "Mahasiswa Aktif",
        hidePhotoInDirectory: false,
        hideProfileInDirectory: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, userProfilePayload);

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      console.error("Registration error:", err);
      let msg = "Terjadi kesalahan saat pendaftaran: " + (err.message || "Gagal membuat akun.");
      if (err.code === "auth/email-already-in-use") {
        msg = "Alamat email ini sudah terdaftar. Silakan login atau gunakan email lain.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Format alamat email tidak valid.";
      } else if (err.code === "auth/weak-password") {
        msg = "Kata sandi terlalu lemah. Gunakan kombinasi huruf dan angka.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
      <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
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
          <span className="text-[11px] text-slate-400 font-medium">
            Registrasi
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            Pendaftaran Anggota Baru
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Khusus mahasiswa kristen FT UPR. Pastikan data akademik diisi dengan benar.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>Pendaftaran berhasil! Mengalihkan ke halaman akun...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: Data Akademik */}
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              1. Data Mahasiswa & Akademik
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nama Lengkap */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Nama sesuai data akademik"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* NIM */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  NIM (Permanen) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="Contoh: 213020503001"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 block">
                  NIM tidak dapat diubah setelah terdaftar.
                </span>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Program Studi */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Program Studi *
                </label>
                <select
                  value={formData.prodi}
                  onChange={(e) => setFormData({ ...formData, prodi: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {PRODI_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Angkatan */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Tahun Angkatan *
                </label>
                <input
                  type="number"
                  required
                  min={2015}
                  max={new Date().getFullYear() + 1}
                  value={formData.angkatan}
                  onChange={(e) => setFormData({ ...formData, angkatan: parseInt(e.target.value) || 2024 })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Jenis Kelamin *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jalur Masuk */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Jalur Masuk Kuliah *
                </label>
                <select
                  value={formData.jalurMasuk}
                  onChange={(e) => setFormData({ ...formData, jalurMasuk: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {JALUR_MASUK_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Akun & Kata Sandi */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              2. Kredensial Masuk
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Alamat Email Aktif *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Kata Sandi */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Kata Sandi *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Konfirmasi Sandi *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Ulangi kata sandi"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Pernyataan Kebenaran Data */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={formData.statementAgreement}
                onChange={(e) => setFormData({ ...formData, statementAgreement: e.target.checked })}
                className="w-3.5 h-3.5 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 flex-shrink-0"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                Saya menyatakan data yang dimasukkan adalah <strong>benar dan sah</strong> sebagai mahasiswa Kristen FT UPR.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-60 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mendaftarkan Akun...
              </>
            ) : (
              "Daftar Sebagai Anggota"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Masuk ke akun Anda
            </Link>
          </p>
          <div>
            <Link
              href="/"
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
