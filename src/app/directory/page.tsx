"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { PRODI_OPTIONS } from "@/lib/constants";
import { 
  Users, 
  Search, 
  GraduationCap, 
  Loader2, 
  ArrowLeft, 
  BarChart2, 
  ExternalLink, 
  Globe, 
  Link2 
} from "lucide-react";

interface PublicMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  prodi: string;
  angkatan: number | string;
  statusKeanggotaan?: string;
  gender?: string;
  instagram?: string;
  linkedin?: string;
  minatBakat?: string;
}

export default function DirectoryPage() {
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState("");

  useEffect(() => {
    async function loadMembers() {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("status", "==", "aktif"), limit(200));
        const snap = await getDocs(q);

        const list: PublicMember[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          if (data.hideProfileInDirectory) return;

          list.push({
            uid: doc.id,
            displayName: data.displayName || "Anggota PSAK",
            photoURL: data.hidePhotoInDirectory ? undefined : data.photoURL,
            prodi: data.prodi || "-",
            angkatan: data.angkatan || "-",
            statusKeanggotaan: data.statusKeanggotaan || "Mahasiswa Aktif",
            gender: data.gender,
            instagram: data.instagram,
            linkedin: data.linkedin,
            minatBakat: data.minatBakat,
          });
        });

        setMembers(list);
      } catch (err) {
        console.error("Error loading directory members:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.displayName.toLowerCase().includes(search.toLowerCase()) ||
      m.prodi.toLowerCase().includes(search.toLowerCase());
    const matchProdi = selectedProdi ? m.prodi === selectedProdi : true;
    const matchAngkatan = selectedAngkatan ? String(m.angkatan) === selectedAngkatan : true;
    return matchSearch && matchProdi && matchAngkatan;
  });

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
              Direktori Mahasiswa PSAK FT UPR
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Katalog terbuka mahasiswa Kristen Fakultas Teknik Universitas Palangka Raya.
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
            href="/stats"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
            Statistik
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau jurusan..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="">Semua Jurusan</option>
            {PRODI_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="">Semua Angkatan</option>
            {Array.from({ length: 11 }, (_, i) => 2016 + i).map((yr) => (
              <option key={yr} value={String(yr)}>
                {yr}
              </option>
            ))}
          </select>

          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap px-2">
            {filteredMembers.length} Mahasiswa
          </span>
        </div>
      </div>

      {/* Grid Mahasiswa */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Memuat data direktori...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-600 dark:text-slate-400">Tidak ada mahasiswa yang cocok dengan kriteria pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredMembers.map((m) => (
            <div
              key={m.uid}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                {m.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoURL}
                    alt={m.displayName}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {m.displayName[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {m.displayName}
                  </h2>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {m.prodi}
                  </p>
                  <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-1">
                    Angkatan {m.angkatan}
                  </span>
                </div>
              </div>

              {/* Action / Detail Link */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link
                  href={`/profile?uid=${m.uid}`}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Detail Profil
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-2 text-slate-400">
                  {m.instagram && (
                    <a
                      href={`https://instagram.com/${m.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Instagram"
                      className="hover:text-pink-500 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {m.linkedin && (
                    <a
                      href={m.linkedin.startsWith("http") ? m.linkedin : `https://${m.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      title="LinkedIn"
                      className="hover:text-blue-600 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
