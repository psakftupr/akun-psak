import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const payload = await request.json();
    const { 
      email, 
      displayName, 
      nim, 
      gender, 
      prodi, 
      angkatan, 
      jalurMasuk, 
      whatsapp, 
      photoURL, 
      sendEmail,
      sendWelcomeEmail,
      tanggalLahir,
      jalur
    } = payload;
    const shouldSendEmail = sendWelcomeEmail !== undefined ? sendWelcomeEmail : sendEmail;
    const finalJalur = jalur || jalurMasuk || "SNBT";

    if (!email || !displayName || !nim) {
      return NextResponse.json(
        { success: false, error: "Parameter tidak lengkap: email, displayName, dan nim wajib diisi." },
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDhLw_vgVifS3tPfB9jAIjFyiTur1dRHZo";
    const password = String(nim).trim(); // Default password adalah NIM mahasiswa

    // 1. Buat Akun Firebase Auth via Identity Toolkit REST API
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const authPayload: any = {
      email: email.trim(),
      password: password,
      displayName: displayName.trim(),
      returnSecureToken: true,
    };
    if (photoURL) authPayload.photoUrl = photoURL;

    const authRes = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authPayload),
    });

    const authData = await authRes.json();

    if (!authRes.ok) {
      const errCode = authData.error?.message || "Gagal membuat akun.";
      let friendlyError = errCode;
      if (errCode === "EMAIL_EXISTS") friendlyError = "EMAIL_EXISTS";
      else if (errCode === "WEAK_PASSWORD") friendlyError = "NIM terlalu pendek sebagai sandi (minimal 6 karakter).";
      else if (errCode === "INVALID_EMAIL") friendlyError = "Format email tidak valid.";

      return NextResponse.json(
        { success: false, error: friendlyError },
        { status: 400, headers: corsHeaders }
      );
    }

    const uid = authData.localId;

    // 2. Buat dokumen user profile di Firestore users/{uid}
    const defaultPhoto = photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/akun-psak/databases/(default)/documents/users/${uid}`;

    const firestorePayload = {
      fields: {
        uid: { stringValue: uid },
        email: { stringValue: email.trim() },
        displayName: { stringValue: displayName.trim() },
        photoURL: { stringValue: defaultPhoto },
        role: { stringValue: "anggota" },
        status: { stringValue: "aktif" },
        nim: { stringValue: String(nim).trim() },
        gender: { stringValue: gender || "Laki-laki" },
        prodi: { stringValue: prodi || "Teknik Informatika" },
        angkatan: { integerValue: String(angkatan || new Date().getFullYear()) },
        jalurMasuk: { stringValue: finalJalur },
        whatsapp: { stringValue: whatsapp || "-" },
        tanggalLahir: { stringValue: tanggalLahir || "" },
        statusKeanggotaan: { stringValue: "Mahasiswa Aktif" },
        hidePhotoInDirectory: { booleanValue: false },
        hideProfileInDirectory: { booleanValue: false },
        createdAt: { stringValue: new Date().toISOString() },
        updatedAt: { stringValue: new Date().toISOString() },
      }
    };

    const docRes = await fetch(firestoreUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestorePayload),
    });

    if (!docRes.ok) {
      console.warn("Gagal menyimpan dokumen user profile via REST:", await docRes.text());
    }

    // 3. Kirim Email Sambutan (Welcome Email) jika diminta
    if (shouldSendEmail) {
      try {
        const sysDocUrl = "https://firestore.googleapis.com/v1/projects/akun-psak/databases/(default)/documents/config/system";
        const sysRes = await fetch(sysDocUrl);
        if (sysRes.ok) {
          const sysData = await sysRes.json();
          const welcomeUrl = sysData.fields?.appsScriptWelcomeEmailUrl?.stringValue;
          if (welcomeUrl) {
            fetch(welcomeUrl, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                email: email.trim(),
                displayName: displayName.trim(),
                nim: String(nim).trim(),
                prodi: prodi || "Teknik",
                password: password,
              }),
            }).catch((e) => console.warn("Background welcome email error:", e));
          }
        }
      } catch (emailErr) {
        console.warn("Gagal memicu welcome email:", emailErr);
      }
    }

    return NextResponse.json(
      { success: true, uid: uid },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("API admin create-user error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500, headers: corsHeaders }
    );
  }
}
