import '@testing-library/jest-dom';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

// Extend Jest matchers with custom matchers from @testing-library/jest-dom
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(content: string | RegExp): R;
    }
  }
}
