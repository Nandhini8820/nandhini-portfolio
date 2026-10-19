/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  moduleNameMapper: {
    // Vite-only module (import.meta.env) swapped for a Jest-friendly version.
    '^(.*)/config/env$': '<rootDir>/src/config/env.jest.ts',
    '\\.css$': 'identity-obj-proxy',
    '^@fontsource/.*$': 'identity-obj-proxy',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx', '!src/test/**', '!src/config/env*.ts'],
};
