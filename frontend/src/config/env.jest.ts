/** Jest stand-in for env.ts, which uses import.meta (unsupported by ts-jest's CommonJS output). */
export const env = {
  apiBaseUrl: '',
  requestTimeoutMs: 10000,
  isDev: false,
};
