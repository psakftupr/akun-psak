"use client";

import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-context";
import { 
  Users, 
  Search, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Loader2 
} from "lucide-react";

export default function AdminUsersPage() {
  const { user, isSuperadmin } = useAuth();

  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setUsersList(list);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setMsg({ type: "error", text: "Gagal memuat pengguna: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (targetUser: any) => {
    try {
      const newStatus = targetUser.status === "aktif" ? "suspen" : "aktif";
      await updateDoc(doc(db, "users", targetUser.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
      );
      setMsg({ type: "success", text: `Status ${targetUser.displayName || targetUser.email} diubah menjadi ${newStatus}.` });
    } catch (err: any) {
      setMsg({ type: "error", text: "Gagal mengubah status: " + err.message });
    }
  };

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

  const filteredUsers = usersList.filter((u) => {
    const q = search.toLowerCase();
    const matchQ =
      (u.displayName || "").toLowerCase().includes(q) ||
      (u.nim || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchProdi = prodiFilter ? u.prodi === prodiFilter : true;
    return matchQ && matchProdi;
  });

  return (
    <div className="space-y-5">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Manajemen Pengguna Mahasiswa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola status aktif/suspen dan penugasan peran akun terdaftar.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
          Total: {usersList.length} Pengguna
        </div>
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIM, atau email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={prodiFilter}
            onChange={(e) => setProdiFilter(e.target.value)}
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
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Mahasiswa</th>
                <th className="px-4 py-3">NIM & Jurusan</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">
                  Role {isSuperadmin ? "(Edit)" : "(Terkunci)"}
                </th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan pencarian.
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

                    {/* Role Dropdown: Khusus Super Admin */}
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
                          onClick={() => handleToggleStatus(u)}
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
  );
}
