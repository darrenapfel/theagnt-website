'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { AdminDashboardData } from '@/types';
import { exportToCSV } from '@/lib/utils';

export default function AdminPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.users) return;

    const exportData = data.users.map((user) => ({
      email: user.email,
      name: user.name || '',
      signup_date: new Date(user.created_at).toLocaleDateString(),
      signup_time: new Date(user.created_at).toLocaleTimeString(),
      auth_provider: user.auth_provider,
      waitlist_status: user.waitlist_status ? 'On Waitlist' : 'Not on Waitlist',
      waitlist_joined: user.waitlist_joined_at
        ? new Date(user.waitlist_joined_at).toLocaleDateString()
        : '',
      last_login: user.last_login
        ? new Date(user.last_login).toLocaleDateString()
        : 'Never',
    }));

    exportToCSV(
      exportData,
      `theagnt-users-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-error text-center">
          <p className="text-lg mb-4">Error loading dashboard</p>
          <p className="text-sm opacity-60">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 border border-charcoal text-foreground hover:bg-charcoal"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-charcoal">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-thin text-foreground">
            theAGNT.ai Admin
          </h1>
          <div className="flex items-center space-x-6">
            <a
              href="/dashboard"
              className="text-foreground/60 hover:text-foreground text-sm"
            >
              Dashboard
            </a>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-foreground/60 hover:text-foreground text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-near-black border border-charcoal p-6">
            <h3 className="text-foreground/60 text-sm font-medium mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-thin text-foreground">
              {data?.totalUsers || 0}
            </p>
          </div>

          <div className="bg-near-black border border-charcoal p-6">
            <h3 className="text-foreground/60 text-sm font-medium mb-2">
              Waitlist Members
            </h3>
            <p className="text-3xl font-thin text-electric-mint">
              {data?.totalWaitlist || 0}
            </p>
          </div>

          <div className="bg-near-black border border-charcoal p-6">
            <h3 className="text-foreground/60 text-sm font-medium mb-2">
              Conversion Rate
            </h3>
            <p className="text-3xl font-thin text-foreground">
              {data?.conversionRate || 0}%
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="mb-6">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-charcoal border border-dark-gray text-foreground text-sm font-medium hover:bg-dark-gray transition-colors"
          >
            Export CSV
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-near-black border border-charcoal overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-charcoal">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
                    Sign-up Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
                    Auth Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
                    Waitlist Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal">
                {data?.users?.map((user) => (
                  <tr key={user.id} className="hover:bg-charcoal/30">
                    <td className="px-4 py-4 text-sm text-foreground font-mono">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      {user.name || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground/80">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground/80">
                      <span className="capitalize">{user.auth_provider}</span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {user.waitlist_status ? (
                        <span className="text-electric-mint">On Waitlist</span>
                      ) : (
                        <span className="text-foreground/60">
                          Not on Waitlist
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground/80">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!data?.users || data.users.length === 0) && (
            <div className="text-center py-12">
              <p className="text-foreground/60">No users found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
