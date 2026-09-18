import { NextRequest, NextResponse } from "next/server";
import { parseNim } from "@/lib/nim-parser";

export async function POST(request: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const authHeader = request.headers.get("authorization") || "";
    const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    const queryToken = request.nextUrl.searchParams.get("token") || "";

    const payload = await request.json();
    const providedToken = bearerToken || queryToken || payload.token;

    // 1. Verifikasi External Token dari Firestore config
    const sysDocUrl = "https://firestore.googleapis.com/v1/projects/akun-psak/databases/(default)/documents/config/system";
    const sysRes = await fetch(sysDocUrl);
    let expectedToken = "PSAK_EXTERNAL_SECRET_2024";

    if (sysRes.ok) {
      const sysData = await sysRes.json();
      const cfgToken = sysData.fields?.externalToken?.stringValue;
      if (cfgToken) expectedToken = cfgToken;
    }

    if (!providedToken || providedToken !== expectedToken) {
      return NextResponse.json(
        { success: false, error: "Akses Ditolak: Token eksternal tidak valid atau belum dikonfigurasi." },
        { status: 401, headers: corsHeaders }
      );
    }

    const {
      email,
      displayName,
      nama,
      nim,
      whatsapp,
      noHp,
      tanggalLahir,
      prodi,
      angkatan,
      jalur,
      sendWelcomeEmail = true,
    } = payload;

    const finalName = (displayName || nama || "").trim();
    const finalNim = String(nim || "").trim();
    const finalEmail = (email || (finalNim ? `${finalNim.toLowerCase()}@mahasiswa.upr.ac.id` : "")).trim().toLowerCase();
    const finalWa = (whatsapp || noHp || "-").trim();

    if (!finalName || !finalNim || !finalEmail) {
      return NextResponse.json(
        { success: false, error: "Parameter tidak lengkap: nama, nim, dan email wajib disediakan." },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Auto-parse NIM jika prodi atau angkatan belum ada
    const nimInfo = parseNim(finalNim);
    const finalProdi = prodi || nimInfo?.prodiName || "Teknik Informatika";
    const finalAngkatan = angkatan || nimInfo?.angkatan || new Date().getFullYear();
    const finalJalur = jalur || nimInfo?.jalurMasuk || "SNBT";

    // 3. Daftarkan ke Firebase Auth via REST
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDhLw_vgVifS3tPfB9jAIjFyiTur1dRHZo";
    const password = finalNim;

    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const authRes = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: finalEmail,
        password: password,
        displayName: finalName,
        returnSecureToken: true,
      }),
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      const errMsg = authData.error?.message || "Gagal membuat akun.";
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: 400, headers: corsHeaders }
      );
    }

    const uid = authData.localId;

    // 4. Buat dokumen profil di Firestore
    const defaultPhoto = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(finalName)}`;
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/akun-psak/databases/(default)/documents/users/${uid}`;

    const firestorePayload = {
      fields: {
        uid: { stringValue: uid },
        email: { stringValue: finalEmail },
        displayName: { stringValue: finalName },
        photoURL: { stringValue: defaultPhoto },
        role: { stringValue: "anggota" },
        status: { stringValue: "aktif" },
        nim: { stringValue: finalNim },
        gender: { stringValue: payload.gender || "Laki-laki" },
        prodi: { stringValue: finalProdi },
        angkatan: { integerValue: String(finalAngkatan) },
        jalurMasuk: { stringValue: finalJalur },
        whatsapp: { stringValue: finalWa },
        tanggalLahir: { stringValue: tanggalLahir || "" },
        statusKeanggotaan: { stringValue: "Mahasiswa Aktif" },
        hidePhotoInDirectory: { booleanValue: false },
        hideProfileInDirectory: { booleanValue: false },
        source: { stringValue: "google_forms_webhook" },
        createdAt: { stringValue: new Date().toISOString() },
        updatedAt: { stringValue: new Date().toISOString() },
      },
    };

    await fetch(firestoreUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestorePayload),
    });

    // 5. Trigger Welcome Email if configured
    if (sendWelcomeEmail && sysRes.ok) {
      try {
        const sysData = await sysRes.json();
        const welcomeUrl = sysData.fields?.appsScriptWelcomeEmailUrl?.stringValue;
        if (welcomeUrl) {
          fetch(welcomeUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              email: finalEmail,
              displayName: finalName,
              nim: finalNim,
              prodi: finalProdi,
              password: password,
            }),
          }).catch((e) => console.warn("Background welcome email error:", e));
        }
      } catch (emailErr) {
        console.warn("Welcome email dispatch failed:", emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil dibuat secara otomatis via webhook eksternal.",
        data: {
          uid,
          displayName: finalName,
          nim: finalNim,
          email: finalEmail,
          prodi: finalProdi,
          angkatan: finalAngkatan,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("External webhook create-user error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
