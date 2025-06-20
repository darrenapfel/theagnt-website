export default function LoadingSpinner({
  size = 'default',
}: {
  size?: 'small' | 'default' | 'large';
}) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    default: 'w-6 h-6 border-2',
    large: 'w-8 h-8 border-2',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-foreground border-t-transparent rounded-full animate-spin`}
    />
  );
}
