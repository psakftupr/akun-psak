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
  "Pengurus Inti",
  "Pengurus Koordinator",
  "Pengurus Harian",
  "Pengurus Muda",
  "Demisioner",
] as const;

export const ROLE_OPTIONS = [
  { value: "anggota", label: "Anggota" },
  { value: "pengurus_muda", label: "Pengurus Muda (PM)" },
  { value: "pengurus_harian", label: "Pengurus Harian (PH)" },
  { value: "admin", label: "Pengurus Koordinator (PK)" },
  { value: "superadmin", label: "Pengurus Inti (PI)" },
  { value: "demisioner", label: "Demisioner" },
] as const;

export const KOORDINATOR_MANAGEABLE_ROLES = [
  { value: "anggota", label: "Anggota" },
  { value: "pengurus_muda", label: "Pengurus Muda (PM)" },
  { value: "pengurus_harian", label: "Pengurus Harian (PH)" },
] as const;

export function formatRoleName(role?: string): string {
  switch (role) {
    case "superadmin":
    case "pengurus_inti":
      return "Pengurus Inti (PI)";
    case "admin":
    case "koordinator":
    case "pengurus_koordinator":
      return "Pengurus Koordinator (PK)";
    case "pengurus_harian":
    case "pengurus":
      return "Pengurus Harian (PH)";
    case "pengurus_muda":
      return "Pengurus Muda (PM)";
    case "demisioner":
      return "Demisioner";
    case "anggota":
    default:
      return "Anggota";
  }
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "anggota" | "pengurus_muda" | "pengurus_harian" | "pengurus_koordinator" | "koordinator" | "admin" | "pengurus_inti" | "superadmin" | "demisioner" | "pengurus";
  status: "aktif" | "suspen";
  nim: string;
  gender: "Laki-laki" | "Perempuan";
  prodi: "Arsitektur" | "Teknik Sipil" | "Teknik Informatika" | "Teknik Pertambangan";
  angkatan: number;
  jalurMasuk: "SNBP" | "SNBT" | "SNMPTN" | "SBMPTN" | "MANDIRI";
  whatsapp: string;
  statusKeanggotaan?: "Mahasiswa Aktif" | "Alumni" | "Pengurus Inti" | "Pengurus Koordinator" | "Pengurus Harian" | "Pengurus Muda" | "Demisioner" | "Pengurus";
  denominasiGereja?: string;
  tanggalLahir?: string;
  instagram?: string;
  linkedin?: string;
  minatBakat?: string;
  hidePhotoInDirectory?: boolean;
  hideProfileInDirectory?: boolean;
  maskNameInDirectory?: boolean;
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
