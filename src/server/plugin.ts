import { RegisterServerOptions } from "@peertube/peertube-types";

interface SoapboxAuthSettings {
  soapboxUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
}

export async function register({
  registerHook,
  registerSetting,
  settingsManager,
  registerExternalAuth,
  unregisterExternalAuth,
  getRouter,
  peertubeHelpers: { logger },
}: RegisterServerOptions) {
  logger.info("Registering SoapBox OAuth authentication plugin");

  // Register plugin settings
  registerSetting({
    name: "soapbox-url",
    label: "SoapBox Instance URL",
    type: "input",
    default: "https://soapbox.example.com",
    descriptionHTML:
      "The URL of your SoapBox instance (e.g., https://soapbox.example.com)",
    private: false,
  });

  registerSetting({
    name: "client-id",
    label: "OAuth Client ID",
    type: "input",
    default: "",
    descriptionHTML: "The OAuth client ID from your SoapBox instance",
    private: true,
  });

  registerSetting({
    name: "client-secret",
    label: "OAuth Client Secret",
    type: "input-password",
    default: "",
    descriptionHTML: "The OAuth client secret from your SoapBox instance",
    private: true,
  });

  registerSetting({
    name: "oauth-scope",
    label: "OAuth Scope",
    type: "input",
    default: "read:accounts write:accounts",
    descriptionHTML:
      "OAuth scope for authentication (default: read:accounts write:accounts)",
    private: false,
  });

  // Register external auth method
  const authResult = registerExternalAuth({
    authName: "soapbox",
    authDisplayName: () => "SoapBox",
    onAuthRequest: async (req: any, res: any) => {
      try {
        const settings = await getSettings(settingsManager);

        if (
          !settings.soapboxUrl ||
          !settings.clientId ||
          !settings.clientSecret
        ) {
          logger.error("SoapBox OAuth settings not configured properly");
          return res
            .status(500)
            .json({ error: "OAuth configuration incomplete" });
        }

        // Generate state parameter for CSRF protection
        const state = generateRandomString(32);

        // Store state in session or use a secure method
        req.session.soapboxOAuthState = state;

        // Build OAuth authorization URL
        const authUrl = new URL("/oauth/authorize", settings.soapboxUrl);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("client_id", settings.clientId);
        authUrl.searchParams.set("redirect_uri", getRedirectUri(req));
        authUrl.searchParams.set("scope", settings.scope);
        authUrl.searchParams.set("state", state);

        logger.info(`Redirecting to SoapBox OAuth: ${authUrl.toString()}`);
        res.redirect(authUrl.toString());
      } catch (error) {
        logger.error("Error in OAuth request:", error);
        res.status(500).json({ error: "Authentication error" });
      }
    },
  });

  // Add custom route for OAuth callback
  const router = getRouter();

  router.get("/callback", async (req: any, res: any) => {
    try {
      const { code, state } = req.query;

      if (!code || !state) {
        return res
          .status(400)
          .json({ error: "Missing authorization code or state" });
      }

      // Verify state parameter
      if (req.session.soapboxOAuthState !== state) {
        logger.error("OAuth state mismatch - possible CSRF attack");
        return res.status(400).json({ error: "Invalid state parameter" });
      }

      const settings = await getSettings(settingsManager);

      // Exchange authorization code for access token
      const tokenResponse = await fetch(`${settings.soapboxUrl}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: settings.clientId,
          client_secret: settings.clientSecret,
          redirect_uri: getRedirectUri(req),
          code: code as string,
        }),
      });

      if (!tokenResponse.ok) {
        logger.error(
          "Failed to exchange code for token:",
          await tokenResponse.text()
        );
        return res.status(400).json({ error: "Failed to obtain access token" });
      }

      const tokenData = (await tokenResponse.json()) as {
        access_token: string;
      };
      const accessToken = tokenData.access_token;

      // Get user information from SoapBox
      const userResponse = await fetch(
        `${settings.soapboxUrl}/api/v1/accounts/verify_credentials`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      if (!userResponse.ok) {
        logger.error("Failed to get user info:", await userResponse.text());
        return res
          .status(400)
          .json({ error: "Failed to get user information" });
      }

      const userData = (await userResponse.json()) as {
        username: string;
        email?: string;
        display_name?: string;
        avatar?: string;
        note?: string;
      };

      // Map SoapBox user data to PeerTube user format
      const user = {
        username: userData.username,
        email:
          userData.email ||
          `${userData.username}@${new URL(settings.soapboxUrl).hostname}`,
        displayName: userData.display_name || userData.username,
        avatar: userData.avatar,
        description: userData.note,
      };

      logger.info(`Successfully authenticated user: ${user.username}`);

      // Clear the state from session
      delete req.session.soapboxOAuthState;

      // Use the userAuthenticated method to complete authentication
      authResult.userAuthenticated({
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        req,
        res,
      });

      // Redirect to success page or back to PeerTube
      res.redirect("/login?message=soapbox-auth-success");
    } catch (error) {
      logger.error("Error in OAuth callback processing:", error);
      res.status(500).json({ error: "Authentication processing error" });
    }
  });

  // Helper function to get settings
  async function getSettings(
    settingsManager: any
  ): Promise<SoapboxAuthSettings> {
    const settings = await settingsManager.getSettings([
      "soapbox-url",
      "client-id",
      "client-secret",
      "oauth-scope",
    ]);

    return {
      soapboxUrl: settings["soapbox-url"] || "",
      clientId: settings["client-id"] || "",
      clientSecret: settings["client-secret"] || "",
      scope: settings["oauth-scope"] || "read:accounts write:accounts",
    };
  }

  // Helper function to generate random string for state parameter
  function generateRandomString(length: number): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Helper function to get redirect URI
  function getRedirectUri(req: any): string {
    const protocol = req.get("x-forwarded-proto") || req.protocol;
    const host = req.get("host");
    return `${protocol}://${host}/plugins/auth-soapbox/callback`;
  }
}
