import { logger } from "../utils/logger";
import { config } from "../config/env";
import { OAuthController, type GoogleTokens } from "../controllers/oauth.controller";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
  labelIds: string[];
}

export interface GmailMessageDetail extends GmailMessage {
  body: string;
}

interface GmailApiMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload?: {
    headers?: { name: string; value: string }[];
    parts?: GmailPart[];
    body?: { data?: string };
    mimeType?: string;
  };
}

interface GmailPart {
  mimeType: string;
  body?: { data?: string };
  parts?: GmailPart[];
}

// ─── Gmail Service ───────────────────────────────────────────────────────────

export class GmailService {
  private oauthController: OAuthController;
  private readonly GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";
  private readonly TOKEN_URL = "https://oauth2.googleapis.com/token";

  constructor() {
    this.oauthController = new OAuthController();
  }

  // ── Token Lifecycle ──────────────────────────────────────────────────────

  private async getValidAccessToken(): Promise<string> {
    const tokens = await this.oauthController.getTokens();
    if (!tokens) throw new Error("Gmail not connected. Please authorize first.");

    const isExpired = Date.now() > tokens.expiry_date - 60_000;
    if (!isExpired) return tokens.access_token;

    if (!tokens.refresh_token) throw new Error("No refresh token. Please re-authorize Gmail.");

    const refreshed = await this.refreshAccessToken(tokens);
    return refreshed.access_token;
  }

  private async refreshAccessToken(tokens: GoogleTokens): Promise<GoogleTokens> {
    const response = await fetch(this.TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        refresh_token: tokens.refresh_token!,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Token refresh failed: ${err}`);
    }

    const data = await response.json() as any;

    const refreshedTokens: GoogleTokens = {
      ...tokens,
      access_token: data.access_token,
      expiry_date: Date.now() + data.expires_in * 1000,
    };

    await this.oauthController.saveTokens(refreshedTokens);
    logger.info("🔑 Gmail token refreshed");
    return refreshedTokens;
  }

  // ── Internal Helpers ─────────────────────────────────────────────────────

  private async gmailFetch(path: string, params?: Record<string, string | string[]>): Promise<any> {
    const accessToken = await this.getValidAccessToken();
    const url = new URL(`${this.GMAIL_BASE}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (Array.isArray(v)) {
          v.forEach((val) => url.searchParams.append(k, val));
        } else {
          url.searchParams.set(k, v);
        }
      }
    }
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gmail API error (${res.status}): ${err}`);
    }
    return res.json();
  }

  private decodeBase64(data: string): string {
    try {
      return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    } catch {
      return "";
    }
  }

  private extractPlainText(parts?: GmailPart[], fallbackBody?: { data?: string }): string {
    if (!parts?.length) {
      return fallbackBody?.data ? this.decodeBase64(fallbackBody.data) : "";
    }
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return this.decodeBase64(part.body.data);
      }
      if (part.parts) {
        const nested = this.extractPlainText(part.parts);
        if (nested) return nested;
      }
    }
    return "";
  }

  private parseMessage(msg: GmailApiMessage): GmailMessage {
    const headers = msg.payload?.headers ?? [];
    const get = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

    return {
      id: msg.id,
      threadId: msg.threadId,
      from: get("From"),
      subject: get("Subject") || "(no subject)",
      snippet: msg.snippet ?? "",
      date: get("Date"),
      isRead: !(msg.labelIds ?? []).includes("UNREAD"),
      labelIds: msg.labelIds ?? [],
    };
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /** Fetch a single message by ID with full decoded body. */
  async getMessageById(messageId: string): Promise<GmailMessageDetail> {
    const msg: GmailApiMessage = await this.gmailFetch(`/messages/${messageId}`, { format: "full" });
    const base = this.parseMessage(msg);
    const body = this.extractPlainText(msg.payload?.parts, msg.payload?.body);
    return { ...base, body };
  }

  /** List recent messages (metadata only). */
  async listMessages(maxResults = 20, query?: string): Promise<GmailMessage[]> {
    maxResults = Math.min(maxResults, 50);
    const params: Record<string, string> = { maxResults: String(maxResults) };
    if (query) params.q = query;

    const listData = await this.gmailFetch("/messages", params);
    const messageIds: { id: string }[] = listData.messages ?? [];
    if (messageIds.length === 0) return [];

    return Promise.all(
      messageIds.map((m) =>
        this.gmailFetch(`/messages/${m.id}`, {
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        }).then((full: GmailApiMessage) => this.parseMessage(full))
      )
    );
  }

  /**
   * Called by the Pub/Sub webhook with the current historyId.
   * Uses the stored lastHistoryId as the window start, then advances the checkpoint.
   */
  async fetchNewMessages(currentHistoryId: string): Promise<GmailMessageDetail[]> {
    const startHistoryId = await this.oauthController.getLastHistoryId();

    if (!startHistoryId) {
      await this.oauthController.setLastHistoryId(currentHistoryId);
      return [];
    }

    let data: any;
    try {
      data = await this.gmailFetch("/history", {
        startHistoryId,
        historyTypes: "messageAdded",
        labelId: "INBOX",
      });
    } catch (err: any) {
      if (err.message?.includes("404")) {
        await this.oauthController.setLastHistoryId(currentHistoryId);
        return [];
      }
      throw err;
    }

    // Advance the checkpoint regardless of whether new messages were found
    await this.oauthController.setLastHistoryId(currentHistoryId);

    const history: any[] = data.history ?? [];
    const addedIds = new Set<string>();
    for (const record of history) {
      for (const added of record.messagesAdded ?? []) {
        addedIds.add(added.message.id);
      }
    }

    if (addedIds.size === 0) return [];

    return Promise.all([...addedIds].map((id) => this.getMessageById(id)));
  }

  /**
   * Register Gmail push watch with Pub/Sub. Seeds lastHistoryId.
   * Must be renewed every 7 days.
   */
  async startWatch(): Promise<{ historyId: string; expiration: string }> {
    const topic = config.GMAIL_TOPIC_NAME;
    if (!topic) throw new Error("GMAIL_TOPIC_NAME is not set in .env");

    const accessToken = await this.getValidAccessToken();

    const res = await fetch(`${this.GMAIL_BASE}/watch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topicName: topic, labelIds: ["INBOX"] }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gmail watch failed: ${err}`);
    }

    const data = await res.json() as any;
    await this.oauthController.setLastHistoryId(String(data.historyId));

    return { historyId: String(data.historyId), expiration: data.expiration };
  }

  /** Stop the active Gmail push watch. */
  async stopWatch(): Promise<void> {
    const accessToken = await this.getValidAccessToken();
    await fetch(`${this.GMAIL_BASE}/stop`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
