/**
 * Domain validation utilities for theAGNT.ai access control
 * Provides functions for domain-based authentication and authorization
 */

/**
 * User role definitions based on email domain and specific accounts
 */
export type UserRole = 'admin' | 'internal' | 'external';

/**
 * User access levels with specific permissions
 */
export interface UserAccess {
  /** User's role based on email domain */
  role: UserRole;
  /** Whether user has admin privileges */
  isAdmin: boolean;
  /** Whether user belongs to theAGNT.ai organization */
  isInternal: boolean;
  /** Whether user can access internal features */
  canAccessInternal: boolean;
  /** Whether user can access admin features */
  canAccessAdmin: boolean;
  /** User's permission level for feature access */
  permissionLevel: 'none' | 'basic' | 'internal' | 'admin';
}

/**
 * Domain validation result with detailed information
 */
export interface DomainValidationResult {
  /** Whether the email is valid */
  isValid: boolean;
  /** Whether the email belongs to theAGNT.ai domain */
  isDomainMatch: boolean;
  /** Extracted domain from email (if valid) */
  domain?: string;
  /** Extracted username from email (if valid) */
  username?: string;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Valid email regex pattern following RFC 5322 specification
 * Simplified version for practical use cases
 * Requires at least one dot in the domain part
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * theAGNT.ai domain constant
 */
export const THEAGNT_DOMAIN = 'theagnt.ai';

/**
 * Admin email address
 */
export const ADMIN_EMAIL = 'darrenapfel@gmail.com';

/**
 * Validates if an email address is properly formatted
 * 
 * @param email - Email address to validate
 * @returns True if email format is valid, false otherwise
 * 
 * @example
 * ```typescript
 * isValidEmail('user@theagnt.ai') // true
 * isValidEmail('invalid-email') // false
 * isValidEmail('') // false
 * isValidEmail(undefined) // false
 * ```
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Checks if an email belongs to the theAGNT.ai domain
 * 
 * @param email - Email address to check
 * @returns True if email belongs to theAGNT.ai domain, false otherwise
 * 
 * @example
 * ```typescript
 * isTheAgntDomain('user@theagnt.ai') // true
 * isTheAgntDomain('user@gmail.com') // false
 * isTheAgntDomain('invalid-email') // false
 * isTheAgntDomain(undefined) // false
 * ```
 */
export function isTheAgntDomain(email?: string | null): boolean {
  if (!isValidEmail(email)) {
    return false;
  }
  
  const domain = email!.trim().toLowerCase().split('@')[1];
  return domain === THEAGNT_DOMAIN;
}

/**
 * Checks if a user is the designated admin
 * 
 * @param email - Email address to check
 * @returns True if email matches the admin email, false otherwise
 * 
 * @example
 * ```typescript
 * isAdmin('darrenapfel@gmail.com') // true
 * isAdmin('user@theagnt.ai') // false
 * isAdmin('user@gmail.com') // false
 * ```
 */
export function isAdmin(email?: string | null): boolean {
  if (!isValidEmail(email)) {
    return false;
  }
  
  return email!.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Performs comprehensive domain validation on an email address
 * 
 * @param email - Email address to validate
 * @returns Detailed validation result with domain information
 * 
 * @example
 * ```typescript
 * validateEmailDomain('user@theagnt.ai')
 * // {
 * //   isValid: true,
 * //   isDomainMatch: true,
 * //   domain: 'theagnt.ai',
 * //   username: 'user'
 * // }
 * 
 * validateEmailDomain('invalid-email')
 * // {
 * //   isValid: false,
 * //   isDomainMatch: false,
 * //   error: 'Invalid email format'
 * // }
 * ```
 */
export function validateEmailDomain(email?: string | null): DomainValidationResult {
  // Handle null/undefined/empty cases
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      isDomainMatch: false,
      error: 'Email is required'
    };
  }
  
  const trimmedEmail = email.trim();
  
  // Check if email format is valid
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      isDomainMatch: false,
      error: 'Invalid email format'
    };
  }
  
  // Extract domain and username
  const [username, domain] = trimmedEmail.toLowerCase().split('@');
  
  if (!username || !domain) {
    return {
      isValid: false,
      isDomainMatch: false,
      error: 'Invalid email structure'
    };
  }
  
  return {
    isValid: true,
    isDomainMatch: domain === THEAGNT_DOMAIN,
    domain,
    username
  };
}

/**
 * Determines user role based on email address
 * 
 * @param email - Email address to evaluate
 * @returns User role (admin, internal, or external)
 * 
 * @example
 * ```typescript
 * getUserRole('darrenapfel@gmail.com') // 'admin'
 * getUserRole('user@theagnt.ai') // 'internal'
 * getUserRole('user@gmail.com') // 'external'
 * ```
 */
export function getUserRole(email?: string | null): UserRole {
  if (isAdmin(email)) {
    return 'admin';
  }
  
  if (isTheAgntDomain(email)) {
    return 'internal';
  }
  
  return 'external';
}

/**
 * Gets comprehensive access information for a user based on their email
 * 
 * @param email - User's email address
 * @returns Complete access control information
 * 
 * @example
 * ```typescript
 * getUserAccess('darrenapfel@gmail.com')
 * // {
 * //   role: 'admin',
 * //   isAdmin: true,
 * //   isInternal: false,
 * //   canAccessInternal: true,
 * //   canAccessAdmin: true,
 * //   permissionLevel: 'admin'
 * // }
 * 
 * getUserAccess('user@theagnt.ai')
 * // {
 * //   role: 'internal',
 * //   isAdmin: false,
 * //   isInternal: true,
 * //   canAccessInternal: true,
 * //   canAccessAdmin: false,
 * //   permissionLevel: 'internal'
 * // }
 * ```
 */
export function getUserAccess(email?: string | null): UserAccess {
  const role = getUserRole(email);
  const isAdminUser = role === 'admin';
  const isInternalUser = role === 'internal';
  
  return {
    role,
    isAdmin: isAdminUser,
    isInternal: isInternalUser,
    canAccessInternal: isAdminUser || isInternalUser,
    canAccessAdmin: isAdminUser,
    permissionLevel: isAdminUser ? 'admin' : isInternalUser ? 'internal' : role === 'external' ? 'basic' : 'none'
  };
}

/**
 * Utility function to check if a user can access internal features
 * 
 * @param email - User's email address
 * @returns True if user can access internal features
 * 
 * @example
 * ```typescript
 * canAccessInternal('darrenapfel@gmail.com') // true (admin)
 * canAccessInternal('user@theagnt.ai') // true (internal)
 * canAccessInternal('user@gmail.com') // false (external)
 * ```
 */
export function canAccessInternal(email?: string | null): boolean {
  return getUserAccess(email).canAccessInternal;
}

/**
 * Utility function to check if a user can access admin features
 * 
 * @param email - User's email address
 * @returns True if user can access admin features
 * 
 * @example
 * ```typescript
 * canAccessAdmin('darrenapfel@gmail.com') // true
 * canAccessAdmin('user@theagnt.ai') // false
 * canAccessAdmin('user@gmail.com') // false
 * ```
 */
export function canAccessAdmin(email?: string | null): boolean {
  return getUserAccess(email).canAccessAdmin;
}

/**
 * Gets a human-readable description of user access level
 * 
 * @param email - User's email address
 * @returns Description of user's access level
 * 
 * @example
 * ```typescript
 * getAccessDescription('darrenapfel@gmail.com') // 'Full administrative access'
 * getAccessDescription('user@theagnt.ai') // 'Internal team member with elevated access'
 * getAccessDescription('user@gmail.com') // 'Basic external user access'
 * ```
 */
export function getAccessDescription(email?: string | null): string {
  const access = getUserAccess(email);
  
  switch (access.permissionLevel) {
    case 'admin':
      return 'Full administrative access';
    case 'internal':
      return 'Internal team member with elevated access';
    case 'basic':
      return 'Basic external user access';
    case 'none':
    default:
      return 'No access granted';
  }
}

/**
 * Type guard to check if an email string is valid
 * Useful for TypeScript type narrowing
 * 
 * @param email - Email to check
 * @returns True if email is a valid string, with type narrowing
 */
export function isValidEmailString(email: unknown): email is string {
  return typeof email === 'string' && isValidEmail(email);
}