"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (error) {
      setStatus("error");
      setErrorMsg(error || "Terjadi kesalahan saat otentikasi SSO.");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("Otorisasi gagal: Kode otentikasi tidak ditemukan.");
      return;
    }

    try {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "PSAK_SSO_SUCCESS",
            code,
            state,
          },
          "*"
        );
        setStatus("success");
        setTimeout(() => {
          window.close();
        }, 800);
      } else {
        setStatus("error");
        setErrorMsg("Jendela induk tidak ditemukan. Silakan salin kode otorisasi berikut: " + code);
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Gagal mengirimkan pesan ke jendela aplikasi induk.");
    }
  }, [searchParams]);

  return (
    <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
      {status === "processing" && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Menghubungkan Akun PSAK...
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mohon tunggu sejenak, otentikasi sedang diteruskan ke aplikasi.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-3" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Autentikasi Berhasil!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Jendela ini akan tertutup secara otomatis...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-rose-600 mb-3" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Gagal Memproses SSO
          </h2>
          <p className="text-xs text-rose-500 mt-1 break-all">
            {errorMsg}
          </p>
          <button
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg"
          >
            Tutup Jendela
          </button>
        </div>
      )}
    </div>
  );
}

export default function SSOPopupCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
      <Suspense
        fallback={
          <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs text-slate-500">Memuat otentikasi...</p>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
