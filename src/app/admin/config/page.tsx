"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  Settings, 
  Lock, 
  Crown, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";

export default function AdminConfigPage() {
  const { isSuperadmin } = useAuth();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowProfileEdit, setAllowProfileEdit] = useState(true);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggleMaintenance = () => {
    if (!isSuperadmin) {
      setMsg({ type: "error", text: "Akses Ditolak: Hanya Super Admin yang berwenang mengubah mode pemeliharaan." });
      return;
    }
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    setMsg({ type: "success", text: `Mode pemeliharaan sistem berhasil ${next ? "diaktifkan" : "dinonaktifkan"}.` });
  };

  const handleToggleAllowEdit = () => {
    if (!isSuperadmin) {
      setMsg({ type: "error", text: "Akses Ditolak: Hanya Super Admin yang berwenang mengubah izin edit profil." });
      return;
    }
    const next = !allowProfileEdit;
    setAllowProfileEdit(next);
    setMsg({ type: "success", text: `Izin edit profil mahasiswa berhasil ${next ? "diaktifkan" : "dinonaktifkan"}.` });
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-600" />
          Konfigurasi Sistem & Kebijakan
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur ketersediaan platform dan batasan operasional akun mahasiswa.
        </p>
      </div>

      {/* Message Notification */}
      {msg && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs ${
            msg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="font-bold text-xs ml-3">Tutup</button>
        </div>
      )}

      {/* Role Notice */}
      {!isSuperadmin ? (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
          <Lock className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>
            <strong>Mode Baca Saja:</strong> Anda login sebagai Admin operasional. Konfigurasi tingkat sistem hanya dapat diubah oleh <strong>Super Admin</strong>.
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2.5">
          <Crown className="w-4 h-4 flex-shrink-0 text-purple-600" />
          <span>
            <strong>Akses Super Admin:</strong> Anda memiliki otorisasi penuh untuk mengubah kebijakan dan mode pemeliharaan platform.
          </span>
        </div>
      )}

      {/* Toggles Container */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Toggle 1: Mode Maintenance */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-xs text-slate-900 dark:text-white">
              Mode Pemeliharaan (Maintenance Mode)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Membatasi login publik dan menampilkan pemberitahuan pemeliharaan server pada aplikasi klien.
            </p>
          </div>
          <button
            type="button"
            disabled={!isSuperadmin}
            onClick={handleToggleMaintenance}
            className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50 cursor-pointer ${
              maintenanceMode ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                maintenanceMode ? "left-5.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Izin Edit Profil */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-xs text-slate-900 dark:text-white">
              Izin Edit Mandiri Profil Mahasiswa
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Izinkan mahasiswa mengubah biodata profil dan nomor kontak secara mandiri dari halaman profil mereka.
            </p>
          </div>
          <button
            type="button"
            disabled={!isSuperadmin}
            onClick={handleToggleAllowEdit}
            className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50 cursor-pointer ${
              allowProfileEdit ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                allowProfileEdit ? "left-5.5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
