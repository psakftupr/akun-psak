"use client";

import React, { useState } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  Database, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  FileText, 
  Server 
} from "lucide-react";

export default function AdminBackupPage() {
  const { isSuperadmin } = useAuth();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [restoreFile, setRestoreFile] = useState<any>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const collectionsToBackup = ["users", "apps", "system_config", "audit_logs", "sso_logs"];

  // 1. Export JSON Data
  const handleExportBackup = async () => {
    setExporting(true);
    setMsg(null);
    try {
      const backupData: Record<string, any[]> = {};

      for (const colName of collectionsToBackup) {
        const snap = await getDocs(collection(db, colName));
        const list: any[] = [];
        snap.forEach((d) => {
          list.push({ _id: d.id, ...d.data() });
        });
        backupData[colName] = list;
      }

      const payload = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: "akun-01-v2.9",
          totalCollections: collectionsToBackup.length,
        },
        data: backupData,
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      const dateStr = new Date().toISOString().split("T")[0];
      downloadAnchor.setAttribute("download", `psak_database_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setMsg({ type: "success", text: "Cadangan database berhasil diekspor dan diunduh." });
    } catch (err: any) {
      console.error("Export backup error:", err);
      setMsg({ type: "error", text: "Gagal mengekspor data: " + err.message });
    } finally {
      setExporting(false);
    }
  };

  // 2. Read Uploaded JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (!json.data) {
          throw new Error("Format berkas backup tidak sesuai (field 'data' tidak ditemukan).");
        }
        setRestoreFile(json);
        setMsg({ type: "success", text: `Berkas cadangan valid dibaca. Metadata: ${json.metadata?.version || "Unknown"}` });
      } catch (err: any) {
        setRestoreFile(null);
        setMsg({ type: "error", text: "Gagal memproses JSON: " + err.message });
      }
    };
    reader.readAsText(file);
  };

  // 3. Execute Restore
  const handleExecuteRestore = async () => {
    if (!isSuperadmin) {
      setMsg({ type: "error", text: "Akses Ditolak: Hanya Super Admin yang berwenang memulihkan data database." });
      return;
    }

    if (!restoreFile || !restoreFile.data) return;

    const confirmed = window.confirm(
      "PERINGATAN: Memulihkan database akan memperbarui/menimpa dokumen yang ada dengan data dari file cadangan. Apakah Anda yakin ingin melanjutkan?"
    );
    if (!confirmed) return;

    setImporting(true);
    setMsg(null);

    try {
      let restoredCount = 0;
      for (const colName of Object.keys(restoreFile.data)) {
        const records = restoreFile.data[colName];
        if (Array.isArray(records)) {
          for (const item of records) {
            const { _id, ...docData } = item;
            if (_id) {
              await setDoc(doc(db, colName, _id), docData, { merge: true });
              restoredCount++;
            }
          }
        }
      }

      setMsg({
        type: "success",
        text: `Pemulihan selesai! Sebanyak ${restoredCount} entri dokumen berhasil dipulihkan ke Firestore.`,
      });
      setRestoreFile(null);
    } catch (err: any) {
      console.error("Restore error:", err);
      setMsg({ type: "error", text: "Gagal memulihkan database: " + err.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Backup & Pemulihan Database
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Cadangkan koleksi data akun, aplikasi SSO, dan konfigurasi sistem dalam bentuk berkas JSON terstruktur.
        </p>
      </div>

      {/* Notifications */}
      {msg && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs ${
            msg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="font-bold text-xs ml-3">
            Tutup
          </button>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Ekspor Cadangan */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Ekspor Cadangan Lengkap (.json)
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Mengekspor seluruh data aktif dari koleksi Firestore (Pengguna, Aplikasi SSO, Konfigurasi Sistem, dan Log Audit) langsung ke komputer lokal Anda.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Server className="w-3.5 h-3.5" /> Cakupan Koleksi:
              </div>
              <ul className="list-disc list-inside pl-1 space-y-0.5 font-mono">
                <li>users (Profil & Akun Mahasiswa)</li>
                <li>apps (Daftar Aplikasi Klien SSO)</li>
                <li>system_config (Pengaturan Webhook & Sistem)</li>
                <li>audit_logs & sso_logs</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleExportBackup}
            disabled={exporting}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengekstrak Data Firestore...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Unduh Cadangan JSON Sekarang
              </>
            )}
          </button>
        </div>

        {/* Card 2: Impor / Pulihkan Cadangan */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Pulihkan Database dari Berkas
              {!isSuperadmin && (
                <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                  Khusus Super Admin
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Unggah berkas JSON cadangan yang valid untuk mengembalikan atau menggabungkan entri data ke Firestore.
            </p>

            <div className="mt-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center bg-slate-50/50 dark:bg-slate-950/40">
              <label className="cursor-pointer flex flex-col items-center">
                <FileText className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  Pilih File Cadangan (.json)
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Format harus sesuai struktur ekspor PSAK
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={!isSuperadmin}
                  className="hidden"
                />
              </label>
            </div>

            {restoreFile && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px]">
                <p className="font-bold text-indigo-900 dark:text-indigo-200">Ringkasan Berkas Cadangan:</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Tanggal Ekspor: {restoreFile.metadata?.exportDate || "-"}
                </p>
                <div className="mt-1 font-mono text-[10px] text-slate-500">
                  {Object.keys(restoreFile.data || {}).map((k) => (
                    <span key={k} className="mr-2">
                      {k}: {restoreFile.data[k]?.length || 0} entri
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleExecuteRestore}
              disabled={!restoreFile || importing || !isSuperadmin}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memulihkan Data...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Jalankan Pemulihan Database
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
