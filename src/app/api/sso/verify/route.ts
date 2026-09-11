import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const clientId = searchParams.get("client_id") || searchParams.get("clientId");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (!code || !clientId) {
    return NextResponse.json(
      { success: false, error: "Parameter 'code' dan 'client_id' wajib diisi." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/akun-psak/databases/(default)/documents/sso_tokens/${code}`;
    const res = await fetch(firestoreUrl);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Token SSO tidak valid atau telah kedaluwarsa." },
        { status: 404, headers: corsHeaders }
      );
    }

    const docData = await res.json();
    const fields = docData.fields || {};

    const tokenClientId = fields.appId?.stringValue;
    const expiresAtStr = fields.expiresAt?.timestampValue || fields.expiresAt?.stringValue;

    if (tokenClientId !== clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID tidak sesuai dengan token yang diberikan." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (expiresAtStr && new Date(expiresAtStr) < new Date()) {
      // Hapus token kedaluwarsa
      await fetch(firestoreUrl, { method: "DELETE" });
      return NextResponse.json(
        { success: false, error: "Token SSO telah kedaluwarsa." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Hapus token agar satu kali pakai (One-Time Use)
    await fetch(firestoreUrl, { method: "DELETE" });

    // Bentuk data profil pengguna bersih
    const userProfile = {
      userId: fields.userId?.stringValue || "",
      email: fields.email?.stringValue || "",
      displayName: fields.displayName?.stringValue || "",
      photoURL: fields.photoURL?.stringValue || "",
      role: fields.role?.stringValue || "",
      nim: fields.nim?.stringValue || "",
      gender: fields.gender?.stringValue || "",
      prodi: fields.prodi?.stringValue || "",
      angkatan: fields.angkatan?.integerValue
        ? parseInt(fields.angkatan.integerValue)
        : fields.angkatan?.stringValue
        ? parseInt(fields.angkatan.stringValue)
        : "",
      jalurMasuk: fields.jalurMasuk?.stringValue || "",
      whatsapp: fields.whatsapp?.stringValue || "",
    };

    return NextResponse.json(
      {
        success: true,
        user: userProfile,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memverifikasi token SSO: " + err.message },
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
