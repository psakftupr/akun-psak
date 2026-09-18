"use client";

import React, { useState } from "react";
import { 
  X, 
  Code2, 
  ExternalLink, 
  Server, 
  Play, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Key 
} from "lucide-react";

interface SSOIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: {
    id: string;
    clientId: string;
    clientSecret?: string;
    name: string;
    redirectUri?: string;
    description?: string;
  } | null;
}

export default function SSOIntegrationModal({ isOpen, onClose, app }: SSOIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState<"sdk" | "redirect" | "backend" | "sandbox">("sdk");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sandbox state
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  if (!isOpen || !app) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://akun.psak.my.id";

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSandbox = async () => {
    setSandboxLoading(true);
    setSandboxResult(null);
    setSandboxError(null);

    try {
      // Ensure SDK is loaded or dynamically instantiate
      if (!(window as any).PsakSSO) {
        // Load SDK script dynamically
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "/sso-sdk.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const sso = new (window as any).PsakSSO({
        clientId: app.clientId,
        ssoOrigin: origin,
      });

      const res = await sso.loginPopup({
        verifyOnClient: true,
        clientSecret: app.clientSecret,
      });

      setSandboxResult(res);
    } catch (err: any) {
      console.error("Sandbox error:", err);
      setSandboxError(err.message || "Gagal menjalankan login popup SSO.");
    } finally {
      setSandboxLoading(false);
    }
  };

  const sdkCode = `<!-- 1. Pasang Script SDK PSAK SSO -->
<script src="${origin}/sso-sdk.js"></script>

<script>
  // 2. Inisialisasi Klien dengan Client ID Aplikasi
  const sso = new PsakSSO({
    clientId: "${app.clientId}",
    redirectUri: "${app.redirectUri || origin + '/sso-popup-callback'}"
  });

  // 3. Panggil Otentikasi Popup
  async function handlePsakLogin() {
    try {
      const auth = await sso.loginPopup();
      console.log("Otorisasi Berhasil! Kode:", auth.code);

      // Kirim kode ini ke backend aplikasi Anda untuk verifikasi
      const response = await fetch('/api/login-via-psak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: auth.code })
      });
      const data = await response.json();
      console.log("Pengguna terotentikasi:", data.user);
    } catch (err) {
      console.error("SSO dibatalkan atau gagal:", err);
    }
  }
</script>

<button onclick="handlePsakLogin()">
  Masuk dengan Akun PSAK
</button>`;

  const redirectCode = `<!-- URL Otorisasi Redirect Standar OAuth2 -->
<a href="${origin}/sso/authorize?client_id=${app.clientId}&redirect_uri=${encodeURIComponent(
    app.redirectUri || "https://aplikasi-anda.com/callback"
  )}&response_type=code&scope=read:profile">
  Login dengan Akun PSAK
</a>`;

  const backendVerifyCodeNode = `// Backend: Verifikasi Auth Code ke PSAK (Node.js Express / Next.js)
app.post('/api/login-via-psak', async (req, res) => {
  const { code } = req.body;

  try {
    const psakRes = await fetch('${origin}/api/sso/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: '${app.clientId}',
        client_secret: '${app.clientSecret || "YOUR_CLIENT_SECRET"}',
        code: code
      })
    });

    const data = await psakRes.json();
    if (!psakRes.ok || !data.success) {
      return res.status(401).json({ error: data.error || 'Token tidak valid' });
    }

    // Identitas mahasiswa terverifikasi resmi:
    const user = data.user; 
    // user = { uid, displayName, email, nim, prodi, angkatan, photoURL, whatsapp, ... }

    // Buat session login di aplikasi Anda...
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              Panduan Integrasi & Sandbox SSO: {app.name}
            </h2>
            <p className="text-xs text-slate-500">
              Dokumentasi teknis, SDK, dan uji coba interaktif untuk mengintegrasikan login PSAK.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab("sdk")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "sdk"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            1. JavaScript SDK (Popup Flow)
          </button>
          <button
            onClick={() => setActiveTab("redirect")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "redirect"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            2. Redirect Flow (OAuth2)
          </button>
          <button
            onClick={() => setActiveTab("backend")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "backend"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            3. Verifikasi Token Backend
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "sandbox"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            4. Live Interactive Sandbox
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: JS SDK */}
          {activeTab === "sdk" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Gunakan script SDK resmi untuk memunculkan modal login popup tanpa meninggalkan halaman aplikasi Anda.
                </p>
                <button
                  onClick={() => copyToClipboard(sdkCode, "sdk")}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1"
                >
                  {copiedKey === "sdk" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "sdk" ? "Tersalin!" : "Salin Kode"}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {sdkCode}
              </pre>
            </div>
          )}

          {/* TAB 2: REDIRECT FLOW */}
          {activeTab === "redirect" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Alur OAuth2 Authorization Code standar untuk aplikasi web multi-halaman atau mobile.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Langkah 1: Arahkan Pengguna ke Endpoint Otorisasi
                </h4>
                <div className="flex items-center justify-between gap-2">
                  <input
                    readOnly
                    value={`${origin}/sso/authorize?client_id=${app.clientId}&redirect_uri=${encodeURIComponent(
                      app.redirectUri || "https://aplikasi-anda.com/callback"
                    )}&response_type=code&scope=read:profile`}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${origin}/sso/authorize?client_id=${app.clientId}&redirect_uri=${encodeURIComponent(
                          app.redirectUri || "https://aplikasi-anda.com/callback"
                        )}&response_type=code&scope=read:profile`,
                        "redirectUrl"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 text-xs font-medium"
                  >
                    {copiedKey === "redirectUrl" ? "Tersalin!" : "Salin"}
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {redirectCode}
              </pre>
            </div>
          )}

          {/* TAB 3: BACKEND VERIFY */}
          {activeTab === "backend" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tukarkan <code className="text-indigo-600 font-mono">code</code> otorisasi dengan profil lengkap pengguna melalui REST API server-to-server.
                </p>
                <button
                  onClick={() => copyToClipboard(backendVerifyCodeNode, "backend")}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1"
                >
                  {copiedKey === "backend" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "backend" ? "Tersalin!" : "Salin Kode"}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {backendVerifyCodeNode}
              </pre>
            </div>
          )}

          {/* TAB 4: LIVE SANDBOX */}
          {activeTab === "sandbox" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-indigo-600" />
                    Uji Coba Langsung Alur Otentikasi
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Klik tombol di samping untuk memicu popup login asli menggunakan kredensial aplikasi{" "}
                    <strong>{app.name}</strong>.
                  </p>
                </div>

                <button
                  onClick={handleRunSandbox}
                  disabled={sandboxLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs whitespace-nowrap self-start sm:self-auto"
                >
                  {sandboxLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses Popup...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Jalankan Tes SSO Sekarang
                    </>
                  )}
                </button>
              </div>

              {sandboxError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{sandboxError}</span>
                </div>
              )}

              {sandboxResult && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Autentikasi SSO Berhasil Teruji! Kode Otorisasi & Respon Profil Diterima.
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Payload Hasil Eksekusi:
                    </p>
                    <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto border border-slate-800">
                      {JSON.stringify(sandboxResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
