// Base URL for the backend API
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Helper function to fetch data from the API with Bearer token authentication.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Check for the admin key in localStorage
  const adminKey = typeof window !== "undefined" ? localStorage.getItem("ADMIN_KEY") : null;

  if (!adminKey) {
    throw new Error("UNAUTHORIZED");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${adminKey}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error(data.error || "API Request Failed");
  }

  return data.data;
}

// API Methods
export const api = {
  getSummary: () => fetchWithAuth("/api/summary"),
  getLoans: () => fetchWithAuth("/api/loans"),
  getTransactions: (limit: number = 20) => fetchWithAuth(`/api/transactions?limit=${limit}`),

  // Method to test a key without fully loading the dashboard
  verifyKey: async (key: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/summary`, {
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        }
      });
      return response.status !== 401;
    } catch {
      return false;
    }
  }
};
