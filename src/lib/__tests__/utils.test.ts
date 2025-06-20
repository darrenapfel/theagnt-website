import { cn, exportToCSV } from '../utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('combines classes correctly', () => {
      const result = cn('text-red-500', 'bg-blue-200');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-200');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('handles false conditions', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).not.toContain('active-class');
    });
  });

  describe('exportToCSV function', () => {
    // Mock DOM methods for testing
    beforeEach(() => {
      // Mock createElement and document methods
      const mockElement = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        style: { visibility: '' },
      };

      Object.defineProperty(document, 'createElement', {
        value: jest.fn(() => mockElement),
        writable: true,
      });

      Object.defineProperty(document.body, 'appendChild', {
        value: jest.fn(),
        writable: true,
      });

      Object.defineProperty(document.body, 'removeChild', {
        value: jest.fn(),
        writable: true,
      });

      Object.defineProperty(URL, 'createObjectURL', {
        value: jest.fn(() => 'mock-url'),
        writable: true,
      });
    });

    it('handles empty data gracefully', () => {
      expect(() => exportToCSV([], 'test.csv')).not.toThrow();
    });

    it('calls document methods for non-empty data', () => {
      const testData = [
        { name: 'John', email: 'john@test.com' },
        { name: 'Jane', email: 'jane@test.com' },
      ];

      exportToCSV(testData, 'test.csv');
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });
});
