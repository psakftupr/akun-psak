"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { 
  PartyPopper, 
  Cake, 
  Send, 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  ArrowLeft, 
  Calendar,
  Loader2 
} from "lucide-react";

export default function BirthdayPage() {
  const { user, profile, loading } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Calculate age if tanggalLahir is available
  let age = null;
  let isBirthdayToday = false;

  if (profile?.tanggalLahir) {
    const bDate = new Date(profile.tanggalLahir);
    const now = new Date();
    if (!isNaN(bDate.getTime())) {
      age = now.getFullYear() - bDate.getFullYear();
      const m = now.getMonth() - bDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < bDate.getDate())) {
        age--;
      }
      isBirthdayToday =
        now.getDate() === bDate.getDate() && now.getMonth() === bDate.getMonth();
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      await addDoc(collection(db, "birthday_replies"), {
        userId: user?.uid || "guest",
        displayName: profile?.displayName || user?.displayName || "Mahasiswa",
        nim: profile?.nim || "-",
        prodi: profile?.prodi || "-",
        replyText: replyText.trim(),
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setReplyText("");
    } catch (err) {
      console.error("Error saving birthday reply:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Floating Festive Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-[10%] w-12 h-16 bg-pink-400/20 rounded-full blur-xs animate-bounce duration-1000" />
        <div className="absolute top-20 right-[15%] w-10 h-14 bg-indigo-400/20 rounded-full blur-xs animate-bounce duration-700" />
        <div className="absolute bottom-20 left-[20%] w-14 h-18 bg-amber-400/20 rounded-full blur-xs animate-bounce duration-1200" />
        <div className="absolute bottom-10 right-[25%] w-12 h-16 bg-purple-400/20 rounded-full blur-xs animate-bounce duration-900" />
      </div>

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 text-xs font-bold">
            <PartyPopper className="w-3.5 h-3.5 text-pink-500" />
            Apresiasi Mahasiswa PSAK
          </span>
        </div>

        {/* Main Festive Greeting Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-pink-200/80 dark:border-pink-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Cake Icon / Avatar */}
          <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-tr from-pink-500 to-indigo-600 p-1 shadow-lg shadow-pink-500/20 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-pink-500 dark:text-pink-400">
              <Cake className="w-9 h-9 animate-pulse" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Selamat Ulang Tahun! 🎉
          </h1>

          <p className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-indigo-600 dark:from-pink-400 dark:to-indigo-400 mt-1">
            {profile?.displayName || user?.displayName || "Sahabat Mahasiswa FT UPR"}
          </p>

          {profile?.nim && (
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              {profile.nim} — {profile.prodi}
            </p>
          )}

          {age && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mt-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Menapaki Usia ke-{age} Tahun
            </div>
          )}

          <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

          {/* Heartfelt Wish */}
          <blockquote className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic px-2 sm:px-6">
            &ldquo;Semoga di pertambahan usia ini, selalu dilimpahkan kesehatan, keberkahan, kemudahan dalam menuntut ilmu di Fakultas Teknik Universitas Palangka Raya, serta tercapai segala impian dan cita-cita muliamu.&rdquo;
          </blockquote>

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Dari Segenap Pengurus & Keluarga Besar PSAK FT UPR
          </p>
        </div>

        {/* Reply / Feedback Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md">
          {submitted ? (
            <div className="text-center py-4 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pesan & Doamu Telah Terkirim!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Terima kasih telah berbagi pesan hangat. Selamat merayakan hari istimewamu! 🎈
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Kirim Balasan / Doa ke Pengurus Organisasi:
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Terima kasih banyak atas ucapannya, semoga PSAK semakin maju dan solid selalu..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Kirim Balasan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
