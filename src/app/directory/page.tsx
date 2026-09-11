"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { PRODI_OPTIONS } from "@/lib/constants";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Calendar,
  Loader2,
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
        const q = query(usersRef, where("status", "==", "aktif"), limit(150));
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
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <Users className="w-3.5 h-3.5" />
          <span>Direktori Komunitas PSAK FT UPR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Direktori Anggota Mahasiswa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Menghubungkan seluruh sivitas akademika Kristen lintas jurusan Fakultas Teknik Universitas Palangka Raya.
        </p>
        <div className="inline-flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privasi Terjaga: Informasi sensitif (Email, WhatsApp, NIM) disembunyikan dari publik.</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau jurusan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Program Studi</option>
            {PRODI_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Angkatan</option>
            {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((yr) => (
              <option key={yr} value={String(yr)}>
                Angkatan {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Members */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-2">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak ada anggota yang ditemukan
          </h3>
          <p className="text-xs text-slate-500">
            Coba sesuaikan kata kunci pencarian atau filter program studi Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.uid}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {member.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photoURL}
                      alt={member.displayName}
                      className="w-14 h-14 rounded-2xl object-cover border border-indigo-500/30 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      {member.displayName[0].toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {member.displayName}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {member.prodi}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Angkatan {member.angkatan} • {member.statusKeanggotaan}
                    </span>
                  </div>
                </div>

                {member.minatBakat && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    💡 {member.minatBakat}
                  </p>
                )}
              </div>

              {/* Social icons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {member.instagram && (
                  <a
                    href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors"
                    title={`Instagram ${member.instagram}`}
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                    title="LinkedIn"
                  >
                    <Link2 className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
