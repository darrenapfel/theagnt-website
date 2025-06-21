'use client';

import { motion } from 'framer-motion';

interface EnhancedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pulse' | 'dots' | 'ring';
  className?: string;
}

export function EnhancedLoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}: EnhancedLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  const spinnerSize = sizeClasses[size];
  const dotSize = dotSizes[size];

  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            className={`${spinnerSize} rounded-full bg-foreground ${className}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{ willChange: 'transform, opacity' }}
          />
        );

      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${dotSize} rounded-full bg-foreground`}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
                style={{ willChange: 'transform' }}
              />
            ))}
          </div>
        );

      case 'ring':
        return (
          <motion.div
            className={`${spinnerSize} border-2 border-foreground/20 border-t-foreground rounded-full ${className}`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{ willChange: 'transform' }}
          />
        );

      default:
        return (
          <motion.div
            className={`${spinnerSize} border-2 border-foreground/20 border-t-foreground rounded-full ${className}`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{ willChange: 'transform' }}
          />
        );
    }
  };

  return (
    <div className="flex items-center justify-center" role="status" aria-label="Loading">
      {renderSpinner()}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default EnhancedLoadingSpinner;