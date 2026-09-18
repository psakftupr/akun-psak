"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { parseNIMUPR, NIMParseResult } from "@/lib/nim-parser";
import { uploadProfilePhoto, isGifFile } from "@/lib/photo-upload";
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
  Image as ImageIcon,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  Check,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Photo Upload State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGif, setIsGif] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadPhotoError, setUploadPhotoError] = useState<string | null>(null);

  // NIM Auto-detection State
  const [nimDetection, setNimDetection] = useState<NIMParseResult | null>(null);
  const [autoDetected, setAutoDetected] = useState(false);
  const [checkingNim, setCheckingNim] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Real-time NIM detection with debounce (450ms delay for natural scanning effect)
  useEffect(() => {
    const rawNim = formData.nim.trim();
    if (!rawNim) {
      setNimDetection(null);
      setAutoDetected(false);
      setCheckingNim(false);
      setShowManualFields(false);
      return;
    }

    setCheckingNim(true);

    const timer = setTimeout(() => {
      const result = parseNIMUPR(rawNim);
      setNimDetection(result);
      setCheckingNim(false);

      if (result.valid && result.prodi && result.tahunMasuk && result.jalurMasuk) {
        setFormData((prev) => ({
          ...prev,
          prodi: result.prodi!,
          angkatan: result.tahunMasuk!,
          jalurMasuk: result.jalurMasuk!,
        }));
        setAutoDetected(true);
        setShowManualFields(false); // Sembunyikan kolom manual saat NIM berhasil terdeteksi!
      } else {
        setAutoDetected(false);
        const cleanDigits = rawNim.replace(/\D/g, "");
        const hasLetters = /[a-zA-Z]/.test(rawNim);
        // Tampilkan kolom manual jika format tidak dikenali / format lama / non-FT
        if (cleanDigits.length >= 12 || (rawNim.length >= 6 && hasLetters)) {
          setShowManualFields(true);
        } else {
          setShowManualFields(false);
        }
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.nim]);

  // Handle Photo File Selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadPhotoError(null);
    const gifDetected = isGifFile(file);
    setIsGif(gifDetected);

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    // Upload to Google Apps Script / Drive
    setUploadingPhoto(true);
    try {
      const uploadRes = await uploadProfilePhoto(file);
      setFormData((prev) => ({ ...prev, photoURL: uploadRes.url }));
      setPhotoPreview(uploadRes.url);
      setIsGif(uploadRes.isGif);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadPhotoError(err.message || "Gagal mengunggah foto. Anda tetap dapat melanjutkan pendaftaran.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photoURL: "" }));
    setPhotoPreview(null);
    setIsGif(false);
    setUploadPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    // Pastikan data akademik terisi
    if (!formData.prodi || !formData.angkatan || !formData.jalurMasuk) {
      setError("Data Program Studi, Angkatan, dan Jalur Masuk wajib dilengkapi.");
      setShowManualFields(true);
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
            Khusus mahasiswa Kristen FT UPR. Data prodi, angkatan, & jalur masuk terisi otomatis dari NIM.
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
          
          {/* Section: Upload Foto & GIF Profil */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                Foto Profil (Opsional)
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                Mendukung GIF Animasi
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Preview Box */}
              <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Pratinjau Foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <User className="w-7 h-7 mx-auto stroke-1" />
                  </div>
                )}

                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer shadow-xs"
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        Pilih Foto / GIF
                      </>
                    )}
                  </button>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-500">
                  Format: <strong>JPG, PNG, WebP</strong> atau <strong>GIF animasi</strong> (Maks. 5MB).
                  {isGif && <span className="text-emerald-600 dark:text-emerald-400 ml-1 font-semibold">✓ GIF animasi aktif</span>}
                </p>
              </div>
            </div>

            {uploadPhotoError && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {uploadPhotoError}
              </p>
            )}
          </div>

          {/* Section: Data Akademik */}
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
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
                  placeholder="Nama sesuai data akademik UPR"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* NIM (Dengan Auto-Detect & Delay Scanning) */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>NIM (Nomor Induk Mahasiswa) *</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                    12 atau 13 digit angka
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Contoh: 223020501044 atau 2430105020001"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                  {checkingNim && (
                    <div className="absolute right-3 top-2">
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Status Efek Loading Scanning NIM */}
                {checkingNim && (
                  <div className="mt-2 p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 flex-shrink-0" />
                    <span className="text-[11px] font-medium">Memeriksa & mengurai format NIM UPR...</span>
                  </div>
                )}

                {/* RINGKASAN DATA TERDETEKSI OTOMATIS (Kolom manual di-hide) */}
                {!checkingNim && autoDetected && nimDetection?.valid && (
                  <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>NIM Terdeteksi Otomatis</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {nimDetection.formatSistem === "CURRENT_13_DIGIT" ? "Format 13 Digit" : "Format 12 Digit"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Program Studi</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block truncate" title={formData.prodi}>
                          {formData.prodi}
                        </span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Angkatan</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">
                          {formData.angkatan}
                        </span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Jalur Masuk</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">
                          {formData.jalurMasuk}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-0.5 text-[11px]">
                      <span className="text-slate-500 text-[10px]">Data prodi, angkatan, & jalur sudah terinput otomatis.</span>
                      <button
                        type="button"
                        onClick={() => setShowManualFields(!showManualFields)}
                        className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                      >
                        {showManualFields ? "Tutup Pilihan Manual" : "Ubah Manual jika berbeda"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifikasi Format Lama / Tidak Diketahui */}
                {!checkingNim && !autoDetected && (formData.nim.trim().length >= 10 || showManualFields) && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px]">
                      NIM belum dikenali secara otomatis (format lama atau non-FT UPR). Silakan tentukan Program Studi, Angkatan, dan Jalur Masuk secara manual pada kolom di bawah.
                    </span>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  NIM akan menjadi identitas permanen akun dan tidak dapat diubah setelah terdaftar.
                </span>
              </div>

              {/* KOLOM MANUAL (HANYA MUNCUL JIKA NIM FORMAT LAMA / TIDAK DIKENALI / DIKLIK USER) */}
              {showManualFields && (
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  {/* Program Studi */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Program Studi *
                    </label>
                    <select
                      value={formData.prodi}
                      onChange={(e) => setFormData({ ...formData, prodi: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Jalur Masuk */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Jalur Masuk Kuliah *
                    </label>
                    <select
                      value={formData.jalurMasuk}
                      onChange={(e) => setFormData({ ...formData, jalurMasuk: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {JALUR_MASUK_OPTIONS.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

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

              {/* WhatsApp */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Nomor WhatsApp Aktif *
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
            </div>
          </div>

          {/* Section: Akun & Kata Sandi (Dengan Toggle Buka/Tutup Mata) */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              2. Kredensial Masuk
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Alamat Email Aktif *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Kata Sandi */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Kata Sandi *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-3 pr-9 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Konfirmasi Sandi *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-3 pr-9 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showConfirmPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
            disabled={loading || success || uploadingPhoto}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-60 cursor-pointer mt-2 shadow-xs"
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
