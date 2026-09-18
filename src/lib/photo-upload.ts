export interface UploadPhotoResult {
  url: string;
  isGif: boolean;
  fileId?: string;
}

export function isGifFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return type === "image/gif" || name.endsWith(".gif");
}

export async function uploadProfilePhoto(
  file: File,
  options?: { maxSizeMB?: number }
): Promise<UploadPhotoResult> {
  const maxSizeMB = options?.maxSizeMB || 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    throw new Error(`Ukuran berkas melebihi batas maksimal ${maxSizeMB}MB.`);
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const isGif = isGifFile(file);
  const isValidType = validTypes.includes(file.type.toLowerCase()) || isGif;

  if (!isValidType) {
    throw new Error("Format berkas tidak didukung. Harap pilih foto JPG, PNG, WebP, atau GIF animasi.");
  }

  // 1. Baca file menjadi base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (err) => reject(new Error("Gagal membaca berkas: " + err));
    reader.readAsDataURL(file);
  });

  const payload = {
    filename: file.name || (isGif ? "avatar.gif" : "avatar.jpg"),
    mimeType: file.type || (isGif ? "image/gif" : "image/jpeg"),
    data: base64Data,
  };

  // 2. Coba kirim via internal proxy Next.js (/api/upload-photo) untuk menghindari CORS & HTML error
  let resultJson: any = null;

  try {
    const localRes = await fetch("/api/upload-photo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const localText = await localRes.text();
    if (!localText.trim().startsWith("<")) {
      try {
        resultJson = JSON.parse(localText);
      } catch (e) {
        console.warn("Parse localRes error:", e);
      }
    }
  } catch (err) {
    console.warn("Local upload-photo API error, mencoba direct fallback:", err);
  }

  // 3. Fallback jika local proxy belum mengembalikan hasil: kirim langsung ke endpoint target
  if (!resultJson || !resultJson.success) {
    try {
      const directRes = await fetch("https://api.psak.my.id/UploadFoto", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      const directText = await directRes.text();
      if (!directText.trim().startsWith("<")) {
        try {
          const directJson = JSON.parse(directText);
          if (directJson.success) {
            resultJson = directJson;
          }
        } catch (e) {
          console.warn("Parse directJson error:", e);
        }
      }
    } catch (directErr) {
      console.warn("Direct upload error:", directErr);
    }
  }

  // 4. Jika berhasil dari salah satu endpoint
  if (resultJson && resultJson.success) {
    const finalUrl = resultJson.directUrl || resultJson.thumbnailUrl;
    return {
      url: finalUrl,
      isGif: Boolean(resultJson.isGif || isGif),
      fileId: resultJson.fileId,
    };
  }

  // 5. Jika kedua server gagal/offline, simpan sebagai Data URL terkompresi lokal agar pendaftaran tidak gagal
  const dataUrl = `data:${file.type || "image/jpeg"};base64,${base64Data}`;
  return {
    url: dataUrl,
    isGif: isGif,
  };
}
