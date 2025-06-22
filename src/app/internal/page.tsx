'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import OptimizedButton from '@/components/ui/OptimizedButton';

/**
 * Internal Dashboard Page
 * 
 * This page is protected by middleware.ts and only accessible to:
 * - Users with @theagnt.ai email domain
 * - Admin users (darrenapfel@gmail.com)
 * 
 * The middleware handles the authentication and domain validation,
 * so by the time this component renders, we know the user has access.
 */
export default function InternalPage() {
  const router = useRouter();

  const handleViewWaitlist = () => {
    router.push('/internal/waitlist');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="default" animated={false} />
        </motion.div>

        {/* Main message */}
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-medium text-foreground">
            this is a special page
          </h2>
          
          <p className="text-muted-foreground text-sm">
            Restricted access for theAGNT.ai team members
          </p>
        </motion.div>

        {/* Waitlist button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <OptimizedButton
            onClick={handleViewWaitlist}
            variant="primary"
            size="lg"
            className="w-full"
          >
            View Waitlist Entries
          </OptimizedButton>
        </motion.div>

        {/* Subtle branding */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-muted-foreground/60 text-xs">
            Protected by server-side middleware
          </p>
        </motion.div>
      </div>
    </div>
  );
}