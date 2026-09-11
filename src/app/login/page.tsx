"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  Lock, 
  Mail, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Loader2,
  CheckCircle2
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    if (!authLoading && user) {
      router.push(returnUrl);
    }
  }, [user, authLoading, router, returnUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push(returnUrl);
    } catch (err: any) {
      console.error("Login error:", err);
      let msg = "Terjadi kesalahan saat masuk. Silakan periksa kembali email dan kata sandi Anda.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "Email atau kata sandi yang Anda masukkan salah.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat atau reset kata sandi Anda.";
      } else if (err.code === "auth/user-disabled") {
        msg = "Akun ini telah dinonaktifkan oleh administrator. Silakan hubungi pengurus PSAK FT UPR.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Masuk ke Akun
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gunakan email dan kata sandi akun PSAK FT UPR Anda.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Belum terdaftar?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Daftar anggota baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
