"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ORG_NAME, ORG_FULL_NAME } from "@/lib/constants";
import { ShieldCheck, Globe, Code2, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Sembunyikan footer pada rute landing & autentikasi agar bersih, terpusat, dan fokus
  const authRoutes = ["/", "/login", "/forgot-password", "/register", "/sso-auth"];
  if (authRoutes.includes(pathname)) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
                {ORG_NAME}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              {ORG_FULL_NAME}. Platform Single Sign-On (SSO) dan manajemen keanggotaan terintegrasi untuk seluruh sivitas akademika kristen di lingkungan Fakultas Teknik Universitas Palangka Raya.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistem Terenkripsi & Didukung Cloudflare Edge Network</span>
            </div>
          </div>

          {/* Col 2: Ekosistem PSAK */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Ekosistem PSAK
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a 
                  href="https://link.psak.my.id" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  link.psak.my.id (Tautan Pintas)
                </a>
              </li>
              <li>
                <Link href="/directory" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Direktori Mahasiswa
                </Link>
              </li>
              <li>
                <Link href="/stats" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Statistik Anggota
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Pengembang & GitHub */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Repositori & Integrasi
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="https://github.com/psakftupr/akun-psak"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  GitHub: psakftupr/akun-psak
                </a>
              </li>
              <li>
                <a href="/sso-sdk.js" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-mono">
                  /sso-sdk.js (JS SDK)
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Portal Masuk SSO
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} PSAK FT UPR. Seluruh hak cipta dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibangun dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk Komunitas PSAK FT UPR
          </p>
        </div>
      </div>
    </footer>
  );
};
