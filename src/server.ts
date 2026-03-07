import { ApiController } from "./controllers/api.controller";
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

      // Authenticate
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
  return server;
}
