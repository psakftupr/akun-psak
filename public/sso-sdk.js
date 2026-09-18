/**
 * PSAK Single Sign-On (SSO) JavaScript SDK v2.0
 * https://akun.psak.my.id
 *
 * Usage:
 * <script src="https://akun.psak.my.id/sso-sdk.js"></script>
 * <script>
 *   const sso = new PsakSSO({
 *     clientId: 'your_client_id',
 *     redirectUri: 'https://your-app.com/callback'
 *   });
 *
 *   async function handleLogin() {
 *     try {
 *       const result = await sso.loginPopup();
 *       console.log("Auth Code:", result.code);
 *     } catch (err) {
 *       console.error("SSO Error:", err);
 *     }
 *   }
 * </script>
 */

(function (window) {
  class PsakSSO {
    constructor(config = {}) {
      if (!config.clientId) {
        console.error("[PsakSSO] clientId is required!");
      }
      this.clientId = config.clientId;
      this.redirectUri = config.redirectUri || window.location.href;
      this.ssoOrigin = config.ssoOrigin || window.location.origin;
      this.scope = config.scope || "read:profile";
    }

    /**
     * Standard Redirect Flow
     */
    loginRedirect(state = "") {
      const authUrl = new URL(`${this.ssoOrigin}/sso/authorize`);
      authUrl.searchParams.set("client_id", this.clientId);
      authUrl.searchParams.set("redirect_uri", this.redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", this.scope);
      if (state) authUrl.searchParams.set("state", state);

      window.location.href = authUrl.toString();
    }

    /**
     * Interactive Popup Flow
     * Opens centered popup window and resolves when authentication finishes
     */
    loginPopup(options = {}) {
      return new Promise((resolve, reject) => {
        const width = options.width || 520;
        const height = options.height || 680;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;

        const callbackUrl = options.callbackUrl || `${this.ssoOrigin}/sso-popup-callback`;

        const authUrl = new URL(`${this.ssoOrigin}/sso/authorize`);
        authUrl.searchParams.set("client_id", this.clientId);
        authUrl.searchParams.set("redirect_uri", callbackUrl);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", this.scope);
        authUrl.searchParams.set("display", "popup");

        const popupWindow = window.open(
          authUrl.toString(),
          "psak_sso_popup",
          `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
        );

        if (!popupWindow) {
          return reject(new Error("Popup blocked by browser. Please allow popups for this site."));
        }

        // Message Listener
        const messageHandler = async (event) => {
          if (!event.data || event.data.type !== "PSAK_SSO_SUCCESS") return;

          window.removeEventListener("message", messageHandler);
          clearInterval(pollTimer);

          const { code } = event.data;

          if (options.verifyOnClient && options.clientSecret) {
            try {
              const verifyRes = await fetch(`${this.ssoOrigin}/api/sso/verify-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  client_id: this.clientId,
                  client_secret: options.clientSecret,
                  code,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                return resolve({ code, user: verifyData.user });
              }
            } catch (vErr) {
              console.warn("[PsakSSO] Client verification error:", vErr);
            }
          }

          resolve({ code });
        };

        window.addEventListener("message", messageHandler);

        // Detect popup closed manually by user
        const pollTimer = setInterval(() => {
          if (popupWindow.closed) {
            clearInterval(pollTimer);
            window.removeEventListener("message", messageHandler);
            reject(new Error("Login window was closed by user."));
          }
        }, 500);
      });
    }
  }

  // Export to global window
  window.PsakSSO = PsakSSO;
})(typeof window !== "undefined" ? window : this);
