"use client";

import React from "react";
import { 
  KeyRound, 
  Crown, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  Award,
  Users, 
  Check, 
  X, 
  Info 
} from "lucide-react";

interface RoleFeature {
  name: string;
  category: string;
  pengurusInti: boolean;
  pengurusKoordinator: boolean;
  pengurusHarian: boolean;
  pengurusMuda: boolean;
  demisioner: boolean;
  anggota: boolean;
  note?: string;
}

export default function AdminRolesPage() {
  const permissions: RoleFeature[] = [
    {
      category: "Akses Anggota Umum",
      name: "Login & Edit Profil Mahasiswa",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: true,
      pengurusMuda: true,
      demisioner: true,
      anggota: true,
      note: "Mengisi biodata lengkap, foto profil GIF/PNG, dan ganti password",
    },
    {
      category: "Akses Anggota Umum",
      name: "Single Sign-On (SSO) ke Aplikasi Terafiliasi",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: true,
      pengurusMuda: true,
      demisioner: true,
      anggota: true,
      note: "Akses satu akun ke web resmi FT, sistem voting, dan portal akademik",
    },
    {
      category: "Akses Anggota Umum",
      name: "Kartu & Ucapan Ulang Tahun Interaktif",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: true,
      pengurusMuda: true,
      demisioner: true,
      anggota: true,
      note: "Menerima notifikasi ucapan otomatis dan membalas doa apresiasi",
    },
    {
      category: "Purna Kepengurusan (Alumni)",
      name: "Lencana Khusus Demisioner & Relasi Alumni",
      pengurusInti: false,
      pengurusKoordinator: false,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: true,
      anggota: false,
      note: "Tanda kehormatan purna pengurus dan jejaring pembina/senior organisasi",
    },
    {
      category: "Kepengurusan & Organisasi Aktif",
      name: "Koordinasi Acara & Kepanitiaan Event PSAK",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: true,
      pengurusMuda: true,
      demisioner: true,
      anggota: false,
      note: "Keterlibatan divisi teknis, kepanitiaan program, dan pendampingan kegiatan",
    },
    {
      category: "Kepengurusan & Organisasi Aktif",
      name: "Rapat Fungsionaris & Evaluasi Program Kerja",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: true,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Peserta rapat pleno fungsionaris seluruh pengurus aktif organisasi",
    },
    {
      category: "Kepengurusan & Organisasi Aktif",
      name: "Pimpinan Bidang & Penanggung Jawab Program Kerja",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Memimpin koordinasi bidang dan penanggung jawab teknis pelaksanaan proker",
    },
    {
      category: "Portal Administrator (/admin)",
      name: "Akses Panel Admin Operasional (/admin)",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Wewenang admin khusus Pengurus Koordinator (PK) dan Pengurus Inti (PI)",
    },
    {
      category: "Portal Administrator (/admin)",
      name: "Lihat & Cari Daftar Pengguna Mahasiswa",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Pencarian nama, NIM, prodi, nomor WhatsApp, dan status keanggotaan",
    },
    {
      category: "Portal Administrator (/admin)",
      name: "Aktivasi / Suspen Akun Mahasiswa",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Memblokir sementara akun bermasalah atau mengaktifkan kembali",
    },
    {
      category: "Portal Administrator (/admin)",
      name: "Pendaftaran Akun Massal (Bulk Import CSV)",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Mendaftarkan mahasiswa baru secara kolektif dengan deteksi NIM otomatis",
    },
    {
      category: "Portal Administrator (/admin)",
      name: "Kelola Aplikasi Klien SSO (Registrasi & Edit)",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Menambah Client ID, nama aplikasi web mitra, dan URL Redirect",
    },
    {
      category: "Portal Administrator (/admin)",
      name: "Lihat Client Secret Aplikasi SSO",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Kredensial rahasia untuk otentikasi server aplikasi backend",
    },
    {
      category: "Portal Administrator (/admin)",
      name: "Lihat Log Sistem & Audit Keamanan",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Audit jejak login admin, verifikasi SSO, dan aktivitas webhook",
    },
    {
      category: "Portal Administrator (/admin)",
      name: "Ekspor Cadangan Database (.json)",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Mengunduh cadangan seluruh koleksi data Firestore",
    },
    {
      category: "Wewenang Manajemen Role",
      name: "Ubah Role Anggota, Pengurus Muda (PM), & Pengurus Harian (PH)",
      pengurusInti: true,
      pengurusKoordinator: true,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Wewenang mengangkat atau memutasi tingkatan Anggota, Pengurus Muda (PM), dan Pengurus Harian (PH)",
    },
    {
      category: "Tingkat Tertinggi (Pengurus Inti & Teknisi)",
      name: "Ubah / Angkat Role Pengurus Koordinator (PK), Demisioner, & Inti (PI)",
      pengurusInti: true,
      pengurusKoordinator: false,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Hak prerogatif Pengurus Inti mengangkat Koordinator Bidang atau suksesi kepengurusan inti",
    },
    {
      category: "Tingkat Tertinggi (Pengurus Inti & Teknisi)",
      name: "Ubah Konfigurasi Webhook & URL Integrasi",
      pengurusInti: true,
      pengurusKoordinator: false,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Mengubah endpoint Google Apps Script dan Secret Token",
    },
    {
      category: "Tingkat Tertinggi (Pengurus Inti & Teknisi)",
      name: "Pulihkan (Restore) Database dari Berkas Cadangan",
      pengurusInti: true,
      pengurusKoordinator: false,
      pengurusHarian: false,
      pengurusMuda: false,
      demisioner: false,
      anggota: false,
      note: "Menimpa dan menyinkronkan dokumen Firestore dari arsip JSON",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          Matriks Hak Akses & Peran (Role Matrix)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Struktur jenjang peran kepengurusan dan wewenang fitur di sistem akun terpusat PSAK FT UPR.
        </p>
      </div>

      {/* Role Summary Badges (6 Tingkatan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* 1. Pengurus Inti (PI) */}
        <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center flex-shrink-0">
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-purple-900 dark:text-purple-200">
              Pengurus Inti (PI)
            </h3>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
              Super Admin / IT
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              Ketua, Sekretaris, Bendahara & Tim IT. Otoritas penuh konfigurasi, role, dan restore.
            </p>
          </div>
        </div>

        {/* 2. Pengurus Koordinator (PK) */}
        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Pengurus Koordinator (PK)
            </h3>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              Admin Operasional
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              Koordinator bidang. Pemegang hak admin operasional verifikasi anggota, suspen, SSO, dan log.
            </p>
          </div>
        </div>

        {/* 3. Pengurus Harian (PH) */}
        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-blue-900 dark:text-blue-200">
              Pengurus Harian (PH)
            </h3>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
              Staf Pengurus Aktif
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              Seluruh anggota pengurus aktif. Bertugas sebagai staf fungsionaris dan rapat bidang (non-admin).
            </p>
          </div>
        </div>

        {/* 4. Pengurus Muda (PM) */}
        <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-teal-900 dark:text-teal-200">
              Pengurus Muda (PM)
            </h3>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
              Staf Muda / Kader
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              Kader pengurus muda dalam masa pembinaan, aktif dalam kepanitiaan acara organisasi.
            </p>
          </div>
        </div>

        {/* 5. Demisioner */}
        <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center flex-shrink-0">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              Demisioner
            </h3>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
              Purna Pengurus
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              Alumni yang telah purna tugas dengan rekognisi purna pengurus dan pembina kegiatan.
            </p>
          </div>
        </div>

        {/* 6. Anggota */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Anggota
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Member Terdaftar
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              Mahasiswa Kristen FT UPR dengan akses profil pribadi dan login SSO terintegrasi.
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Fitur & Hak Akses</th>
                <th className="px-3 py-3.5 text-center">Pengurus Inti (PI)</th>
                <th className="px-3 py-3.5 text-center">Pengurus Koordinator (PK)</th>
                <th className="px-3 py-3.5 text-center">Pengurus Harian (PH)</th>
                <th className="px-3 py-3.5 text-center">Pengurus Muda (PM)</th>
                <th className="px-3 py-3.5 text-center">Demisioner</th>
                <th className="px-3 py-3.5 text-center">Anggota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissions.map((perm, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{perm.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {perm.note}
                    </p>
                  </td>

                  {/* Pengurus Inti (PI) */}
                  <td className="px-3 py-3 text-center">
                    {perm.pengurusInti ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Pengurus Koordinator (PK) */}
                  <td className="px-3 py-3 text-center">
                    {perm.pengurusKoordinator ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Pengurus Harian (PH) */}
                  <td className="px-3 py-3 text-center">
                    {perm.pengurusHarian ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Pengurus Muda (PM) */}
                  <td className="px-3 py-3 text-center">
                    {perm.pengurusMuda ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Demisioner */}
                  <td className="px-3 py-3 text-center">
                    {perm.demisioner ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Anggota */}
                  <td className="px-3 py-3 text-center">
                    {perm.anggota ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
