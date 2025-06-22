'use client';

import { motion } from 'framer-motion';
import AuthButton from '@/components/auth/AuthButton';
import EmailAuthButton from '@/components/auth/EmailAuthButton';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-near-black flex flex-col items-center justify-center p-6">
      <motion.div 
        className="w-full max-w-sm space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="text-center">
          <motion.h1 
            className="text-6xl font-thin text-foreground mb-12 animate-[breathe_4s_ease-in-out_infinite]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ willChange: 'opacity' }}
          >
            theAGNT.ai
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-sm mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ willChange: 'opacity' }}
          >
            Choose your authentication method
          </motion.p>
        </div>

        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, staggerChildren: 0.05 }}
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.35 }}
            style={{ willChange: 'transform, opacity' }}
          >
            <AuthButton provider="google">Continue with Google</AuthButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.4 }}
            style={{ willChange: 'transform, opacity' }}
          >
            <AuthButton provider="apple">Continue with Apple</AuthButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.45 }}
            style={{ willChange: 'transform, opacity' }}
          >
            <EmailAuthButton>Continue with Email</EmailAuthButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
