import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prodiFilter = searchParams.get("prodi");
  const angkatanFilter = searchParams.get("angkatan");
  const searchQuery = searchParams.get("q") || searchParams.get("search");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=180, stale-while-revalidate=300",
  };

  try {
    const firestoreUrl = "https://firestore.googleapis.com/v1/projects/akun-psak/databases/(default)/documents/users?pageSize=200";
    const res = await fetch(firestoreUrl);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Gagal mengambil data direktori anggota." },
        { status: 500, headers: corsHeaders }
      );
    }

    const docData = await res.json();
    const documents = docData.documents || [];
    const members: any[] = [];

    documents.forEach((doc: any) => {
      const f = doc.fields || {};
      const userStatus = f.status?.stringValue || "aktif";
      if (userStatus !== "aktif") return;

      const hidePhotoInDirectory = f.hidePhotoInDirectory?.booleanValue || false;
      const hideProfileInDirectory = f.hideProfileInDirectory?.booleanValue || false;
      const maskNameInDirectory = f.maskNameInDirectory?.booleanValue || false;

      if (hideProfileInDirectory) return;

      let displayName = f.displayName?.stringValue || "Anggota PSAK";
      if (maskNameInDirectory && displayName) {
        const parts = displayName.trim().split(/\s+/);
        if (parts.length > 1) {
          displayName = `${parts[0]} ${parts.slice(1).map((p: string) => `${p[0].toUpperCase()}.`).join(" ")}`;
        } else if (parts[0].length > 2) {
          displayName = `${parts[0].slice(0, 2)}***`;
        }
      }
      const photoURL = hidePhotoInDirectory
        ? "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
        : f.photoURL?.stringValue || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
      const prodi = f.prodi?.stringValue || "-";
      const angkatan = f.angkatan?.integerValue
        ? parseInt(f.angkatan.integerValue)
        : f.angkatan?.stringValue || "-";
      const gender = f.gender?.stringValue || "-";
      const statusKeanggotaan = f.statusKeanggotaan?.stringValue || "Mahasiswa Aktif";
      const role = f.role?.stringValue || "anggota";
      const instagram = f.instagram?.stringValue || "";
      const linkedin = f.linkedin?.stringValue || "";
      const minatBakat = f.minatBakat?.stringValue || "";

      // Apply filters
      if (prodiFilter && prodi.toLowerCase() !== prodiFilter.toLowerCase()) return;
      if (angkatanFilter && String(angkatan) !== String(angkatanFilter)) return;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = displayName.toLowerCase().includes(q);
        const matchProdi = prodi.toLowerCase().includes(q);
        if (!matchName && !matchProdi) return;
      }

      // STRICTLY NO PII: No Email, No WhatsApp, No NIM, No Address
      members.push({
        displayName,
        photoURL,
        prodi,
        angkatan,
        gender,
        statusKeanggotaan,
        role,
        instagram,
        linkedin,
        minatBakat,
      });
    });

    return NextResponse.json(
      {
        success: true,
        total: members.length,
        privacyNotice: "Seluruh data pribadi sensitif (Email, WhatsApp, NIM, Alamat) disembunyikan demi keamanan privasi anggota.",
        members,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil direktori: " + err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
