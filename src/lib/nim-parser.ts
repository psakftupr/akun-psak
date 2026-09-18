/**
 * Utilitas Parser & Decoder NIM Universitas Palangka Raya (UPR)
 * Sesuai Dokumen Spesifikasi doc-NIM-v20.md & SK Rektor UPR
 */

export interface NIMParseResult {
  valid: boolean;
  reason?: string;
  cleanNim: string;
  tahunMasuk?: number;
  jenjang?: string;
  jalurMasuk?: "SNBP" | "SNBT" | "MANDIRI";
  kodeFakultas?: string;
  kodeProdi?: string;
  prodi?: "Arsitektur" | "Teknik Sipil" | "Teknik Informatika" | "Teknik Pertambangan";
  nomorUrut?: string;
  formatSistem?: "CURRENT_13_DIGIT" | "LEGACY_12_DIGIT";
  isFTUPR?: boolean;
}

const FT_PRODI_MAP: Record<string, "Arsitektur" | "Teknik Sipil" | "Teknik Informatika" | "Teknik Pertambangan"> = {
  "01": "Teknik Sipil",
  "02": "Arsitektur",
  "03": "Teknik Informatika",
  "04": "Teknik Pertambangan",
};

const JALUR_MAP: Record<string, "SNBP" | "SNBT" | "MANDIRI"> = {
  "01": "SNBP", // SNMPTN / SNBP
  "02": "SNBT", // SBMPTN / SNBT
  "03": "MANDIRI", // SMMPTN-Barat / Mandiri
  "04": "SNBP", // Afirmasi Dikti / 3T
  "05": "MANDIRI", // RPL Tipe A
  "10": "MANDIRI", // Profesi
  "11": "MANDIRI", // Tugas Belajar
  "12": "MANDIRI", // Kerjasama
  "13": "MANDIRI", // Pindah Prodi Internal
  "14": "MANDIRI", // Pindahan PTN Lain
  "15": "MANDIRI", // WNA
};

export function parseNIMUPR(nimStr: string): NIMParseResult {
  if (!nimStr) {
    return { valid: false, reason: "NIM tidak boleh kosong", cleanNim: "" };
  }

  const cleanDigits = nimStr.replace(/\D/g, "");
  const is12Digit = cleanDigits.length === 12;
  const is13Digit = cleanDigits.length === 13;

  if (!is12Digit && !is13Digit) {
    return {
      valid: false,
      reason: "Panjang NIM harus 12 digit (angkatan < 2024) atau 13 digit (angkatan 2024+)",
      cleanNim: cleanDigits,
    };
  }

  const yy = cleanDigits.substring(0, 2);
  const levelDigit = cleanDigits.substring(2, 3);
  const pathDigit = cleanDigits.substring(3, 5);
  const facDigit = cleanDigits.substring(5, 7);
  const prodiDigit = cleanDigits.substring(7, 9);
  const seqNum = cleanDigits.substring(9);

  const yyNum = parseInt(yy, 10);
  const yearNum = !isNaN(yyNum) && yyNum >= 0 && yyNum <= 99 ? 2000 + yyNum : undefined;

  const jalur = JALUR_MAP[pathDigit] || "SNBT";
  const isFT = facDigit === "05";
  const prodi = isFT ? FT_PRODI_MAP[prodiDigit] : undefined;

  const isValidFT = Boolean(yearNum && yearNum >= 2000 && yearNum <= 2099 && isFT && prodi);

  return {
    valid: isValidFT,
    reason: isValidFT
      ? undefined
      : !isFT
      ? "Kode Fakultas bukan Fakultas Teknik (kode 05)"
      : !prodi
      ? "Kode Program Studi Teknik tidak dikenali"
      : "Format NIM tidak valid",
    cleanNim: cleanDigits,
    tahunMasuk: yearNum,
    jenjang: levelDigit === "3" ? "S1" : levelDigit === "4" ? "S2" : levelDigit === "5" ? "S3" : "S1",
    jalurMasuk: jalur,
    kodeFakultas: facDigit,
    kodeProdi: prodiDigit,
    prodi: prodi,
    nomorUrut: seqNum,
    formatSistem: is13Digit ? "CURRENT_13_DIGIT" : "LEGACY_12_DIGIT",
    isFTUPR: isFT,
  };
}

export function parseNim(nimStr: string) {
  const res = parseNIMUPR(nimStr);
  return {
    ...res,
    prodiName: res.prodi,
    angkatan: res.tahunMasuk,
  };
}

