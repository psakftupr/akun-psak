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
  AlertCircle, 
  ArrowRight, 
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      if (
        err.code === "auth/invalid-credential" || 
        err.code === "auth/user-not-found" || 
        err.code === "auth/wrong-password"
      ) {
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
            Masuk Akun
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            Masuk ke Akun Anda
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Akses layanan SSO dan identitas mahasiswa teknik kristen.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Alamat Email
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
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <>
                Masuk Sekarang
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Daftar Mahasiswa Baru
            </Link>
          </p>

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 min-h-[85vh] flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
