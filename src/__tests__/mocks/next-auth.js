// Mock NextAuth for testing
module.exports = {
  NextAuth: jest.fn((config) => ({
    handlers: {
      GET: jest.fn(),
      POST: jest.fn()
    },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn()
  })),
  NextAuthConfig: {}
};