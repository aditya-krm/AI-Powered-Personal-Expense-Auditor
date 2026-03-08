import { ApiController } from "./controllers/api.controller";
import { OAuthController } from "./controllers/oauth.controller";
import { GmailService } from "./services/gmail.service";
import { config } from "./config/env";
import { logger } from "./utils/logger";

function authenticateRequest(req: Request): boolean {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

  const expectedKey = config.ADMIN_KEY;
  const providedKey = authHeader.slice(7); // Remove "Bearer " prefix

  return providedKey === expectedKey;
}

export function startApiServer() {
  const apiController = new ApiController();
  const oauthController = new OAuthController();
  const gmailService = new GmailService();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      // Handle CORS Preflight
      if (req.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      }

      // Default Headers
      const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      };

      // ─── Public Routes (no Bearer required) ──────────────────────────────

      // Pub/Sub push webhook — must return 200 immediately
      if (req.method === "POST" && url.pathname === "/api/webhook/gmail") {
        try {
          const body = await req.json() as any;

          if (!body.message?.data) return new Response("Bad Request", { status: 400 });

          const decoded = Buffer.from(body.message.data, "base64").toString("utf-8");
          const raw = JSON.parse(decoded) as { emailAddress: string; historyId: string | number };
          const notification = {
            emailAddress: raw.emailAddress,
            historyId: String(raw.historyId),
          };

          // Acknowledge immediately, process in background
          const processEmail = async () => {
            const messages = await gmailService.fetchNewMessages(notification.historyId);
            for (const msg of messages) {
              logger.info(`📧 New mail from ${msg.from} — "${msg.subject}"`);
              // TODO: pass msg to downstream handler (AI parser, Telegram notifier, etc.)
            }
          };

          processEmail().catch((err) => logger.error("Gmail processing error", err));
          return new Response("OK", { status: 200 });
        } catch (error) {
          logger.error("Webhook error", error);
          return new Response("Server Error", { status: 500 });
        }
      }

      // Initiate Google OAuth — browser follows this directly
      if (req.method === "GET" && url.pathname === "/auth/google") {
        const authUrl = oauthController.getAuthUrl();
        return Response.redirect(authUrl, 302);
      }

      // Route 2: Google OAuth callback — Google redirects the browser here
      if (req.method === "GET" && url.pathname === "/auth/google/callback") {
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          return new Response(`
            <html><body style="font-family:monospace;background:#050505;color:#ef4444;padding:40px">
              <h1>Authorization Denied</h1>
              <p>${error}</p>
              <p>You can close this tab.</p>
            </body></html>
          `, { status: 400, headers: { "Content-Type": "text/html" } });
        }

        if (!code) {
          return new Response("Missing authorization code", { status: 400 });
        }

        try {
          await oauthController.exchangeCodeForTokens(code);
          return new Response(`
            <html><body style="font-family:monospace;background:#050505;color:#10B981;padding:40px;text-align:center">
              <h1 style="font-size:2rem;margin-bottom:1rem">✅ Gmail Connected</h1>
              <p style="color:#94A3B8">Access granted. Tokens stored securely.</p>
              <p style="color:#94A3B8;font-size:0.8rem;margin-top:2rem">You can close this tab and return to the dashboard.</p>
              <script>setTimeout(() => window.close(), 3000)</script>
            </body></html>
          `, { headers: { "Content-Type": "text/html" } });
        } catch (err: any) {
          logger.error("OAuth callback error", err);
          return new Response(`
            <html><body style="font-family:monospace;background:#050505;color:#ef4444;padding:40px">
              <h1>Connection Failed</h1>
              <p>${err.message}</p>
            </body></html>
          `, { status: 500, headers: { "Content-Type": "text/html" } });
        }
      }

      // ─── Authenticate all other requests ─────────────────────────────────
      if (!authenticateRequest(req)) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { status: 401, headers }
        );
      }

      try {
        if (req.method === "GET") {
          if (url.pathname === "/") {
            return new Response(JSON.stringify({ success: true, message: "Welcome to the Finance Bot API" }), { headers });
          }
          if (url.pathname === "/api/summary") {
            const data = await apiController.getSummary();
            return new Response(JSON.stringify({ success: true, data }), { headers });
          }
          if (url.pathname === "/api/loans") {
            const data = await apiController.getLoans();
            return new Response(JSON.stringify({ success: true, data }), { headers });
          }
          if (url.pathname === "/api/transactions") {
            const limitStr = url.searchParams.get("limit");
            const limit = limitStr ? parseInt(limitStr, 10) : 20;
            const data = await apiController.getRecentTransactions(limit);
            return new Response(JSON.stringify({ success: true, data }), { headers });
          }
          // Route 3: Protected status check (authenticated)
          if (url.pathname === "/auth/google/status") {
            const connected = await oauthController.isConnected();
            return new Response(JSON.stringify({ success: true, data: { connected } }), { headers });
          }
        }

        // 404 Not Found Handling
        return new Response(JSON.stringify({ success: false, error: "Not Found" }), { status: 404, headers });

      } catch (error) {
        logger.error("API Error", error);
        return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500, headers });
      }
    }
  });

  logger.info(`🌐 API Server listening on http://localhost:${server.port}`);

  // Start Gmail push watch — registers this server with Pub/Sub
  // Watch expires every 7 days; re-call to renew or schedule a daily cron
  if (config.GMAIL_TOPIC_NAME) {
    gmailService.startWatch()
      .then(({ historyId, expiration }) =>
        logger.info(`👁️  Gmail watch registered (historyId: ${historyId}, expires: ${new Date(Number(expiration)).toLocaleDateString()})`)
      )
      .catch((err) => logger.warn(`⚠️  Gmail watch skipped: ${err.message}`));
  }

  return server;
}



