/**
 * PSAK FT UPR - Single Sign-On (SSO) Client SDK
 * https://akun.psak.my.id
 */
(function (window) {
  class PsakSSO {
    constructor(config) {
      if (!config || !config.clientId) {
        throw new Error("PsakSSO: 'clientId' is required in configuration.");
      }
      this.clientId = config.clientId;
      this.ssoBaseUrl = config.ssoBaseUrl || (window.location.origin.includes("localhost") ? window.location.origin : "https://akun.psak.my.id");
    }

    /**
     * Buka jendela popup login SSO & minta izin otorisasi
     * @param {Object} options
     * @param {boolean} options.verifyOnClient - Jika true, langsung lakukan verifikasi token ke API /api/sso/verify
     * @returns {Promise<Object>} Data profil pengguna atau token authorization code
     */
    login(options = { verifyOnClient: true }) {
      return new Promise((resolve, reject) => {
        const state = "psak_state_" + Math.random().toString(36).substring(2, 10);
        const authUrl = `${this.ssoBaseUrl}/sso-auth?client_id=${encodeURIComponent(this.clientId)}&state=${encodeURIComponent(state)}`;

        const width = 500;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          authUrl,
          "PsakSSOLoginPopup",
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,resizable=yes`
        );

        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          reject(new Error("Popup diblokir oleh peramban (browser). Izinkan popup untuk melanjutkan login SSO."));
          return;
        }

        const handleMessage = async (event) => {
          // Hanya tangani event PSAK_SSO
          if (!event.data || (event.data.type !== "PSAK_SSO_SUCCESS" && event.data.type !== "PSAK_SSO_CANCEL")) {
            return;
          }

          window.removeEventListener("message", handleMessage);

          if (event.data.type === "PSAK_SSO_CANCEL") {
            reject(new Error("Pengguna membatalkan proses otorisasi SSO."));
            return;
          }

          if (event.data.type === "PSAK_SSO_SUCCESS") {
            const code = event.data.code;
            if (!code) {
              reject(new Error("Respons otorisasi tidak menyertakan kode valid."));
              return;
            }

            if (!options.verifyOnClient) {
              resolve({ code, state: event.data.state });
              return;
            }

            // Verifikasi langsung di sisi client melalui API
            try {
              const verifyRes = await fetch(`${this.ssoBaseUrl}/api/sso/verify?code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(this.clientId)}`);
              const verifyJson = await verifyRes.json();

              if (!verifyRes.ok || !verifyJson.success) {
                reject(new Error(verifyJson.error || "Gagal memverifikasi token SSO."));
                return;
              }

              resolve(verifyJson.user);
            } catch (fetchErr) {
              reject(new Error("Gagal menghubungi server verifikasi SSO: " + fetchErr.message));
            }
          }
        };

        window.addEventListener("message", handleMessage);

        // Pantau jika popup ditutup manual oleh pengguna sebelum selesai
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            window.removeEventListener("message", handleMessage);
          }
        }, 1000);
      });
    }
  }

  window.PsakSSO = PsakSSO;
})(window);
