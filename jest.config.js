const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next-auth/providers/google$': '<rootDir>/src/__tests__/mocks/google-provider.js',
    '^next-auth/providers/credentials$': '<rootDir>/src/__tests__/mocks/credentials-provider.js',
    '^next-auth$': '<rootDir>/src/__tests__/mocks/next-auth.js',
    '^next-auth/react$': '<rootDir>/src/__tests__/mocks/next-auth-react.js',
  },
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth)/)'
  ],
};

module.exports = createJestConfig(customJestConfig);
