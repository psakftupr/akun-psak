"use client";

import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  AppWindow, 
  Plus, 
  Loader2, 
  Lock, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";

export default function AdminAppsPage() {
  const { isSuperadmin } = useAuth();

  const [appsList, setAppsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAppName, setNewAppName] = useState("");
  const [newAppClientId, setNewAppClientId] = useState("");
  const [newAppRedirects, setNewAppRedirects] = useState("");
  const [addingApp, setAddingApp] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadApps = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "applications"));
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setAppsList(list);
    } catch (err: any) {
      console.error("Error loading apps:", err);
      setMsg({ type: "error", text: "Gagal memuat aplikasi: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) {
      setMsg({ type: "error", text: "Akses Ditolak: Hanya Super Admin yang berwenang menambahkan aplikasi SSO baru." });
      return;
    }
    if (!newAppName.trim() || !newAppClientId.trim()) return;

    setAddingApp(true);
    try {
      const clientIdClean = newAppClientId.trim().toLowerCase().replace(/\s+/g, "_");
      const redirects = newAppRedirects
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      const appPayload = {
        name: newAppName.trim(),
        clientId: clientIdClean,
        redirectUris: redirects,
        active: true,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "applications", clientIdClean), appPayload);
      setAppsList((prev) => [...prev, { id: clientIdClean, ...appPayload }]);
      setNewAppName("");
      setNewAppClientId("");
      setNewAppRedirects("");
      setMsg({ type: "success", text: `Aplikasi '${newAppName}' berhasil didaftarkan.` });
    } catch (err: any) {
      setMsg({ type: "error", text: "Gagal mendaftarkan aplikasi: " + err.message });
    } finally {
      setAddingApp(false);
    }
  };

  const handleToggleApp = async (appItem: any) => {
    if (!isSuperadmin) {
      setMsg({ type: "error", text: "Akses Ditolak: Hanya Super Admin yang dapat mengubah status aktif aplikasi." });
      return;
    }
    try {
      const nextActive = !appItem.active;
      await updateDoc(doc(db, "applications", appItem.id), {
        active: nextActive,
      });
      setAppsList((prev) =>
        prev.map((a) => (a.id === appItem.id ? { ...a, active: nextActive } : a))
      );
      setMsg({ type: "success", text: `Aplikasi ${appItem.name} ${nextActive ? "diaktifkan" : "dinonaktifkan"}.` });
    } catch (err: any) {
      setMsg({ type: "error", text: "Gagal memperbarui aplikasi: " + err.message });
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AppWindow className="w-5 h-5 text-emerald-600" />
          Aplikasi Klien Single Sign-On (SSO)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola otorisasi aplikasi eksternal dan portal resmi yang terhubung dengan akun PSAK.
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

      {/* Grid: Add Form + List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1: Form Registrasi (Super Admin Only) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Daftarkan Klien SSO
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aplikasi pihak ketiga yang menggunakan autentikasi PSAK.
            </p>
          </div>

          {!isSuperadmin ? (
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5" />
                Hak Akses Khusus Super Admin
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Pendaftaran aplikasi klien SSO baru hanya dapat dilakukan oleh Super Admin.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAddApp} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Nama Aplikasi
                </label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="Contoh: Portal Pemilu PSAK"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Client ID (Unik)
                </label>
                <input
                  type="text"
                  required
                  value={newAppClientId}
                  onChange={(e) => setNewAppClientId(e.target.value)}
                  placeholder="pemilu_psak"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Redirect URIs (1 baris per URL)
                </label>
                <textarea
                  rows={3}
                  value={newAppRedirects}
                  onChange={(e) => setNewAppRedirects(e.target.value)}
                  placeholder="https://pemilu.psak.my.id/callback&#10;http://localhost:3000/callback"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={addingApp}
                className="w-full py-2 px-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {addingApp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Daftarkan Aplikasi
              </button>
            </form>
          )}
        </div>

        {/* Kolom 2: Daftar Aplikasi Terdaftar */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Aplikasi Klien Terdaftar ({appsList.length})
            </h2>
            <button
              onClick={loadApps}
              disabled={loading}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Segarkan
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs text-slate-400 mt-2">Memuat aplikasi...</p>
            </div>
          ) : appsList.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              Belum ada aplikasi yang didaftarkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {appsList.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white">{app.name}</h3>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          app.active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {app.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      client_id: {app.clientId || app.id}
                    </p>

                    {app.redirectUris && app.redirectUris.length > 0 && (
                      <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                        <span className="font-medium text-slate-600 dark:text-slate-400 block">Redirects:</span>
                        {app.redirectUris.map((uri: string, idx: number) => (
                          <div key={idx} className="truncate font-mono">
                            • {uri}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isSuperadmin && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => handleToggleApp(app)}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        {app.active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
