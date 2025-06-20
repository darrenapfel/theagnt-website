'use client';

import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'default' | 'large';
  animated?: boolean;
}

export default function Logo({ size = 'default', animated = true }: LogoProps) {
  const fontSize =
    size === 'large' ? 'text-6xl md:text-7xl' : 'text-4xl md:text-5xl';

  if (animated) {
    return (
      <motion.h1
        className={`${fontSize} font-thin text-foreground text-center`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          animate={{
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          theAGNT.ai
        </motion.span>
      </motion.h1>
    );
  }

  return (
    <h1 className={`${fontSize} font-thin text-foreground text-center`}>
      theAGNT.ai
    </h1>
  );
}
