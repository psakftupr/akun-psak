"use client";

import React, { useState } from "react";
import { parseNim } from "@/lib/nim-parser";
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Table, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Plus, 
  Trash2, 
  Play, 
  Loader2, 
  Mail, 
  Check, 
  RefreshCw 
} from "lucide-react";

interface ImportedUser {
  id: string;
  displayName: string;
  nim: string;
  email: string;
  whatsapp: string;
  tanggalLahir: string;
  prodi?: string;
  angkatan?: number;
  jalur?: string;
  valid: boolean;
  errors: string[];
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [activeTab, setActiveTab] = useState<"csv" | "table" | "preview" | "progress">("csv");
  const [pastedText, setPastedText] = useState("");
  const [usersToImport, setUsersToImport] = useState<ImportedUser[]>([]);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Progress state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ name: string; email: string; success: boolean; msg: string }[]>([]);

  if (!isOpen) return null;

  // Validate single user row
  const validateUser = (u: Partial<ImportedUser>): ImportedUser => {
    const errors: string[] = [];
    const displayName = (u.displayName || "").trim();
    const nim = (u.nim || "").trim();
    const email = (u.email || "").trim().toLowerCase();
    const whatsapp = (u.whatsapp || "").trim();
    const tanggalLahir = (u.tanggalLahir || "").trim();

    if (!displayName) errors.push("Nama wajib diisi");
    if (!nim || nim.length < 6) errors.push("NIM minimal 6 karakter");
    if (!email || !email.includes("@")) errors.push("Format email tidak valid");

    const parsed = nim ? parseNim(nim) : null;

    return {
      id: u.id || Math.random().toString(36).substring(2, 9),
      displayName,
      nim,
      email,
      whatsapp,
      tanggalLahir,
      prodi: parsed?.prodiName || u.prodi || "Teknik Informatika",
      angkatan: parsed?.angkatan || u.angkatan || new Date().getFullYear(),
      jalur: parsed?.jalurMasuk || u.jalur || "Reguler",
      valid: errors.length === 0,
      errors,
    };
  };

  // 1. Process Raw Text or CSV
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsedList: ImportedUser[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip header line if contains 'nama' or 'nim'
      if (i === 0 && (line.toLowerCase().includes("nama") || line.toLowerCase().includes("nim"))) {
        continue;
      }

      // Support comma, semicolon, or tab separator
      let cols: string[] = [];
      if (line.includes("\t")) {
        cols = line.split("\t");
      } else if (line.includes(";")) {
        cols = line.split(";");
      } else {
        cols = line.split(",");
      }

      const cleanCols = cols.map((c) => c.replace(/^["']|["']$/g, "").trim());
      if (cleanCols.length < 2) continue;

      const userRow = validateUser({
        displayName: cleanCols[0] || "",
        nim: cleanCols[1] || "",
        email: cleanCols[2] || (cleanCols[1] ? `${cleanCols[1].toLowerCase()}@mahasiswa.upr.ac.id` : ""),
        whatsapp: cleanCols[3] || "",
        tanggalLahir: cleanCols[4] || "",
      });
      parsedList.push(userRow);
    }

    setUsersToImport(parsedList);
    setActiveTab("preview");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        parseCSVText(content);
      }
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const headers = "Nama Lengkap,NIM,Email,Nomor WhatsApp,Tanggal Lahir (YYYY-MM-DD)\n";
    const sample1 = "Budi Pratama,223020503001,budi22@mahasiswa.upr.ac.id,081234567890,2004-05-12\n";
    const sample2 = "Siti Aisyah,233010502015,siti23@mahasiswa.upr.ac.id,089876543210,2005-08-20\n";
    const blob = new Blob([headers + sample1 + sample2], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_import_mahasiswa_psak.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Manual Table Handlers
  const addEmptyRow = () => {
    const newRow = validateUser({
      id: Math.random().toString(36).substring(2, 9),
      displayName: "",
      nim: "",
      email: "",
      whatsapp: "",
      tanggalLahir: "",
    });
    setUsersToImport((prev) => [...prev, newRow]);
  };

  const updateRow = (index: number, field: string, val: string) => {
    setUsersToImport((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: val };
      copy[index] = validateUser(target);
      return copy;
    });
  };

  const removeRow = (index: number) => {
    setUsersToImport((prev) => prev.filter((_, i) => i !== index));
  };

  // 3. Batch Execution Runner
  const runBatchImport = async () => {
    const validUsers = usersToImport.filter((u) => u.valid);
    if (validUsers.length === 0) return;

    setActiveTab("progress");
    setIsProcessing(true);
    setCurrentIndex(0);
    setResults([]);

    const tempResults: { name: string; email: string; success: boolean; msg: string }[] = [];

    for (let i = 0; i < validUsers.length; i++) {
      setCurrentIndex(i + 1);
      const target = validUsers[i];

      try {
        const res = await fetch("/api/admin/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: target.displayName,
            nim: target.nim,
            email: target.email,
            whatsapp: target.whatsapp,
            tanggalLahir: target.tanggalLahir,
            prodi: target.prodi,
            angkatan: target.angkatan,
            jalur: target.jalur,
            sendWelcomeEmail,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          tempResults.push({
            name: target.displayName,
            email: target.email,
            success: true,
            msg: data.message || "Akun berhasil dibuat",
          });
        } else {
          tempResults.push({
            name: target.displayName,
            email: target.email,
            success: false,
            msg: data.error || "Gagal membuat akun",
          });
        }
      } catch (err: any) {
        tempResults.push({
          name: target.displayName,
          email: target.email,
          success: false,
          msg: err.message || "Network error",
        });
      }

      setResults([...tempResults]);
    }

    setIsProcessing(false);
    onSuccess();
  };

  const validCount = usersToImport.filter((u) => u.valid).length;
  const invalidCount = usersToImport.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Pendaftaran Massal Pengguna (Bulk Import)
            </h2>
            <p className="text-xs text-slate-500">
              Impor banyak akun mahasiswa sekaligus menggunakan file CSV, input teks, atau spreadsheet manual.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/30">
          <button
            disabled={isProcessing}
            onClick={() => setActiveTab("csv")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "csv"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            1. Upload CSV / Teks
          </button>
          <button
            disabled={isProcessing}
            onClick={() => {
              if (usersToImport.length === 0) addEmptyRow();
              setActiveTab("table");
            }}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "table"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            2. Input Tabel Manual
          </button>
          <button
            disabled={isProcessing || usersToImport.length === 0}
            onClick={() => setActiveTab("preview")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "preview"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            3. Validasi & Pratinjau ({usersToImport.length})
          </button>
          {results.length > 0 && (
            <button
              onClick={() => setActiveTab("progress")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "progress"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              4. Laporan Eksekusi
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: CSV / TEXT */}
          {activeTab === "csv" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drag & Drop File */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-950/40">
                  <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Pilih Berkas CSV / Spreadsheet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 mb-4">
                    Mendukung file .csv atau .txt dengan pembatas koma atau titik koma
                  </p>
                  <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium shadow-xs">
                    Browse File
                    <input
                      type="file"
                      accept=".csv, .txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Template & Guidelines */}
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/50 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-indigo-600" />
                      Format Kolom File CSV
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Susunan kolom harus berurutan:
                      <br />
                      <span className="font-mono text-indigo-700 dark:text-indigo-300 font-medium">
                        Nama Lengkap, NIM, Email, No. WA, Tanggal Lahir (YYYY-MM-DD)
                      </span>
                      <br />
                      Kata sandi default akun baru otomatis disetel ke <strong>NIM</strong>. Mahasiswa dapat mengubahnya kemudian.
                    </p>
                  </div>

                  <button
                    onClick={downloadCSVTemplate}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 text-xs font-semibold flex items-center justify-center gap-2 self-start"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Format CSV Contoh
                  </button>
                </div>
              </div>

              {/* Paste Raw Text Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Atau Tempel (Paste) Baris Data Teks Secara Langsung:
                </label>
                <textarea
                  rows={5}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Budi Pratama, 223020503001, budi22@mahasiswa.upr.ac.id, 081234567890, 2004-05-12\nSiti Aisyah, 233010502015, siti23@mahasiswa.upr.ac.id, 089876543210, 2005-08-20`}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => parseCSVText(pastedText)}
                    disabled={!pastedText.trim()}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Proses Teks & Validasi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL TABLE */}
          {activeTab === "table" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Ketik atau ubah data mahasiswa secara langsung. Jurusan & Angkatan terdeteksi otomatis dari NIM.
                </p>
                <button
                  onClick={addEmptyRow}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Baris
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-72">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Nama Lengkap</th>
                      <th className="p-2.5">NIM</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">No. WA</th>
                      <th className="p-2.5">Tgl Lahir</th>
                      <th className="p-2.5">Prodi Otomatis</th>
                      <th className="p-2.5 text-center w-10">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {usersToImport.map((row, idx) => (
                      <tr key={row.id}>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.displayName}
                            onChange={(e) => updateRow(idx, "displayName", e.target.value)}
                            placeholder="Nama Lengkap"
                            className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.nim}
                            onChange={(e) => updateRow(idx, "nim", e.target.value)}
                            placeholder="NIM"
                            className="w-28 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="email"
                            value={row.email}
                            onChange={(e) => updateRow(idx, "email", e.target.value)}
                            placeholder="Email"
                            className="w-40 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.whatsapp}
                            onChange={(e) => updateRow(idx, "whatsapp", e.target.value)}
                            placeholder="08..."
                            className="w-28 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="date"
                            value={row.tanggalLahir}
                            onChange={(e) => updateRow(idx, "tanggalLahir", e.target.value)}
                            className="w-28 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px]"
                          />
                        </td>
                        <td className="p-2 text-[11px] text-slate-500 whitespace-nowrap">
                          {row.prodi} ({row.angkatan})
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            onClick={() => removeRow(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab("preview")}
                  disabled={usersToImport.length === 0}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Lanjut ke Validasi ({usersToImport.length} baris)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VALIDATION PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {validCount} Data Valid (Siap Didaftarkan)
                </span>
                {invalidCount > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    {invalidCount} Data Tidak Lengkap / Error
                  </span>
                )}
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-72">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Nama</th>
                      <th className="p-2.5">NIM & Prodi</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {usersToImport.map((row) => (
                      <tr
                        key={row.id}
                        className={
                          row.valid
                            ? ""
                            : "bg-rose-50/50 dark:bg-rose-950/20"
                        }
                      >
                        <td className="p-2.5">
                          {row.valid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5" /> Invalid
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-medium">{row.displayName || "-"}</td>
                        <td className="p-2.5">
                          <span className="font-mono">{row.nim}</span>
                          <span className="text-slate-400 block text-[10px]">
                            {row.prodi} ({row.angkatan})
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{row.email}</td>
                        <td className="p-2.5 text-slate-500">
                          {row.valid ? (
                            <span className="text-[11px] text-emerald-600">Password default = NIM</span>
                          ) : (
                            <span className="text-[11px] text-rose-600 font-semibold">
                              {row.errors.join(", ")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Welcome Email Option */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      Kirim Email Sambutan (Welcome Email) Otomatis
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Mengirimkan instruksi login dan kata sandi sementara melalui Webhook Google Apps Script.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendWelcomeEmail}
                  onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveTab("table")}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 text-xs font-semibold"
                >
                  Kembali Edit Data
                </button>
                <button
                  onClick={runBatchImport}
                  disabled={validCount === 0 || isProcessing}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Jalankan Pendaftaran ({validCount} Akun)
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PROGRESS & REPORT */}
          {activeTab === "progress" && (
            <div className="space-y-5">
              <div className="text-center py-4">
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Mendaftarkan Akun Mahasiswa ({currentIndex} / {usersToImport.filter((u) => u.valid).length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mohon jangan menutup jendela browser ini selagi proses berjalan...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Proses Pendaftaran Selesai!
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total Berhasil:{" "}
                      <strong className="text-emerald-600 font-bold">
                        {results.filter((r) => r.success).length}
                      </strong>{" "}
                      | Gagal:{" "}
                      <strong className="text-rose-600 font-bold">
                        {results.filter((r) => !r.success).length}
                      </strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      usersToImport.filter((u) => u.valid).length > 0
                        ? (currentIndex / usersToImport.filter((u) => u.valid).length) * 100
                        : 100
                    }%`,
                  }}
                />
              </div>

              {/* Execution Results Log List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto max-h-60 p-3 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                      r.success
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        : "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {r.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-bold">{r.name}</span>{" "}
                        <span className="font-mono text-[11px] text-slate-500">({r.email})</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium">{r.msg}</span>
                  </div>
                ))}
              </div>

              {!isProcessing && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold"
                  >
                    Tutup Modal & Segarkan Data
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
