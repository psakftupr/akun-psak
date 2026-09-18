"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  Settings, 
  Lock, 
  Crown, 
  CheckCircle2, 
  AlertTriangle,
  Save,
  Loader2,
  Globe,
  Mail,
  Key,
  Shield,
  UploadCloud,
  FileSpreadsheet
} from "lucide-react";

export default function AdminConfigPage() {
  const { isSuperadmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [config, setConfig] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    allowUserEditProfile: true,
    appsScriptUrl: "https://api.psak.my.id/UploadFoto",
    appsScriptEmailUrl: "https://api.psak.my.id/sendEmailOTP",
    appsScriptWelcomeEmailUrl: "https://api.psak.my.id/sendEmailWelcome",
    appsScriptBirthdayEmailUrl: "https://api.psak.my.id/sendEmailHBD",
    externalToken: "gform-new",
  });

  // Load configuration from Firestore
  useEffect(() => {
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, "config", "system"));
        if (snap.exists()) {
          const data = snap.data();
          setConfig((prev) => ({
            ...prev,
            maintenanceMode: Boolean(data.maintenanceMode),
            registrationEnabled: data.registrationEnabled !== false,
            allowUserEditProfile: data.allowUserEditProfile !== false,
            appsScriptUrl: data.appsScriptUrl || prev.appsScriptUrl,
            appsScriptEmailUrl: data.appsScriptEmailUrl || prev.appsScriptEmailUrl,
            appsScriptWelcomeEmailUrl: data.appsScriptWelcomeEmailUrl || prev.appsScriptWelcomeEmailUrl,
            appsScriptBirthdayEmailUrl: data.appsScriptBirthdayEmailUrl || prev.appsScriptBirthdayEmailUrl,
            externalToken: data.externalToken || prev.externalToken,
          }));
        }
      } catch (err: any) {
        console.error("Gagal memuat konfigurasi:", err);
        setMsg({ type: "error", text: "Gagal memuat konfigurasi dari database: " + err.message });
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) {
      setMsg({ type: "error", text: "Akses Ditolak: Hanya Super Admin yang berwenang mengubah konfigurasi sistem." });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      await setDoc(doc(db, "config", "system"), {
        ...config,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setMsg({ type: "success", text: "Seluruh konfigurasi sistem dan webhook berhasil disimpan!" });
    } catch (err: any) {
      console.error("Gagal menyimpan konfigurasi:", err);
      setMsg({ type: "error", text: "Gagal menyimpan konfigurasi: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Konfigurasi Sistem & Webhook
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur ketersediaan platform, integrasi otomatisasi Google Apps Script, dan kunci API eksternal.
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
          <button onClick={() => setMsg(null)} className="font-bold text-xs ml-3 cursor-pointer">Tutup</button>
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
            <strong>Akses Penuh Super Admin:</strong> Anda berwenang mengubah kebijakan sistem, endpoint Apps Script, dan token API eksternal.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: KEBIJAKAN PLATFORM */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            1. Status & Kebijakan Operasional
          </h2>

          <div className="space-y-3">
            {/* Toggle 1: Mode Maintenance */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-xs text-slate-900 dark:text-white">
                  Mode Pemeliharaan (Maintenance Mode)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Membatasi login umum dan menampilkan pengumuman pemeliharaan server bagi anggota non-admin.
                </p>
              </div>
              <button
                type="button"
                disabled={!isSuperadmin}
                onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50 cursor-pointer ${
                  config.maintenanceMode ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                    config.maintenanceMode ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Pendaftaran Anggota Baru */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-xs text-slate-900 dark:text-white">
                  Buka Pendaftaran Anggota Baru
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Izinkan mahasiswa Kristen baru FT UPR membuat akun mandiri melalui form registrasi.
                </p>
              </div>
              <button
                type="button"
                disabled={!isSuperadmin}
                onClick={() => setConfig({ ...config, registrationEnabled: !config.registrationEnabled })}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50 cursor-pointer ${
                  config.registrationEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                    config.registrationEnabled ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Izin Edit Profil */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-xs text-slate-900 dark:text-white">
                  Izin Edit Mandiri Profil Mahasiswa
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Izinkan mahasiswa mengubah biodata, foto, dan nomor kontak secara mandiri dari halaman profil mereka.
                </p>
              </div>
              <button
                type="button"
                disabled={!isSuperadmin}
                onClick={() => setConfig({ ...config, allowUserEditProfile: !config.allowUserEditProfile })}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50 cursor-pointer ${
                  config.allowUserEditProfile ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                    config.allowUserEditProfile ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: INTEGRASI GOOGLE APPS SCRIPT (WEBHOOKS) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            2. URL Webhook Google Apps Script (GAS)
          </h2>

          <div className="space-y-3">
            {/* Upload Foto */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                Webhook Upload Foto Profil (Google Drive)
              </label>
              <input
                type="url"
                disabled={!isSuperadmin}
                value={config.appsScriptUrl}
                onChange={(e) => setConfig({ ...config, appsScriptUrl: e.target.value })}
                placeholder="https://api.psak.my.id/UploadFoto atau https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            {/* Kirim OTP Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                Webhook Kirim Email Kode OTP (Verifikasi)
              </label>
              <input
                type="url"
                disabled={!isSuperadmin}
                value={config.appsScriptEmailUrl}
                onChange={(e) => setConfig({ ...config, appsScriptEmailUrl: e.target.value })}
                placeholder="https://api.psak.my.id/sendEmailOTP"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            {/* Kirim Welcome Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                Webhook Kirim Email Selamat Datang (Welcome Email)
              </label>
              <input
                type="url"
                disabled={!isSuperadmin}
                value={config.appsScriptWelcomeEmailUrl}
                onChange={(e) => setConfig({ ...config, appsScriptWelcomeEmailUrl: e.target.value })}
                placeholder="https://api.psak.my.id/sendEmailWelcome"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            {/* Kirim Birthday Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-rose-600" />
                Webhook Kirim Email Ucapan Ulang Tahun (Birthday)
              </label>
              <input
                type="url"
                disabled={!isSuperadmin}
                value={config.appsScriptBirthdayEmailUrl}
                onChange={(e) => setConfig({ ...config, appsScriptBirthdayEmailUrl: e.target.value })}
                placeholder="https://api.psak.my.id/sendEmailHBD"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: TOKEN API EKSTERNAL & GOOGLE FORMS */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            3. Integrasi Eksternal & Google Forms
          </h2>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              Kunci Rahasia API / Token Registrasi Google Form (`externalToken`)
            </label>
            <input
              type="text"
              disabled={!isSuperadmin}
              value={config.externalToken}
              onChange={(e) => setConfig({ ...config, externalToken: e.target.value })}
              placeholder="Contoh: gform-new"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Token ini digunakan pada Google Apps Script formulir pendaftaran untuk memvalidasi request ke endpoint <code>/api/external/create-user</code>.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        {isSuperadmin && (
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-60 cursor-pointer shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan Konfigurasi...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Konfigurasi Sistem
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
