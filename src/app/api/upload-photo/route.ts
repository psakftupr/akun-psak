import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, mimeType, data } = body;

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Parameter data berkas tidak lengkap." },
        { status: 400 }
      );
    }

    const payload = {
      filename: filename || "avatar.jpg",
      mimeType: mimeType || "image/jpeg",
      data: data,
    };

    // Target endpoint Google Apps Script / Proxy
    const targetUrl = "https://api.psak.my.id/UploadFoto";

    const upstreamResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await upstreamResponse.text();

    // Periksa jika respons berupa HTML (misal 522/524 Cloudflare / Google Error)
    if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
      console.error("Upstream returned HTML instead of JSON:", responseText.slice(0, 300));
      return NextResponse.json(
        { 
          success: false, 
          error: "Layanan Google Drive mengembalikan respons tidak valid. Silakan coba beberapa saat lagi." 
        },
        { status: 502 }
      );
    }

    try {
      const result = JSON.parse(responseText);
      return NextResponse.json(result, { status: upstreamResponse.ok ? 200 : 500 });
    } catch (parseErr) {
      console.error("JSON parse error from upstream:", parseErr, responseText.slice(0, 200));
      return NextResponse.json(
        { success: false, error: "Format respons dari server tidak valid." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Terjadi kesalahan internal pada server upload." },
      { status: 500 }
    );
  }
}
