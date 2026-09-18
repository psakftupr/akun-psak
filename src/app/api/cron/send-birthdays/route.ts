import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Current date in Asia/Jakarta (UTC+7)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(now);
    const todayDay = parts.find((p) => p.type === "day")?.value || "";
    const todayMonth = parts.find((p) => p.type === "month")?.value || "";

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDhLw_vgVifS3tPfB9jAIjFyiTur1dRHZo";

    // 1. Ambil config system untuk webhook email ultah
    const sysDocUrl = `https://firestore.googleapis.com/v1/projects/akun-psak/databases/(default)/documents/config/system?key=${apiKey}`;
    const sysRes = await fetch(sysDocUrl);
    let birthdayWebhookUrl = "";
    if (sysRes.ok) {
      const sysData = await sysRes.json();
      birthdayWebhookUrl = sysData.fields?.appsScriptBirthdayEmailUrl?.stringValue || "";
    }

    // 2. Ambil seluruh users dari Firestore REST
    const usersUrl = `https://firestore.googleapis.com/v1/projects/akun-psak/databases/(default)/documents/users?key=${apiKey}&pageSize=300`;
    const usersRes = await fetch(usersUrl);
    if (!usersRes.ok) {
      const errText = await usersRes.text();
      return NextResponse.json(
        { 
          success: false, 
          error: "Akses Firestore memerlukan otentikasi token administrator.",
          details: errText 
        },
        { status: 200 }
      );
    }

    const usersData = await usersRes.json();
    const documents = usersData.documents || [];

    const matchedUsers: any[] = [];

    for (const doc of documents) {
      const fields = doc.fields || {};
      const tanggalLahir = fields.tanggalLahir?.stringValue || "";
      if (!tanggalLahir) continue;

      let bDay = "";
      let bMonth = "";

      // Handle YYYY-MM-DD
      if (tanggalLahir.includes("-")) {
        const segs = tanggalLahir.split("-");
        if (segs.length === 3) {
          bMonth = segs[1].padStart(2, "0");
          bDay = segs[2].padStart(2, "0");
        }
      } else if (tanggalLahir.includes("/")) {
        const segs = tanggalLahir.split("/");
        if (segs.length === 3) {
          bDay = segs[0].padStart(2, "0");
          bMonth = segs[1].padStart(2, "0");
        }
      }

      if (bDay === todayDay && bMonth === todayMonth) {
        matchedUsers.push({
          uid: fields.uid?.stringValue,
          displayName: fields.displayName?.stringValue,
          email: fields.email?.stringValue,
          nim: fields.nim?.stringValue,
          prodi: fields.prodi?.stringValue,
          tanggalLahir,
        });
      }
    }

    // 3. Kirim Webhook Email ke Google Apps Script jika ada yang ultah
    let sentCount = 0;
    if (birthdayWebhookUrl && matchedUsers.length > 0) {
      for (const u of matchedUsers) {
        if (!u.email) continue;
        try {
          await fetch(birthdayWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              action: "send_birthday_greeting",
              email: u.email,
              displayName: u.displayName,
              nim: u.nim,
              prodi: u.prodi,
              tanggalLahir: u.tanggalLahir,
            }),
          });
          sentCount++;
        } catch (postErr) {
          console.warn("Failed sending birthday email to:", u.email, postErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pemeriksaan ulang tahun (${todayDay}-${todayMonth}) selesai.`,
      matchedCount: matchedUsers.length,
      sentCount,
      birthdayUsers: matchedUsers,
    });
  } catch (err: any) {
    console.error("Cron send-birthdays error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
