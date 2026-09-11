"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft 
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      let msg = "Terjadi kesalahan saat mengirim instruksi reset kata sandi.";
      if (err.code === "auth/user-not-found") {
        msg = "Alamat email ini tidak terdaftar di sistem PSAK FT UPR.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Format email tidak valid.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
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
            Reset Sandi
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            Pemulihan Kata Sandi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tautan pemulihan akan dikirimkan ke email terdaftar Anda.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>
                Tautan reset berhasil dikirim ke <strong>{email}</strong>. Silakan periksa kotak masuk atau spam email Anda.
              </span>
            </div>

            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 text-xs transition-colors text-center"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Alamat Email Terdaftar
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-60 cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim Email...
                </>
              ) : (
                "Kirim Tautan Pemulihan"
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Halaman Masuk
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
