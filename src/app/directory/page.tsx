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
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Direktori Anggota
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Katalog sivitas akademika Kristen Fakultas Teknik Universitas Palangka Raya.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Data pribadi (NIM, WhatsApp, Email) disembunyikan.</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau jurusan..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Angkatan</option>
            {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((yr) => (
              <option key={yr} value={String(yr)}>
                Angkatan {yr}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 ml-auto md:ml-2">
            Total: <strong>{filteredMembers.length}</strong>
          </span>
        </div>
      </div>

      {/* Grid of Members */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-10 text-center border border-slate-200 dark:border-slate-800 space-y-2">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Tidak ada anggota yang cocok
          </h3>
          <p className="text-xs text-slate-500">
            Ubah kata kunci pencarian atau reset filter program studi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.uid}
              className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {member.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photoURL}
                      alt={member.displayName}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      {member.displayName[0].toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {member.displayName}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                      {member.prodi}
                    </p>
                    <span className="text-[11px] text-slate-500 block">
                      Angkatan {member.angkatan} • {member.statusKeanggotaan}
                    </span>
                  </div>
                </div>

                {member.minatBakat && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">
                    {member.minatBakat}
                  </p>
                )}
              </div>

              {/* Social icons */}
              {(member.instagram || member.linkedin) && (
                <div className="pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  {member.instagram && (
                    <a
                      href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-pink-600 flex items-center gap-1 transition-colors"
                      title={`Instagram: ${member.instagram}`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{member.instagram}</span>
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors ml-auto"
                      title="LinkedIn"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
