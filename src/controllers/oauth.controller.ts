import { config } from "../config/env";
import { logger } from "../utils/logger";
import { prisma } from "../prisma/client";

const PROVIDER = "google";

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
  token_type: string;
  scope: string;
}

export class OAuthController {
  private readonly SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
  private readonly AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
  private readonly TOKEN_URL = "https://oauth2.googleapis.com/token";

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: config.GOOGLE_CLIENT_ID,
      redirect_uri: config.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: this.SCOPES.join(" "),
      access_type: "offline",   // gets refresh_token
      prompt: "consent",        // force consent screen to always get refresh_token
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const response = await fetch(this.TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: config.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Token exchange failed: ${err}`);
    }

    const data = await response.json() as any;

    const tokens: GoogleTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry_date: Date.now() + (data.expires_in * 1000),
      token_type: data.token_type,
      scope: data.scope,
    };

    await this.saveTokens(tokens);
    logger.info("✅ Google OAuth tokens saved to database");
    return tokens;
  }

  async saveTokens(tokens: GoogleTokens): Promise<void> {
    await prisma.oAuthToken.upsert({
      where: { provider: PROVIDER },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiryDate: BigInt(tokens.expiry_date),
        tokenType: tokens.token_type,
        scope: tokens.scope,
      },
      create: {
        provider: PROVIDER,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiryDate: BigInt(tokens.expiry_date),
        tokenType: tokens.token_type,
        scope: tokens.scope,
      },
    });
  }

  async getTokens(): Promise<GoogleTokens | null> {
    const row = await prisma.oAuthToken.findUnique({
      where: { provider: PROVIDER },
    });

    if (!row) return null;

    return {
      access_token: row.accessToken,
      refresh_token: row.refreshToken ?? undefined,
      expiry_date: Number(row.expiryDate),
      token_type: row.tokenType,
      scope: row.scope,
    };
  }

  async isConnected(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null && !!tokens.access_token;
  }
}
