"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  Shield, 
  Users, 
  AppWindow, 
  FileText, 
  Settings, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Lock,
  Globe,
  Radio,
  Power
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, profile, isAdmin, isSuperadmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"users" | "apps" | "logs" | "config">("users");

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userProdiFilter, setUserProdiFilter] = useState("");

  // Apps State
  const [appsList, setAppsList] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppClientId, setNewAppClientId] = useState("");
  const [newAppRedirects, setNewAppRedirects] = useState("");
  const [addingApp, setAddingApp] = useState(false);

  // System Config State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowProfileEdit, setAllowProfileEdit] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

  // Notification State
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [user, isAdmin, authLoading, router]);

  // Load Users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setUsersList(list);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setMsg({ type: "error", text: "Gagal memuat pengguna: " + err.message });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load Apps
  const loadApps = async () => {
    setLoadingApps(false);
    try {
      const snap = await getDocs(collection(db, "applications"));
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setAppsList(list);
    } catch (err: any) {
      console.error("Error loading apps:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadApps();
    }
  }, [isAdmin]);

  // Handle User Status Toggle
  const handleToggleUserStatus = async (targetUser: any) => {
    try {
      const newStatus = targetUser.status === "aktif" ? "suspen" : "aktif";
      await updateDoc(doc(db, "users", targetUser.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
      );
      setMsg({ type: "success", text: `Status ${targetUser.displayName} diubah menjadi ${newStatus}.` });
    } catch (err: any) {
      setMsg({ type: "error", text: "Gagal mengubah status: " + err.message });
    }
  };

  // Handle Role Change
  const handleChangeRole = async (targetUser: any, newRole: string) => {
    if (newRole === "superadmin" && !isSuperadmin) {
      setMsg({ type: "error", text: "Hanya Superadmin yang dapat mengangkat Superadmin lain." });
      return;
    }
    try {
      await updateDoc(doc(db, "users", targetUser.id), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      setMsg({ type: "success", text: `Role ${targetUser.displayName} diubah menjadi ${newRole}.` });
    } catch (err: any) {
      setMsg({ type: "error", text: "Gagal mengubah role: " + err.message });
    }
  };

  // Handle Add Application
  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setMsg({ type: "success", text: "Aplikasi klien SSO baru berhasil didaftarkan!" });
    } catch (err: any) {
      setMsg({ type: "error", text: "Gagal mendaftarkan aplikasi: " + err.message });
    } finally {
      setAddingApp(false);
    }
  };

  // Handle App Status Toggle
  const handleToggleApp = async (appItem: any) => {
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

  if (authLoading || !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchQ =
      (u.displayName || "").toLowerCase().includes(q) ||
      (u.nim || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchProdi = userProdiFilter ? u.prodi === userProdiFilter : true;
    return matchQ && matchProdi;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Panel Administrator PSAK FT UPR
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold uppercase">
                {profile?.role}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola pengguna, aplikasi SSO, audit integritas sistem, dan konfigurasi platform.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Pengguna ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "apps"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            Aplikasi SSO ({appsList.length})
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "config"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Konfigurasi Sistem
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {msg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm ${
            msg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: USERS */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama, NIM, atau email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={userProdiFilter}
                onChange={(e) => setUserProdiFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="">Semua Jurusan</option>
                <option value="Arsitektur">Arsitektur</option>
                <option value="Teknik Sipil">Teknik Sipil</option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Teknik Pertambangan">Teknik Pertambangan</option>
              </select>
              <button
                onClick={loadUsers}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Segarkan
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Mahasiswa</th>
                    <th className="px-6 py-3.5">NIM & Prodi</th>
                    <th className="px-6 py-3.5">Kontak WA</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.photoURL}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                              {(u.displayName || "U")[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {u.displayName || "Tanpa Nama"}
                            </p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{u.nim || "-"}</p>
                        <p className="text-[11px] text-slate-500">{u.prodi} ({u.angkatan})</p>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                        {u.whatsapp || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={u.role || "anggota"}
                          disabled={u.id === user?.uid || (u.role === "superadmin" && !isSuperadmin)}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold capitalize disabled:opacity-50"
                        >
                          <option value="anggota">Anggota</option>
                          <option value="admin">Admin</option>
                          {isSuperadmin && <option value="superadmin">Superadmin</option>}
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            u.status === "aktif"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200"
                          }`}
                        >
                          {u.status || "aktif"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {u.id !== user?.uid && (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            {u.status === "aktif" ? "Suspen" : "Aktifkan"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPS SSO */}
      {activeTab === "apps" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add App Form */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Daftarkan Aplikasi Klien Baru
            </h2>
            <p className="text-xs text-slate-500">
              Aplikasi eksternal yang diizinkan menggunakan sistem SSO PSAK FT UPR.
            </p>

            <form onSubmit={handleAddApp} className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Nama Aplikasi
                </label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="Contoh: Portal Pemilu PSAK"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Client ID (Unik)
                </label>
                <input
                  type="text"
                  required
                  value={newAppClientId}
                  onChange={(e) => setNewAppClientId(e.target.value)}
                  placeholder="contoh: pemilu_psak"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Callback Redirect URIs (Satu per baris)
                </label>
                <textarea
                  rows={3}
                  value={newAppRedirects}
                  onChange={(e) => setNewAppRedirects(e.target.value)}
                  placeholder="https://pemilu.psak.my.id/callback&#10;http://localhost:3000/callback"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={addingApp}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {addingApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Daftarkan Aplikasi
              </button>
            </form>
          </div>

          {/* Apps List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Aplikasi Klien Terdaftar ({appsList.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {appsList.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{app.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {app.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                      Client ID: {app.clientId || app.id}
                    </p>

                    {app.redirectUris && app.redirectUris.length > 0 && (
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <span className="font-semibold block">Redirect URIs:</span>
                        {app.redirectUris.map((uri: string, idx: number) => (
                          <div key={idx} className="truncate font-mono">
                            • {uri}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleToggleApp(app)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                    >
                      {app.active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM CONFIG */}
      {activeTab === "config" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-2xl space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Konfigurasi & Pemeliharaan Platform
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Mode Pemeliharaan (Maintenance Mode)</p>
                <p className="text-xs text-slate-500">
                  Saat aktif, platform menampilkan banner pemeliharaan dan menonaktifkan login publik.
                </p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  maintenanceMode ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    maintenanceMode ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Izinkan Edit Profil Anggota</p>
                <p className="text-xs text-slate-500">
                  Bila dinonaktifkan, seluruh anggota tidak dapat mengedit profil secara mandiri.
                </p>
              </div>
              <button
                onClick={() => setAllowProfileEdit(!allowProfileEdit)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  allowProfileEdit ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    allowProfileEdit ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
