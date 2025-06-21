'use client';

import { motion, MotionProps } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef, ReactNode, useCallback, useState } from 'react';
import { EnhancedLoadingSpinner } from './EnhancedLoadingSpinner';

interface OptimizedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  hapticFeedback?: boolean;
  instantFeedback?: boolean;
}

export const OptimizedButton = forwardRef<HTMLButtonElement, OptimizedButtonProps>(
  ({
    children,
    loading = false,
    loadingText,
    variant = 'outline',
    size = 'md',
    icon,
    hapticFeedback = true,
    instantFeedback = true,
    className = '',
    onClick,
    disabled,
    ...props
  }, ref) => {
    const [isPressed, setIsPressed] = useState(false);

    const baseClasses = "font-medium rounded-md transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal focus:ring-offset-background flex items-center justify-center gap-3 select-none";
    
    const variantClasses = {
      primary: "bg-electric-mint text-near-black hover:bg-electric-mint/90 active:bg-electric-mint/80",
      secondary: "bg-charcoal text-foreground hover:bg-dark-gray active:bg-dark-gray/80",
      outline: "border border-charcoal bg-transparent text-foreground hover:bg-charcoal active:bg-dark-gray"
    };

    const sizeClasses = {
      sm: "h-9 px-3 text-sm",
      md: "h-12 px-4 text-base",
      lg: "h-14 px-6 text-lg"
    };

    const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:active:bg-transparent";

    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

    // Haptic feedback simulation through visual and micro-interaction
    const simulateHaptic = useCallback(() => {
      if (!hapticFeedback) return;
      
      // Visual haptic feedback through quick scale animation
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);

      // Web Vibration API for supported devices
      if ('vibrator' in navigator || 'vibrate' in navigator) {
        try {
          navigator.vibrate(50); // 50ms vibration
        } catch (error) {
          // Vibration not supported, silent fail
        }
      }
    }, [hapticFeedback]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      if (instantFeedback) {
        simulateHaptic();
      }

      onClick?.(event);
    }, [disabled, loading, instantFeedback, simulateHaptic, onClick]);

    // Animation states for performance
    const getAnimationState = () => {
      if (isPressed) return { scale: 0.98 };
      if (loading) return { scale: 1 };
      return { scale: 1 };
    };

    const getContentOpacity = () => loading ? 0 : 1;
    const getLoadingOpacity = () => loading ? 1 : 0;

    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        animate={getAnimationState()}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
        style={{ willChange: 'transform' }}
        {...props}
      >
        <motion.div
          className="flex items-center justify-center gap-3 w-full"
          animate={{ opacity: getContentOpacity(), y: loading ? -2 : 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ willChange: 'opacity, transform' }}
        >
          {icon && !loading && (
            <span className="flex-shrink-0">
              {icon}
            </span>
          )}
          <span className="flex-1">
            {children}
          </span>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: getLoadingOpacity(), scale: loading ? 1 : 0.8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ willChange: 'opacity, transform' }}
        >
          <EnhancedLoadingSpinner size="sm" variant="ring" />
          {loadingText && (
            <span className="ml-2 text-sm">
              {loadingText}
            </span>
          )}
        </motion.div>
      </motion.button>
    );
  }
);

OptimizedButton.displayName = 'OptimizedButton';

export default OptimizedButton;