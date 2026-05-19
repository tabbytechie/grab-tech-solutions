/**
 * API Client Library for interacting with the FastAPI backend.
 * Provides a structured way to execute requests and handle responses.
 */

/**
 * API Client Library for the Grab Tech Solutions Data Ingestion Engine.
 * 
 * This module handles all communication with the FastAPI backend, managing
 * authentication state via HttpOnly cookies and providing type-safe wrappers
 * for ingestion tasks and provider management.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api/v1";

/**
 * Standard API response envelope used by the backend.
 */
export interface ApiResponse<T> {
  /** Unique correlation ID for tracing this request. */
  id: string;
  /** Status of the request (e.g., "success", "error"). */
  status: string;
  /** The actual data returned by the API. */
  payload: T;
  /** ISO timestamp when the response was generated. */
  timestamp: string;
  /** Optional human-readable message, usually present on errors. */
  message?: string;
}

/**
 * Represents a system user profile.
 */
export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

/**
 * Represents a data provider configuration.
 */
export interface Provider {
  id: string;
  name: string;
  email: string;
  /** Arbitrary configuration for the specific provider type. */
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Represents an asynchronous data ingestion task.
 */
export interface IngestionTask {
  id: string;
  provider_id: string;
  /** Status: "queued", "processing", "completed", "failed". */
  status: string;
  /** Priority level from 1 (low) to 10 (high). */
  priority: number;
  created_at: string;
  updated_at: string;
}

/**
 * Input schema for creating a new user account.
 */
export interface UserCreate {
  email: string;
  password: string;
  full_name?: string;
}

/**
 * Global authentication state management (Cookie-based).
 * 
 * Note: The actual JWT is stored in a Secure, HttpOnly cookie managed by the browser.
 * This object maintains a non-sensitive flag in sessionStorage for UI state synchronization.
 */
const authState = {
  /**
   * Checks if the user is likely authenticated based on a local flag.
   */
  isAuthenticated: () =>
    typeof window !== "undefined" && window.sessionStorage.getItem("is_authenticated") === "true",
  /**
   * Updates the local authentication flag.
   */
  setAuthenticated: (status: boolean) => {
    if (typeof window === "undefined") return;
    if (status) window.sessionStorage.setItem("is_authenticated", "true");
    else window.sessionStorage.removeItem("is_authenticated");
  },
};

import { telemetry } from "./telemetry";

/**
 * Core fetch wrapper with telemetry, error handling, and session management.
 * 
 * @param endpoint - The API endpoint path (e.g., "/tasks/").
 * @param options - Standard RequestInit options.
 * @returns A promise resolving to the API response envelope.
 * @throws Error if the response is not OK or if a network error occurs.
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const correlationId = crypto.randomUUID();

  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Correlation-ID": correlationId,
    ...options.headers,
  });

  telemetry.log("API_REQUEST_INIT", { endpoint, method: options.method || "GET", correlationId });

  const start = performance.now();
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Essential for HttpOnly cookie authentication
    });

    const duration = performance.now() - start;
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Automatically clear local session on unauthorized response
        authState.setAuthenticated(false);
      }
      const error = new Error(data.message || data.detail || `API error: ${response.status}`);
      telemetry.error("API_REQUEST_FAILURE", error, {
        endpoint,
        status: response.status,
        correlationId,
        duration: `${duration.toFixed(2)}ms`,
      });
      throw error;
    }

    telemetry.log("API_REQUEST_SUCCESS", {
      endpoint,
      status: response.status,
      correlationId,
      duration: `${duration.toFixed(2)}ms`,
    });

    return data as ApiResponse<T>;
  } catch (err) {
    if (!(err instanceof Error)) {
      const error = new Error("Unknown network error");
      telemetry.error("API_REQUEST_CRITICAL", error, { endpoint, correlationId });
      throw error;
    }
    throw err;
  }
}

/**
 * Grouped API methods for system operations.
 */
export const api = {
  /** Authentication and session management. */
  auth: {
    /**
     * Initializes a new session. Sets an HttpOnly cookie on success.
     */
    login: async (email: string, password: string) => {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include", // Necessary to receive the session cookie
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Login failed");

      authState.setAuthenticated(true);
      return data;
    },
    /**
     * Registers a new user identity.
     */
    register: (data: UserCreate) =>
      fetchApi<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    /**
     * Terminates the current session and clears cookies.
     */
    logout: async () => {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, { 
          method: "POST", 
          credentials: "include" 
        });
      } finally {
        authState.setAuthenticated(false);
      }
    },
    /** Synchronous check for UI-level authentication status. */
    isAuthenticated: () => authState.isAuthenticated(),
  },
  /** Management of external data providers. */
  providers: {
    /** List all providers owned by the current user. */
    list: () => fetchApi<Provider[]>("/providers/"),
    /** Retrieve details for a specific provider. */
    get: (id: string) => fetchApi<Provider>(`/providers/${id}`),
    /** Register a new data provider. */
    create: (data: Partial<Provider>) =>
      fetchApi<Provider>("/providers/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  /** Operations for ingestion tasks. */
  tasks: {
    /** List all tasks owned by the current user. */
    list: () => fetchApi<IngestionTask[]>("/tasks/"),
    /** Retrieve status and logs for a specific task. */
    get: (id: string) => fetchApi<IngestionTask>(`/tasks/${id}`),
    /** Create and queue a new ingestion task. */
    create: (data: { provider_id: string; payload: Record<string, unknown>; priority?: number }) =>
      fetchApi<IngestionTask>("/tasks/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  /** System health check. */
  health: () => fetch(API_BASE_URL.replace(/\/api\/v1$/, "/health")).then((r) => r.json()),
};
