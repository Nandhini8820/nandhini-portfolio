/** Runtime configuration read from Vite environment variables (see .env.example). */
export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000,
  isDev: import.meta.env.DEV,
};
