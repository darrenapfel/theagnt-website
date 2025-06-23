'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import OptimizedButton from '@/components/ui/OptimizedButton';
import { AdminDashboardData } from '@/types';
import { exportToCSV } from '@/lib/utils';

/**
 * Internal Waitlist Page
 * 
 * This page displays waitlist entries for theAGNT.ai team members.
 * Similar to admin functionality but focused on waitlist management.
 */
export default function InternalWaitlistPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const fetchWaitlistData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/internal/waitlist');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch waitlist data (${response.status})`);
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching waitlist:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.users) return;

    // Filter only waitlist users for internal export
    const waitlistUsers = data.users.filter(user => user.waitlist_status);
    
    const exportData = waitlistUsers.map((user) => ({
      email: user.email,
      name: user.name || '',
      waitlist_joined: user.waitlist_joined_at
        ? new Date(user.waitlist_joined_at).toLocaleDateString()
        : '',
      signup_date: new Date(user.created_at).toLocaleDateString(),
      auth_provider: user.auth_provider,
      last_login: user.last_login
        ? new Date(user.last_login).toLocaleDateString()
        : 'Never',
    }));

    exportToCSV(
      exportData,
      `theagnt-waitlist-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleBackToInternal = () => {
    router.push('/internal');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 border-2 border-electric-mint border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading waitlist data...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="default" animated={false} />
          <div className="text-error text-center">
            <p className="text-lg mb-4">Error loading waitlist data</p>
            <p className="text-sm opacity-60 mb-6">{error}</p>
            <div className="space-y-4">
              <OptimizedButton
                onClick={fetchWaitlistData}
                variant="primary"
                size="md"
              >
                Retry
              </OptimizedButton>
              <OptimizedButton
                onClick={handleBackToInternal}
                variant="outline"
                size="md"
              >
                Back to Internal
              </OptimizedButton>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Filter only waitlist users for display
  const waitlistUsers = data?.users?.filter(user => user.waitlist_status) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        className="border-b border-charcoal"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-thin text-foreground">
              Waitlist Entries
            </h1>
            <span className="text-electric-mint text-sm">
              {waitlistUsers.length} member{waitlistUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <OptimizedButton
            onClick={handleBackToInternal}
            variant="outline"
            size="sm"
          >
            ← Back
          </OptimizedButton>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Waitlist Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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
              {waitlistUsers.length}
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
        </motion.div>

        {/* Export Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <OptimizedButton
            onClick={handleExportCSV}
            variant="secondary"
            size="md"
            disabled={waitlistUsers.length === 0}
          >
            Export Waitlist CSV
          </OptimizedButton>
        </motion.div>

        {/* Waitlist Table */}
        <motion.div
          className="bg-near-black border border-charcoal overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
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
                    Joined Waitlist
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
                    Sign-up Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
                    Auth Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal">
                {waitlistUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-charcoal/30">
                    <td className="px-4 py-4 text-sm text-foreground font-mono">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      {user.name || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-electric-mint">
                      {user.waitlist_joined_at
                        ? new Date(user.waitlist_joined_at).toLocaleDateString()
                        : 'Unknown'}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground/80">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground/80">
                      <span className="capitalize">{user.auth_provider}</span>
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

          {waitlistUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-foreground/60 mb-4">No users on waitlist yet</p>
              <p className="text-muted-foreground text-sm">
                Waitlist entries will appear here when users join
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}