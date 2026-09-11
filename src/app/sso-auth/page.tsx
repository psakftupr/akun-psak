"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowRight
} from "lucide-react";

function SSOAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const clientId = searchParams.get("client_id") || searchParams.get("clientId");
  const redirectUri = searchParams.get("redirect_uri") || searchParams.get("redirectUri");
  const state = searchParams.get("state") || "";

  const [appInfo, setAppInfo] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorizing, setAuthorizing] = useState(false);

  // Fetch App registration
  useEffect(() => {
    async function loadApp() {
      if (!clientId) {
        setError("Parameter 'client_id' tidak ditemukan. Permintaan otorisasi tidak valid.");
        setLoadingApp(false);
        return;
      }

      try {
        const appRef = doc(db, "applications", clientId);
        const appSnap = await getDoc(appRef);

        if (appSnap.exists()) {
          const data = appSnap.data();
          if (data.active === false) {
            setError("Aplikasi ini sedang dinonaktifkan oleh administrator PSAK.");
          } else {
            setAppInfo(data);
          }
        } else {
          // Fallback demo info if testing
          setAppInfo({
            name: clientId.toUpperCase(),
            description: "Aplikasi Ekosistem PSAK FT UPR",
            clientId: clientId,
          });
        }
      } catch (err: any) {
        console.error("Error loading application info:", err);
        setError("Gagal memvalidasi aplikasi klien: " + err.message);
      } finally {
        setLoadingApp(false);
      }
    }

    loadApp();
  }, [clientId]);

  const handleAuthorize = async () => {
    if (!user || !profile || !clientId) return;

    setAuthorizing(true);
    setError(null);

    try {
      // 1. Generate unique 32-char authorization code
      const code = "psak_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

      // 2. Set token expiration to 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // 3. Save to sso_tokens/{code} in Firestore
      const tokenRef = doc(db, "sso_tokens", code);
      await setDoc(tokenRef, {
        code,
        appId: clientId,
        userId: user.uid,
        email: profile.email || user.email || "",
        displayName: profile.displayName || "",
        photoURL: profile.photoURL || "",
        role: profile.role || "anggota",
        nim: profile.nim || "",
        gender: profile.gender || "",
        prodi: profile.prodi || "",
        angkatan: profile.angkatan || 0,
        jalurMasuk: profile.jalurMasuk || "",
        whatsapp: profile.whatsapp || "",
        expiresAt,
        createdAt: new Date().toISOString(),
      });

      // 4. Return to opener (if popup) or redirect
      if (typeof window !== "undefined" && window.opener) {
        window.opener.postMessage(
          {
            type: "PSAK_SSO_SUCCESS",
            code,
            state,
          },
          "*"
        );
        setTimeout(() => window.close(), 600);
      } else if (redirectUri) {
        const target = new URL(redirectUri);
        target.searchParams.set("code", code);
        if (state) target.searchParams.set("state", state);
        window.location.href = target.toString();
      } else {
        alert("Otorisasi berhasil! Kode otentikasi: " + code);
      }
    } catch (err: any) {
      console.error("Authorize error:", err);
      setError("Gagal memberikan otorisasi: " + err.message);
      setAuthorizing(false);
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined" && window.opener) {
      window.opener.postMessage(
        {
          type: "PSAK_SSO_CANCEL",
          state,
        },
        "*"
      );
      window.close();
    } else if (redirectUri) {
      const target = new URL(redirectUri);
      target.searchParams.set("error", "access_denied");
      if (state) target.searchParams.set("state", state);
      window.location.href = target.toString();
    } else {
      router.push("/");
    }
  };

  if (authLoading || loadingApp) {
    return (
      <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500">Memeriksa izin SSO...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, prompt to login first
  if (!user) {
    const currentQuery = typeof window !== "undefined" ? window.location.search : "";
    return (
      <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Masuk Diperlukan
            </h2>
            <p className="text-xs text-slate-500">
              Aplikasi <strong>{appInfo?.name || clientId}</strong> meminta Anda masuk menggunakan Akun PSAK FT UPR.
            </p>
          </div>
          <button
            onClick={() => router.push(`/login?returnUrl=${encodeURIComponent("/sso-auth" + currentQuery)}`)}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Masuk ke Akun
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header Platform */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              Akun PSAK FT UPR
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="w-3 h-3" />
            Otorisasi SSO
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            Hubungkan ke {appInfo?.name || clientId}
          </h1>
          <p className="text-xs text-slate-500">
            Aplikasi ini meminta izin memverifikasi identitas Anda dengan Akun PSAK.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* User preview */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
          {profile?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoURL}
              alt={profile.displayName}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              {profile?.displayName ? profile.displayName[0].toUpperCase() : "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {profile?.displayName}
            </p>
            <p className="text-[11px] font-mono text-slate-500 truncate">
              NIM: {profile?.nim || "-"} • {profile?.prodi}
            </p>
          </div>
        </div>

        {/* Permissions Scope */}
        <div className="space-y-1.5 pt-1 text-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Data yang akan dibagikan:
          </p>
          <ul className="space-y-1 text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              Nama Lengkap, Email & Foto Profil
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              NIM, Program Studi & Angkatan
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              Status Keanggotaan Mahasiswa
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleAuthorize}
            disabled={authorizing}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-60 cursor-pointer"
          >
            {authorizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Mengotorisasi...
              </>
            ) : (
              "Izinkan Akses"
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={authorizing}
            className="w-full py-2 px-4 rounded-xl font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-xs cursor-pointer text-center"
          >
            Tolak / Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SSOAuthPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 min-h-[85vh] flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    }>
      <SSOAuthContent />
    </Suspense>
  );
}
