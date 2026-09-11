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
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Statistik Demografi & Keanggotaan</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Statistik Komunitas PSAK FT UPR
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Gambaran umum sebaran mahasiswa, angkatan, dan program studi yang tergabung dalam persekutuan.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Total Anggota Terdaftar</span>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.total}</p>
              <p className="text-[11px] text-slate-500">Mahasiswa & alumni dalam sistem</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Anggota Status Aktif</span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</p>
              <p className="text-[11px] text-slate-500">Akun berstatus aktif & terverifikasi</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Program Studi FT</span>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">4 Jurusan</p>
              <p className="text-[11px] text-slate-500">Arsitektur, Sipil, TI, Tambang</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Perbandingan Gender</span>
              <p className="text-3xl font-black text-violet-600 dark:text-violet-400">
                {stats.byGender["Laki-laki"] || 0}L / {stats.byGender["Perempuan"] || 0}P
              </p>
              <p className="text-[11px] text-slate-500">Distribusi anggota persekutuan</p>
            </div>
          </div>

          {/* Prodi Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Sebaran Anggota per Program Studi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Distribusi sivitas akademika kristen di 4 jurusan Fakultas Teknik UPR.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(stats.byProdi).map(([prodi, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={prodi} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-200">
                      <span>{prodi}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{count} orang ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jalur Masuk & Angkatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jalur Masuk */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Jalur Penerimaan Masuk
              </h3>

              <div className="space-y-3 pt-2">
                {Object.entries(stats.byJalur).map(([jalur, count]) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={jalur} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{jalur}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Angkatan */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Sebaran per Angkatan
              </h3>

              <div className="space-y-3 pt-2">
                {Object.entries(stats.byAngkatan)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .slice(0, 6)
                  .map(([yr, count]) => {
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={yr} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Angkatan {yr}</span>
                          <span className="text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
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
