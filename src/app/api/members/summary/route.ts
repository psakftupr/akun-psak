import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=60",
  };

  try {
    const summaryDocUrl = "https://firestore.googleapis.com/v1/projects/akun-psak/databases/(default)/documents/config/public_summary";
    const res = await fetch(summaryDocUrl);

    let totalMembers = 0;
    let totalActive = 0;
    let byProdi = { "Arsitektur": 0, "Teknik Sipil": 0, "Teknik Informatika": 0, "Teknik Pertambangan": 0 };
    let byAngkatan = {};
    let byGender = { "Laki-laki": 0, "Perempuan": 0 };
    let lastUpdated = new Date().toISOString();

    if (res.ok) {
      const docData = await res.json();
      const f = docData.fields || {};
      totalMembers = f.totalMembers?.integerValue ? parseInt(f.totalMembers.integerValue) : 0;
      totalActive = f.totalActive?.integerValue ? parseInt(f.totalActive.integerValue) : 0;
      if (f.byProdiJson?.stringValue) {
        try { byProdi = JSON.parse(f.byProdiJson.stringValue); } catch (e) {}
      }
      if (f.byAngkatanJson?.stringValue) {
        try { byAngkatan = JSON.parse(f.byAngkatanJson.stringValue); } catch (e) {}
      }
      if (f.byGenderJson?.stringValue) {
        try { byGender = JSON.parse(f.byGenderJson.stringValue); } catch (e) {}
      }
      if (f.updatedAt?.stringValue) lastUpdated = f.updatedAt.stringValue;
    }

    const payload = {
      success: true,
      organization: "PSAK FT UPR",
      privacyNotice: "Data bersifat agregat publik. Seluruh data identitas pribadi (PII) tidak disertakan demi menjaga privasi pengguna.",
      summary: {
        totalMembers,
        totalActive,
        byProdi,
        byAngkatan,
        byGender,
        updatedAt: lastUpdated,
      },
    };

    return NextResponse.json(payload, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil ringkasan anggota: " + err.message },
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
