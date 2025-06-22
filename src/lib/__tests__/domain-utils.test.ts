import {
  isValidEmail,
  isTheAgntDomain,
  isAdmin,
  validateEmailDomain,
  getUserRole,
  getUserAccess,
  canAccessInternal,
  canAccessAdmin,
  getAccessDescription,
  isValidEmailString,
  THEAGNT_DOMAIN,
  ADMIN_EMAIL,
  type UserRole,
  type UserAccess,
  type DomainValidationResult
} from '../domain-utils';

describe('Domain Utils', () => {
  describe('Constants', () => {
    test('should have correct domain constant', () => {
      expect(THEAGNT_DOMAIN).toBe('theagnt.ai');
    });

    test('should have correct admin email constant', () => {
      expect(ADMIN_EMAIL).toBe('darrenapfel@gmail.com');
    });
  });

  describe('isValidEmail', () => {
    test('should validate correct email formats', () => {
      expect(isValidEmail('user@theagnt.ai')).toBe(true);
      expect(isValidEmail('test.user@theagnt.ai')).toBe(true);
      expect(isValidEmail('user+tag@gmail.com')).toBe(true);
      expect(isValidEmail('user.name@company.co.uk')).toBe(true);
      expect(isValidEmail('darrenapfel@gmail.com')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@@domain.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain.')).toBe(false);
    });

    test('should handle null, undefined, and empty values', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
    });

    test('should handle non-string values', () => {
      expect(isValidEmail(123 as any)).toBe(false);
      expect(isValidEmail({} as any)).toBe(false);
      expect(isValidEmail([] as any)).toBe(false);
    });

    test('should handle emails with whitespace', () => {
      expect(isValidEmail('  user@theagnt.ai  ')).toBe(true);
      expect(isValidEmail('\n\tuser@theagnt.ai\n\t')).toBe(true);
    });
  });

  describe('isTheAgntDomain', () => {
    test('should return true for theagnt.ai domain emails', () => {
      expect(isTheAgntDomain('user@theagnt.ai')).toBe(true);
      expect(isTheAgntDomain('test.user@theagnt.ai')).toBe(true);
      expect(isTheAgntDomain('admin@theagnt.ai')).toBe(true);
    });

    test('should return false for other domain emails', () => {
      expect(isTheAgntDomain('user@gmail.com')).toBe(false);
      expect(isTheAgntDomain('user@company.com')).toBe(false);
      expect(isTheAgntDomain('darrenapfel@gmail.com')).toBe(false);
    });

    test('should handle case insensitivity', () => {
      expect(isTheAgntDomain('USER@THEAGNT.AI')).toBe(true);
      expect(isTheAgntDomain('User@TheAGNT.ai')).toBe(true);
      expect(isTheAgntDomain('user@TheAgnt.AI')).toBe(true);
    });

    test('should return false for invalid emails', () => {
      expect(isTheAgntDomain('invalid-email')).toBe(false);
      expect(isTheAgntDomain(null)).toBe(false);
      expect(isTheAgntDomain(undefined)).toBe(false);
      expect(isTheAgntDomain('')).toBe(false);
    });

    test('should handle emails with whitespace', () => {
      expect(isTheAgntDomain('  user@theagnt.ai  ')).toBe(true);
    });
  });

  describe('isAdmin', () => {
    test('should return true for admin email', () => {
      expect(isAdmin('darrenapfel@gmail.com')).toBe(true);
    });

    test('should handle case insensitivity for admin email', () => {
      expect(isAdmin('DARRENAPFEL@GMAIL.COM')).toBe(true);
      expect(isAdmin('DarrenApfel@Gmail.COM')).toBe(true);
    });

    test('should return false for non-admin emails', () => {
      expect(isAdmin('user@theagnt.ai')).toBe(false);
      expect(isAdmin('other@gmail.com')).toBe(false);
      expect(isAdmin('admin@theagnt.ai')).toBe(false);
    });

    test('should return false for invalid emails', () => {
      expect(isAdmin('invalid-email')).toBe(false);
      expect(isAdmin(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
      expect(isAdmin('')).toBe(false);
    });

    test('should handle emails with whitespace', () => {
      expect(isAdmin('  darrenapfel@gmail.com  ')).toBe(true);
    });
  });

  describe('validateEmailDomain', () => {
    test('should validate theagnt.ai domain emails', () => {
      const result = validateEmailDomain('user@theagnt.ai');
      expect(result).toEqual({
        isValid: true,
        isDomainMatch: true,
        domain: 'theagnt.ai',
        username: 'user'
      });
    });

    test('should validate external domain emails', () => {
      const result = validateEmailDomain('user@gmail.com');
      expect(result).toEqual({
        isValid: true,
        isDomainMatch: false,
        domain: 'gmail.com',
        username: 'user'
      });
    });

    test('should handle admin email', () => {
      const result = validateEmailDomain('darrenapfel@gmail.com');
      expect(result).toEqual({
        isValid: true,
        isDomainMatch: false,
        domain: 'gmail.com',
        username: 'darrenapfel'
      });
    });

    test('should handle invalid emails', () => {
      const result = validateEmailDomain('invalid-email');
      expect(result).toEqual({
        isValid: false,
        isDomainMatch: false,
        error: 'Invalid email format'
      });
    });

    test('should handle null/undefined emails', () => {
      expect(validateEmailDomain(null)).toEqual({
        isValid: false,
        isDomainMatch: false,
        error: 'Email is required'
      });

      expect(validateEmailDomain(undefined)).toEqual({
        isValid: false,
        isDomainMatch: false,
        error: 'Email is required'
      });
    });

    test('should handle empty string', () => {
      const result = validateEmailDomain('');
      expect(result).toEqual({
        isValid: false,
        isDomainMatch: false,
        error: 'Email is required'
      });
    });

    test('should handle case insensitivity', () => {
      const result = validateEmailDomain('USER@THEAGNT.AI');
      expect(result).toEqual({
        isValid: true,
        isDomainMatch: true,
        domain: 'theagnt.ai',
        username: 'user'
      });
    });

    test('should handle emails with whitespace', () => {
      const result = validateEmailDomain('  user@theagnt.ai  ');
      expect(result).toEqual({
        isValid: true,
        isDomainMatch: true,
        domain: 'theagnt.ai',
        username: 'user'
      });
    });
  });

  describe('getUserRole', () => {
    test('should return admin role for admin email', () => {
      expect(getUserRole('darrenapfel@gmail.com')).toBe('admin');
    });

    test('should return internal role for theagnt.ai domain', () => {
      expect(getUserRole('user@theagnt.ai')).toBe('internal');
      expect(getUserRole('admin@theagnt.ai')).toBe('internal');
    });

    test('should return external role for other domains', () => {
      expect(getUserRole('user@gmail.com')).toBe('external');
      expect(getUserRole('user@company.com')).toBe('external');
    });

    test('should return external role for invalid emails', () => {
      expect(getUserRole('invalid-email')).toBe('external');
      expect(getUserRole(null)).toBe('external');
      expect(getUserRole(undefined)).toBe('external');
    });

    test('should handle case insensitivity', () => {
      expect(getUserRole('DARRENAPFEL@GMAIL.COM')).toBe('admin');
      expect(getUserRole('USER@THEAGNT.AI')).toBe('internal');
    });
  });

  describe('getUserAccess', () => {
    test('should return admin access for admin email', () => {
      const access = getUserAccess('darrenapfel@gmail.com');
      expect(access).toEqual({
        role: 'admin',
        isAdmin: true,
        isInternal: false,
        canAccessInternal: true,
        canAccessAdmin: true,
        permissionLevel: 'admin'
      });
    });

    test('should return internal access for theagnt.ai domain', () => {
      const access = getUserAccess('user@theagnt.ai');
      expect(access).toEqual({
        role: 'internal',
        isAdmin: false,
        isInternal: true,
        canAccessInternal: true,
        canAccessAdmin: false,
        permissionLevel: 'internal'
      });
    });

    test('should return external access for other domains', () => {
      const access = getUserAccess('user@gmail.com');
      expect(access).toEqual({
        role: 'external',
        isAdmin: false,
        isInternal: false,
        canAccessInternal: false,
        canAccessAdmin: false,
        permissionLevel: 'basic'
      });
    });

    test('should return none access for invalid emails', () => {
      const access = getUserAccess('invalid-email');
      expect(access).toEqual({
        role: 'external',
        isAdmin: false,
        isInternal: false,
        canAccessInternal: false,
        canAccessAdmin: false,
        permissionLevel: 'basic'
      });
    });

    test('should handle null/undefined emails', () => {
      const access = getUserAccess(null);
      expect(access.role).toBe('external');
      expect(access.permissionLevel).toBe('basic');
    });
  });

  describe('canAccessInternal', () => {
    test('should return true for admin', () => {
      expect(canAccessInternal('darrenapfel@gmail.com')).toBe(true);
    });

    test('should return true for internal users', () => {
      expect(canAccessInternal('user@theagnt.ai')).toBe(true);
    });

    test('should return false for external users', () => {
      expect(canAccessInternal('user@gmail.com')).toBe(false);
    });

    test('should return false for invalid emails', () => {
      expect(canAccessInternal('invalid-email')).toBe(false);
      expect(canAccessInternal(null)).toBe(false);
    });
  });

  describe('canAccessAdmin', () => {
    test('should return true for admin', () => {
      expect(canAccessAdmin('darrenapfel@gmail.com')).toBe(true);
    });

    test('should return false for internal users', () => {
      expect(canAccessAdmin('user@theagnt.ai')).toBe(false);
    });

    test('should return false for external users', () => {
      expect(canAccessAdmin('user@gmail.com')).toBe(false);
    });

    test('should return false for invalid emails', () => {
      expect(canAccessAdmin('invalid-email')).toBe(false);
      expect(canAccessAdmin(null)).toBe(false);
    });
  });

  describe('getAccessDescription', () => {
    test('should return admin description for admin', () => {
      expect(getAccessDescription('darrenapfel@gmail.com')).toBe('Full administrative access');
    });

    test('should return internal description for internal users', () => {
      expect(getAccessDescription('user@theagnt.ai')).toBe('Internal team member with elevated access');
    });

    test('should return basic description for external users', () => {
      expect(getAccessDescription('user@gmail.com')).toBe('Basic external user access');
    });

    test('should return basic description for invalid emails', () => {
      expect(getAccessDescription('invalid-email')).toBe('Basic external user access');
      expect(getAccessDescription(null)).toBe('Basic external user access');
    });
  });

  describe('isValidEmailString', () => {
    test('should return true for valid email strings', () => {
      expect(isValidEmailString('user@theagnt.ai')).toBe(true);
      expect(isValidEmailString('darrenapfel@gmail.com')).toBe(true);
    });

    test('should return false for invalid email strings', () => {
      expect(isValidEmailString('invalid-email')).toBe(false);
    });

    test('should return false for non-string values', () => {
      expect(isValidEmailString(123)).toBe(false);
      expect(isValidEmailString(null)).toBe(false);
      expect(isValidEmailString(undefined)).toBe(false);
      expect(isValidEmailString({})).toBe(false);
      expect(isValidEmailString([])).toBe(false);
    });

    test('should narrow type correctly', () => {
      const unknownValue: unknown = 'user@theagnt.ai';
      
      if (isValidEmailString(unknownValue)) {
        // TypeScript should recognize this as string
        expect(typeof unknownValue).toBe('string');
        expect(unknownValue.includes('@')).toBe(true);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle very long emails', () => {
      const longEmail = 'a'.repeat(100) + '@theagnt.ai';
      expect(isValidEmail(longEmail)).toBe(true);
      expect(isTheAgntDomain(longEmail)).toBe(true);
    });

    test('should handle emails with special characters', () => {
      expect(isValidEmail('user+tag@theagnt.ai')).toBe(true);
      expect(isValidEmail('user.name@theagnt.ai')).toBe(true);
      expect(isValidEmail('user_name@theagnt.ai')).toBe(true);
    });

    test('should handle international domain names properly', () => {
      expect(isValidEmail('user@example.co.uk')).toBe(true);
      expect(isValidEmail('user@subdomain.example.com')).toBe(true);
    });

    test('should maintain consistency across all functions', () => {
      const testCases = [
        'darrenapfel@gmail.com',
        'user@theagnt.ai',
        'external@gmail.com',
        'invalid-email',
        null,
        undefined
      ];

      testCases.forEach(email => {
        const role = getUserRole(email);
        const access = getUserAccess(email);
        const canInternal = canAccessInternal(email);
        const canAdmin = canAccessAdmin(email);

        // Ensure consistency between functions
        expect(access.role).toBe(role);
        expect(access.canAccessInternal).toBe(canInternal);
        expect(access.canAccessAdmin).toBe(canAdmin);

        // Admin should always have access to everything
        if (role === 'admin') {
          expect(canInternal).toBe(true);
          expect(canAdmin).toBe(true);
          expect(access.isAdmin).toBe(true);
        }

        // Internal users should have internal access but not admin
        if (role === 'internal') {
          expect(canInternal).toBe(true);
          expect(canAdmin).toBe(false);
          expect(access.isInternal).toBe(true);
          expect(access.isAdmin).toBe(false);
        }

        // External users should have no special access
        if (role === 'external') {
          expect(canAdmin).toBe(false);
          expect(access.isAdmin).toBe(false);
          expect(access.isInternal).toBe(false);
        }
      });
    });
  });
});