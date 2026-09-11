"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  Users, 
  GraduationCap, 
  Building2, 
  UserCheck, 
  ArrowLeft,
  Loader2
} from "lucide-react";

interface StatItem {
  name: string;
  count: number;
  percentage: number;
}

export default function StatsPage() {
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [prodiStats, setProdiStats] = useState<StatItem[]>([]);
  const [angkatanStats, setAngkatanStats] = useState<StatItem[]>([]);
  const [jalurMasukStats, setJalurMasukStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const usersRef = collection(db, "users");
        const snap = await getDocs(query(usersRef));

        let total = 0;
        let active = 0;
        const prodiMap: Record<string, number> = {
          "Teknik Informatika": 0,
          "Teknik Sipil": 0,
          "Arsitektur": 0,
          "Teknik Pertambangan": 0,
        };
        const angkatanMap: Record<string, number> = {};
        const jalurMap: Record<string, number> = {};

        snap.forEach((doc) => {
          const data = doc.data();
          total++;
          if (data.status === "aktif") active++;

          // Prodi
          const p = data.prodi;
          if (p && prodiMap[p] !== undefined) {
            prodiMap[p]++;
          } else if (p) {
            prodiMap[p] = (prodiMap[p] || 0) + 1;
          }

          // Angkatan
          const a = String(data.angkatan || "");
          if (a && a !== "undefined" && a !== "0") {
            angkatanMap[a] = (angkatanMap[a] || 0) + 1;
          }

          // Jalur Masuk
          const j = data.jalurMasuk;
          if (j) {
            jalurMap[j] = (jalurMap[j] || 0) + 1;
          }
        });

        setTotalMembers(total);
        setActiveMembers(active);

        // Calculate Percentages
        const calcPercent = (map: Record<string, number>) =>
          Object.entries(map)
            .map(([name, count]) => ({
              name,
              count,
              percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        setProdiStats(calcPercent(prodiMap));
        setAngkatanStats(calcPercent(angkatanMap).slice(0, 8));
        setJalurMasukStats(calcPercent(jalurMap));
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
      {/* Header Minimalis Terpadu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/" className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs hover:opacity-90">
              P
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Statistik Komunitas PSAK FT UPR
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data metrik dan sebaran mahasiswa Kristen Fakultas Teknik Universitas Palangka Raya.
          </p>
        </div>

        {/* Tautan Navigasi Cepat */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Beranda
          </Link>
          <Link
            href="/directory"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Direktori
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Menghitung metrik statistik...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 block mb-1">Total Mahasiswa</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalMembers}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 block mb-1">Akun Aktif</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeMembers}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 block mb-1">Jurusan / Prodi</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">4</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 block mb-1">Angkatan Terdata</span>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{angkatanStats.length}</p>
            </div>
          </div>

          {/* Breakdown Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sebaran Prodi */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Sebaran per Program Studi
              </h2>
              <div className="space-y-3">
                {prodiStats.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-500">
                        {item.count} orang ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sebaran Angkatan */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Sebaran per Tahun Angkatan
              </h2>
              <div className="space-y-3">
                {angkatanStats.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">Angkatan {item.name}</span>
                      <span className="text-slate-500">
                        {item.count} orang ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
