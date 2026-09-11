export const ORG_NAME = "PSAK FT UPR";
export const ORG_FULL_NAME = "Persekutuan Sivitas Akademika Kristen Fakultas Teknik Universitas Palangka Raya";
export const APP_DOMAIN = "akun.psak.my.id";

export const PRODI_OPTIONS = [
  "Arsitektur",
  "Teknik Sipil",
  "Teknik Informatika",
  "Teknik Pertambangan",
] as const;

export const JALUR_MASUK_OPTIONS = [
  "SNBP",
  "SNBT",
  "SNMPTN",
  "SBMPTN",
  "MANDIRI",
] as const;

export const GENDER_OPTIONS = [
  "Laki-laki",
  "Perempuan",
] as const;

export const STATUS_KEANGGOTAAN_OPTIONS = [
  "Mahasiswa Aktif",
  "Alumni",
  "Pengurus",
] as const;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "anggota" | "admin" | "superadmin";
  status: "aktif" | "suspen";
  nim: string;
  gender: "Laki-laki" | "Perempuan";
  prodi: "Arsitektur" | "Teknik Sipil" | "Teknik Informatika" | "Teknik Pertambangan";
  angkatan: number;
  jalurMasuk: "SNBP" | "SNBT" | "SNMPTN" | "SBMPTN" | "MANDIRI";
  whatsapp: string;
  statusKeanggotaan?: "Mahasiswa Aktif" | "Alumni" | "Pengurus";
  denominasiGereja?: string;
  tanggalLahir?: string;
  instagram?: string;
  linkedin?: string;
  minatBakat?: string;
  hidePhotoInDirectory?: boolean;
  hideProfileInDirectory?: boolean;
  customToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SSOApplication {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  redirectUris: string[];
  homepageUrl?: string;
  logoUrl?: string;
  active: boolean;
  createdAt?: string;
}
