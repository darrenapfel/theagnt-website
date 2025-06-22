export interface WaitlistEntry {
  id: string;
  user_id: string;
  joined_at: string;
  metadata: Record<string, unknown>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  last_login?: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalWaitlist: number;
  conversionRate: number;
  users: UserWithWaitlist[];
}

export interface UserWithWaitlist extends User {
  auth_provider: 'google' | 'apple' | 'email';
  waitlist_status: boolean;
  waitlist_joined_at?: string;
}

// Domain validation types
export type UserRole = 'admin' | 'internal' | 'external';

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
