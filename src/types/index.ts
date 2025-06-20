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
