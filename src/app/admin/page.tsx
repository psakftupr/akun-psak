"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Shield, 
  ShieldCheck,
  Crown,
  Users, 
  AppWindow, 
  Settings, 
  Search, 
  Plus, 
  Loader2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  LogOut,
  Lock,
  ExternalLink
} from "lucide-react";

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, profile, isAdmin, isSuperadmin, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"users" | "apps" | "config">("users");

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
    setLoadingApps(true);
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

  // Handle User Status Toggle (Admin & Super Admin bisa)
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
      setMsg({ type: "success", text: `Status akun ${targetUser.displayName || targetUser.email} diubah menjadi ${newStatus}.` });
    } catch (err: any) {
      setMsg({ type: "error", text: "Gagal mengubah status: " + err.message });
    }
  };

  // Handle Role Change (HANYA SUPER ADMIN)
  const handleChangeRole = async (targetUser: any, newRole: string) => {
    if (!isSuperadmin) {
      setMsg({ type: "error", text: "Akses Ditolak: Hanya Super Admin yang berwenang mengubah role akun." });
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
      setMsg({ type: "success", text: `Role ${targetUser.displayName || targetUser.email} diubah menjadi ${newRole}.` });
    } catch (err: any) {
      setMsg({ type: "error", text: "Gagal mengubah role: " + err.message });
    }
  };

  // Handle Add Application (HANYA SUPER ADMIN)
  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) {
      setMsg({ type: "error", text: "Akses Ditolak: Hanya Super Admin yang dapat mendaftarkan aplikasi klien SSO baru." });
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
      setMsg({ type: "success", text: `Aplikasi klien '${newAppName}' berhasil didaftarkan.` });
    } catch (err: any) {
      setMsg({ type: "error", text: "Gagal mendaftarkan aplikasi: " + err.message });
    } finally {
      setAddingApp(false);
    }
  };

  // Handle App Status Toggle (HANYA SUPER ADMIN)
  const handleToggleApp = async (appItem: any) => {
    if (!isSuperadmin) {
      setMsg({ type: "error", text: "Akses Ditolak: Hanya Super Admin yang dapat mengubah status aplikasi SSO." });
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

  if (authLoading || !isAdmin) {
    return (
      <div className="flex-1 min-h-[85vh] flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
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
    <div className="flex-1 flex flex-col w-full min-h-screen pb-20 md:pb-8">
      {/* 1. TOP NAVBAR PORTAL ADMIN (DESKTOP & TABLET) */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo & Role Badge */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                Portal Admin PSAK FT UPR
              </span>

              {/* Distinction: SUPER ADMIN vs ADMIN */}
              {isSuperadmin ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800 uppercase tracking-wide">
                  <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Super Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  Admin
                </span>
              )}
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "users"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Pengguna ({usersList.length})
              </button>

              <button
                onClick={() => setActiveTab("apps")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "apps"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <AppWindow className="w-3.5 h-3.5" />
                Aplikasi SSO ({appsList.length})
              </button>

              <button
                onClick={() => setActiveTab("config")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "config"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Konfigurasi
              </button>
            </div>

            {/* Right Quick Links */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ke Beranda</span>
              </Link>

              <button
                onClick={() => logout()}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1"
                title="Keluar dari Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN PORTAL CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-5">
        {/* Status / Alert Banner */}
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

        {/* TAB 1: DATA PENGGUNA */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari nama, NIM, atau email..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={userProdiFilter}
                  onChange={(e) => setUserProdiFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                >
                  <option value="">Semua Jurusan</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Arsitektur">Arsitektur</option>
                  <option value="Teknik Pertambangan">Teknik Pertambangan</option>
                </select>

                <button
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingUsers ? "animate-spin" : ""}`} />
                  Segarkan
                </button>
              </div>
            </div>

            {/* Table Users */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Mahasiswa</th>
                      <th className="px-4 py-3">NIM & Jurusan</th>
                      <th className="px-4 py-3">WhatsApp</th>
                      <th className="px-4 py-3">
                        Role {isSuperadmin ? "(Edit Bebas)" : "(Khusus Superadmin)"}
                      </th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          Tidak ada mahasiswa yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {u.photoURL ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={u.photoURL}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                  {(u.displayName || "U")[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {u.displayName || "Tanpa Nama"}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-mono font-medium text-slate-800 dark:text-slate-200">{u.nim || "-"}</p>
                            <p className="text-[11px] text-slate-400">{u.prodi} ({u.angkatan || "-"})</p>
                          </td>

                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                            {u.whatsapp || "-"}
                          </td>

                          {/* Role Column: Controlled by isSuperadmin */}
                          <td className="px-4 py-3">
                            {isSuperadmin ? (
                              <select
                                value={u.role || "anggota"}
                                disabled={u.id === user?.uid}
                                onChange={(e) => handleChangeRole(u, e.target.value)}
                                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs capitalize"
                              >
                                <option value="anggota">Anggota</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Superadmin</option>
                              </select>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                                <Lock className="w-3 h-3 text-slate-400" />
                                {u.role || "Anggota"}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium capitalize border ${
                                u.status === "aktif"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              {u.status || "aktif"}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            {u.id !== user?.uid && (
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                              >
                                {u.status === "aktif" ? "Suspen" : "Aktifkan"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APLIKASI KLIEN SSO */}
        {activeTab === "apps" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add App Form (HANYA SUPER ADMIN) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Daftarkan Klien SSO
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Integrasi aplikasi pihak ketiga dalam ekosistem PSAK FT UPR.
                </p>
              </div>

              {!isSuperadmin ? (
                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    Khusus Super Admin
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Hanya Super Admin yang berwenang menambahkan aplikasi SSO baru.
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
                      placeholder="Misal: Portal Pemilu PSAK"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Redirect URIs (1 per baris)
                    </label>
                    <textarea
                      rows={3}
                      value={newAppRedirects}
                      onChange={(e) => setNewAppRedirects(e.target.value)}
                      placeholder="https://pemilu.psak.my.id/callback&#10;http://localhost:3000/callback"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addingApp}
                    className="w-full py-2 px-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {addingApp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Simpan Aplikasi
                  </button>
                </form>
              )}
            </div>

            {/* Apps List */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Aplikasi Klien Terdaftar ({appsList.length})
              </h2>

              {appsList.length === 0 ? (
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

                        <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
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
        )}

        {/* TAB 3: KONFIGURASI SISTEM */}
        {activeTab === "config" && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                Pengaturan Sistem & Kebijakan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi umum akses platform dan ketersediaan layanan SSO.
              </p>
            </div>

            {!isSuperadmin && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Mode Baca Saja: Hanya Super Admin yang dapat mengubah konfigurasi ini.</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">Mode Pemeliharaan (Maintenance)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Membatasi akses pengguna biasa dan menampilkan pemberitahuan pemeliharaan sistem.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!isSuperadmin}
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50 ${
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

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">Izin Edit Mandiri Profil Mahasiswa</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Izinkan mahasiswa mengubah biodata profil dan kontak secara berkala.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!isSuperadmin}
                  onClick={() => setAllowProfileEdit(!allowProfileEdit)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50 ${
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
        )}
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (KHUSUS LAYAR HP) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === "users" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"
          }`}
        >
          <Users className="w-4 h-4" />
          Pengguna
        </button>

        <button
          onClick={() => setActiveTab("apps")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === "apps" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"
          }`}
        >
          <AppWindow className="w-4 h-4" />
          Klien SSO
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === "config" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"
          }`}
        >
          <Settings className="w-4 h-4" />
          Sistem
        </button>

        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Beranda
        </Link>
      </nav>
    </div>
  );
}
