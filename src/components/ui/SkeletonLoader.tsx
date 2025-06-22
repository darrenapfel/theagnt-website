'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'button' | 'input' | 'text' | 'card';
  count?: number;
  className?: string;
  animate?: boolean;
}

export function SkeletonLoader({ 
  variant = 'button', 
  count = 1, 
  className = '',
  animate = true 
}: SkeletonLoaderProps) {
  const baseClasses = "bg-gradient-to-r from-charcoal via-dark-gray to-charcoal bg-[length:200%_100%] rounded-md";
  
  const variantClasses = {
    button: 'h-12 w-full',
    input: 'h-12 w-full',
    text: 'h-4 w-3/4',
    card: 'h-32 w-full'
  };

  const skeletonClass = `${baseClasses} ${variantClasses[variant]} ${className}`;

  const SkeletonElement = ({ index }: { index: number }) => (
    <motion.div
      key={index}
      className={skeletonClass}
      animate={animate ? { backgroundPosition: ['200% 0', '-200% 0'] } : undefined}
      transition={animate ? {
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      } : undefined}
      style={{ 
        willChange: animate ? 'background-position' : 'auto',
        backgroundImage: 'linear-gradient(90deg, var(--charcoal) 25%, var(--dark-gray) 50%, var(--charcoal) 75%)'
      }}
    />
  );

  if (count === 1) {
    return <SkeletonElement index={0} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonElement key={index} index={index} />
      ))}
    </div>
  );
}

export default SkeletonLoader;