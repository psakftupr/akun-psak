"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  BarChart3, 
  Users, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Loader2,
  PieChart,
  ShieldAlert
} from "lucide-react";

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byProdi: {} as Record<string, number>,
    byAngkatan: {} as Record<string, number>,
    byGender: {} as Record<string, number>,
    byJalur: {} as Record<string, number>,
  });

  useEffect(() => {
    async function calculateStats() {
      try {
        const usersRef = collection(db, "users");
        const snap = await getDocs(usersRef);

        let total = 0;
        let active = 0;
        const byProdi: Record<string, number> = {
          "Arsitektur": 0,
          "Teknik Sipil": 0,
          "Teknik Informatika": 0,
          "Teknik Pertambangan": 0,
        };
        const byAngkatan: Record<string, number> = {};
        const byGender: Record<string, number> = { "Laki-laki": 0, "Perempuan": 0 };
        const byJalur: Record<string, number> = {};

        snap.forEach((doc) => {
          total++;
          const data = doc.data();
          if (data.status === "aktif") active++;

          if (data.prodi) {
            byProdi[data.prodi] = (byProdi[data.prodi] || 0) + 1;
          }

          if (data.angkatan) {
            const yr = String(data.angkatan);
            byAngkatan[yr] = (byAngkatan[yr] || 0) + 1;
          }

          if (data.gender) {
            byGender[data.gender] = (byGender[data.gender] || 0) + 1;
          }

          if (data.jalurMasuk) {
            byJalur[data.jalurMasuk] = (byJalur[data.jalurMasuk] || 0) + 1;
          }
        });

        setStats({
          total,
          active,
          byProdi,
          byAngkatan,
          byGender,
          byJalur,
        });
      } catch (err) {
        console.error("Error calculating stats:", err);
      } finally {
        setLoading(false);
      }
    }

    calculateStats();
  }, []);

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Statistik Komunitas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Data agregat keanggotaan mahasiswa dan sebaran jurusan PSAK FT UPR.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Terdaftar</span>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total}</p>
              <p className="text-[10px] text-slate-400">Anggota dalam sistem</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Anggota Aktif</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
              <p className="text-[10px] text-slate-400">Akun terverifikasi aktif</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Program Studi</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">4 Jurusan</p>
              <p className="text-[10px] text-slate-400">Arsitektur, Sipil, TI, Tambang</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Gender</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {stats.byGender["Laki-laki"] || 0}L : {stats.byGender["Perempuan"] || 0}P
              </p>
              <p className="text-[10px] text-slate-400">Laki-laki & Perempuan</p>
            </div>
          </div>

          {/* Prodi Distribution */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Sebaran per Program Studi (Fakultas Teknik)
              </h2>
              <p className="text-xs text-slate-500">
                Jumlah mahasiswa terdaftar di tiap jurusan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(stats.byProdi).map(([prodi, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={prodi} className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span>{prodi}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jalur Masuk & Angkatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jalur Masuk */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Jalur Penerimaan Masuk
              </h3>

              <div className="space-y-2.5 pt-1">
                {Object.entries(stats.byJalur).map(([jalur, count]) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={jalur} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{jalur}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Angkatan */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sebaran per Angkatan
              </h3>

              <div className="space-y-2.5 pt-1">
                {Object.entries(stats.byAngkatan)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .slice(0, 6)
                  .map(([yr, count]) => {
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={yr} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">Angkatan {yr}</span>
                          <span className="text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
