import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { AuthSession, CreateJobInput, Job, PaginatedResponse, UpdateJobInput } from "./types";

const API_BASE_URL = "https://jh.agusp.com";

const TOKEN_KEY = "auth_token";
const SESSION_KEY = "auth_session";

// SecureStore doesn't work on web; use localStorage fallback
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await storage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["cookie"] = `better-auth.session_token=${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(SESSION_KEY);
  }

  return response;
}

// --- Auth API ---

export async function signIn(
  email: string,
  password: string
): Promise<{ data?: AuthSession; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const body = await res.json();

    if (!res.ok) {
      return { error: body.message || body.error || "Invalid email or password" };
    }

    // Extract token from response
    const sessionToken = body?.data?.session?.token || body?.token || null;
    if (sessionToken) {
      await storage.setItem(TOKEN_KEY, sessionToken);
    }

    const session: AuthSession = {
      user: body?.data?.user || body?.user || null,
      session: body?.data?.session || body?.session || null,
    };

    if (session) {
      await storage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return { data: session };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<{ data?: AuthSession; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    });

    const body = await res.json();

    if (!res.ok) {
      return { error: body.message || body.error || "Registration failed" };
    }

    const sessionToken = body?.data?.session?.token || body?.token || null;
    if (sessionToken) {
      await storage.setItem(TOKEN_KEY, sessionToken);
    }

    const session: AuthSession = {
      user: body?.data?.user || body?.user || null,
      session: body?.data?.session || body?.session || null,
    };

    if (session) {
      await storage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return { data: session };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/sign-out`, {
      method: "POST",
      credentials: "include",
    });
  } catch {}
  await storage.removeItem(TOKEN_KEY);
  await storage.removeItem(SESSION_KEY);
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cached = await storage.getItem(SESSION_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    const res = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      credentials: "include",
    });

    if (!res.ok) return null;

    const body = await res.json();
    const session: AuthSession = {
      user: body?.user || null,
      session: body?.session || null,
    };

    if (session?.session?.token) {
      await storage.setItem(TOKEN_KEY, session.session.token);
    }
    if (session) {
      await storage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return session;
  } catch {
    return null;
  }
}

// --- Jobs API (placeholder endpoints) ---

export async function fetchJobs(
  page: number = 1,
  pageSize: number = 10,
  statusFilter?: string,
  search?: string
): Promise<{ data?: PaginatedResponse<Job>; error?: string }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/api/jobs?${params.toString()}`
    );

    if (res.status === 404) {
      return { error: "Backend API not ready" };
    }

    if (!res.ok) {
      return { error: `Failed to fetch jobs: ${res.status}` };
    }

    const data = await res.json();
    return { data };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function fetchJob(
  id: string
): Promise<{ data?: Job; error?: string }> {
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/jobs/${id}`);

    if (res.status === 404) {
      return { error: "Backend API not ready" };
    }

    if (!res.ok) {
      return { error: `Failed to fetch job: ${res.status}` };
    }

    const data = await res.json();
    return { data };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function createJob(
  input: CreateJobInput
): Promise<{ data?: Job; error?: string }> {
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/jobs`, {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (res.status === 404) {
      return { error: "Backend API not ready" };
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.message || `Failed to create job: ${res.status}` };
    }

    const data = await res.json();
    return { data };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function updateJob(
  id: string,
  input: UpdateJobInput
): Promise<{ data?: Job; error?: string }> {
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });

    if (res.status === 404) {
      return { error: "Backend API not ready" };
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.message || `Failed to update job: ${res.status}` };
    }

    const data = await res.json();
    return { data };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function deleteJob(
  id: string
): Promise<{ error?: string }> {
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/jobs/${id}`, {
      method: "DELETE",
    });

    if (res.status === 404) {
      return { error: "Backend API not ready" };
    }

    if (!res.ok) {
      return { error: `Failed to delete job: ${res.status}` };
    }

    return {};
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function fetchStats(): Promise<{
  data?: { total: number; activePipeline: number; thisWeek: number; offers: number };
  error?: string;
}> {
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/jobs/stats`);

    if (res.status === 404) {
      return { error: "Backend API not ready" };
    }

    if (!res.ok) {
      return { error: `Failed to fetch stats: ${res.status}` };
    }

    const data = await res.json();
    return { data };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}
