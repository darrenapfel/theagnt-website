import '@testing-library/jest-dom';

// Extend Jest matchers with custom matchers from @testing-library/jest-dom
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(content: string | RegExp): R;
    }
  }
}
