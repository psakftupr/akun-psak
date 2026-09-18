"use client";

import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  Activity, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  LogIn, 
  Globe, 
  Key, 
  Loader2, 
  Calendar, 
  ChevronDown, 
  ChevronRight 
} from "lucide-react";

type LogType = "audit_logs" | "user_activity_logs" | "network_logs" | "sso_logs";

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState<LogType>("audit_logs");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async (tab: LogType) => {
    setLoading(true);
    try {
      let q;
      try {
        q = query(collection(db, tab), orderBy("timestamp", "desc"), limit(100));
      } catch {
        q = query(collection(db, tab), limit(100));
      }
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      // Sort client side if timestamp exists
      list.sort((a, b) => {
        const tA = new Date(a.timestamp || a.createdAt || 0).getTime();
        const tB = new Date(b.timestamp || b.createdAt || 0).getTime();
        return tB - tA;
      });

      setLogs(list);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(activeTab);
  }, [activeTab]);

  const filteredLogs = logs.filter((l) => {
    const s = search.toLowerCase();
    return (
      (l.action || "").toLowerCase().includes(s) ||
      (l.userName || "").toLowerCase().includes(s) ||
      (l.userEmail || "").toLowerCase().includes(s) ||
      (l.ip || "").toLowerCase().includes(s) ||
      (l.appName || "").toLowerCase().includes(s) ||
      (l.message || "").toLowerCase().includes(s) ||
      (l.endpoint || "").toLowerCase().includes(s)
    );
  });

  const getTabIcon = (tab: LogType) => {
    switch (tab) {
      case "audit_logs":
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case "user_activity_logs":
        return <LogIn className="w-3.5 h-3.5" />;
      case "network_logs":
        return <Globe className="w-3.5 h-3.5" />;
      case "sso_logs":
        return <Key className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Pusat Log Sistem & Keamanan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit aktivitas admin, jejak login pengguna, request jaringan, dan autentikasi SSO eksternal.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(activeTab)}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Segarkan Log
        </button>
      </div>

      {/* Log Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("audit_logs")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "audit_logs"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          {getTabIcon("audit_logs")}
          Audit Administrator
        </button>

        <button
          onClick={() => setActiveTab("user_activity_logs")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "user_activity_logs"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          {getTabIcon("user_activity_logs")}
          Aktivitas Pengguna (Login/Edit)
        </button>

        <button
          onClick={() => setActiveTab("sso_logs")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "sso_logs"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          {getTabIcon("sso_logs")}
          SSO Auth Exchange
        </button>

        <button
          onClick={() => setActiveTab("network_logs")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "network_logs"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          {getTabIcon("network_logs")}
          Network & Webhook
        </button>
      </div>

      {/* Filter and Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari aksi, user, IP, atau pesan..."
          className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Log Feed Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Aksi / Event</th>
                <th className="px-4 py-3">Inisiator / Akun</th>
                <th className="px-4 py-3">IP / Perangkat</th>
                <th className="px-4 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Memuat log {activeTab}...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Belum ada rekaman log untuk kategori ini.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const dateStr = log.timestamp || log.createdAt;
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "-";

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                            {log.action || log.event || log.method || "EVENT"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.userName || log.userEmail || log.clientName || "-"}
                          </p>
                          {log.userEmail && (
                            <p className="text-[10px] text-slate-400 font-mono">{log.userEmail}</p>
                          )}
                        </td>

                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                          {log.ip || log.userAgent?.substring(0, 20) || "-"}
                        </td>

                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {log.message || log.details?.summary || log.endpoint || "-"}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 space-y-1">
                              <p className="font-bold text-indigo-600 dark:text-indigo-400">Rincian Objek Log Raw:</p>
                              <pre className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto text-[10px]">
                                {JSON.stringify(log, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
